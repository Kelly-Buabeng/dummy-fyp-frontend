/**
 * RoadGuard AI — API client for the FYP-26 Pothole Detection backend.
 * Endpoints and payload shapes come straight from the backend's
 * app/api/v1/endpoints/*.py and app/schemas/detection.py.
 */

import type {
  DetectionResponse,
  HealthResponse,
  HeatmapPoint,
  ReportResponse,
  StatsResponse,
} from "./types";

export const API_BASE = "https://web-production-0431d.up.railway.app";

const API_KEY_STORAGE = "roadguard:apiKey";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export function storeApiKey(key: string, remember: boolean): void {
  try {
    if (remember && key) {
      localStorage.setItem(API_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    /* localStorage unavailable (private mode) — key just won't persist */
  }
}

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d: { msg?: string }) => d.msg || JSON.stringify(d))
        .join("; ");
    }
    return JSON.stringify(data);
  } catch {
    return res.statusText || `Request failed with status ${res.status}`;
  }
}

interface ApiRequestOptions {
  method?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  body?: BodyInit;
  isFormData?: boolean;
  signal?: AbortSignal;
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", params, headers = {}, body, isFormData = false, signal } = options;

  const url = new URL(API_BASE + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }

  const finalHeaders: Record<string, string> = { ...headers };
  let finalBody = body;
  if (body && !isFormData) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), { method, headers: finalHeaders, body: finalBody, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(
      "Couldn't reach the RoadGuard API. Check your connection, or the service may be waking up from idle — try again in a few seconds.",
      0
    );
  }

  if (!res.ok) {
    const detail = await parseErrorDetail(res);
    throw new ApiError(detail, res.status);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json() as Promise<T>;
  return res as unknown as T;
}

export interface DetectParams {
  file: File;
  lat: number;
  lng: number;
  deviceId?: string;
  apiKey: string;
}

export interface ExportParams {
  format?: "csv" | "geojson";
  minConfidence?: number;
  limit?: number;
  apiKey: string;
}

export interface DeleteParams {
  id: string;
  apiKey: string;
}

export const RoadGuardApi = {
  base: API_BASE,

  health(signal?: AbortSignal) {
    return apiRequest<HealthResponse>("/health", { signal });
  },

  stats(signal?: AbortSignal) {
    return apiRequest<StatsResponse>("/api/v1/stats", { signal });
  },

  heatmap(
    { limit = 500, minConfidence = 0.4 }: { limit?: number; minConfidence?: number } = {},
    signal?: AbortSignal
  ) {
    return apiRequest<HeatmapPoint[]>("/api/v1/heatmap", {
      params: { limit, min_confidence: minConfidence },
      signal,
    });
  },

  report(
    { minConfidence = 0.4, limit = 5000 }: { minConfidence?: number; limit?: number } = {},
    signal?: AbortSignal
  ) {
    return apiRequest<ReportResponse>("/api/v1/report", {
      params: { min_confidence: minConfidence, limit },
      signal,
    });
  },

  async detect({ file, lat, lng, deviceId, apiKey }: DetectParams) {
    const form = new FormData();
    form.append("image", file);
    form.append("lat", String(lat));
    form.append("lng", String(lng));
    form.append("device_id", deviceId || "manual");
    return apiRequest<DetectionResponse>("/api/v1/detect", {
      method: "POST",
      isFormData: true,
      headers: apiKey ? { "X-API-Key": apiKey } : {},
      body: form,
    });
  },

  async exportDetections({ format = "csv", minConfidence = 0, limit = 5000, apiKey }: ExportParams) {
    const url = new URL(API_BASE + "/api/v1/detections/export");
    url.searchParams.set("format", format);
    url.searchParams.set("min_confidence", String(minConfidence));
    url.searchParams.set("limit", String(limit));
    let res: Response;
    try {
      res = await fetch(url.toString(), { headers: apiKey ? { "X-API-Key": apiKey } : {} });
    } catch {
      throw new ApiError("Couldn't reach the RoadGuard API. Check your connection and try again.", 0);
    }
    if (!res.ok) throw new ApiError(await parseErrorDetail(res), res.status);
    return res.blob();
  },

  async deleteDetection({ id, apiKey }: DeleteParams) {
    return apiRequest<{ deleted: string }>(`/api/v1/detections/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: apiKey ? { "X-API-Key": apiKey } : {},
    });
  },
};

/**
 * Status-code-specific copy for each protected endpoint — bespoke UX,
 * not generic boilerplate, so ported literally rather than "cleaned up".
 */

export function formatDetectError(err: unknown): string {
  if (!(err instanceof ApiError)) return err instanceof Error ? err.message : String(err);
  if (err.status === 401 || err.status === 403) {
    return "That API key was rejected. Double-check it with your project admin.";
  }
  if (err.status === 400) return err.message || "Those coordinates fall outside Ghana's bounding box.";
  if (err.status === 413) return "That image is too large — max size is 10MB.";
  if (err.status === 422) return "Couldn't read that file as an image. Try a JPEG or PNG.";
  if (err.status === 503) return "The detection model isn't ready on the server yet. Try again shortly.";
  return err.message;
}

export function formatExportError(err: unknown): string {
  if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
    return "That API key was rejected.";
  }
  return err instanceof Error ? err.message : String(err);
}

export function formatDeleteError(err: unknown): string {
  if (err instanceof ApiError && err.status === 404) return "No detection found with that ID.";
  return err instanceof Error ? err.message : String(err);
}
