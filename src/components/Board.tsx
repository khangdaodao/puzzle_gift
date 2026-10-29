import { useCallback, useEffect, useMemo, useReducer, useRef, type PointerEvent } from 'react';
import { giftConfig, fill } from '../config/giftConfig';
import { piecePath, type PuzzleGeometry } from '../engine/jigsawGeometry';
import { BOARD_W, type LayoutMode } from '../engine/layout';
import { createState, isComplete, placedCount, reducer } from '../engine/puzzleState';
import { Piece } from './Piece';
import { Celebration } from './Celebration';

interface Props { geometry: PuzzleGeometry; mode: LayoutMode; scale: number; href: string; onRestart: () => void; onComplete: () => void; onSolved: () => void }

export function Board({ geometry: g, mode, scale, href, onRestart, onComplete, onSolved }: Props) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createState(g, mode));
  const { world, pieces } = state;
  const done = placedCount(state), total = pieces.length, complete = isComplete(state);
  const ui = giftConfig.ui;

  const live = useRef({ state, scale, complete });
  live.current = { state, scale, complete };
  const field = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number; pointer: number } | null>(null);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    dispatch({ type: 'relayout', mode, seed: Math.floor(Math.random() * 2 ** 31) });
  }, [mode]);

  // Completion comes only from the real placed-piece state. onSolved locks the controls at once;
  // onComplete follows after the photo reveal and celebration have had time to play.
  const callbacks = useRef({ onComplete, onSolved });
  callbacks.current = { onComplete, onSolved };
  useEffect(() => {
    if (!complete) return;
    callbacks.current.onSolved();
    const t = setTimeout(() => callbacks.current.onComplete(), 2600);
    return () => clearTimeout(t);
  }, [complete]);

  const toBoard = (e: PointerEvent) => {
    const r = field.current!.getBoundingClientRect();
    const { scale: sc, state: s } = live.current;
    return [(e.clientX - r.left) / sc - s.world.bx, (e.clientY - r.top) / sc - s.world.by];
  };
  const onDown = useCallback((id: number, e: PointerEvent<SVGPathElement>) => {
    if (live.current.complete) return;
    const p = live.current.state.pieces[id];
    if (p.placed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [px, py] = toBoard(e);
    drag.current = { id, dx: px - p.x, dy: py - p.y, pointer: e.pointerId };
    dispatch({ type: 'front', id });
  }, []);
  const onMove = useCallback((e: PointerEvent<SVGPathElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const [px, py] = toBoard(e);
    dispatch({ type: 'move', id: d.id, x: px - d.dx, y: py - d.dy });
  }, []);
  const onUp = useCallback((e: PointerEvent<SVGPathElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    drag.current = null;
    dispatch({ type: 'drop', id: d.id });
  }, []);

  const paths = useMemo(() => pieces.map((p) => piecePath(g, p.col, p.row)), [g]); // eslint-disable-line react-hooks/exhaustive-deps
  const uid = g.seed.toString(36);
  const m = g.margin;

  return (
    <>
      <div className="progress">
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}
          aria-label={fill(ui.progress).replace('{done}', String(done)).replace('{total}', String(total))}>
          <span style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span aria-live="polite">{complete ? ui.solved : ui.progress.replace('{done}', String(done)).replace('{total}', String(total))}</span>
        <button className="btn ghost" onClick={onRestart} disabled={complete}>{ui.shuffle}</button>
      </div>

      <div ref={field} className="field" style={{ width: world.worldW * scale, height: world.worldH * scale }}>
        <div className="slot" style={{ left: world.bx * scale, top: world.by * scale, width: BOARD_W * scale, height: g.height * scale }}>
          <img className="ghost" src={href} alt="" draggable={false} />
          <img className={'reveal' + (complete ? ' on' : '')} src={href} alt={giftConfig.image.alt} draggable={false} />
        </div>
        {complete && <Celebration style={{ left: world.bx * scale, top: world.by * scale, width: BOARD_W * scale, height: g.height * scale }} />}
        {pieces.map((p) => (
          <Piece key={p.id} id={p.id} d={paths[p.id]} placed={p.placed} z={p.z} href={href} imgW={BOARD_W} imgH={g.height}
            clipId={`clip-${uid}-${p.id}`} shadow={g.cw * 0.014}
            viewBox={`${p.col * g.cw - m} ${p.row * g.ch - m} ${g.cw + 2 * m} ${g.ch + 2 * m}`}
            left={(world.bx + p.x - m) * scale} top={(world.by + p.y - m) * scale}
            width={(g.cw + 2 * m) * scale} height={(g.ch + 2 * m) * scale}
            onDown={onDown} onMove={onMove} onUp={onUp} />
        ))}
      </div>
    </>
  );
}
