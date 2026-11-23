export type ScaleFactor = 1 | 2 | 4;
export type ExportFormat = 'jpeg' | 'png';
export type AspectLayoutId =
  | 'auto'
  | '1:1'
  | '4:5'
  | '3:4'
  | '9:16'
  | '4:3'
  | '3:2'
  | '16:9';

export interface AspectLayoutOption {
  id: AspectLayoutId;
  label: string;
  subtitle: string;
  group: 'otomatis' | 'potret' | 'persegi' | 'lanskap';
  ratio: number | null; // width / height; null means follow source image natural ratio
}

export interface FocalPoint {
  x: number; // 0 (left) to 1 (right)
  y: number; // 0 (top) to 1 (bottom)
}

export const ASPECT_LAYOUTS: AspectLayoutOption[] = [
  {
    id: 'auto',
    label: 'Asli',
    subtitle: 'Sesuai foto',
    group: 'otomatis',
    ratio: null,
  },
  {
    id: '1:1',
    label: '1:1',
    subtitle: 'Persegi',
    group: 'persegi',
    ratio: 1,
  },
  {
    id: '4:5',
    label: '4:5',
    subtitle: 'Feed IG',
    group: 'potret',
    ratio: 4 / 5,
  },
  {
    id: '3:4',
    label: '3:4',
    subtitle: 'Potret',
    group: 'potret',
    ratio: 3 / 4,
  },
  {
    id: '9:16',
    label: '9:16',
    subtitle: 'Story / Reels',
    group: 'potret',
    ratio: 9 / 16,
  },
  {
    id: '4:3',
    label: '4:3',
    subtitle: 'Layar HP',
    group: 'lanskap',
    ratio: 4 / 3,
  },
  {
    id: '3:2',
    label: '3:2',
    subtitle: 'Kamera',
    group: 'lanskap',
    ratio: 3 / 2,
  },
  {
    id: '16:9',
    label: '16:9',
    subtitle: 'Layar lebar',
    group: 'lanskap',
    ratio: 16 / 9,
  },
];

export interface EnhancementSettings {
  sharpness: number; // 0 to 100
  clarity: number; // 0 to 100
  dehaze: number; // 0 to 100
  denoise: number; // 0 to 100
  exposure: number; // -30 to +30
  contrast: number; // -30 to +50
  vibrance: number; // -30 to +50
  scaleFactor: ScaleFactor;
  format: ExportFormat;
}

export interface EnhancementPreset {
  id: string;
  label: string;
  description: string;
  settings: Omit<EnhancementSettings, 'scaleFactor' | 'format'>;
}

export interface ImageDiagnostics {
  avgLuminance: number; // 0..255
  contrastSpread: number; // 0..255
  edgeSharpness: number; // 0..100 normalized estimate
  noiseEstimate: number; // 0..100 normalized estimate
  summaryLabel: string;
  recommendedPresetId: string;
  recommendedSettings: Omit<EnhancementSettings, 'scaleFactor' | 'format'>;
}

export const DEFAULT_RESTORED_SETTINGS: EnhancementSettings = {
  sharpness: 32,
  clarity: 18,
  dehaze: 12,
  denoise: 8,
  exposure: 2,
  contrast: 8,
  vibrance: 8,
  scaleFactor: 2,
  format: 'jpeg',
};

export const DEFAULT_UPLOAD_SETTINGS: EnhancementSettings = {
  sharpness: 52,
  clarity: 28,
  dehaze: 18,
  denoise: 20,
  exposure: 2,
  contrast: 12,
  vibrance: 10,
  scaleFactor: 2,
  format: 'jpeg',
};

export const PRESET_PROFILES: EnhancementPreset[] = [
  {
    id: 'natural-hd',
    label: 'Natural HD',
    description: 'Ketajaman seimbang dengan warna tetap alami untuk segala jenis foto.',
    settings: {
      sharpness: 32,
      clarity: 18,
      dehaze: 12,
      denoise: 8,
      exposure: 2,
      contrast: 8,
      vibrance: 8,
    },
  },
  {
    id: 'potret-wajah',
    label: 'Potret & Wajah',
    description: 'Menajamkan detail mata, rambut, dan pakaian tanpa merusak tekstur kulit.',
    settings: {
      sharpness: 48,
      clarity: 22,
      dehaze: 10,
      denoise: 16,
      exposure: 4,
      contrast: 10,
      vibrance: 8,
    },
  },
  {
    id: 'foto-lama',
    label: 'Foto Lama',
    description: 'Memulihkan foto pudar, kabut tipis, dan artefak kompresi lawas.',
    settings: {
      sharpness: 56,
      clarity: 32,
      dehaze: 36,
      denoise: 30,
      exposure: 3,
      contrast: 18,
      vibrance: 12,
    },
  },
  {
    id: 'malam-bersih',
    label: 'Malam & ISO Tinggi',
    description: 'Meredam bintik noise di cahaya minim sekaligus mengangkat detail bayangan.',
    settings: {
      sharpness: 38,
      clarity: 20,
      dehaze: 16,
      denoise: 52,
      exposure: 10,
      contrast: 10,
      vibrance: 10,
    },
  },
  {
    id: 'lanskap-detail',
    label: 'Lanskap & Kota',
    description: 'Kejernihan tinggi untuk dedaunan, tekstur batu, dan detail bangunan.',
    settings: {
      sharpness: 60,
      clarity: 40,
      dehaze: 28,
      denoise: 10,
      exposure: 0,
      contrast: 14,
      vibrance: 14,
    },
  },
  {
    id: 'cetak-4k',
    label: 'Cetak Ultra 4K',
    description: 'Ketajaman maksimal untuk hasil cetak atau layar resolusi tinggi.',
    settings: {
      sharpness: 74,
      clarity: 38,
      dehaze: 18,
      denoise: 14,
      exposure: 0,
      contrast: 16,
      vibrance: 10,
    },
  },
];

export function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value);
}

export function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function getAspectLayoutOption(layoutId: AspectLayoutId): AspectLayoutOption {
  return ASPECT_LAYOUTS.find((item) => item.id === layoutId) ?? ASPECT_LAYOUTS[0];
}

export function getTargetAspectRatio(
  layoutId: AspectLayoutId,
  sourceWidth: number,
  sourceHeight: number,
): number {
  const safeW = Math.max(1, Number.isFinite(sourceWidth) ? sourceWidth : 1);
  const safeH = Math.max(1, Number.isFinite(sourceHeight) ? sourceHeight : 1);
  const option = getAspectLayoutOption(layoutId);
  return option.ratio ?? safeW / safeH;
}

export function computeCroppedSourceRect(
  sourceWidth: number,
  sourceHeight: number,
  targetRatio: number,
  focal: FocalPoint = { x: 0.5, y: 0.5 },
): { sx: number; sy: number; sWidth: number; sHeight: number } {
  const safeW = Math.max(1, Math.round(Number.isFinite(sourceWidth) ? sourceWidth : 1));
  const safeH = Math.max(1, Math.round(Number.isFinite(sourceHeight) ? sourceHeight : 1));
  const safeRatio = Math.max(0.05, Number.isFinite(targetRatio) ? targetRatio : safeW / safeH);

  const srcRatio = safeW / safeH;
  const fx = clampUnit(focal.x);
  const fy = clampUnit(focal.y);

  if (Math.abs(srcRatio - safeRatio) < 0.005) {
    return { sx: 0, sy: 0, sWidth: safeW, sHeight: safeH };
  }

  if (srcRatio > safeRatio) {
    const sHeight = safeH;
    const sWidth = Math.max(1, Math.round(safeH * safeRatio));
    const maxOffsetX = Math.max(0, safeW - sWidth);
    const sx = Math.round(maxOffsetX * fx);
    return { sx, sy: 0, sWidth, sHeight };
  } else {
    const sWidth = safeW;
    const sHeight = Math.max(1, Math.round(safeW / safeRatio));
    const maxOffsetY = Math.max(0, safeH - sHeight);
    const sy = Math.round(maxOffsetY * fy);
    return { sx: 0, sy, sWidth, sHeight };
  }
}

export function computeOutputDimensions(
  baseWidth: number,
  baseHeight: number,
  scaleFactor: ScaleFactor,
): { width: number; height: number } {
  const safeW = Math.max(1, Math.round(Number.isFinite(baseWidth) ? baseWidth : 1));
  const safeH = Math.max(1, Math.round(Number.isFinite(baseHeight) ? baseHeight : 1));
  return {
    width: safeW * scaleFactor,
    height: safeH * scaleFactor,
  };
}

export function computeAspectOutputDimensions(
  baseWidth: number,
  baseHeight: number,
  layoutId: AspectLayoutId,
  scaleFactor: ScaleFactor,
  focal: FocalPoint = { x: 0.5, y: 0.5 },
): { width: number; height: number } {
  const ratio = getTargetAspectRatio(layoutId, baseWidth, baseHeight);
  const crop = computeCroppedSourceRect(baseWidth, baseHeight, ratio, focal);
  return computeOutputDimensions(crop.sWidth, crop.sHeight, scaleFactor);
}

export function formatMegapixels(width: number, height: number): string {
  const safeW = Math.max(0, width);
  const safeH = Math.max(0, height);
  const mp = (safeW * safeH) / 1_000_000;
  return `${mp.toFixed(1)} MP`;
}

export function computeSplitPercentFromPointer(
  clientX: number,
  rectLeft: number,
  rectWidth: number,
): number {
  if (!Number.isFinite(rectWidth) || rectWidth <= 0) return 50;
  const ratio = ((clientX - rectLeft) / rectWidth) * 100;
  if (ratio < 2) return 2;
  if (ratio > 98) return 98;
  return Math.round(ratio * 10) / 10;
}

export function getPresetById(id: string): EnhancementPreset | undefined {
  return PRESET_PROFILES.find((preset) => preset.id === id);
}

export function isNeutralEnhancement(settings: EnhancementSettings): boolean {
  return (
    settings.sharpness === 0 &&
    settings.clarity === 0 &&
    settings.dehaze === 0 &&
    settings.denoise === 0 &&
    settings.exposure === 0 &&
    settings.contrast === 0 &&
    settings.vibrance === 0
  );
}

/**
 * Pure deterministic pixel diagnostics:
 * Evaluates luminance, tonal spread, edge gradient sharpness, and flat-region noise
 * to recommend optimal general HD restoration parameters for any uploaded photo.
 */
export function analyzePixelBuffer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ImageDiagnostics {
  const totalPixels = width * height;
  if (width <= 2 || height <= 2 || data.length < totalPixels * 4) {
    return {
      avgLuminance: 128,
      contrastSpread: 60,
      edgeSharpness: 50,
      noiseEstimate: 15,
      summaryLabel: 'Kondisi Standar · Siap Ditingkatkan',
      recommendedPresetId: 'natural-hd',
      recommendedSettings: { ...PRESET_PROFILES[0].settings },
    };
  }

  let lumSum = 0;
  let lumSqSum = 0;
  let gradSum = 0;
  let gradCount = 0;
  let flatNoiseSum = 0;
  let flatCount = 0;

  const lums = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    lums[i] = lum;
    lumSum += lum;
    lumSqSum += lum * lum;
  }

  const avgLuminance = lumSum / totalPixels;
  const variance = Math.max(0, lumSqSum / totalPixels - avgLuminance * avgLuminance);
  const stdDev = Math.sqrt(variance);
  const contrastSpread = Math.min(255, Math.round(stdDev * 2.4));

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx = Math.abs(lums[i + 1] - lums[i - 1]);
      const gy = Math.abs(lums[i + width] - lums[i - width]);
      const g = (gx + gy) * 0.5;
      gradSum += g;
      gradCount++;

      // Measure Laplacian micro-variation in truly flat areas for noise estimation
      if (g < 8) {
        const lap = Math.abs(
          4 * lums[i] - lums[i - 1] - lums[i + 1] - lums[i - width] - lums[i + width],
        );
        flatNoiseSum += lap;
        flatCount++;
      }
    }
  }

  const avgGrad = gradCount > 0 ? gradSum / gradCount : 10;
  const edgeSharpness = Math.min(100, Math.max(0, Math.round((avgGrad / 28) * 100)));
  const avgFlatLap = flatCount > 0 ? flatNoiseSum / flatCount : 3;
  const noiseEstimate = Math.min(100, Math.max(0, Math.round((avgFlatLap / 28) * 100)));

  const isLowLight = avgLuminance < 85;
  const isFadedOrHazy = contrastSpread < 95 && avgLuminance >= 85;
  const isSoft = edgeSharpness < 42;
  const isNoisy = noiseEstimate > 34;

  let summaryLabel = 'Kondisi seimbang · Siap ditingkatkan';
  let recommendedPresetId = 'natural-hd';

  if (isLowLight && isNoisy) {
    summaryLabel = 'Cahaya minim & berbintik · Cocok mode Malam';
    recommendedPresetId = 'malam-bersih';
  } else if (isLowLight) {
    summaryLabel = 'Agak gelap · Perlu naikkan pencahayaan';
    recommendedPresetId = 'malam-bersih';
  } else if (isFadedOrHazy) {
    summaryLabel = 'Agak pudar / berkabut · Perlu anti-kabut';
    recommendedPresetId = 'foto-lama';
  } else if (isSoft) {
    summaryLabel = 'Detail agak lunak · Perlu penajaman';
    recommendedPresetId = 'lanskap-detail';
  }

  const sharpness = Math.min(82, Math.max(28, Math.round(68 - edgeSharpness * 0.45)));
  const clarity = Math.min(48, Math.max(16, Math.round(18 + (100 - contrastSpread * 0.38) * 0.25)));
  const dehaze = isFadedOrHazy ? 34 : contrastSpread < 125 ? 20 : 10;
  const denoise = isNoisy ? Math.min(62, Math.round(18 + noiseEstimate * 0.55)) : 10;
  const exposure = avgLuminance < 75 ? 12 : avgLuminance < 100 ? 6 : avgLuminance > 205 ? -6 : 2;
  const contrast = contrastSpread < 95 ? 18 : contrastSpread < 130 ? 12 : 6;
  const vibrance = isFadedOrHazy ? 14 : 8;

  return {
    avgLuminance: Math.round(avgLuminance),
    contrastSpread,
    edgeSharpness,
    noiseEstimate,
    summaryLabel,
    recommendedPresetId,
    recommendedSettings: {
      sharpness,
      clarity,
      dehaze,
      denoise,
      exposure,
      contrast,
      vibrance,
    },
  };
}

/**
 * Pure deterministic pixel-buffer HD finishing pipeline:
 * 1) Edge-preserving 3x3 bilateral-like denoise pass (reduces ISO grain & JPEG block noise)
 * 2) 3x3 Gaussian Unsharp Mask (sharpness) with halo-suppression + local midtone clarity
 * 3) Anti-haze (dehaze) tonal recovery, exposure, contrast, and selective vibrance mapping
 */
export function applyUnsharpMaskAndTone(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  settings: EnhancementSettings,
): Uint8ClampedArray {
  const totalPixels = width * height;
  if (width <= 0 || height <= 0 || srcData.length < totalPixels * 4) {
    return new Uint8ClampedArray(srcData);
  }

  if (isNeutralEnhancement(settings)) {
    return new Uint8ClampedArray(srcData);
  }

  const out = new Uint8ClampedArray(srcData.length);
  const working = new Uint8ClampedArray(srcData);

  // Step 1: Edge-preserving denoise if requested
  if (settings.denoise > 0 && width >= 3 && height >= 3) {
    const denoiseStrength = Math.min(1, Math.max(0, settings.denoise / 100));
    const threshold = 18 + denoiseStrength * 36;
    const denoised = new Uint8ClampedArray(working.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          denoised[idx] = working[idx];
          denoised[idx + 1] = working[idx + 1];
          denoised[idx + 2] = working[idx + 2];
          denoised[idx + 3] = working[idx + 3];
          continue;
        }

        const cR = working[idx];
        const cG = working[idx + 1];
        const cB = working[idx + 2];

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let weightSum = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const nR = working[nIdx];
            const nG = working[nIdx + 1];
            const nB = working[nIdx + 2];

            const diff = Math.abs(nR - cR) + Math.abs(nG - cG) + Math.abs(nB - cB);
            if (diff <= threshold * 3) {
              const w = kx === 0 && ky === 0 ? 2 : 1;
              sumR += nR * w;
              sumG += nG * w;
              sumB += nB * w;
              weightSum += w;
            }
          }
        }

        const avgR = sumR / weightSum;
        const avgG = sumG / weightSum;
        const avgB = sumB / weightSum;

        denoised[idx] = clampByte(cR + (avgR - cR) * denoiseStrength);
        denoised[idx + 1] = clampByte(cG + (avgG - cG) * denoiseStrength);
        denoised[idx + 2] = clampByte(cB + (avgB - cB) * denoiseStrength);
        denoised[idx + 3] = working[idx + 3];
      }
    }
    working.set(denoised);
  }

  // Step 2: Unsharp mask (sharpness + local clarity) & tone adjustments + dehaze
  const sharpAmount = (settings.sharpness / 100) * 1.45;
  const clarityAmount = (settings.clarity / 100) * 0.45;
  const dehazeStrength = Math.max(0, Math.min(1, settings.dehaze / 100));
  const dehazeBlackLift = dehazeStrength * 14;
  const dehazeScale = 255 / Math.max(200, 255 - dehazeBlackLift * 1.4);
  const exposureFactor = Math.pow(2, settings.exposure / 40);
  const contrastFactor = 1 + settings.contrast / 100;
  const vibranceAmount = settings.vibrance / 100 + dehazeStrength * 0.12;

  for (let y = 0; y < height; y++) {
    const yPrev = Math.max(0, y - 1);
    const yNext = Math.min(height - 1, y + 1);

    for (let x = 0; x < width; x++) {
      const xPrev = Math.max(0, x - 1);
      const xNext = Math.min(width - 1, x + 1);
      const idx = (y * width + x) * 4;

      let r = working[idx];
      let g = working[idx + 1];
      let b = working[idx + 2];
      const a = working[idx + 3];

      if (sharpAmount > 0 || clarityAmount > 0) {
        const iTL = (yPrev * width + xPrev) * 4;
        const iTC = (yPrev * width + x) * 4;
        const iTR = (yPrev * width + xNext) * 4;
        const iML = (y * width + xPrev) * 4;
        const iMR = (y * width + xNext) * 4;
        const iBL = (yNext * width + xPrev) * 4;
        const iBC = (yNext * width + x) * 4;
        const iBR = (yNext * width + xNext) * 4;

        const blurR =
          (working[iTL] +
            2 * working[iTC] +
            working[iTR] +
            2 * working[iML] +
            4 * r +
            2 * working[iMR] +
            working[iBL] +
            2 * working[iBC] +
            working[iBR]) /
          16;
        const blurG =
          (working[iTL + 1] +
            2 * working[iTC + 1] +
            working[iTR + 1] +
            2 * working[iML + 1] +
            4 * g +
            2 * working[iMR + 1] +
            working[iBL + 1] +
            2 * working[iBC + 1] +
            working[iBR + 1]) /
          16;
        const blurB =
          (working[iTL + 2] +
            2 * working[iTC + 2] +
            working[iTR + 2] +
            2 * working[iML + 2] +
            4 * b +
            2 * working[iMR + 2] +
            working[iBL + 2] +
            2 * working[iBC + 2] +
            working[iBR + 2]) /
          16;

        const detailR = r - blurR;
        const detailG = g - blurG;
        const detailB = b - blurB;

        const detailEnergy = Math.abs(detailR) + Math.abs(detailG) + Math.abs(detailB);
        const gate = detailEnergy > 6 ? 1 : detailEnergy / 6;

        const gain = sharpAmount * gate + clarityAmount;
        r = r + detailR * gain;
        g = g + detailG * gain;
        b = b + detailB * gain;
      }

      if (dehazeStrength > 0) {
        r = (r - dehazeBlackLift) * dehazeScale;
        g = (g - dehazeBlackLift) * dehazeScale;
        b = (b - dehazeBlackLift) * dehazeScale;
      }

      if (settings.exposure !== 0) {
        r *= exposureFactor;
        g *= exposureFactor;
        b *= exposureFactor;
      }

      if (settings.contrast !== 0) {
        r = (r - 128) * contrastFactor + 128;
        g = (g - 128) * contrastFactor + 128;
        b = (b - 128) * contrastFactor + 128;
      }

      if (vibranceAmount !== 0) {
        const maxCh = Math.max(r, g, b);
        const minCh = Math.min(r, g, b);
        const avg = (r + g + b) / 3;
        const sat = maxCh > 0 ? (maxCh - minCh) / 255 : 0;
        const boost = vibranceAmount * (1 - sat * 0.75);
        r = r + (r - avg) * boost;
        g = g + (g - avg) * boost;
        b = b + (b - avg) * boost;
      }

      out[idx] = clampByte(r);
      out[idx + 1] = clampByte(g);
      out[idx + 2] = clampByte(b);
      out[idx + 3] = a;
    }
  }

  return out;
}

/**
 * Samples an HTMLImageElement onto a compact analysis canvas and returns pixel diagnostics.
 */
export function analyzeImageElement(sourceImg: HTMLImageElement): ImageDiagnostics {
  const naturalW = sourceImg.naturalWidth || sourceImg.width;
  const naturalH = sourceImg.naturalHeight || sourceImg.height;
  const maxDim = 160;
  const scale = Math.min(1, maxDim / Math.max(1, naturalW, naturalH));
  const sampleW = Math.max(8, Math.round(naturalW * scale));
  const sampleH = Math.max(8, Math.round(naturalH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return analyzePixelBuffer(new Uint8ClampedArray(0), 0, 0);
  }
  ctx.drawImage(sourceImg, 0, 0, sampleW, sampleH);
  const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
  return analyzePixelBuffer(imgData.data, sampleW, sampleH);
}

/**
 * Creates a realistic degraded "low-res / soft / slightly faded" Before preview URL
 * from a clean studio demo image so users can interactively test the restoration slider.
 */
export function createDegradedDemoDataUrl(sourceImg: HTMLImageElement): string {
  const naturalW = sourceImg.naturalWidth || sourceImg.width;
  const naturalH = sourceImg.naturalHeight || sourceImg.height;
  const lowW = Math.max(120, Math.round(naturalW * 0.28));
  const lowH = Math.max(120, Math.round(naturalH * 0.28));

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = lowW;
  smallCanvas.height = lowH;
  const sCtx = smallCanvas.getContext('2d');
  if (!sCtx) return sourceImg.src;

  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = 'low';
  sCtx.filter = 'contrast(0.84) saturate(0.82) brightness(0.96) blur(0.6px)';
  sCtx.drawImage(sourceImg, 0, 0, lowW, lowH);

  return smallCanvas.toDataURL('image/jpeg', 0.58);
}

/**
 * Browser Canvas pipeline:
 * 1) Crops source image cleanly to the chosen AspectLayoutId & focal point
 * 2) Applies progressive 2x stepped resampling for crisp upscaling
 * 3) Runs deterministic Unsharp Mask, dehaze, & tone finishing
 */
export function renderEnhancedToCanvas(
  sourceImg: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
  settings: EnhancementSettings,
  maxPreviewEdge?: number,
  layoutId: AspectLayoutId = 'auto',
  focal: FocalPoint = { x: 0.5, y: 0.5 },
): { width: number; height: number } {
  const naturalW = sourceImg.naturalWidth || sourceImg.width;
  const naturalH = sourceImg.naturalHeight || sourceImg.height;

  const targetRatio = getTargetAspectRatio(layoutId, naturalW, naturalH);
  const crop = computeCroppedSourceRect(naturalW, naturalH, targetRatio, focal);
  const desired = computeOutputDimensions(crop.sWidth, crop.sHeight, settings.scaleFactor);

  let targetW = desired.width;
  let targetH = desired.height;

  if (maxPreviewEdge && Math.max(targetW, targetH) > maxPreviewEdge) {
    const ratio = maxPreviewEdge / Math.max(targetW, targetH);
    targetW = Math.max(1, Math.round(targetW * ratio));
    targetH = Math.max(1, Math.round(targetH * ratio));
  }

  let currentCanvas = document.createElement('canvas');
  currentCanvas.width = crop.sWidth;
  currentCanvas.height = crop.sHeight;
  const initCtx = currentCanvas.getContext('2d');
  if (!initCtx) {
    return { width: targetW, height: targetH };
  }
  initCtx.imageSmoothingEnabled = true;
  initCtx.imageSmoothingQuality = 'high';
  initCtx.drawImage(
    sourceImg,
    crop.sx,
    crop.sy,
    crop.sWidth,
    crop.sHeight,
    0,
    0,
    crop.sWidth,
    crop.sHeight,
  );

  while (currentCanvas.width * 2 <= targetW && currentCanvas.height * 2 <= targetH) {
    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = currentCanvas.width * 2;
    stepCanvas.height = currentCanvas.height * 2;
    const stepCtx = stepCanvas.getContext('2d');
    if (!stepCtx) break;
    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(currentCanvas, 0, 0, stepCanvas.width, stepCanvas.height);
    currentCanvas = stepCanvas;
  }

  targetCanvas.width = targetW;
  targetCanvas.height = targetH;
  const targetCtx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!targetCtx) {
    return { width: targetW, height: targetH };
  }

  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  targetCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);

  if (!isNeutralEnhancement(settings)) {
    const imgData = targetCtx.getImageData(0, 0, targetW, targetH);
    const processed = applyUnsharpMaskAndTone(imgData.data, targetW, targetH, settings);
    imgData.data.set(processed);
    targetCtx.putImageData(imgData, 0, 0);
  }

  return { width: targetW, height: targetH };
}
