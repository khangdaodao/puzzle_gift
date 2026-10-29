import type { CSSProperties } from 'react';

const COLORS = ['#d9777f', '#f1b9b2', '#fff4e6', '#e8b86b', '#f6a9a0', '#a8434f'];
const PIECES = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 37) % 100, drift: ((i * 53) % 120) - 60, delay: (i % 10) * 0.08, dur: 1.7 + ((i * 7) % 10) / 10,
  color: COLORS[i % COLORS.length], w: 6 + (i % 3) * 2, spin: 360 + (i % 4) * 180,
}));
const HEARTS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2, d = 110 + ((i * 41) % 90);
  return { dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d), size: 14 + (i % 4) * 4, delay: (i % 5) * 0.04 };
});

/** A short burst of hearts and confetti, drawn over the finished photo. Hidden for reduced motion (CSS). */
export function Celebration({ style }: { style?: CSSProperties }) {
  return (
    <div className="celebrate" style={style} aria-hidden="true">
      {HEARTS.map((h, i) => (
        <svg key={`h${i}`} className="burst-heart" viewBox="0 0 24 24" width={h.size} height={h.size} fill="currentColor"
          style={{ '--dx': `${h.dx}px`, '--dy': `${h.dy}px`, animationDelay: `${h.delay}s` } as CSSProperties}>
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.1 5.6 3.2C14 6.1 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21Z" />
        </svg>
      ))}
      {PIECES.map((p, i) => (
        <span key={`c${i}`} className="confetti"
          style={{ left: `${p.x}%`, width: p.w, height: p.w * 1.6, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
            '--drift': `${p.drift}px`, '--spin': `${p.spin}deg` } as CSSProperties} />
      ))}
    </div>
  );
}
