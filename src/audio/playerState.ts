/** Pure music-player state, kept separate from the Audio element so it can be unit-tested. */
export type Status = 'idle' | 'loading' | 'ready' | 'error';
export interface PlayerState { index: number; playing: boolean; status: Status }
export type PlayerAction =
  | { type: 'play' } | { type: 'pause' }
  | { type: 'select'; index: number; count: number }
  | { type: 'ready' } | { type: 'failed' } | { type: 'blocked' }
  | { type: 'ended'; count: number };

export const initialPlayer: PlayerState = { index: 0, playing: false, status: 'idle' };

export function playerReducer(s: PlayerState, a: PlayerAction): PlayerState {
  switch (a.type) {
    case 'play': return { ...s, playing: true, status: s.status === 'ready' ? 'ready' : 'loading' };
    case 'pause': return { ...s, playing: false };
    case 'select': return a.index < 0 || a.index >= a.count || a.index === s.index ? s : { ...s, index: a.index, status: 'loading' };
    case 'ready': return { ...s, status: 'ready' };
    case 'failed': return { ...s, status: 'error', playing: false }; // missing / undecodable file
    case 'blocked': return { ...s, playing: false };                 // browser refused to start audio
    case 'ended': return a.count > 1
      ? { index: (s.index + 1) % a.count, playing: true, status: 'loading' }
      : { ...s, playing: false };
  }
}
