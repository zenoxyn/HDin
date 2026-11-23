import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Upload } from 'lucide-react';
import { ComparisonStage, type ViewMode } from './components/ComparisonStage';
import { InspectorPanel } from './components/InspectorPanel';
import { TechniqueDetails } from './components/TechniqueDetails';
import { TopBar } from './components/TopBar';
import {
  analyzeImageElement,
  computeAspectOutputDimensions,
  createDegradedDemoDataUrl,
  DEFAULT_RESTORED_SETTINGS,
  DEFAULT_UPLOAD_SETTINGS,
  formatMegapixels,
  getAspectLayoutOption,
  getPresetById,
  getTargetAspectRatio,
  renderEnhancedToCanvas,
  type AspectLayoutId,
  type EnhancementSettings,
  type FocalPoint,
  type ImageDiagnostics,
} from './utils/imageEnhancer';

interface StudioDemoPhoto {
  id: 'portrait' | 'architecture' | 'landscape';
  buttonLabel: string;
  categoryLabel: string;
  title: string;
  enhancedUrl: string;
  defaultFocal: FocalPoint;
  defaultPresetId: string;
}

const STUDIO_DEMOS: StudioDemoPhoto[] = [
  {
    id: 'portrait',
    buttonLabel: 'Potret (3:4)',
    categoryLabel: 'Contoh Potret',
    title: 'Potret Studio Alami',
    enhancedUrl: '/src/assets/images/demo_portrait_studio_1795360781146.jpg',
    defaultFocal: { x: 0.5, y: 0.35 },
    defaultPresetId: 'potret-wajah',
  },
  {
    id: 'architecture',
    buttonLabel: 'Kota & Bangunan (4:3)',
    categoryLabel: 'Contoh Arsitektur',
    title: 'Sudut Kota Klasik',
    enhancedUrl: '/src/assets/images/demo_architecture_street_1795360781353.jpg',
    defaultFocal: { x: 0.5, y: 0.45 },
    defaultPresetId: 'lanskap-detail',
  },
  {
    id: 'landscape',
    buttonLabel: 'Alam (16:9)',
    categoryLabel: 'Contoh Lanskap',
    title: 'Danau & Gunung Pagi',
    enhancedUrl: '/src/assets/images/demo_landscape_scenic_1795360781398.jpg',
    defaultFocal: { x: 0.5, y: 0.5 },
    defaultPresetId: 'natural-hd',
  },
];

export default function App() {
  const [activeDemoId, setActiveDemoId] = useState<StudioDemoPhoto['id']>('portrait');
  const [originalUrl, setOriginalUrl] = useState<string>(STUDIO_DEMOS[0].enhancedUrl);
  const [enhancedBaseUrl, setEnhancedBaseUrl] = useState<string>(STUDIO_DEMOS[0].enhancedUrl);
  const [photoTitle, setPhotoTitle] = useState<string>(STUDIO_DEMOS[0].title);
  const [categoryLabel, setCategoryLabel] = useState<string>(STUDIO_DEMOS[0].categoryLabel);
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);

  const [layoutId, setLayoutId] = useState<AspectLayoutId>('auto');
  const [focalPoint, setFocalPoint] = useState<FocalPoint>(STUDIO_DEMOS[0].defaultFocal);

  const [settings, setSettings] = useState<EnhancementSettings>(() => {
    const preset = getPresetById(STUDIO_DEMOS[0].defaultPresetId);
    return preset
      ? { ...DEFAULT_RESTORED_SETTINGS, ...preset.settings }
      : DEFAULT_RESTORED_SETTINGS;
  });
  const [activePresetId, setActivePresetId] = useState<string | null>(STUDIO_DEMOS[0].defaultPresetId);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitPercent, setSplitPercent] = useState<number>(50);

  const [originalDims, setOriginalDims] = useState<{ width: number; height: number } | null>(null);
  const [baseHdDims, setBaseHdDims] = useState<{ width: number; height: number } | null>(null);
  const [diagnostics, setDiagnostics] = useState<ImageDiagnostics | null>(null);
  const [canvasReady, setCanvasReady] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hdImageObjRef = useRef<HTMLImageElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);

  // Load base image, synthesize degraded Before URL for demos, and run pixel diagnostics
  useEffect(() => {
    let cancelled = false;
    setCanvasReady(false);
    setLoadError(null);

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      hdImageObjRef.current = img;
      setBaseHdDims({ width: img.naturalWidth, height: img.naturalHeight });

      const diag = analyzeImageElement(img);
      setDiagnostics(diag);

      if (!isCustomUpload) {
        const degradedUrl = createDegradedDemoDataUrl(img);
        setOriginalUrl(degradedUrl);
        setOriginalDims({
          width: Math.max(120, Math.round(img.naturalWidth * 0.28)),
          height: Math.max(120, Math.round(img.naturalHeight * 0.28)),
        });
      } else {
        setOriginalDims({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setLoadError('Tidak dapat memuat berkas foto untuk diproses.');
      }
    };
    img.src = enhancedBaseUrl;

    return () => {
      cancelled = true;
    };
  }, [enhancedBaseUrl, isCustomUpload]);

  // Re-render preview canvas whenever base image, layout, focal point, or settings change
  useEffect(() => {
    const img = hdImageObjRef.current;
    const canvas = previewCanvasRef.current;
    if (!img || !canvas || !baseHdDims) return;

    setIsProcessing(true);
    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        if (!hdImageObjRef.current || !previewCanvasRef.current) return;
        renderEnhancedToCanvas(
          hdImageObjRef.current,
          previewCanvasRef.current,
          settings,
          1440,
          layoutId,
          focalPoint,
        );
        setCanvasReady(true);
        setIsProcessing(false);
      });
    }, 24);

    return () => window.clearTimeout(timer);
  }, [baseHdDims, settings, viewMode, layoutId, focalPoint]);

  const loadUserImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setLoadError('Silakan pilih berkas gambar yang valid (JPG, PNG, atau WebP).');
      return;
    }

    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
    }

    const blobUrl = URL.createObjectURL(file);
    activeBlobUrlRef.current = blobUrl;

    const cleanName = file.name.replace(/\.[^/.]+$/, '') || 'Foto Unggahan';
    setPhotoTitle(cleanName);
    setCategoryLabel('File Unggahan Anda');
    setOriginalUrl(blobUrl);
    setEnhancedBaseUrl(blobUrl);
    setIsCustomUpload(true);
    setLayoutId('auto');
    setFocalPoint({ x: 0.5, y: 0.45 });
    setSettings(DEFAULT_UPLOAD_SETTINGS);
    setActivePresetId('natural-hd');
    setExportNotice(null);
    setLoadError(null);
  }, []);

  // Support Ctrl+V / Cmd+V paste anywhere on page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            loadUserImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [loadUserImageFile]);

  // Cleanup uploaded object URL on unmount
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, []);

  const handleSelectDemo = useCallback((demoId: StudioDemoPhoto['id']) => {
    const demo = STUDIO_DEMOS.find((s) => s.id === demoId);
    if (!demo) return;

    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }

    const preset = getPresetById(demo.defaultPresetId);
    setActiveDemoId(demo.id);
    setPhotoTitle(demo.title);
    setCategoryLabel(demo.categoryLabel);
    setOriginalUrl(demo.enhancedUrl);
    setEnhancedBaseUrl(demo.enhancedUrl);
    setIsCustomUpload(false);
    setLayoutId('auto');
    setFocalPoint(demo.defaultFocal);
    setSettings(
      preset ? { ...DEFAULT_RESTORED_SETTINGS, ...preset.settings } : DEFAULT_RESTORED_SETTINGS,
    );
    setActivePresetId(demo.defaultPresetId);
    setExportNotice(null);
    setLoadError(null);
  }, []);

  const handleTriggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadUserImageFile(file);
    e.target.value = '';
  };

  const handleRestoreSample = useCallback(() => {
    handleSelectDemo(activeDemoId);
  }, [activeDemoId, handleSelectDemo]);

  const handleApplyAutoOptimize = useCallback(() => {
    if (!diagnostics) return;
    setSettings((prev) => ({
      ...prev,
      ...diagnostics.recommendedSettings,
    }));
    setActivePresetId(diagnostics.recommendedPresetId);
    setExportNotice('Auto-Optimasi diterapkan sesuai kondisi piksel foto.');
  }, [diagnostics]);

  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    setExportNotice(null);
  }, []);

  const handleUpdateSetting = useCallback(
    <K extends keyof EnhancementSettings>(key: K, value: EnhancementSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      if (key !== 'scaleFactor' && key !== 'format') {
        setActivePresetId(null);
      }
      setExportNotice(null);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setLayoutId('auto');
    if (isCustomUpload) {
      setFocalPoint({ x: 0.5, y: 0.45 });
      setSettings(DEFAULT_UPLOAD_SETTINGS);
      setActivePresetId('natural-hd');
    } else {
      const activeDemo = STUDIO_DEMOS.find((s) => s.id === activeDemoId) ?? STUDIO_DEMOS[0];
      const preset = getPresetById(activeDemo.defaultPresetId);
      setFocalPoint(activeDemo.defaultFocal);
      setSettings(
        preset ? { ...DEFAULT_RESTORED_SETTINGS, ...preset.settings } : DEFAULT_RESTORED_SETTINGS,
      );
      setActivePresetId(activeDemo.defaultPresetId);
    }
    setExportNotice(null);
  }, [activeDemoId, isCustomUpload]);

  const handleDownload = useCallback(() => {
    const img = hdImageObjRef.current;
    if (!img) return;

    setIsExporting(true);
    setExportNotice(null);

    requestAnimationFrame(() => {
      window.setTimeout(() => {
        try {
          const exportCanvas = document.createElement('canvas');
          const { width, height } = renderEnhancedToCanvas(
            img,
            exportCanvas,
            settings,
            undefined,
            layoutId,
            focalPoint,
          );
          const mimeType = settings.format === 'png' ? 'image/png' : 'image/jpeg';
          const ext = settings.format === 'png' ? 'png' : 'jpg';
          const safeSlug = photoTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          const ratioSlug = layoutId === 'auto' ? 'asli' : layoutId.replace(':', 'x');

          exportCanvas.toBlob(
            (blob) => {
              if (!blob) {
                setIsExporting(false);
                setExportNotice('Gagal menyiapkan file unduhan.');
                return;
              }
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `hdin-${safeSlug || 'foto'}-${ratioSlug}-${settings.scaleFactor}x.${ext}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.setTimeout(() => URL.revokeObjectURL(url), 1000);
              setIsExporting(false);
              setExportNotice(
                `Berhasil diunduh: ${width} × ${height} px (${formatMegapixels(width, height)})`,
              );
            },
            mimeType,
            settings.format === 'jpeg' ? 0.95 : undefined,
          );
        } catch {
          setIsExporting(false);
          setExportNotice('Terjadi kendala saat mengekspor resolusi penuh.');
        }
      }, 20);
    });
  }, [photoTitle, settings, layoutId, focalPoint]);

  const activeDimsForRatio = baseHdDims ?? originalDims ?? { width: 900, height: 1200 };
  const targetRatio = getTargetAspectRatio(
    layoutId,
    activeDimsForRatio.width,
    activeDimsForRatio.height,
  );
  const layoutOption = getAspectLayoutOption(layoutId);
  const layoutLabel =
    layoutId === 'auto'
      ? `Asli (${targetRatio < 0.99 ? 'Potret' : targetRatio > 1.01 ? 'Lanskap' : 'Persegi'})`
      : `${layoutOption.label} · ${layoutOption.subtitle}`;

  const outputDims = baseHdDims
    ? computeAspectOutputDimensions(
        baseHdDims.width,
        baseHdDims.height,
        layoutId,
        settings.scaleFactor,
        focalPoint,
      )
    : null;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <TopBar onDownload={handleDownload} isExporting={isExporting} />

      <main id="studio" className="mx-auto max-w-[1440px] px-4 pt-5 pb-14 sm:px-8">
        {/* Studio Header Row + Upload CTA & Clear Sample Explanation */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl text-balance [overflow-wrap:anywhere]">
              {isCustomUpload ? `Restorasi HD: ${photoTitle}` : `HDin Studio — ${photoTitle}`}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
              <span>{isCustomUpload ? 'Unggahan Anda' : categoryLabel}</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="font-mono tabular-nums">
                {outputDims
                  ? `Target ${outputDims.width} × ${outputDims.height} px (${formatMegapixels(outputDims.width, outputDims.height)})`
                  : 'Menyiapkan ukuran...'}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                Seret foto ke kanvas atau tempel (Ctrl+V) untuk mulai
              </span>
              <span aria-hidden="true">·</span>
              <a
                href="https://github.com/zenoxyn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-semibold text-[#F2B705] hover:text-[#ffd038] underline decoration-[#F2B705]/40 underline-offset-4 transition-colors"
              >
                <span>by zenoxyn</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
            {exportNotice && (
              <p
                role="status"
                aria-live="polite"
                className="mt-1.5 text-xs font-medium text-[#F2B705]"
              >
                {exportNotice}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-1.5 lg:items-end shrink-0">
            <p className="text-[11px] text-zinc-400">
              Unggah foto Anda sendiri, atau klik foto contoh untuk mencoba hasil HD:
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="inline-flex items-center gap-2 rounded-lg border border-[#F2B705]/60 bg-[#F2B705]/12 px-3.5 py-1.5 text-xs font-semibold text-[#F2B705] transition-colors duration-150 hover:bg-[#F2B705]/20 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Unggah Foto</span>
              </button>

              <div
                role="group"
                aria-label="Foto contoh untuk dicoba sebelum mengunggah"
                className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-[#141417] p-1"
              >
                {STUDIO_DEMOS.map((demo) => {
                  const isSelected = !isCustomUpload && activeDemoId === demo.id;
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleSelectDemo(demo.id)}
                      aria-pressed={isSelected}
                      title={`${demo.categoryLabel} — klik untuk melihat pratinjau contoh`}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 text-[#F2B705]'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      {demo.buttonLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main 12-Column Darkroom Workspace */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ComparisonStage
              originalUrl={originalUrl}
              enhancedFallbackUrl={enhancedBaseUrl}
              photoTitle={photoTitle}
              originalDims={originalDims}
              outputDims={outputDims}
              targetRatio={targetRatio}
              layoutLabel={layoutLabel}
              focalPoint={focalPoint}
              previewCanvasRef={previewCanvasRef}
              canvasReady={canvasReady}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              splitPercent={splitPercent}
              onChangeSplitPercent={setSplitPercent}
              onFileDrop={loadUserImageFile}
              isProcessing={isProcessing}
              loadError={loadError}
            />
          </div>

          <div className="lg:col-span-4">
            <InspectorPanel
              settings={settings}
              activePresetId={activePresetId}
              layoutId={layoutId}
              focalPoint={focalPoint}
              baseHdDims={baseHdDims}
              targetRatio={targetRatio}
              diagnostics={diagnostics}
              isCustomUpload={isCustomUpload}
              isExporting={isExporting}
              onApplyAutoOptimize={handleApplyAutoOptimize}
              onSelectLayout={(id) => {
                setLayoutId(id);
                setExportNotice(null);
              }}
              onChangeFocalPoint={(focal) => {
                setFocalPoint(focal);
                setExportNotice(null);
              }}
              onSelectPreset={handleSelectPreset}
              onUpdateSetting={handleUpdateSetting}
              onReset={handleReset}
              onTriggerUpload={handleTriggerUpload}
              onRestoreSample={handleRestoreSample}
              onDownload={handleDownload}
            />
          </div>
        </div>

        <TechniqueDetails
          isCustomUpload={isCustomUpload}
          photoTitle={photoTitle}
          categoryLabel={categoryLabel}
          layoutLabel={layoutLabel}
          originalDims={originalDims}
          outputDims={outputDims}
        />
      </main>

      <footer className="border-t border-zinc-800/80 py-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-8">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-200">
              HDin · Studio Restorasi &amp; Peningkatan Foto HD
            </span>
            <span className="text-xs text-zinc-500">
              Semua pemrosesan berjalan lokal di browser Anda untuk menjaga privasi foto.
            </span>
          </div>

          <a
            href="https://github.com/zenoxyn"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-xl border border-[#F2B705]/45 bg-[#141417] px-4 py-2.5 transition-colors duration-150 hover:border-[#F2B705] hover:bg-[#F2B705]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B705]"
          >
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium text-zinc-400">
                Dibuat oleh
              </span>
              <span className="text-sm font-semibold text-[#F2B705] group-hover:text-[#ffd038]">
                zenoxyn · github.com/zenoxyn
              </span>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F2B705] text-[#0A0A0B] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
}
