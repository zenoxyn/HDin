<div align="center">
  <h1>📸 HDin — Photo Restoration & HD Enhancement Studio</h1>
  <p><strong>Browser-based photo restoration studio for blurry, noisy & low-resolution shots</strong></p>
  <p>
    <a href="#-why-i-built-this">Why I Built This</a> •
    <a href="#-features">Features</a> •
    <a href="#-how-it-works">How It Works</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#%EF%B8%8F-deploying-to-vercel">Deploy</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-author">Author</a>
  </p>
  <p>Built by <a href="https://github.com/zenoxyn"><strong>@zenoxyn</strong></a></p>
</div>

---

## 💭 Why I Built This

I shoot with a **Canon PowerShot A2500** — a lightweight, travel-friendly compact camera. It's the kind of camera you actually carry, so it ends up in the bag on trips, quick walks, and low-light moments where you *shouldn't* be shooting.

The problem? A small 20-megapixel bridge camera has a tiny 1/2.3" sensor. That means:

- **Handshake blur** when the shutter speed drops in dim light
- **Heavy luminance noise** at high ISO, visible as colour speckle in shadows
- **Soft, mushy detail** once the image is cropped or enlarged
- **Washed-out, hazy contrast** on older or poorly-lit frames

Rather than buying new gear, I wanted a tool that rescues those photos *after* the fact. HDin is my answer: a **fully client-side enhancement studio** that analyses the actual pixel data of your image, picks a sensible restoration profile, and lets you fine-tune every step visually — with a before/after slider so you can judge the result instantly.

Everything runs **inside your browser**. Photos are never uploaded to a server, no API keys are required, and it works completely offline.

---

## ✨ Features

| Area | Description |
| --- | --- |
| **🖼️ Four comparison modes** | Interactive split slider, side-by-side, original-only, and enhanced-only — switch instantly to verify results |
| **🔍 Pixel diagnostics** | HDin measures luminance, tonal spread, edge sharpness, and noise from your file, then reports exactly what is wrong with it |
| **⚡ One-click Auto-Optimize** | Applies a tuned parameter set matched to the detected condition (low-light, hazy, soft, or noisy) |
| **🎛️ Six restoration presets** | Natural HD · Portrait & Faces · Old Photo · Night & High ISO · Landscape & City · Ultra 4K Print |
| **🎚️ Manual fine-tuning** | Seven live sliders: sharpness, clarity, dehaze, denoise, exposure, contrast, and vibrance |
| **📐 Smart framing** | 8 aspect layouts (Original, 1:1, 4:5, 3:4, 9:16, 4:3, 3:2, 16:9) with a draggable focal point so crops never decapitate your subject |
| **🔎 Detail zoom** | 100% / 150% / 200% preview zoom for pixel-peeping the restored result |
| **⬆️ Resolution boost** | Export at 1×, 2×, or 4× Ultra via progressive stepped resampling |
| **💾 One-click export** | Download as JPEG (q95) or PNG, auto-named `hdin-<photo>-<ratio>-<scale>x.<ext>` with the final resolution in MP |
| **📥 Three ways to load** | File picker, drag-and-drop onto the canvas, or paste straight from your clipboard with `Ctrl+V` / `Cmd+V` |
| **🧪 Built-in samples** | Portrait, city architecture, and landscape demos that auto-generate a degraded "before" frame so you can test the studio instantly |
| **🔒 Private by design** | Zero backend, zero uploads, zero API keys — pixel processing happens on-device via Canvas |

---

## ⚙️ How It Works

Every export runs a deterministic, dependency-free pipeline written in TypeScript and executed on the Canvas API.

**1. Diagnostics — understand the photo first**

A downsampled copy of your image is sampled and scored on four axes:

| Metric | Method | What it tells you |
| --- | --- | --- |
| Average luminance | Rec. 601 luma sum | Whether the frame is under- or over-exposed |
| Contrast spread | Luma standard deviation × 2.4 | Whether tones are crushed flat or punchy |
| Edge sharpness | Mean Sobel-style gradient | How soft the frame actually is |
| Noise estimate | Mean Laplacian variance in flat regions | How much grain / JPEG blocking is present |

Those four numbers drive the **Auto-Optimize** recommendation and the condition summary shown in the inspector.

**2. Restoration — a four-stage finishing pass**

| Stage | Technique |
| --- | --- |
| **Denoise** | Edge-preserving 3×3 bilateral-style pass with a similarity threshold, so grain is smoothed while edges and texture survive |
| **Sharpen & clarify** | 3×3 Gaussian unsharp mask with halo suppression (detail-energy gating) plus a local midtone clarity lift |
| **Dehaze & tone** | Black-lift tonal recovery to cut haze, then exposure, contrast, and saturation-aware selective vibrance |
| **Upscale** | Progressive 2× stepped resampling (`imageSmoothingQuality: 'high'`) instead of one brutal single-step stretch |

**3. Export — full resolution, full quality**

The preview renders at a capped 1440px edge for speed, but the download re-renders the **entire pipeline at native resolution** and encodes the result as JPEG (quality 0.95) or PNG.

---

## 🛠 Tech Stack

- **React 19** + **TypeScript** — strict, fully typed image pipeline
- **Vite 8** — instant dev server and optimized production builds
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — darkroom-inspired UI, zero config files
- **Lucide React** — iconography
- **Canvas 2D API** — the actual image processing engine (no WebAssembly, no native modules)
- **Node's built-in test runner** — 16 unit tests covering the pixel pipeline

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (developed on Node 22 / 24)

### Installation

```bash
# Clone & enter the project
git clone https://github.com/zenoxyn/HDin.git
cd HDin

# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

### All Commands

```bash
npm run dev      # Dev server with HMR on port 3000
npm run build    # Type-check + production bundle into ./dist
npm run preview  # Serve the production build locally
npm run lint     # TypeScript type-check only (no emit)
npm run clean    # Remove build artifacts
npm test         # Run the 16 image-pipeline unit tests
```

---

## ☁️ Deploying to Vercel

HDin is a **fully static SPA** — no server, no database, no environment variables. Connect the repo and every push to `main` redeploys automatically.

### One-time setup

1. Push this repo to GitHub.
2. Open [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → choose `zenoxyn/HDin`.
3. Vercel auto-detects the **Vite** preset:
   - **Build command** — `npm run build`
   - **Output directory** — `dist`
   - **Install command** — `npm install`
4. Hit **Deploy**. No environment variables to configure.

### Why it works out of the box

- The enhancement pipeline is pure browser JavaScript — nothing needs a runtime.
- `vite.config.ts` copies `src/assets` into `dist/src/assets` after each build, so the root-relative demo image URLs resolve correctly in production.
- `vercel.json` ships SPA rewrites (no 404s on deep links) and long-lived immutable caching for hashed build assets.

### Notes

- Vercel's Hobby plan is intended for **personal, non-commercial use** ([Vercel ToS §4](https://vercel.com/legal/terms)).
- `dist/` and `.vercel/` are gitignored — never commit build output.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── TopBar.tsx             # Header bar + export action
│   ├── ComparisonStage.tsx    # Canvas stage: 4 view modes, split slider, zoom, drag-drop
│   ├── InspectorPanel.tsx     # Diagnostics, presets, sliders, layout & focal controls
│   └── TechniqueDetails.tsx   # Per-photo breakdown of the applied techniques
├── utils/
│   ├── imageEnhancer.ts       # Core engine: diagnostics, denoise, unsharp mask, tone, export
│   └── imageEnhancer.test.ts  # 16 unit tests for the pixel pipeline
├── assets/images/             # Bundled demo photos (portrait, architecture, landscape)
├── App.tsx                    # Root state machine + studio layout
├── index.css                  # Tailwind v4 theme, fonts, custom slider styling
└── main.tsx                   # React entry point
```

---

## 📄 License

MIT — free to use, modify, and share for your own photo restoration workflow.

---

## 👤 Author

**Novanda Ega Arenta** ([@zenoxyn](https://github.com/zenoxyn))

- GitHub — [github.com/zenoxyn](https://github.com/zenoxyn)
- Repository — [github.com/zenoxyn/HDin](https://github.com/zenoxyn/HDin)

---

> **Disclaimer**: HDin is an independent, open-source project. It is not affiliated with, endorsed by, or sponsored by Canon Inc., Adobe, or any other vendor. All sample imagery bundled with this repository is included for demonstration purposes only.
