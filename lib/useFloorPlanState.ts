"use client";

import { useMemo, useState } from "react";
import { createHistory, push, redo, undo } from "./history";
import {
  FloorPlanState,
  Opening,
  OpeningType,
  Point,
  TraceImage,
  Wall,
} from "@/types/floor";

const DEFAULT_WALL_HEIGHT = 2.5;
const DEFAULT_WALL_THICKNESS = 0.2;

const initialState: FloorPlanState = {
  walls: [],
  openings: [],
};

const snapshot = (state: FloorPlanState) => structuredClone(state);

export const useFloorPlanState = () => {
  const [history, setHistory] = useState(() => createHistory(initialState));
  const [wallDefaults, setWallDefaults] = useState({
    thickness: DEFAULT_WALL_THICKNESS,
    height: DEFAULT_WALL_HEIGHT,
  });

  const state = history.present;

  const apply = (next: FloorPlanState) => setHistory((h) => push(h, next));

  const addWall = (start: Point, end: Point) => {
    const wall: Wall = {
      id: crypto.randomUUID(),
      start,
      end,
      thickness: wallDefaults.thickness,
      height: wallDefaults.height,
    };
    apply({ ...snapshot(state), walls: [...state.walls, wall] });
    return wall.id;
  };

  const updateWall = (id: string, updates: Partial<Wall>) => {
    const walls = state.walls.map((wall) =>
      wall.id === id ? { ...wall, ...updates } : wall
    );
    apply({ ...snapshot(state), walls });
  };

  const removeWall = (id: string) => {
    const walls = state.walls.filter((wall) => wall.id !== id);
    const openings = state.openings.filter((opening) => opening.wallId !== id);
    apply({ ...snapshot(state), walls, openings });
  };

  const addOpening = (
    wallId: string,
    type: OpeningType,
    offset: number,
    width = 1,
    height = 2
  ) => {
    const opening: Opening = {
      id: crypto.randomUUID(),
      wallId,
      type,
      offset,
      width,
      height,
    };
    apply({ ...snapshot(state), openings: [...state.openings, opening] });
    return opening.id;
  };

  const updateOpening = (id: string, updates: Partial<Opening>) => {
    const openings = state.openings.map((opening) =>
      opening.id === id ? { ...opening, ...updates } : opening
    );
    apply({ ...snapshot(state), openings });
  };

  const removeOpening = (id: string) => {
    const openings = state.openings.filter((opening) => opening.id !== id);
    apply({ ...snapshot(state), openings });
  };

  const setTraceImage = (trace?: TraceImage) => {
    apply({ ...snapshot(state), traceImage: trace });
  };

  const clearAll = () => setHistory(createHistory(initialState));

  const undoAction = () => setHistory((h) => undo(h));
  const redoAction = () => setHistory((h) => redo(h));

  const exportJSON = () =>
    JSON.stringify(
      {
        walls: state.walls,
        openings: state.openings,
        traceImage: state.traceImage,
      },
      null,
      2
    );

  const importJSON = (payload: string) => {
    try {
      const parsed = JSON.parse(payload) as Partial<FloorPlanState>;
      const next: FloorPlanState = {
        walls: parsed.walls ?? [],
        openings: parsed.openings ?? [],
        traceImage: parsed.traceImage,
      };
      setHistory(createHistory(next));
      return { success: true } as const;
    } catch (error) {
      return { success: false, message: (error as Error).message } as const;
    }
  };

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const wallLength = (wall: Wall) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    return Math.hypot(dx, dy);
  };

  const stats = useMemo(() => {
    const totalLength = state.walls.reduce((sum, wall) => sum + wallLength(wall), 0);
    return { totalLength };
  }, [state.walls]);

  return {
    state,
    wallDefaults,
    setWallDefaults,
    addWall,
    updateWall,
    removeWall,
    addOpening,
    updateOpening,
    removeOpening,
    setTraceImage,
    clearAll,
    undoAction,
    redoAction,
    canUndo,
    canRedo,
    exportJSON,
    importJSON,
    stats,
  };
};

export type FloorPlanController = ReturnType<typeof useFloorPlanState>;
export { DEFAULT_WALL_HEIGHT, DEFAULT_WALL_THICKNESS };
