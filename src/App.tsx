import { useEffect, useState } from 'react';
import { giftConfig } from './config/giftConfig';
import { FloatingHearts } from './components/FloatingHearts';
import { Welcome } from './components/Welcome';
import { Puzzle } from './components/Puzzle';
import { Surprise } from './components/Surprise';
import { MusicPlayer } from './components/MusicPlayer';
import { useMusic } from './audio/AudioProvider';

/** The gift is a linear flow: welcome → puzzle → surprise (envelope and letter). */
export type Stage = 'welcome' | 'puzzle' | 'surprise';

export default function App() {
  const [stage, setStage] = useState<Stage>('welcome');
  const music = useMusic();
  useEffect(() => { document.title = giftConfig.ui.pageTitle; }, []);

  return (
    <main className={'stage' + (stage === 'puzzle' ? ' playing' : '')}>
      <FloatingHearts />
      <MusicPlayer />
      {stage === 'welcome' && <Welcome onStart={() => { music.play(); setStage('puzzle'); }} />}
      {stage === 'puzzle' && <Puzzle onComplete={() => setStage('surprise')} />}
      {stage === 'surprise' && <Surprise />}
    </main>
  );
}
