import { useEffect, useReducer, useRef, useState } from 'react';
import { asset, fill, giftConfig } from '../config/giftConfig';
import { surpriseReducer, type View } from './surpriseState';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.1 5.6 3.2C14 6.1 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21Z';

/** Scene shown after the puzzle: envelope → letter, with replay and a way back to the photo. */
export function Surprise({ initialView = 'closed' }: { initialView?: View }) {
  const { letter, ui, closingMessage, image } = giftConfig;
  const [view, dispatch] = useReducer(surpriseReducer, initialView);
  const [round, setRound] = useState(0); // bumping this remounts the envelope so its entrance replays
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => { // let the flap and letter finish moving, then show the readable letter
    if (view !== 'opening') return;
    const t = window.setTimeout(() => dispatch({ type: 'opened' }), 1300);
    return () => window.clearTimeout(t);
  }, [view]);

  useEffect(() => { // move keyboard / screen-reader focus to the new content
    if (view === 'letter' || view === 'photo') panel.current?.focus({ preventScroll: true });
  }, [view]);

  return (
    <section className="surprise scene-in">
      {(view === 'closed' || view === 'opening') && (
        <div className="env-wrap" key={round}>
          <button className={`envelope ${view}`} disabled={view !== 'closed'} aria-label={ui.envelopeLabel}
            onClick={() => dispatch({ type: 'open', reduced: prefersReducedMotion() })}>
            <span className="env-back" />
            <span className="env-paper"><i /><i /><i /></span>
            <span className="env-front" />
            <span className="env-flap" />
            <span className="env-seal"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={HEART} /></svg></span>
          </button>
          <p className={'note prompt' + (view === 'opening' ? ' fading' : '')}>{ui.tapEnvelope}</p>
        </div>
      )}

      {view === 'letter' && (
        <>
          <article className="letter" ref={panel} tabIndex={-1} aria-labelledby="letter-title">
            <h2 id="letter-title">{fill(letter.title)}</h2>
            {letter.date && <p className="letter-date">{fill(letter.date)}</p>}
            <div className="letter-body">
              {letter.paragraphs.map((p, i) => <p key={i} style={{ animationDelay: `${0.15 + i * 0.18}s` }}>{fill(p)}</p>)}
            </div>
            {letter.signature && <p className="letter-sign">{fill(letter.signature)}</p>}
          </article>
          <div className="letter-actions">
            <button className="btn ghost" onClick={() => { dispatch({ type: 'replay' }); setRound((r) => r + 1); }}>{ui.replay}</button>
            <button className="btn ghost" onClick={() => dispatch({ type: 'photo' })}>{ui.viewPhoto}</button>
          </div>
        </>
      )}

      {view === 'photo' && (
        <div className="photo-view" ref={panel} tabIndex={-1}>
          <figure className="frame full"><img src={asset(image.src)} alt={image.alt} /></figure>
          {closingMessage && <p className="closing">{fill(closingMessage)}</p>}
          <button className="btn ghost" onClick={() => dispatch({ type: 'back' })}>{ui.backToLetter}</button>
        </div>
      )}
    </section>
  );
}
