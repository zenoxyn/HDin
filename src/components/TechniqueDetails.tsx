import { formatMegapixels } from '../utils/imageEnhancer';

interface TechniqueDetailsProps {
  isCustomUpload: boolean;
  photoTitle: string;
  categoryLabel: string;
  layoutLabel: string;
  originalDims: { width: number; height: number } | null;
  outputDims: { width: number; height: number } | null;
}

const RESTORATION_STEPS = [
  {
    index: '01.',
    title: 'Analisis Kondisi Piksel Otomatis',
    description:
      'Mendeteksi terang-gelap, kontras, dan ketajaman tepi secara otomatis agar detail wajah, teks, dedaunan, maupun bangunan kembali tajam tanpa efek berlebihan.',
  },
  {
    index: '02.',
    title: 'Redam Noise & Anti-Kabut Pudar',
    description:
      'Membersihkan bintik foto cahaya minim, artefak kompresi media sosial, serta lapisan kabut pudar pada foto lama agar warna dan kontras kembali bersih.',
  },
  {
    index: '03.',
    title: 'Rasio Fleksibel untuk Semua Kebutuhan',
    description:
      'Mendukung rasio asli maupun crop presisi 1:1, 4:5 (Feed IG), 3:4, 9:16 (Story / Reels), 4:3, 3:2, dan 16:9 lengkap dengan penggeser titik fokus bingkai.',
  },
  {
    index: '04.',
    title: 'Upscale Bertahap hingga 4× Ultra',
    description:
      'Penskalaan bertahap dipadukan dengan Unsharp Mask presisi menghasilkan berkas HD siap unggah maupun cetak ukuran besar langsung di browser Anda.',
  },
];

export function TechniqueDetails({
  isCustomUpload,
  photoTitle,
  categoryLabel,
  layoutLabel,
  originalDims,
  outputDims,
}: TechniqueDetailsProps) {
  return (
    <div className="mt-16 border-t border-zinc-800/80 pt-14">
      {/* Cara Kerja HDin */}
      <section
        id="alur-kerja"
        aria-labelledby="detail-heading"
        className="grid grid-cols-1 gap-10 scroll-mt-20 lg:grid-cols-12"
      >
        <div className="lg:col-span-4">
          <p className="text-xs font-medium text-[#F2B705] tracking-wide">
            Cara Kerja HDin
          </p>
          <h2
            id="detail-heading"
            className="mt-2 font-serif text-3xl font-medium tracking-tight text-zinc-100 text-balance"
          >
            Pulihkan foto buram, lawas, atau pecah jadi jernih lagi dalam sekejap.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Unggah atau seret foto apa saja ke kanvas, lalu bandingkan hasilnya secara langsung.
            Seluruh pemrosesan berjalan lokal di perangkat Anda demi menjaga privasi.
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          {RESTORATION_STEPS.map((step) => (
            <div key={step.index} className="border-t border-zinc-800 pt-4">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs tabular-nums text-[#F2B705]">
                  {step.index}
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Spesifikasi Teknis */}
      <section
        id="spesifikasi"
        aria-labelledby="specs-heading"
        className="mt-16 border-t border-zinc-800/80 pt-12 scroll-mt-20"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="specs-heading" className="text-lg font-semibold text-zinc-100 [overflow-wrap:anywhere]">
              Spesifikasi Berkas ({photoTitle})
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Ringkasan ukuran piksel, rasio layout, dan kepadatan detail sebelum dan sesudah
              diproses di HDin.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-medium text-zinc-400">
                <th className="py-3 pr-6">Parameter</th>
                <th className="py-3 pr-6">Foto Asli</th>
                <th className="py-3">Hasil Restorasi HDin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
              <tr>
                <td className="py-3.5 pr-6 font-medium text-zinc-200">Sumber Foto</td>
                <td className="py-3.5 pr-6 text-zinc-400">
                  {isCustomUpload ? 'File Unggahan Anda' : `Contoh Studio (${categoryLabel})`}
                </td>
                <td className="py-3.5 text-zinc-100">Upscale Bertahap + Unsharp Mask</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium text-zinc-200">Rasio Layout</td>
                <td className="py-3.5 pr-6 font-mono tabular-nums text-zinc-400">
                  {originalDims
                    ? originalDims.height > originalDims.width
                      ? 'Potret Asli'
                      : originalDims.width > originalDims.height
                        ? 'Lanskap Asli'
                        : 'Persegi Asli'
                    : '—'}
                </td>
                <td className="py-3.5 font-mono tabular-nums text-zinc-100">{layoutLabel}</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium text-zinc-200">Dimensi Piksel</td>
                <td className="py-3.5 pr-6 font-mono tabular-nums text-zinc-400">
                  {originalDims ? `${originalDims.width} × ${originalDims.height} px` : '—'}
                </td>
                <td className="py-3.5 font-mono tabular-nums text-[#F2B705]">
                  {outputDims ? `${outputDims.width} × ${outputDims.height} px` : '—'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-6 font-medium text-zinc-200">Kepadatan Efektif</td>
                <td className="py-3.5 pr-6 font-mono tabular-nums text-zinc-400">
                  {originalDims ? formatMegapixels(originalDims.width, originalDims.height) : '—'}
                </td>
                <td className="py-3.5 font-mono tabular-nums text-zinc-100">
                  {outputDims ? formatMegapixels(outputDims.width, outputDims.height) : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
