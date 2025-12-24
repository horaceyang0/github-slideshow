import { FloorPlanState } from "@/types/floor";

const cloneState = (state: FloorPlanState): FloorPlanState =>
  structuredClone(state);

export type HistoryState = {
  past: FloorPlanState[];
  present: FloorPlanState;
  future: FloorPlanState[];
};

export const createHistory = (initial: FloorPlanState): HistoryState => ({
  past: [],
  present: cloneState(initial),
  future: [],
});

export const push = (history: HistoryState, next: FloorPlanState): HistoryState => ({
  past: [...history.past, history.present],
  present: cloneState(next),
  future: [],
});

export const undo = (history: HistoryState): HistoryState => {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, history.past.length - 1);
  return {
    past: newPast,
    present: cloneState(previous),
    future: [history.present, ...history.future],
  };
};

export const redo = (history: HistoryState): HistoryState => {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  const newFuture = history.future.slice(1);
  return {
    past: [...history.past, history.present],
    present: cloneState(next),
    future: newFuture,
  };
};
