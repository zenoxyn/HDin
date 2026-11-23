import { Download } from 'lucide-react';

interface TopBarProps {
  onDownload: () => void;
  isExporting: boolean;
}

export function TopBar({ onDownload, isExporting }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/90 bg-[#0A0A0B]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-3.5 sm:px-8">
        <a
          href="#studio"
          className="text-xl font-semibold tracking-tight text-zinc-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B705] rounded-sm"
        >
          HDin
        </a>

        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
        >
          <a
            href="#studio"
            className="hover:text-zinc-100 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B705] rounded-sm"
          >
            Studio
          </a>
          <a
            href="#preset"
            className="hover:text-zinc-100 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B705] rounded-sm"
          >
            Preset
          </a>
          <a
            href="#alur-kerja"
            className="hover:text-zinc-100 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B705] rounded-sm"
          >
            Cara Kerja
          </a>
          <a
            href="#spesifikasi"
            className="hover:text-zinc-100 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B705] rounded-sm"
          >
            Spesifikasi
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onDownload}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#F2B705] px-4 py-2 text-sm font-semibold text-[#0A0A0B] transition-colors duration-150 hover:bg-[#ffd038] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B705]"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{isExporting ? 'Memproses...' : 'Unduh Hasil HD'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
