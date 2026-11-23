import { Download, RotateCcw, SlidersHorizontal, Upload } from 'lucide-react';
import {
  ASPECT_LAYOUTS,
  computeAspectOutputDimensions,
  formatMegapixels,
  PRESET_PROFILES,
  type AspectLayoutId,
  type EnhancementSettings,
  type ExportFormat,
  type FocalPoint,
  type ImageDiagnostics,
  type ScaleFactor,
} from '../utils/imageEnhancer';

interface InspectorPanelProps {
  settings: EnhancementSettings;
  activePresetId: string | null;
  layoutId: AspectLayoutId;
  focalPoint: FocalPoint;
  baseHdDims: { width: number; height: number } | null;
  targetRatio: number;
  diagnostics: ImageDiagnostics | null;
  isCustomUpload: boolean;
  isExporting: boolean;
  onApplyAutoOptimize: () => void;
  onSelectLayout: (layoutId: AspectLayoutId) => void;
  onChangeFocalPoint: (focal: FocalPoint) => void;
  onSelectPreset: (presetId: string) => void;
  onUpdateSetting: <K extends keyof EnhancementSettings>(
    key: K,
    value: EnhancementSettings[K],
  ) => void;
  onReset: () => void;
  onTriggerUpload: () => void;
  onRestoreSample: () => void;
  onDownload: () => void;
}

interface SliderControlRowProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}

function SliderControlRow({ id, label, value, min, max, onChange }: SliderControlRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={id} className="font-medium text-zinc-300">
          {label}
        </label>
        <span className="font-mono tabular-nums text-zinc-400">
          {value > 0 && min < 0 ? `+${value}` : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="studio-slider w-full"
      />
    </div>
  );
}

export function InspectorPanel({
  settings,
  activePresetId,
  layoutId,
  focalPoint,
  baseHdDims,
  targetRatio,
  diagnostics,
  isCustomUpload,
  isExporting,
  onApplyAutoOptimize,
  onSelectLayout,
  onChangeFocalPoint,
  onSelectPreset,
  onUpdateSetting,
  onReset,
  onTriggerUpload,
  onRestoreSample,
  onDownload,
}: InspectorPanelProps) {
  const targetDims = baseHdDims
    ? computeAspectOutputDimensions(
        baseHdDims.width,
        baseHdDims.height,
        layoutId,
        settings.scaleFactor,
        focalPoint,
      )
    : null;

  const srcRatio = baseHdDims ? baseHdDims.width / baseHdDims.height : targetRatio;
  const isCroppedHorizontally = srcRatio - targetRatio > 0.015;
  const isCroppedVertically = targetRatio - srcRatio > 0.015;

  return (
    <aside
      aria-label="Panel pengaturan restorasi HD"
      className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-[#141417] p-5"
    >
      {/* Smart Pixel Diagnostics & 1-Click Auto-Optimize */}
      {diagnostics && (
        <>
          <div className="flex flex-col gap-2.5 rounded-lg border border-zinc-800 bg-[#0A0A0B] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold text-zinc-200">Analisis Kondisi Foto</h2>
                <p className="mt-0.5 text-xs text-zinc-400">{diagnostics.summaryLabel}</p>
              </div>
              <button
                type="button"
                onClick={onApplyAutoOptimize}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#F2B705]/50 bg-[#F2B705]/12 px-2.5 py-1.5 text-xs font-semibold text-[#F2B705] transition-colors duration-150 hover:bg-[#F2B705]/20 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Auto-Optimasi</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-zinc-400">
              <span>Cahaya {diagnostics.avgLuminance}</span>
              <span aria-hidden="true">·</span>
              <span>Ketajaman {diagnostics.edgeSharpness}%</span>
              <span aria-hidden="true">·</span>
              <span>Noise {diagnostics.noiseEstimate}%</span>
            </div>
          </div>

          <div className="h-px bg-zinc-800/80" />
        </>
      )}

      {/* General Restoration Presets */}
      <div id="preset" className="flex flex-col gap-2.5 scroll-mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Profil Restorasi</h2>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B705] rounded"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_PROFILES.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                aria-pressed={isActive}
                title={preset.description}
                className={`rounded-lg border px-3 py-2 text-left transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'border-[#F2B705] bg-[#F2B705]/12 text-zinc-100'
                    : 'border-zinc-800 bg-[#0A0A0B] text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                }`}
              >
                <span className="block text-xs font-semibold whitespace-nowrap truncate">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-zinc-800/80" />

      {/* Fine Controls */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-100">Penyesuaian Detail</h2>
        <SliderControlRow
          id="slider-sharpness"
          label="Ketajaman (Unsharp Mask)"
          value={settings.sharpness}
          min={0}
          max={100}
          onChange={(v) => onUpdateSetting('sharpness', v)}
        />
        <SliderControlRow
          id="slider-clarity"
          label="Detail Halus (Clarity)"
          value={settings.clarity}
          min={0}
          max={100}
          onChange={(v) => onUpdateSetting('clarity', v)}
        />
        <SliderControlRow
          id="slider-dehaze"
          label="Anti-Kabut (Dehaze)"
          value={settings.dehaze}
          min={0}
          max={100}
          onChange={(v) => onUpdateSetting('dehaze', v)}
        />
        <SliderControlRow
          id="slider-denoise"
          label="Redam Noise"
          value={settings.denoise}
          min={0}
          max={100}
          onChange={(v) => onUpdateSetting('denoise', v)}
        />
        <SliderControlRow
          id="slider-exposure"
          label="Pencahayaan"
          value={settings.exposure}
          min={-30}
          max={30}
          onChange={(v) => onUpdateSetting('exposure', v)}
        />
        <SliderControlRow
          id="slider-contrast"
          label="Kontras"
          value={settings.contrast}
          min={-30}
          max={50}
          onChange={(v) => onUpdateSetting('contrast', v)}
        />
        <SliderControlRow
          id="slider-vibrance"
          label="Kesegaran Warna"
          value={settings.vibrance}
          min={-30}
          max={50}
          onChange={(v) => onUpdateSetting('vibrance', v)}
        />
      </div>

      <div className="h-px bg-zinc-800/80" />

      {/* Aspect Ratio / Portrait & Landscape Layout Selector */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Rasio &amp; Crop</h2>
          <span className="font-mono text-[11px] text-zinc-400">
            {targetRatio < 0.99 ? 'Potret' : targetRatio > 1.01 ? 'Lanskap' : 'Persegi'}
          </span>
        </div>

        <div
          role="group"
          aria-label="Pilih rasio aspek layout foto"
          className="grid grid-cols-4 gap-1.5"
        >
          {ASPECT_LAYOUTS.map((layout) => {
            const isActive = layoutId === layout.id;
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => onSelectLayout(layout.id)}
                aria-pressed={isActive}
                title={`${layout.label} — ${layout.subtitle}`}
                className={`flex flex-col items-center justify-center rounded-lg border px-1.5 py-2 text-center transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'border-[#F2B705] bg-[#F2B705]/14 text-zinc-100'
                    : 'border-zinc-800 bg-[#0A0A0B] text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                }`}
              >
                <span className="font-mono text-xs font-semibold whitespace-nowrap">
                  {layout.label}
                </span>
                <span className="mt-0.5 text-[10px] leading-tight text-zinc-400 whitespace-nowrap truncate max-w-full">
                  {layout.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {(isCroppedHorizontally || isCroppedVertically) && (
          <div className="mt-1 flex flex-col gap-1.5 rounded-lg border border-zinc-800/80 bg-[#0A0A0B] px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="slider-focal-crop" className="font-medium text-zinc-300">
                {isCroppedHorizontally ? 'Geser Bingkai Horizontal' : 'Geser Bingkai Vertikal'}
              </label>
              <span className="font-mono tabular-nums text-zinc-400">
                {Math.round((isCroppedHorizontally ? focalPoint.x : focalPoint.y) * 100)}%
              </span>
            </div>
            <input
              id="slider-focal-crop"
              type="range"
              min={0}
              max={100}
              value={Math.round((isCroppedHorizontally ? focalPoint.x : focalPoint.y) * 100)}
              onChange={(e) => {
                const pct = Number(e.target.value) / 100;
                onChangeFocalPoint(
                  isCroppedHorizontally
                    ? { ...focalPoint, x: pct }
                    : { ...focalPoint, y: pct },
                );
              }}
              className="studio-slider w-full"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-zinc-800/80" />

      {/* Output Resolution & Format */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Skala Resolusi</h2>
          {targetDims && (
            <span className="font-mono text-xs tabular-nums text-zinc-400">
              {targetDims.width} × {targetDims.height} · {formatMegapixels(targetDims.width, targetDims.height)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 4] as ScaleFactor[]).map((factor) => (
            <button
              key={factor}
              type="button"
              onClick={() => onUpdateSetting('scaleFactor', factor)}
              aria-pressed={settings.scaleFactor === factor}
              className={`rounded-lg border py-2 text-center font-mono text-xs font-medium tabular-nums transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                settings.scaleFactor === factor
                  ? 'border-[#F2B705] bg-[#F2B705]/12 text-[#F2B705]'
                  : 'border-zinc-800 bg-[#0A0A0B] text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {factor === 1 ? '1× Standar' : factor === 2 ? '2× HD' : '4× Ultra'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(['jpeg', 'png'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onUpdateSetting('format', fmt)}
              aria-pressed={settings.format === fmt}
              className={`rounded-lg border py-1.5 text-center font-mono text-xs font-medium uppercase transition-colors duration-150 cursor-pointer ${
                settings.format === fmt
                  ? 'border-zinc-600 bg-zinc-800 text-zinc-100'
                  : 'border-zinc-800 bg-[#0A0A0B] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {fmt === 'jpeg' ? 'JPEG (95%)' : 'PNG Lossless'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Export & Upload Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={onDownload}
          disabled={isExporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F2B705] px-4 py-2.5 text-sm font-semibold text-[#0A0A0B] transition-colors duration-150 hover:bg-[#ffd038] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B705]"
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{isExporting ? 'Menyiapkan File...' : 'Unduh Hasil HD'}</span>
        </button>

        <button
          type="button"
          onClick={onTriggerUpload}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-[#0A0A0B] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors duration-150 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Unggah Foto Lain</span>
        </button>

        {isCustomUpload && (
          <button
            type="button"
            onClick={onRestoreSample}
            className="w-full rounded-lg py-1.5 text-center text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Kembali ke Foto Contoh
          </button>
        )}
      </div>
    </aside>
  );
}
