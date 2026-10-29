import { giftConfig } from '../config/giftConfig';
import { useMusic } from '../audio/AudioProvider';

export function MusicPlayer() {
  const { available, tracks, track, state, toggle, select } = useMusic();
  const ui = giftConfig.ui;
  if (!available || !track) return null;
  const label = state.playing ? ui.musicOff : ui.musicOn;
  return (
    <div className="music" role="group" aria-label="Music">
      <button className="music-btn" onClick={toggle} aria-pressed={state.playing} aria-label={label} title={`${label} · ${track.title}`}>
        {state.playing
          ? <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          : <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.500Z" /></svg>}
      </button>
      {tracks.length > 1 ? (
        <select className="music-select" aria-label={ui.musicTrack} value={state.index} onChange={(e) => select(Number(e.target.value))}>
          {tracks.map((t, i) => <option key={t.src} value={i}>{t.title}</option>)}
        </select>
      ) : (
        <span className="music-title">{track.title}{track.artist ? ` · ${track.artist}` : ''}</span>
      )}
      {state.status === 'error' && <span className="music-msg" role="status">{ui.musicMissing}</span>}
    </div>
  );
}
