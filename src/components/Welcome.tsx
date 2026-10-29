import { giftConfig, fill, asset } from '../config/giftConfig';

export function Welcome({ onStart }: { onStart: () => void }) {
  const { welcome, image } = giftConfig;
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="frame">
        <img src={asset(image.src)} alt="" />
      </div>
      <div>
        <h1 id="welcome-title">{fill(welcome.title)}</h1>
        <p>{fill(welcome.intro)}</p>
        <button className="btn" onClick={onStart}>{welcome.startLabel}</button>
      </div>
    </section>
  );
}
