"use client";

import { useEffect } from "react";

const CRACKS = [
  "M20 100 Q60 40 100 100 T180 100",
  "M100 20 Q140 80 100 180 Q60 120 100 20",
  "M40 160 Q100 120 160 40",
  "M10 60 Q80 100 190 140",
];

interface KintsugiFractureOverlayProps {
  open: boolean;
  onComplete?: () => void;
  caption?: string;
}

export function KintsugiFractureOverlay({
  open,
  onComplete,
  caption = "Salvaged to the Legacy Library",
}: KintsugiFractureOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => onComplete?.(), 2400);
    return () => window.clearTimeout(t);
  }, [open, onComplete]);

  if (!open) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center duration-300"
      aria-live="polite"
      role="status"
    >
      <div className="absolute inset-0 bg-[#0a0a0a]/85 backdrop-blur-[2px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ animation: "kintsugi-glow 2s ease-in-out infinite" }}
      />
      <div className="relative flex flex-col items-center gap-6 px-6">
        <svg
          width={280}
          height={280}
          viewBox="0 0 200 200"
          className="drop-shadow-[0_0_28px_rgba(212,175,55,0.35)]"
        >
          <defs>
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="#1a1a1a"
            stroke="#d4af37"
            strokeWidth="1.5"
            opacity={0.9}
          />
          {CRACKS.map((d, i) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#d4af37"
              strokeWidth={1.2 + i * 0.15}
              strokeLinecap="round"
              filter="url(#goldGlow)"
              strokeDasharray={180 + i * 30}
              strokeDashoffset={180 + i * 30}
              style={{
                animation: `kintsugi-draw 1.${2 + i}s ease forwards ${i * 0.08}s`,
              }}
            />
          ))}
          <circle
            cx="100"
            cy="100"
            r="6"
            fill="#d4af37"
            style={{
              animation: "kintsugi-fade-in 0.6s ease 0.9s both",
            }}
          />
        </svg>
        <p className="max-w-sm text-center font-heading text-xs font-medium tracking-[0.35em] text-[#d4af37] uppercase">
          {caption}
        </p>
      </div>
    </div>
  );
}
