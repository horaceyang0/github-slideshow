export type Point = {
  x: number;
  y: number;
};

export type Wall = {
  id: string;
  start: Point;
  end: Point;
  thickness: number; // meters
  height: number; // meters
};

export type OpeningType = "door" | "window";

export type Opening = {
  id: string;
  wallId: string;
  type: OpeningType;
  offset: number; // normalized 0..1 along wall length
  width: number; // meters
  height: number; // meters
};

export type TraceImage = {
  url: string;
  name: string;
  opacity: number;
};

export type FloorPlanState = {
  walls: Wall[];
  openings: Opening[];
  traceImage?: TraceImage;
};
