/**
 * ============================================================
 *  GIFT CONFIGURATION — the only file you need to edit.
 * ============================================================
 *  To make a new gift:
 *   1. Replace the photo in /public/images/ (or point `image.src` at a new file).
 *   2. Edit the names, letter, and (optionally) music below.
 *   3. `npm run build`, then upload the `dist/` folder to any static host.
 *
 *  Asset paths are relative to /public (no leading slash).
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MusicTrack {
  /** Shown in the player. */
  title: string;
  artist?: string;
  /** Path inside /public, e.g. "audio/my-song.mp3". You must have the rights to use it. */
  src: string;
}

export interface GiftConfig {
  recipientName: string;
  senderName: string;
  image: { src: string; alt: string };
  /** Pieces: easy 12, medium 24, hard 48. */
  defaultDifficulty: Difficulty;
  welcome: { title: string; intro: string; startLabel: string };
  letter: {
    title: string;
    /** Each string is one paragraph. Use {recipient} / {sender} as placeholders. */
    paragraphs: string[];
    signature?: string;
    date?: string;
  };
  /** Optional closing line shown with the finished photo. */
  closingMessage?: string;
  music: { enabled: boolean; tracks: MusicTrack[] };
  /** All interface text, so the site can be translated without touching components. */
  ui: {
    pageTitle: string;
    difficulty: Record<Difficulty, string>;
    progress: string; // {done} / {total}
    musicOn: string; musicOff: string; musicMissing: string;
    tapEnvelope: string; replay: string; viewPhoto: string; backToLetter: string;
    shuffle: string; loading: string; imageError: string; solved: string;
    musicTrack: string; envelopeLabel: string;
  };
}

export const giftConfig: GiftConfig = {
  recipientName: 'Linh',
  senderName: 'Khang',
  image: { src: 'images/anhghep.jpg', alt: 'The photo hidden inside the puzzle' },
  defaultDifficulty: 'medium',

  welcome: {
    title: 'A little puzzle for you, {recipient}',
    intro: 'I hid something in this picture. Put the pieces back together and it will open.',
    startLabel: 'Start the puzzle',
  },

  letter: {
    title: 'For {recipient}',
    paragraphs: [
      'I hid this letter behind a puzzle, because some things are worth slowing down for.',
      'This is only a sample. Replace these lines in src/config/giftConfig.ts with your own words; every string in this list becomes one paragraph.',
      'Thank you for putting the pieces together.',
    ],
    signature: 'Yours, {sender}',
    date: '',
  },

  closingMessage: '',

  music: {
    enabled: true,
    tracks: [
      // Supply your own licensed file at public/audio/ngay-xua-em-den.mp3.
      // If the file is missing, the player shows a message and the gift still works.
      { title: 'Ngày xưa em đến', artist: 'Anh Khang', src: 'audio/ngay-xua-em-den.mp3' },
    ],
  },

  ui: {
    pageTitle: 'A little puzzle for you',
    difficulty: { easy: 'Easy · 12', medium: 'Medium · 24', hard: 'Hard · 48' },
    progress: '{done} of {total} pieces',
    musicOn: 'Turn music on', musicOff: 'Turn music off', musicMissing: 'Music file not found',
    tapEnvelope: 'Tap the envelope to open it', replay: 'Replay', viewPhoto: 'See the photo',
    backToLetter: 'Back to the letter',
    shuffle: 'Shuffle again', loading: 'Loading the photo…',
    imageError: 'The photo could not be loaded. Check image.src in src/config/giftConfig.ts.',
    solved: 'Solved!',
    musicTrack: 'Choose a song', envelopeLabel: 'Open the envelope',
  },
};

/** Fill {recipient} / {sender} placeholders. */
export const fill = (text: string, c: GiftConfig = giftConfig) =>
  text.replace(/\{recipient\}/g, c.recipientName).replace(/\{sender\}/g, c.senderName);

/** Resolve a /public asset path against Vite's base so it works on any host. */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
