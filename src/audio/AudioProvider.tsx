import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { asset, giftConfig, type MusicTrack } from '../config/giftConfig';
import { initialPlayer, playerReducer, type PlayerState } from './playerState';

interface Music {
  available: boolean; tracks: MusicTrack[]; state: PlayerState; track?: MusicTrack;
  play: () => void; toggle: () => void; select: (i: number) => void;
}
const Ctx = createContext<Music | null>(null);

/** One Audio element for the whole app, so music keeps playing across every stage.
 *  Nothing plays until a user gesture calls play()/toggle(); a missing file only sets an error state. */
export function AudioProvider({ children }: { children: ReactNode }) {
  const tracks = useMemo(() => (giftConfig.music.enabled ? giftConfig.music.tracks : []), []);
  const count = tracks.length;
  const [state, dispatch] = useReducer(playerReducer, initialPlayer);
  const [audio] = useState(() => { const a = new Audio(); a.preload = 'metadata'; return a; });

  useEffect(() => {
    if (!count) return;
    audio.loop = count === 1;
    const ready = () => dispatch({ type: 'ready' });
    const failed = () => dispatch({ type: 'failed' });
    const ended = () => dispatch({ type: 'ended', count });
    audio.addEventListener('canplay', ready);
    audio.addEventListener('error', failed);
    audio.addEventListener('ended', ended);
    return () => {
      audio.removeEventListener('canplay', ready); audio.removeEventListener('error', failed);
      audio.removeEventListener('ended', ended); audio.pause();
    };
  }, [audio, count]);

  useEffect(() => { // load the selected track
    if (!count) return;
    audio.src = asset(tracks[state.index].src);
    audio.load();
  }, [audio, tracks, count, state.index]);

  useEffect(() => { // follow the play/pause intent
    if (!count) return;
    if (!state.playing) { audio.pause(); return; }
    audio.play().catch((err: DOMException) => {
      if (err.name === 'AbortError') return; // a newer load/pause superseded this play()
      dispatch({ type: err.name === 'NotAllowedError' ? 'blocked' : 'failed' });
    });
  }, [audio, count, state.playing, state.index]);

  const play = useCallback(() => { if (count) dispatch({ type: 'play' }); }, [count]);
  const toggle = useCallback(() => {
    if (state.playing) return dispatch({ type: 'pause' });
    if (state.status === 'error') audio.load(); // retry after a failure
    dispatch({ type: 'play' });
  }, [audio, state.playing, state.status]);
  const select = useCallback((index: number) => dispatch({ type: 'select', index, count }), [count]);

  const value = useMemo<Music>(() => ({
    available: count > 0, tracks, state, track: tracks[state.index], play, toggle, select,
  }), [count, tracks, state, play, toggle, select]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMusic(): Music {
  const m = useContext(Ctx);
  if (!m) throw new Error('useMusic must be used inside <AudioProvider>');
  return m;
}
