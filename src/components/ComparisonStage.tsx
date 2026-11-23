import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Columns2, Eye, MoveHorizontal, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { computeSplitPercentFromPointer, type FocalPoint } from '../utils/imageEnhancer';

export type ViewMode = 'split' | 'side-by-side' | 'original' | 'enhanced';
export type ZoomLevel = 1 | 1.5 | 2;

interface ComparisonStageProps {
  originalUrl: string;
  enhancedFallbackUrl: string;
  photoTitle: string;
  originalDims: { width: number; height: number } | null;
  outputDims: { width: number; height: number } | null;
  targetRatio: number;
  layoutLabel: string;
  focalPoint: FocalPoint;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasReady: boolean;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  splitPercent: number;
  onChangeSplitPercent: (percent: number) => void;
  onFileDrop: (file: File) => void;
  isProcessing: boolean;
  loadError: string | null;
}

export function ComparisonStage({
  originalUrl,
  enhancedFallbackUrl,
  photoTitle,
  originalDims,
  outputDims,
  targetRatio,
  layoutLabel,
  focalPoint,
  previewCanvasRef,
  canvasReady,
  viewMode,
  onChangeViewMode,
  splitPercent,
  onChangeSplitPercent,
  onFileDrop,
  isProcessing,
  loadError,
}: ComparisonStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 50,
    y: 50,
    visible: false,
  });
  const [origImgError, setOrigImgError] = useState(false);
  const [enhImgError, setEnhImgError] = useState(false);
  const [canvasSnapshotUrl, setCanvasSnapshotUrl] = useState<string | null>(null);

  useEffect(() => {
    setOrigImgError(false);
    setEnhImgError(false);
  }, [originalUrl, enhancedFallbackUrl]);

  useEffect(() => {
    if (!canvasReady || !previewCanvasRef.current) return;
    try {
      setCanvasSnapshotUrl(previewCanvasRef.current.toDataURL('image/jpeg', 0.92));
    } catch {
      setCanvasSnapshotUrl(enhancedFallbackUrl);
    }
  }, [canvasReady, previewCanvasRef, enhancedFallbackUrl, isProcessing, targetRatio, focalPoint]);

  const updateSplitFromClientX = useCallback(
    (clientX: number) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      onChangeSplitPercent(computeSplitPercentFromPointer(clientX, rect.left, rect.width));
    },
    [onChangeSplitPercent],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (viewMode !== 'split') return;
    setIsDraggingSplit(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSplitFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setPointerPos({ x: xPct, y: yPct, visible: true });
    }
    if (isDraggingSplit && viewMode === 'split') {
      updateSplitFromClientX(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSplit) {
      setIsDraggingSplit(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 1 : 5;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChangeSplitPercent(Math.max(2, splitPercent - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChangeSplitPercent(Math.min(98, splitPercent + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChangeSplitPercent(2);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChangeSplitPercent(98);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isFileDragOver) {
      setIsFileDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsFileDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsFileDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileDrop(file);
    }
  };

  const cycleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const resolvedHdUrl = canvasSnapshotUrl ?? enhancedFallbackUrl;
  const maxStageWidthPx = Math.max(240, Math.round(560 * targetRatio));
  const objectPosCss = `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%`;

  return (
    <section
      aria-label="Area perbandingan foto sebelum dan sesudah"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col gap-3"
    >
      {/* Drag & Drop File Overlay */}
      {isFileDragOver && (
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F2B705] bg-[#0A0A0B]/90 backdrop-blur-sm">
          <Upload className="h-7 w-7 text-[#F2B705]" aria-hidden="true" />
          <p className="text-sm font-semibold text-zinc-100">
            Lepaskan foto di sini untuk di-HD-kan
          </p>
          <p className="text-xs text-zinc-400">Mendukung JPG, PNG, dan WebP</p>
        </div>
      )}

      {/* Mode & Zoom Toolbar */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-zinc-800 bg-[#141417] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5">
        <div
          role="group"
          aria-label="Mode tampilan perbandingan"
          className="grid grid-cols-4 gap-1 rounded-lg bg-[#0A0A0B] p-1 border border-zinc-800/80 sm:flex sm:items-center"
        >
          <button
            type="button"
            onClick={() => onChangeViewMode('split')}
            aria-pressed={viewMode === 'split'}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer sm:px-3 ${
              viewMode === 'split'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <MoveHorizontal className="h-3.5 w-3.5 hidden sm:block" aria-hidden="true" />
            <span>Geser</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('side-by-side')}
            aria-pressed={viewMode === 'side-by-side'}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer sm:px-3 ${
              viewMode === 'side-by-side'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Columns2 className="h-3.5 w-3.5 hidden sm:block" aria-hidden="true" />
            <span>Sejajar</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('original')}
            aria-pressed={viewMode === 'original'}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer sm:px-3 ${
              viewMode === 'original'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Eye className="h-3.5 w-3.5 hidden sm:block" aria-hidden="true" />
            <span>Asli</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('enhanced')}
            aria-pressed={viewMode === 'enhanced'}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer sm:px-3 ${
              viewMode === 'enhanced'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Eye className="h-3.5 w-3.5 hidden sm:block" aria-hidden="true" />
            <span>Hasil HD</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={cycleZoom}
            aria-label={`Ubah perbesaran pratinjau, saat ini ${Math.round(zoomLevel * 100)} persen`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#0A0A0B] px-3 py-1.5 text-xs font-mono tabular-nums text-zinc-300 transition-colors duration-150 hover:border-zinc-700 hover:text-zinc-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {zoomLevel > 1 ? (
              <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{Math.round(zoomLevel * 100)}%</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      {loadError ? (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border border-red-900/60 bg-[#141417] p-8 text-center">
          <p className="text-sm font-medium text-red-300">Gagal memuat gambar</p>
          <p className="mt-1 text-xs text-zinc-400">{loadError}</p>
        </div>
      ) : viewMode === 'side-by-side' ? (
        <div
          data-testid="comparison-stage-side-by-side"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <figure className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#141417]">
            <div className="flex items-center justify-center bg-zinc-950 p-2">
              <div
                style={{
                  aspectRatio: String(targetRatio),
                  width: `min(100%, ${Math.round(440 * targetRatio)}px)`,
                }}
                className="overflow-hidden rounded-md bg-zinc-900"
              >
                {!origImgError ? (
                  <img
                    src={originalUrl}
                    alt={`${photoTitle} — Foto asli`}
                    referrerPolicy="no-referrer"
                    onError={() => setOrigImgError(true)}
                    style={{
                      objectPosition: objectPosCss,
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: `${pointerPos.x}% ${pointerPos.y}%`,
                    }}
                    className="h-full w-full object-cover transition-transform duration-150"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-xs text-zinc-400">
                    Pratinjau foto asli tidak tersedia
                  </div>
                )}
              </div>
            </div>
            <figcaption className="flex items-center justify-between border-t border-zinc-800 px-3.5 py-2 text-xs text-zinc-400">
              <span className="font-medium text-zinc-200">Sebelum · Asli</span>
              <span className="font-mono tabular-nums">
                {originalDims ? `${originalDims.width} × ${originalDims.height}` : 'Memuat...'}
              </span>
            </figcaption>
          </figure>

          <figure className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#141417]">
            <div className="flex items-center justify-center bg-zinc-950 p-2">
              <div
                style={{
                  aspectRatio: String(targetRatio),
                  width: `min(100%, ${Math.round(440 * targetRatio)}px)`,
                }}
                className="overflow-hidden rounded-md bg-zinc-900"
              >
                {!enhImgError ? (
                  <img
                    src={resolvedHdUrl}
                    alt={`${photoTitle} — Hasil HD`}
                    referrerPolicy="no-referrer"
                    onError={() => setEnhImgError(true)}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: `${pointerPos.x}% ${pointerPos.y}%`,
                    }}
                    className="h-full w-full object-cover transition-transform duration-150"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-xs text-zinc-400">
                    Pratinjau hasil HD tidak tersedia
                  </div>
                )}
              </div>
            </div>
            <figcaption className="flex items-center justify-between border-t border-zinc-800 px-3.5 py-2 text-xs text-zinc-400">
              <span className="font-medium text-[#F2B705]">Sesudah · Hasil HD</span>
              <span className="font-mono tabular-nums">
                {outputDims ? `${outputDims.width} × ${outputDims.height}` : 'Memuat...'}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : (
        /* Darkroom Mat Container framing any Portrait, Square, or Landscape aspect cleanly */
        <div className="flex w-full items-center justify-center rounded-xl border border-zinc-800/80 bg-[#050506] p-2.5 sm:p-4">
          <div
            ref={stageRef}
            data-testid="comparison-stage"
            data-layout-ratio={targetRatio.toFixed(3)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              setPointerPos((p) => ({ ...p, visible: false }));
            }}
            style={{
              aspectRatio: String(targetRatio),
              width: `min(100%, ${maxStageWidthPx}px)`,
            }}
            className={`relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 select-none ${
              viewMode === 'split' ? 'cursor-ew-resize touch-none' : 'cursor-crosshair'
            }`}
          >
            {/* Base HD Canvas / Image */}
            <div
              className="absolute inset-0 h-full w-full"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: `${pointerPos.x}% ${pointerPos.y}%`,
              }}
            >
              <canvas
                ref={previewCanvasRef}
                data-testid="hd-preview-canvas"
                className={`block h-full w-full object-cover ${
                  viewMode === 'original' ? 'opacity-0' : canvasReady ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {!canvasReady && viewMode !== 'original' && !enhImgError && (
                <img
                  src={enhancedFallbackUrl}
                  alt={`${photoTitle} — Hasil HD`}
                  referrerPolicy="no-referrer"
                  onError={() => setEnhImgError(true)}
                  style={{ objectPosition: objectPosCss }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>

            {/* Original Image Layer */}
            {(viewMode === 'split' || viewMode === 'original') && !origImgError && (
              <div
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{
                  clipPath:
                    viewMode === 'split' ? `inset(0 ${100 - splitPercent}% 0 0)` : undefined,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: `${pointerPos.x}% ${pointerPos.y}%`,
                }}
              >
                <img
                  src={originalUrl}
                  alt={`${photoTitle} — Foto asli`}
                  referrerPolicy="no-referrer"
                  onError={() => setOrigImgError(true)}
                  style={{ objectPosition: objectPosCss }}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Split Slider Divider & Accessible Handle */}
            {viewMode === 'split' && (
              <div
                role="slider"
                tabIndex={0}
                aria-label="Pembatas perbandingan sebelum dan sesudah"
                aria-valuemin={2}
                aria-valuemax={98}
                aria-valuenow={Math.round(splitPercent)}
                onKeyDown={handleSliderKeyDown}
                style={{ left: `${splitPercent}%` }}
                className="absolute inset-y-0 z-20 -translate-x-1/2 flex flex-col items-center justify-center focus-visible:outline-none group"
              >
                <div className="h-full w-[2px] bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.65)]" />
                <div className="absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A0A0B] bg-[#F2B705] text-[#0A0A0B] shadow-lg transition-transform duration-150 group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-[#F2B705]/40">
                  <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            )}

            {/* Corner Contrast Labels */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3.5 pb-2.5 pt-10 text-xs">
              {viewMode === 'split' || viewMode === 'original' ? (
                <span className="font-medium text-zinc-200 tracking-wide whitespace-nowrap">
                  Sebelum · Asli
                </span>
              ) : (
                <span />
              )}

              {viewMode === 'split' || viewMode === 'enhanced' ? (
                <span className="font-medium text-[#F2B705] tracking-wide whitespace-nowrap">
                  Sesudah · HD
                </span>
              ) : null}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
                <span className="rounded-lg bg-[#141417] border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-100">
                  Memproses versi HD...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono tabular-nums">
          <span>
            Rasio: <strong className="font-medium text-zinc-200">{layoutLabel}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Asli: {originalDims ? `${originalDims.width} × ${originalDims.height} px` : '—'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-zinc-200">
            Output HD: {outputDims ? `${outputDims.width} × ${outputDims.height} px` : '—'}
          </span>
        </div>

        {viewMode === 'split' && (
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 mr-1">Posisi garis:</span>
            {[25, 50, 75].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => onChangeSplitPercent(pct)}
                className={`rounded px-2 py-1 font-mono text-xs tabular-nums transition-colors duration-150 cursor-pointer ${
                  Math.abs(splitPercent - pct) < 2
                    ? 'bg-zinc-800 text-[#F2B705]'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
