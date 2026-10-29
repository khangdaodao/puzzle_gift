import { describe, expect, it } from 'vitest';
import { initialPlayer, playerReducer as r, type PlayerState } from './playerState';

describe('music player state', () => {
  it('starts silent: nothing plays before a user action', () => {
    expect(initialPlayer.playing).toBe(false);
  });
  it('play / pause toggle the playing flag', () => {
    let s = r(initialPlayer, { type: 'play' });
    expect(s.playing).toBe(true);
    s = r(s, { type: 'pause' });
    expect(s.playing).toBe(false);
  });
  it('a missing or broken file sets an error and stops playback, and play can retry', () => {
    let s = r(r(initialPlayer, { type: 'play' }), { type: 'failed' });
    expect(s).toMatchObject({ status: 'error', playing: false });
    s = r(s, { type: 'play' });
    expect(s).toMatchObject({ playing: true, status: 'loading' });
  });
  it('a browser autoplay block only stops playback, without flagging the file as broken', () => {
    const s = r({ index: 0, playing: true, status: 'loading' }, { type: 'blocked' });
    expect(s).toMatchObject({ playing: false, status: 'loading' });
  });
  it('selecting a track changes it and ignores invalid indexes', () => {
    const s = r(initialPlayer, { type: 'select', index: 1, count: 3 });
    expect(s.index).toBe(1);
    expect(r(s, { type: 'select', index: 7, count: 3 })).toBe(s);
    expect(r(s, { type: 'select', index: -1, count: 3 })).toBe(s);
  });
  it('keeps playing across track changes and advances at the end of a track', () => {
    const playing: PlayerState = { index: 2, playing: true, status: 'ready' };
    expect(r(playing, { type: 'ended', count: 3 })).toMatchObject({ index: 0, playing: true });
    expect(r(playing, { type: 'ended', count: 1 }).playing).toBe(false);
  });
});
