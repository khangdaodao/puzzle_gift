/** Real jigsaw geometry. Every internal edge is generated ONCE in absolute board
 *  coordinates; the two neighbouring pieces use that same curve (one forwards, one
 *  reversed), so tabs and blanks always fit exactly. */
export type Pt = [number, number];
export type Cubic = [Pt, Pt, Pt, Pt]; // start, control1, control2, end
export type Edge = Cubic[];

export interface PuzzleGeometry {
  cols: number; rows: number; width: number; height: number;
  cw: number; ch: number; margin: number; seed: number;
  h: Edge[][]; // h[row 0..rows][col]  — horizontal edges, drawn left → right
  v: Edge[][]; // v[row][col 0..cols]  — vertical edges, drawn top → bottom
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick cols × rows (both ≥ 2) whose cell grid best matches the image aspect ratio. */
export function gridFor(count: number, aspect: number) {
  let best = { cols: count, rows: 1, err: Infinity };
  for (let rows = 2; rows <= count / 2; rows++) {
    if (count % rows) continue;
    const cols = count / rows;
    const err = Math.abs(Math.log(cols / rows / aspect));
    if (err < best.err) best = { cols, rows, err };
  }
  return { cols: best.cols, rows: best.rows };
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const straight = (a: Pt, b: Pt): Edge => [[a, lerp(a, b, 1 / 3), lerp(a, b, 2 / 3), b]];

/** A mushroom-shaped tab from a to b; bulges to one random side (tab or blank). */
function tabbed(a: Pt, b: Pt, rand: () => number): Edge {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
  const nx = -uy, ny = ux;
  const s = rand() < 0.5 ? -1 : 1;
  const c = 0.5 + (rand() - 0.5) * 0.12;
  const k = 0.9 + rand() * 0.25;
  const P = (u: number, v: number): Pt => [a[0] + (ux * u + nx * v * s) * L, a[1] + (uy * u + ny * v * s) * L];
  const hy = 0.1, top = hy + 0.16 * k;
  return [
    [P(0, 0), P((c - 0.07) / 3, 0), P((2 * (c - 0.07)) / 3, 0), P(c - 0.07, 0)],
    [P(c - 0.07, 0), P(c - 0.07, 0.04), P(c - 0.05, 0.06), P(c - 0.045, hy)],
    [P(c - 0.045, hy), P(c - 0.17, top), P(c + 0.17, top), P(c + 0.045, hy)],
    [P(c + 0.045, hy), P(c + 0.05, 0.06), P(c + 0.07, 0.04), P(c + 0.07, 0)],
    [P(c + 0.07, 0), P(c + 0.07 + (0.93 - c) / 3, 0), P(c + 0.07 + (2 * (0.93 - c)) / 3, 0), P(1, 0)],
  ];
}

export function buildGeometry(cols: number, rows: number, width: number, height: number, seed: number): PuzzleGeometry {
  const rand = mulberry32(seed);
  const cw = width / cols, ch = height / rows;
  const h: Edge[][] = [], v: Edge[][] = [];
  for (let r = 0; r <= rows; r++) {
    h[r] = [];
    for (let c = 0; c < cols; c++) {
      const a: Pt = [c * cw, r * ch], b: Pt = [(c + 1) * cw, r * ch];
      h[r][c] = r === 0 || r === rows ? straight(a, b) : tabbed(a, b, rand);
    }
  }
  for (let r = 0; r < rows; r++) {
    v[r] = [];
    for (let c = 0; c <= cols; c++) {
      const a: Pt = [c * cw, r * ch], b: Pt = [c * cw, (r + 1) * ch];
      v[r][c] = c === 0 || c === cols ? straight(a, b) : tabbed(a, b, rand);
    }
  }
  return { cols, rows, width, height, cw, ch, margin: 0.27 * Math.max(cw, ch), seed, h, v };
}

export const reverseEdge = (e: Edge): Edge =>
  e.slice().reverse().map(([p0, c1, c2, p1]) => [p1, c2, c1, p0] as Cubic);

/** The four sides of a piece in clockwise order: top, right, bottom, left. */
export function pieceSides(g: PuzzleGeometry, col: number, row: number): Edge[] {
  return [g.h[row][col], g.v[row][col + 1], reverseEdge(g.h[row + 1][col]), reverseEdge(g.v[row][col])];
}

const f = (n: number) => Math.round(n * 100) / 100;
export function piecePath(g: PuzzleGeometry, col: number, row: number): string {
  const sides = pieceSides(g, col, row);
  const start = sides[0][0][0];
  let d = `M${f(start[0])} ${f(start[1])}`;
  for (const side of sides)
    for (const [, c1, c2, p] of side) d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p[0])} ${f(p[1])}`;
  return d + 'Z';
}
