/**
 * RoadGuard AI — API client for the FYP-26 Pothole Detection backend.
 * Endpoints and payload shapes come straight from the backend's
 * app/api/v1/endpoints/*.py and app/schemas/detection.py.
 */

const API_BASE = "https://web-production-0431d.up.railway.app";

const API_KEY_STORAGE = "roadguard:apiKey";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getStoredApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

function storeApiKey(key, remember) {
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

async function parseErrorDetail(res) {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
    }
    return JSON.stringify(data);
  } catch {
    return res.statusText || `Request failed with status ${res.status}`;
  }
}

async function apiRequest(path, { method = "GET", params, headers = {}, body, isFormData = false } = {}) {
  const url = new URL(API_BASE + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  let finalHeaders = { ...headers };
  let finalBody = body;
  if (body && !isFormData) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url.toString(), { method, headers: finalHeaders, body: finalBody });
  } catch (err) {
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
  if (contentType.includes("application/json")) return res.json();
  return res;
}

const RoadGuardApi = {
  base: API_BASE,

  health() {
    return apiRequest("/health");
  },

  stats() {
    return apiRequest("/api/v1/stats");
  },

  heatmap({ limit = 500, minConfidence = 0.4 } = {}) {
    return apiRequest("/api/v1/heatmap", { params: { limit, min_confidence: minConfidence } });
  },

  report({ minConfidence = 0.4, limit = 5000 } = {}) {
    return apiRequest("/api/v1/report", { params: { min_confidence: minConfidence, limit } });
  },

  async detect({ file, lat, lng, deviceId, apiKey }) {
    const form = new FormData();
    form.append("image", file);
    form.append("lat", lat);
    form.append("lng", lng);
    form.append("device_id", deviceId || "manual");
    return apiRequest("/api/v1/detect", {
      method: "POST",
      isFormData: true,
      headers: apiKey ? { "X-API-Key": apiKey } : {},
      body: form,
    });
  },

  async exportDetections({ format = "csv", minConfidence = 0, limit = 5000, apiKey }) {
    const url = new URL(API_BASE + "/api/v1/detections/export");
    url.searchParams.set("format", format);
    url.searchParams.set("min_confidence", minConfidence);
    url.searchParams.set("limit", limit);
    let res;
    try {
      res = await fetch(url.toString(), { headers: apiKey ? { "X-API-Key": apiKey } : {} });
    } catch {
      throw new ApiError("Couldn't reach the RoadGuard API. Check your connection and try again.", 0);
    }
    if (!res.ok) throw new ApiError(await parseErrorDetail(res), res.status);
    const blob = await res.blob();
    return blob;
  },

  async deleteDetection({ id, apiKey }) {
    return apiRequest(`/api/v1/detections/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: apiKey ? { "X-API-Key": apiKey } : {},
    });
  },
};
