"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Box,
  Download,
  FileJson,
  History,
  ImagePlus,
  RefreshCcw,
  Repeat2,
  Ruler,
  Save,
  Trash2,
  Undo2,
  Upload,
  Wand2,
  Window as WindowIcon,
  DoorOpen,
} from "lucide-react";
import { FloorPlanCanvas } from "@/components/editor/floor-plan-canvas";
import { FloorPlan3D } from "@/components/three/floorplan-3d";
import { useFloorPlanState } from "@/lib/useFloorPlanState";
import { OpeningType } from "@/types/floor";

export default function Home() {
  const controller = useFloorPlanState();
  const [selectedWallId, setSelectedWallId] = useState<string>();
  const [openingType, setOpeningType] = useState<OpeningType>("door");
  const [openingOffset, setOpeningOffset] = useState(0.25);
  const [openingWidth, setOpeningWidth] = useState(1);
  const [openingHeight, setOpeningHeight] = useState(2);
  const [importPayload, setImportPayload] = useState("");
  const [status, setStatus] = useState<string>("");

  const selectedWall = useMemo(
    () => controller.state.walls.find((wall) => wall.id === selectedWallId),
    [controller.state.walls, selectedWallId]
  );

  useEffect(() => {
    if (selectedWallId && !selectedWall) setSelectedWallId(undefined);
  }, [selectedWall, selectedWallId]);

  const handleTraceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    controller.setTraceImage({ url, name: file.name, opacity: 0.5 });
  };

  const handleOpacityChange = (value: number) => {
    const trace = controller.state.traceImage;
    if (!trace) return;
    controller.setTraceImage({ ...trace, opacity: value });
  };

  const handleAddOpening = () => {
    if (!selectedWallId) {
      setStatus("Select a wall first to place an opening.");
      return;
    }
    controller.addOpening(selectedWallId, openingType, openingOffset, openingWidth, openingHeight);
    setStatus("Opening added to wall.");
  };

  const handleImport = () => {
    const result = controller.importJSON(importPayload);
    if (!result.success) {
      setStatus(`Import failed: ${result.message}`);
      return;
    }
    setStatus("State imported successfully.");
  };

  const handleExport = () => {
    const payload = controller.exportJSON();
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "floor-plan.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Exported JSON file.");
  };

  const formatLength = (meters: number) => `${meters.toFixed(2)} m`;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Modern workspace</p>
          <h1 className="text-3xl font-semibold text-slate-900">3D Floor Plan Editor</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => controller.undoAction()}
            disabled={!controller.canUndo}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0"
          >
            <Undo2 className="h-4 w-4" /> Undo
          </button>
          <button
            onClick={() => controller.redoAction()}
            disabled={!controller.canRedo}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0"
          >
            <Repeat2 className="h-4 w-4" /> Redo
          </button>
          <button
            onClick={() => controller.clearAll()}
            className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Trash2 className="h-4 w-4" /> Reset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="card relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-700" />
              <h2 className="text-lg font-semibold">2D Floor Plan</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Box className="h-4 w-4" /> Grid snapping 0.5 m
            </div>
          </div>
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
                <ImagePlus className="h-4 w-4" /> Trace image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleTraceUpload}
                />
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                Opacity
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={controller.state.traceImage?.opacity ?? 0}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="accent-slate-800"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                <Ruler className="h-4 w-4" /> Wall thickness
                <input
                  type="number"
                  min={0.05}
                  step={0.05}
                  value={controller.wallDefaults.thickness}
                  onChange={(e) =>
                    controller.setWallDefaults((prev) => ({ ...prev, thickness: Number(e.target.value) }))
                  }
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                <Wand2 className="h-4 w-4" /> Wall height
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  value={controller.wallDefaults.height}
                  onChange={(e) =>
                    controller.setWallDefaults((prev) => ({ ...prev, height: Number(e.target.value) }))
                  }
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <FloorPlanCanvas
                controller={controller}
                selectedWallId={selectedWallId}
                onSelectWall={setSelectedWallId}
              />
            </div>

            {selectedWall ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <BadgeCheck className="h-4 w-4" /> Selected wall
                  </div>
                  <dl className="mt-2 space-y-1 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Length</span><span>{formatLength(Math.hypot(selectedWall.end.x - selectedWall.start.x, selectedWall.end.y - selectedWall.start.y))}</span></div>
                    <div className="flex justify-between"><span>Thickness</span><span>{formatLength(selectedWall.thickness)}</span></div>
                    <div className="flex justify-between"><span>Height</span><span>{formatLength(selectedWall.height)}</span></div>
                  </dl>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <label className="space-y-1">
                      <span className="block text-slate-500">Thickness (m)</span>
                      <input
                        type="number"
                        min={0.05}
                        step={0.05}
                        value={selectedWall.thickness}
                        onChange={(e) => controller.updateWall(selectedWall.id, { thickness: Number(e.target.value) })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-slate-500">Height (m)</span>
                      <input
                        type="number"
                        min={1}
                        step={0.1}
                        value={selectedWall.height}
                        onChange={(e) => controller.updateWall(selectedWall.id, { height: Number(e.target.value) })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => controller.removeWall(selectedWall.id)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Trash2 className="h-4 w-4" /> Remove wall
                  </button>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <WindowIcon className="h-4 w-4" /> Openings
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <label className="space-y-1">
                      <span className="block text-slate-500">Type</span>
                      <select
                        value={openingType}
                        onChange={(e) => setOpeningType(e.target.value as OpeningType)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <option value="door">Door</option>
                        <option value="window">Window</option>
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="block text-slate-500">Offset (0-1)</span>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.05}
                        value={openingOffset}
                        onChange={(e) => setOpeningOffset(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-slate-500">Width (m)</span>
                      <input
                        type="number"
                        min={0.4}
                        step={0.1}
                        value={openingWidth}
                        onChange={(e) => setOpeningWidth(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-slate-500">Height (m)</span>
                      <input
                        type="number"
                        min={0.5}
                        step={0.1}
                        value={openingHeight}
                        onChange={(e) => setOpeningHeight(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                  </div>
                  <button
                    onClick={handleAddOpening}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {openingType === "door" ? (
                      <DoorOpen className="h-4 w-4" />
                    ) : (
                      <WindowIcon className="h-4 w-4" />
                    )}
                    Add opening
                  </button>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {controller.state.openings
                      .filter((opening) => opening.wallId === selectedWall.id)
                      .map((opening) => (
                        <div
                          key={opening.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <div>
                            <p className="font-semibold capitalize">{opening.type}</p>
                            <p className="text-xs text-slate-500">
                              Offset {opening.offset.toFixed(2)} · {formatLength(opening.width)} wide
                            </p>
                          </div>
                          <button
                            onClick={() => controller.removeOpening(opening.id)}
                            className="rounded-full p-1 text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    {controller.state.openings.filter((o) => o.wallId === selectedWall.id).length === 0 && (
                      <p className="text-xs text-slate-500">No openings on this wall yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
                Click on the canvas to start drawing walls. Select a wall to edit its properties or add doors/windows.
              </p>
            )}
          </div>
        </section>

        <section className="card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-slate-700" />
              <h2 className="text-lg font-semibold">3D View</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><RefreshCcw className="h-4 w-4" /> Live</span>
              <span className="flex items-center gap-1"><Save className="h-4 w-4" /> {formatLength(controller.stats.totalLength)} walls</span>
            </div>
          </div>
          <div className="flex-1 bg-slate-100 p-4">
            <div className="h-[520px] rounded-2xl border border-slate-200 shadow-inner">
              <FloorPlan3D state={controller.state} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-white p-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <FileJson className="h-4 w-4" /> JSON Export / Import
              </div>
              <textarea
                className="h-32 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 focus:border-slate-400"
                placeholder="Paste JSON here to import state"
                value={importPayload}
                onChange={(e) => setImportPayload(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setImportPayload(controller.exportJSON())}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Download className="h-4 w-4" /> Fill from current
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Upload className="h-4 w-4" /> Import JSON
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Save className="h-4 w-4" /> Export JSON
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <DoorOpen className="h-4 w-4" /> Tips
              </div>
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                <li>Click once to start a wall and click again to finish it with snapping every 0.5 m.</li>
                <li>Select a wall by clicking near it, then adjust thickness, height, and openings.</li>
                <li>Use the trace image to align drawings with real floor plans—adjust opacity for precision.</li>
                <li>Undo/Redo keeps a history of serialized state snapshots for reliable changes.</li>
              </ul>
              {status && (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <BadgeCheck className="h-4 w-4" /> {status}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
