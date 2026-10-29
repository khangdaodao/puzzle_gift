import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { giftConfig, asset, type Difficulty } from '../config/giftConfig';
import { buildGeometry, gridFor } from '../engine/jigsawGeometry';
import { BOARD_W, pickLayout } from '../engine/layout';
import { Board } from './Board';

const COUNTS: Record<Difficulty, number> = { easy: 12, medium: 24, hard: 48 };

type Img = { w: number; h: number } | 'error' | null;
function useImageSize(src: string): Img {
  const [img, setImg] = useState<Img>(null);
  useEffect(() => {
    const el = new Image();
    el.onload = () => setImg({ w: el.naturalWidth || 1200, h: el.naturalHeight || 800 });
    el.onerror = () => setImg('error');
    el.src = src;
  }, [src]);
  return img;
}

export function Puzzle({ onComplete }: { onComplete: () => void }) {
  const ui = giftConfig.ui;
  const [difficulty, setDifficulty] = useState<Difficulty>(giftConfig.defaultDifficulty);
  const [round, setRound] = useState(0);
  const [locked, setLocked] = useState(false); // true once the puzzle is solved
  const solved = useCallback(() => setLocked(true), []);
  const href = asset(giftConfig.image.src);
  const img = useImageSize(href);

  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: typeof window === 'undefined' ? 800 : window.innerHeight });
  useEffect(() => {
    const read = () => setSize({ w: wrap.current?.clientWidth ?? 0, h: window.innerHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(wrap.current!);
    window.addEventListener('resize', read);
    return () => { ro.disconnect(); window.removeEventListener('resize', read); };
  }, []);

  const geometry = useMemo(() => {
    if (!img || img === 'error') return null;
    const { cols, rows } = gridFor(COUNTS[difficulty], img.w / img.h);
    return buildGeometry(cols, rows, BOARD_W, (BOARD_W * img.h) / img.w, Math.floor(Math.random() * 2 ** 31));
  }, [img, difficulty, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const layout = geometry && size.w > 0 ? pickLayout(size.w, Math.max(280, size.h - 230), geometry.height) : null;
  const restart = useCallback(() => setRound((r) => r + 1), []);

  return (
    <section className="play" ref={wrap} aria-label="Puzzle">
      <div className="toolbar" role="group" aria-label="Difficulty">
        {(Object.keys(COUNTS) as Difficulty[]).map((d) => (
          <button key={d} className={'chip' + (d === difficulty ? ' on' : '')} aria-pressed={d === difficulty} disabled={locked}
            onClick={() => { setDifficulty(d); setRound((r) => r + 1); }}>{ui.difficulty[d]}</button>
        ))}
      </div>
      {img === 'error' && <p className="note">{ui.imageError}</p>}
      {img === null && <p className="note">{ui.loading}</p>}
      {geometry && layout && (
        <Board key={`${difficulty}-${round}`} geometry={geometry} mode={layout.mode} scale={layout.scale}
          href={href} onRestart={restart} onComplete={onComplete} onSolved={solved} />
      )}
    </section>
  );
}
