"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FloorPlanController } from "@/lib/useFloorPlanState";
import { Point, Wall } from "@/types/floor";

const SCALE = 80; // pixels per meter
const GRID_METERS = 0.5;

const snapToIncrement = (value: number, step = GRID_METERS) =>
  Math.round(value / step) * step;

const pointDistance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const wallDistance = (wall: Wall, point: Point) => {
  const { start, end } = wall;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return pointDistance(point, start);
  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq)
  );
  const proj = { x: start.x + t * dx, y: start.y + t * dy };
  return pointDistance(point, proj);
};

const metersToPixels = (value: number) => value * SCALE;
const pixelsToMeters = (value: number) => value / SCALE;

const getEventPosition = (canvas: HTMLCanvasElement, evt: PointerEvent): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: pixelsToMeters(evt.clientX - rect.left),
    y: pixelsToMeters(evt.clientY - rect.top),
  };
};

const snapPoint = (point: Point): Point => ({
  x: snapToIncrement(point.x),
  y: snapToIncrement(point.y),
});

type Props = {
  controller: FloorPlanController;
  selectedWallId?: string;
  onSelectWall: (id?: string) => void;
};

export const FloorPlanCanvas = ({ controller, selectedWallId, onSelectWall }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draftStart, setDraftStart] = useState<Point | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [size, setSize] = useState({ width: 900, height: 680 });

  const selectedWall = useMemo(
    () => controller.state.walls.find((w) => w.id === selectedWallId),
    [controller.state.walls, selectedWallId]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const height = Math.max(520, width * 0.65);
        setSize({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    const grid = metersToPixels(GRID_METERS);
    for (let x = 0; x <= canvas.width; x += grid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += grid) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
    ctx.restore();

    controller.state.walls.forEach((wall) => {
      const lineWidth = Math.max(1, metersToPixels(wall.thickness));
      ctx.save();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = wall.id === selectedWallId ? "#38bdf8" : "#0f172a";
      ctx.beginPath();
      ctx.moveTo(metersToPixels(wall.start.x), metersToPixels(wall.start.y));
      ctx.lineTo(metersToPixels(wall.end.x), metersToPixels(wall.end.y));
      ctx.stroke();
      ctx.restore();
    });

    controller.state.openings.forEach((opening) => {
      const wall = controller.state.walls.find((w) => w.id === opening.wallId);
      if (!wall) return;
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const length = Math.hypot(dx, dy);
      if (length === 0) return;
      const cx = wall.start.x + opening.offset * dx;
      const cy = wall.start.y + opening.offset * dy;
      const half = (opening.width / 2) * SCALE;
      const px = metersToPixels(cx);
      const py = metersToPixels(cy);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-half, 0);
      ctx.lineTo(half, 0);
      ctx.stroke();
      ctx.restore();
    });

    if (draftStart && hoverPoint) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(metersToPixels(draftStart.x), metersToPixels(draftStart.y));
      ctx.lineTo(metersToPixels(hoverPoint.x), metersToPixels(hoverPoint.y));
      ctx.stroke();
      ctx.restore();
    }

    if (hoverPoint) {
      ctx.save();
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(metersToPixels(hoverPoint.x), metersToPixels(hoverPoint.y), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [controller.state.openings, controller.state.walls, draftStart, hoverPoint, selectedWallId, size]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapped = snapPoint(getEventPosition(canvas, e.nativeEvent));
    setHoverPoint(snapped);
  };

  const handlePointerLeave = () => setHoverPoint(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapped = snapPoint(getEventPosition(canvas, e.nativeEvent));

    if (draftStart) {
      if (pointDistance(draftStart, snapped) > 0) {
        const wallId = controller.addWall(draftStart, snapped);
        onSelectWall(wallId);
      }
      setDraftStart(null);
    } else {
      // Try selecting an existing wall first
      const hit = controller.state.walls.find(
        (wall) => wallDistance(wall, snapped) <= 0.25
      );
      if (hit) {
        onSelectWall(hit.id);
        return;
      }
      setDraftStart(snapped);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height: size.height }}
    >
      {controller.state.traceImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={controller.state.traceImage.url}
          alt="Trace"
          style={{ opacity: controller.state.traceImage.opacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
      ) : null}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ height: size.height }}
        className="relative z-10 h-full w-full rounded-2xl bg-white shadow-inner"
      />
    </div>
  );
};
