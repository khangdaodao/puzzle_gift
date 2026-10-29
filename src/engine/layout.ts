import type { PuzzleGeometry } from './jigsawGeometry';

export const BOARD_W = 1000; // board width in abstract units; screen scale is applied at render time
export type LayoutMode = 'side' | 'below';
export interface World { mode: LayoutMode; worldW: number; worldH: number; bx: number; by: number }

const GUTTER = 0.38 * BOARD_W; // piece area on each side of the board (wide screens)
const TRAY = 0.9; // piece area below the board, as a fraction of board height (narrow screens)

export function worldFor(mode: LayoutMode, boardH: number): World {
  return mode === 'side'
    ? { mode, worldW: BOARD_W + 2 * GUTTER, worldH: boardH, bx: GUTTER, by: 0 }
    : { mode, worldW: BOARD_W, worldH: boardH * (1 + TRAY), bx: 0, by: 0 };
}

/** Choose the layout that lets the board be drawn largest in the available space. */
export function pickLayout(availW: number, availH: number, boardH: number) {
  const fit = (w: World) => Math.min(availW / w.worldW, availH / w.worldH);
  const side = fit(worldFor('side', boardH)), below = fit(worldFor('below', boardH));
  return side >= below ? { mode: 'side' as const, scale: side } : { mode: 'below' as const, scale: below };
}

/** Random starting position (top-left of the piece cell, in board coordinates) outside the board. */
export function scatter(g: PuzzleGeometry, w: World, rand: () => number): [number, number] {
  if (w.mode === 'side') {
    const x = rand() < 0.5 ? -w.bx + rand() * (w.bx - g.cw) : g.width + rand() * (w.bx - g.cw);
    return [x, rand() * Math.max(0, w.worldH - g.ch)];
  }
  const room = Math.max(0, w.worldH - g.height - g.ch - 20);
  return [rand() * (g.width - g.cw), g.height + 20 + rand() * room];
}

export function clampPos(g: PuzzleGeometry, w: World, x: number, y: number): [number, number] {
  const cl = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  return [cl(x, -w.bx, w.worldW - w.bx - g.cw), cl(y, -w.by, w.worldH - w.by - g.ch)];
}

/** A piece snaps when its cell origin is within 30% of a cell of its true position. */
export const isSnapped = (g: PuzzleGeometry, col: number, row: number, x: number, y: number) =>
  Math.hypot(x - col * g.cw, y - row * g.ch) <= 0.3 * Math.min(g.cw, g.ch);
