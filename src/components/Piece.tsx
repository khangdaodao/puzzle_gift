import { memo, type PointerEvent } from 'react';

interface Props {
  id: number; d: string; viewBox: string; left: number; top: number; width: number; height: number;
  z: number; placed: boolean; href: string; imgW: number; imgH: number; clipId: string; shadow: number;
  onDown: (id: number, e: PointerEvent<SVGPathElement>) => void;
  onMove: (e: PointerEvent<SVGPathElement>) => void;
  onUp: (e: PointerEvent<SVGPathElement>) => void;
}

/** One jigsaw piece: the whole photo clipped to this piece's outline. Only the outline
 *  (not the transparent corners of the SVG box) receives pointer events. */
export const Piece = memo(function Piece(p: Props) {
  return (
    <svg className={'piece' + (p.placed ? ' placed' : '')} viewBox={p.viewBox} aria-hidden="true"
      style={{ transform: `translate(${p.left}px, ${p.top}px)`, width: p.width, height: p.height, zIndex: p.placed ? 1 : 10 + p.z }}>
      {/* Cheap vector shadow: a CSS drop-shadow filter on every piece made 48-piece puzzles lag. */}
      <g className="shadow" fill="rgba(110,45,55,.16)">
        <path d={p.d} transform={`translate(${p.shadow} ${p.shadow * 1.5})`} />
        <path d={p.d} fill="rgba(110,45,55,.08)" transform={`translate(${p.shadow * 2} ${p.shadow * 3})`} />
      </g>
      <defs><clipPath id={p.clipId}><path d={p.d} /></clipPath></defs>
      <image href={p.href} x={0} y={0} width={p.imgW} height={p.imgH} preserveAspectRatio="none" clipPath={`url(#${p.clipId})`} />
      <path className="outline" d={p.d} fill="rgba(255,255,255,0)" stroke="rgba(255,255,255,.7)" strokeWidth={2}
        onPointerDown={(e) => p.onDown(p.id, e)} onPointerMove={p.onMove} onPointerUp={p.onUp} onPointerCancel={p.onUp} />
    </svg>
  );
});
