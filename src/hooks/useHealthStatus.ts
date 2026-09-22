import { useEffect, useState } from "react";
import { RoadGuardApi } from "@/lib/api";

export type HealthStatus = "checking" | "online" | "degraded" | "offline";

/**
 * The footer's live /health ping. Now lives in the persistent layout
 * (wrapping <Outlet/>) instead of being re-run per static page, so it
 * naturally fires once per app session instead of once per page load.
 */
export function useHealthStatus() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [message, setMessage] = useState("Checking API status…");

  useEffect(() => {
    const controller = new AbortController();

    RoadGuardApi.health(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setStatus(res.pothole_model_ready ? "online" : "degraded");
        setMessage(res.pothole_model_ready ? "All systems online" : "Online — model warming up");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setStatus("offline");
        setMessage("Service unreachable — it may be waking from idle");
      });

    return () => controller.abort();
  }, []);

  return { status, message };
}
