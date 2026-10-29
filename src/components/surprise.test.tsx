import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { surpriseReducer as r } from './surpriseState';
import { Surprise } from './Surprise';
import { giftConfig, fill } from '../config/giftConfig';

describe('surprise state machine', () => {
  it('goes envelope → opening → letter, and the letter can show the photo and return', () => {
    let v = r('closed', { type: 'open', reduced: false });
    expect(v).toBe('opening');
    v = r(v, { type: 'opened' }); expect(v).toBe('letter');
    v = r(v, { type: 'photo' }); expect(v).toBe('photo');
    v = r(v, { type: 'back' }); expect(v).toBe('letter');
  });
  it('replay returns to the closed envelope', () => {
    expect(r('letter', { type: 'replay' })).toBe('closed');
    expect(r('photo', { type: 'replay' })).toBe('closed');
  });
  it('reduced motion opens straight to the letter', () => {
    expect(r('closed', { type: 'open', reduced: true })).toBe('letter');
  });
  it('ignores impossible transitions (no double-open, no letter before the envelope)', () => {
    expect(r('opening', { type: 'open', reduced: false })).toBe('opening');
    expect(r('letter', { type: 'open', reduced: false })).toBe('letter');
    expect(r('closed', { type: 'opened' })).toBe('closed');
    expect(r('closed', { type: 'photo' })).toBe('closed');
  });
});

describe('surprise scene content (server-rendered)', () => {
  const { letter, ui } = giftConfig;
  it('shows an accessible envelope and prompt first, but not the letter text', () => {
    const html = renderToString(<Surprise />);
    expect(html).toContain(ui.envelopeLabel);
    expect(html).toContain(ui.tapEnvelope);
    expect(html).not.toContain('letter-title');
  });
  it('shows the configured letter with names filled in', () => {
    const html = renderToString(<Surprise initialView="letter" />);
    expect(html).toContain(fill(letter.title));
    letter.paragraphs.forEach((p) => expect(html).toContain(fill(p).replace(/'/g, '&#x27;')));
    if (letter.signature) expect(html).toContain(fill(letter.signature));
    expect(html).toContain(ui.replay);
    expect(html).toContain(ui.viewPhoto);
    expect(html).not.toMatch(/\{(recipient|sender)\}/);
  });
  it('shows the finished photo view', () => {
    const html = renderToString(<Surprise initialView="photo" />);
    expect(html).toContain(giftConfig.image.alt);
    expect(html).toContain(ui.backToLetter);
  });
});
