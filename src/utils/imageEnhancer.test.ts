import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzePixelBuffer,
  applyUnsharpMaskAndTone,
  ASPECT_LAYOUTS,
  clampByte,
  computeAspectOutputDimensions,
  computeCroppedSourceRect,
  computeOutputDimensions,
  computeSplitPercentFromPointer,
  DEFAULT_RESTORED_SETTINGS,
  formatMegapixels,
  getPresetById,
  getTargetAspectRatio,
  isNeutralEnhancement,
  PRESET_PROFILES,
  type EnhancementSettings,
} from './imageEnhancer';

const NEUTRAL: EnhancementSettings = {
  sharpness: 0,
  clarity: 0,
  dehaze: 0,
  denoise: 0,
  exposure: 0,
  contrast: 0,
  vibrance: 0,
  scaleFactor: 1,
  format: 'jpeg',
};

test('clampByte restricts out-of-range and non-finite values', () => {
  assert.equal(clampByte(-12), 0);
  assert.equal(clampByte(0), 0);
  assert.equal(clampByte(127.6), 128);
  assert.equal(clampByte(300), 255);
  assert.equal(clampByte(Number.NaN), 0);
});

test('computeOutputDimensions multiplies by 1x, 2x, 4x accurately', () => {
  assert.deepEqual(computeOutputDimensions(1200, 896, 1), { width: 1200, height: 896 });
  assert.deepEqual(computeOutputDimensions(1200, 896, 2), { width: 2400, height: 1792 });
  assert.deepEqual(computeOutputDimensions(1200, 896, 4), { width: 4800, height: 3584 });
  assert.deepEqual(computeOutputDimensions(0, -10, 2), { width: 2, height: 2 });
});

test('ASPECT_LAYOUTS includes all standard portrait, square, and landscape ratios', () => {
  const ids = ASPECT_LAYOUTS.map((l) => l.id);
  for (const required of ['auto', '1:1', '4:5', '3:4', '9:16', '4:3', '3:2', '16:9'] as const) {
    assert.ok(ids.includes(required), `Missing aspect layout: ${required}`);
  }
});

test('getTargetAspectRatio resolves auto to source ratio and presets to numeric ratios', () => {
  assert.equal(getTargetAspectRatio('auto', 900, 1200), 0.75);
  assert.equal(getTargetAspectRatio('1:1', 1200, 896), 1);
  assert.equal(getTargetAspectRatio('4:5', 1200, 896), 0.8);
  assert.equal(getTargetAspectRatio('16:9', 900, 1200), 16 / 9);
});

test('computeCroppedSourceRect crops landscape to portrait 4:5 and respects focal offset', () => {
  const centerCrop = computeCroppedSourceRect(1200, 900, 4 / 5, { x: 0.5, y: 0.5 });
  assert.equal(centerCrop.sHeight, 900);
  assert.equal(centerCrop.sWidth, 720);
  assert.equal(centerCrop.sx, 240);
  assert.equal(centerCrop.sy, 0);

  const leftCrop = computeCroppedSourceRect(1200, 900, 4 / 5, { x: 0, y: 0.5 });
  assert.equal(leftCrop.sx, 0);

  const rightCrop = computeCroppedSourceRect(1200, 900, 4 / 5, { x: 1, y: 0.5 });
  assert.equal(rightCrop.sx, 480);
});

test('computeCroppedSourceRect crops portrait to widescreen 16:9 and respects vertical focal offset', () => {
  const topCrop = computeCroppedSourceRect(900, 1200, 16 / 9, { x: 0.5, y: 0 });
  assert.equal(topCrop.sWidth, 900);
  assert.equal(topCrop.sHeight, 506);
  assert.equal(topCrop.sy, 0);

  const bottomCrop = computeCroppedSourceRect(900, 1200, 16 / 9, { x: 0.5, y: 1 });
  assert.equal(bottomCrop.sy, 694);
});

test('computeAspectOutputDimensions scales cropped region accurately', () => {
  assert.deepEqual(computeAspectOutputDimensions(1200, 900, '1:1', 4), {
    width: 3600,
    height: 3600,
  });
  assert.deepEqual(computeAspectOutputDimensions(900, 1200, '4:5', 2), {
    width: 1800,
    height: 2250,
  });
});

test('formatMegapixels formats resolution cleanly', () => {
  assert.equal(formatMegapixels(4608, 3456), '15.9 MP');
  assert.equal(formatMegapixels(2400, 1792), '4.3 MP');
  assert.equal(formatMegapixels(4800, 3584), '17.2 MP');
});

test('computeSplitPercentFromPointer clamps within [2, 98]', () => {
  assert.equal(computeSplitPercentFromPointer(100, 100, 400), 2);
  assert.equal(computeSplitPercentFromPointer(300, 100, 400), 50);
  assert.equal(computeSplitPercentFromPointer(600, 100, 400), 98);
  assert.equal(computeSplitPercentFromPointer(200, 100, 0), 50);
});

test('isNeutralEnhancement detects zeroed finishing parameters', () => {
  assert.equal(isNeutralEnhancement(NEUTRAL), true);
  assert.equal(isNeutralEnhancement(DEFAULT_RESTORED_SETTINGS), false);
});

test('applyUnsharpMaskAndTone preserves buffer identically when neutral', () => {
  const src = new Uint8ClampedArray([
    100, 120, 140, 255,
    110, 130, 150, 255,
    120, 140, 160, 255,
    130, 150, 170, 255,
  ]);
  const out = applyUnsharpMaskAndTone(src, 2, 2, NEUTRAL);
  assert.deepEqual(Array.from(out), Array.from(src));
});

test('applyUnsharpMaskAndTone increases edge contrast across a sharp step boundary', () => {
  const width = 4;
  const height = 3;
  const src = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const val = x < 2 ? 80 : 160;
      src[idx] = val;
      src[idx + 1] = val;
      src[idx + 2] = val;
      src[idx + 3] = 255;
    }
  }

  const out = applyUnsharpMaskAndTone(src, width, height, {
    ...NEUTRAL,
    sharpness: 80,
  });

  const darkEdgeIdx = (1 * width + 1) * 4;
  const brightEdgeIdx = (1 * width + 2) * 4;

  assert.ok(out[darkEdgeIdx] < 80, `Expected < 80, got ${out[darkEdgeIdx]}`);
  assert.ok(out[brightEdgeIdx] > 160, `Expected > 160, got ${out[brightEdgeIdx]}`);
});

test('applyUnsharpMaskAndTone dehaze deepens flat hazy shadows cleanly', () => {
  const src = new Uint8ClampedArray([
    110, 110, 110, 255,
    180, 180, 180, 255,
    130, 130, 130, 255,
    160, 160, 160, 255,
  ]);
  const out = applyUnsharpMaskAndTone(src, 2, 2, {
    ...NEUTRAL,
    dehaze: 80,
  });
  assert.ok(out[0] < 110, `Expected dark tones to deepen with dehaze, got ${out[0]}`);
});

test('applyUnsharpMaskAndTone denoise smooths isolated single-pixel noise spike', () => {
  const width = 3;
  const height = 3;
  const src = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    src[i * 4] = 100;
    src[i * 4 + 1] = 100;
    src[i * 4 + 2] = 100;
    src[i * 4 + 3] = 255;
  }
  const centerIdx = 4 * 4;
  src[centerIdx] = 130;
  src[centerIdx + 1] = 130;
  src[centerIdx + 2] = 130;

  const out = applyUnsharpMaskAndTone(src, width, height, {
    ...NEUTRAL,
    denoise: 100,
  });

  assert.ok(
    out[centerIdx] < 120 && out[centerIdx] >= 100,
    `Expected center noise spike to reduce toward 100, got ${out[centerIdx]}`,
  );
});

test('analyzePixelBuffer detects low-light and hazy conditions accurately', () => {
  const width = 8;
  const height = 8;
  const darkBuf = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    darkBuf[i * 4] = 35;
    darkBuf[i * 4 + 1] = 35;
    darkBuf[i * 4 + 2] = 40;
    darkBuf[i * 4 + 3] = 255;
  }
  const darkDiag = analyzePixelBuffer(darkBuf, width, height);
  assert.equal(darkDiag.recommendedPresetId, 'malam-bersih');
  assert.ok(darkDiag.recommendedSettings.exposure > 0);

  const hazyBuf = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const v = i % 2 === 0 ? 128 : 138;
    hazyBuf[i * 4] = v;
    hazyBuf[i * 4 + 1] = v;
    hazyBuf[i * 4 + 2] = v;
    hazyBuf[i * 4 + 3] = 255;
  }
  const hazyDiag = analyzePixelBuffer(hazyBuf, width, height);
  assert.equal(hazyDiag.recommendedPresetId, 'foto-lama');
  assert.ok(hazyDiag.recommendedSettings.dehaze >= 30);
});

test('all preset profiles exist and produce valid alpha-preserved output', () => {
  const src = new Uint8ClampedArray(3 * 3 * 4).fill(128);
  for (let i = 0; i < 9; i++) {
    src[i * 4 + 3] = 255;
  }

  for (const preset of PRESET_PROFILES) {
    assert.ok(getPresetById(preset.id), `Preset ${preset.id} should be retrievable`);
    const out = applyUnsharpMaskAndTone(src, 3, 3, {
      ...preset.settings,
      scaleFactor: 2,
      format: 'jpeg',
    });
    assert.equal(out.length, src.length);
    for (let i = 0; i < 9; i++) {
      assert.equal(out[i * 4 + 3], 255);
    }
  }
});
