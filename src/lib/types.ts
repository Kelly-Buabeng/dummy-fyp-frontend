/**
 * Mirrors the backend's Pydantic schemas 1:1 — see
 * app/schemas/detection.py in the FYP-26-POTHOLE-DETECTION repo.
 */

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectionItem {
  label: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface DetectionResponse {
  id: string | null;
  pothole_detected: boolean;
  detections: DetectionItem[];
  coordinates: { lat: number; lng: number };
  device_id: string;
  timestamp: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface StatsResponse {
  total_detections: number;
  avg_confidence: number;
  devices_active: number;
  mock_mode: boolean;
}

export interface SeverityBreakdown {
  high: number;
  medium: number;
  low: number;
}

export interface RegionReport {
  region: string;
  total: number;
  avg_confidence: number;
  severity_breakdown: SeverityBreakdown;
}

export interface ReportResponse {
  generated_at: string;
  total_detections: number;
  regions: RegionReport[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  pothole_model_ready: boolean;
}
