import { describe, expect, it } from 'vitest';
import { buildGeometry, gridFor, pieceSides, reverseEdge, type Edge } from './jigsawGeometry';
import { clampPos, isSnapped, worldFor, BOARD_W } from './layout';
import { createState, isComplete, placedCount, reducer } from './puzzleState';

const geom = (cols = 6, rows = 4, seed = 7) => buildGeometry(cols, rows, BOARD_W, (BOARD_W * rows) / cols, seed);
const same = (a: Edge, b: Edge) => JSON.stringify(a) === JSON.stringify(b);
const isFlat = (e: Edge) => e.every((c) => c.every(([, y]) => Math.abs(y - e[0][0][1]) < 1e-9) || c.every(([x]) => Math.abs(x - e[0][0][0]) < 1e-9));

describe('grid', () => {
  it('uses 12 / 24 / 48 pieces and follows image aspect', () => {
    for (const n of [12, 24, 48]) { const g = gridFor(n, 1.5); expect(g.cols * g.rows).toBe(n); expect(g.cols).toBeGreaterThan(g.rows); }
    expect(gridFor(12, 1.5)).toEqual({ cols: 4, rows: 3 });
    expect(gridFor(48, 1.5)).toEqual({ cols: 8, rows: 6 });
    const p = gridFor(24, 0.75); expect(p.rows).toBeGreaterThan(p.cols);
  });
});

describe('jigsaw geometry', () => {
  it('neighbouring pieces share complementary edges (every pair, several seeds)', () => {
    for (const seed of [1, 2, 99]) {
      const g = geom(6, 4, seed);
      for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
        if (c + 1 < g.cols) expect(same(reverseEdge(pieceSides(g, c, r)[1]), pieceSides(g, c + 1, r)[3])).toBe(true);
        if (r + 1 < g.rows) expect(same(reverseEdge(pieceSides(g, c, r)[2]), pieceSides(g, c, r + 1)[0])).toBe(true);
      }
    }
  });
  it('outlines are closed, continuous paths', () => {
    const g = geom();
    const cubics = pieceSides(g, 2, 1).flat();
    cubics.forEach((cb, i) => { if (i) expect(cb[0]).toEqual(cubics[i - 1][3]); });
    expect(cubics[0][0]).toEqual(cubics[cubics.length - 1][3]);
  });
  it('border edges are flat and internal edges have tabs or blanks', () => {
    const g = geom();
    expect(isFlat(pieceSides(g, 0, 0)[0])).toBe(true);
    expect(isFlat(pieceSides(g, 0, 0)[3])).toBe(true);
    expect(isFlat(pieceSides(g, g.cols - 1, g.rows - 1)[1])).toBe(true);
    expect(isFlat(pieceSides(g, g.cols - 1, g.rows - 1)[2])).toBe(true);
    expect(isFlat(g.h[1][1])).toBe(false);
    expect(isFlat(g.v[1][1])).toBe(false);
  });
  it('different seeds give different tab layouts', () => {
    expect(same(geom(6, 4, 1).h[1][1], geom(6, 4, 2).h[1][1])).toBe(false);
  });
});

describe('puzzle state', () => {
  const g = geom(4, 3, 5);
  const fresh = () => createState(g, 'side');
  it('starts with every piece loose, outside the board', () => {
    const s = fresh();
    expect(s.pieces).toHaveLength(12);
    expect(placedCount(s)).toBe(0);
    s.pieces.forEach((p) => expect(isSnapped(g, p.col, p.row, p.x, p.y)).toBe(false));
  });
  it('snaps near the true cell, locks, and counts only then', () => {
    let s = fresh();
    const p = s.pieces[5];
    s = reducer(s, { type: 'move', id: 5, x: p.col * g.cw + 0.2 * g.cw, y: p.row * g.ch });
    s = reducer(s, { type: 'drop', id: 5 });
    expect(s.pieces[5]).toMatchObject({ placed: true, x: p.col * g.cw, y: p.row * g.ch });
    expect(placedCount(s)).toBe(1);
    s = reducer(s, { type: 'move', id: 5, x: 0, y: 0 }); // locked pieces cannot be moved
    expect(s.pieces[5].x).toBe(p.col * g.cw);
  });
  it('does not count a wrong or too-far placement', () => {
    let s = fresh();
    const wrongCell = s.pieces[3]; // dropping piece 0 in piece 3's cell must not place it
    s = reducer(s, { type: 'move', id: 0, x: wrongCell.col * g.cw, y: wrongCell.row * g.ch });
    s = reducer(s, { type: 'drop', id: 0 });
    expect(s.pieces[0].placed).toBe(false);
    s = reducer(s, { type: 'move', id: 1, x: g.cw + 0.5 * g.cw, y: 0 });
    s = reducer(s, { type: 'drop', id: 1 });
    expect(placedCount(s)).toBe(0);
  });
  it('is complete only when all pieces are placed', () => {
    let s = fresh();
    for (const p of s.pieces.slice(0, -1)) {
      s = reducer(s, { type: 'move', id: p.id, x: p.col * g.cw, y: p.row * g.ch });
      s = reducer(s, { type: 'drop', id: p.id });
      expect(isComplete(s)).toBe(false);
    }
    const last = s.pieces[s.pieces.length - 1];
    s = reducer(s, { type: 'move', id: last.id, x: last.col * g.cw, y: last.row * g.ch });
    s = reducer(s, { type: 'drop', id: last.id });
    expect(isComplete(s)).toBe(true);
  });
  it('keeps pieces inside the play area and relayout keeps solved pieces', () => {
    const w = worldFor('side', g.height);
    const [x, y] = clampPos(g, w, -99999, 99999);
    expect(x).toBe(-w.bx); expect(y).toBe(w.worldH - g.ch);
    let s = fresh();
    s = reducer(s, { type: 'move', id: 0, x: 0, y: 0 }); s = reducer(s, { type: 'drop', id: 0 });
    s = reducer(s, { type: 'relayout', mode: 'below', seed: 3 });
    expect(s.pieces[0].placed).toBe(true);
    expect(s.world.mode).toBe('below');
    s.pieces.filter((p) => !p.placed).forEach((p) => expect(p.y).toBeGreaterThanOrEqual(g.height));
  });
});
