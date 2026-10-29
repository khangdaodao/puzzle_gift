import type { PuzzleGeometry } from './jigsawGeometry';
import { mulberry32 } from './jigsawGeometry';
import { clampPos, isSnapped, scatter, worldFor, type LayoutMode, type World } from './layout';

export interface PieceState { id: number; col: number; row: number; x: number; y: number; placed: boolean; z: number }
export interface PuzzleState { pieces: PieceState[]; zTop: number; g: PuzzleGeometry; world: World }

export type Action =
  | { type: 'front'; id: number }
  | { type: 'move'; id: number; x: number; y: number }
  | { type: 'drop'; id: number }
  | { type: 'relayout'; mode: LayoutMode; seed: number };

export function createState(g: PuzzleGeometry, mode: LayoutMode): PuzzleState {
  const world = worldFor(mode, g.height);
  const rand = mulberry32(g.seed ^ 0x9e3779b9);
  const pieces: PieceState[] = [];
  for (let row = 0; row < g.rows; row++)
    for (let col = 0; col < g.cols; col++) {
      const [x, y] = scatter(g, world, rand);
      pieces.push({ id: row * g.cols + col, col, row, x, y, placed: false, z: 0 });
    }
  return { pieces, zTop: 0, g, world };
}

export const placedCount = (s: PuzzleState) => s.pieces.filter((p) => p.placed).length;
export const isComplete = (s: PuzzleState) => s.pieces.length > 0 && placedCount(s) === s.pieces.length;

const patch = (s: PuzzleState, id: number, f: (p: PieceState) => PieceState): PuzzleState => ({
  ...s, pieces: s.pieces.map((p) => (p.id === id ? f(p) : p)),
});

export function reducer(s: PuzzleState, a: Action): PuzzleState {
  switch (a.type) {
    case 'front':
      return { ...patch(s, a.id, (p) => (p.placed ? p : { ...p, z: s.zTop + 1 })), zTop: s.zTop + 1 };
    case 'move':
      return patch(s, a.id, (p) => {
        if (p.placed) return p;
        const [x, y] = clampPos(s.g, s.world, a.x, a.y);
        return { ...p, x, y };
      });
    case 'drop': // only a piece near its true cell becomes "placed"; anything else stays loose
      return patch(s, a.id, (p) =>
        !p.placed && isSnapped(s.g, p.col, p.row, p.x, p.y)
          ? { ...p, x: p.col * s.g.cw, y: p.row * s.g.ch, placed: true, z: 0 }
          : p);
    case 'relayout': { // screen shape changed: re-scatter loose pieces into the new piece area
      const world = worldFor(a.mode, s.g.height);
      const rand = mulberry32(a.seed);
      return { ...s, world, pieces: s.pieces.map((p) => {
        if (p.placed) return p;
        const [x, y] = scatter(s.g, world, rand);
        return { ...p, x, y };
      }) };
    }
  }
}
