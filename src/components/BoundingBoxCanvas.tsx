import { useLayoutEffect, useRef, useState } from "react";
import type { DetectionItem } from "@/lib/types";

interface BoundingBoxCanvasProps {
  src: string;
  alt: string;
  detections: DetectionItem[];
}

/**
 * Draws bounding boxes over the uploaded photo preview.
 *
 * Bug fix vs. the original vanilla-JS version: that version attached
 * `window.addEventListener("resize", draw, { once: true })` fresh on
 * every draw call, so it only ever redrew once after the *first*
 * result — later window resizes stopped updating the boxes. This uses
 * a ResizeObserver on the image element instead, properly torn down
 * in the effect cleanup, plus useLayoutEffect so boxes paint
 * synchronously with the image rather than flashing in a frame late.
 */
export function BoundingBoxCanvas({ src, alt, detections }: BoundingBoxCanvasProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !naturalSize) return;

    const draw = () => {
      const rect = img.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const scaleX = rect.width / naturalSize.width;
      const scaleY = rect.height / naturalSize.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach((d) => {
        const isPothole = d.label.toLowerCase() === "pothole";
        const color = isPothole ? "#ff3b30" : "#ff9f0a";
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        const x = d.bbox.x1 * scaleX;
        const y = d.bbox.y1 * scaleY;
        const w = (d.bbox.x2 - d.bbox.x1) * scaleX;
        const h = (d.bbox.y2 - d.bbox.y1) * scaleY;
        ctx.strokeRect(x, y, w, h);

        const label = `${d.label} ${(d.confidence * 100).toFixed(0)}%`;
        ctx.font = "600 12px -apple-system, sans-serif";
        const textW = ctx.measureText(label).width + 10;
        ctx.fillStyle = color;
        ctx.fillRect(x, Math.max(0, y - 18), textW, 18);
        ctx.fillStyle = "#1d1d1f";
        ctx.fillText(label, x + 5, Math.max(12, y - 5));
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(img);
    return () => observer.disconnect();
  }, [naturalSize, detections]);

  return (
    <div className="relative mt-4 overflow-hidden rounded-xl border border-border">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="block w-full"
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
