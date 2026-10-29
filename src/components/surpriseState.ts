/** The surprise scene is a small state machine: envelope → opening → letter ⇄ photo, with replay. */
export type View = 'closed' | 'opening' | 'letter' | 'photo';
export type SurpriseAction =
  | { type: 'open'; reduced: boolean } // user clicked the envelope
  | { type: 'opened' }                 // opening animation finished
  | { type: 'photo' } | { type: 'back' } | { type: 'replay' };

export function surpriseReducer(v: View, a: SurpriseAction): View {
  switch (a.type) {
    case 'open': return v === 'closed' ? (a.reduced ? 'letter' : 'opening') : v; // reduced motion skips the animation
    case 'opened': return v === 'opening' ? 'letter' : v;
    case 'photo': return v === 'letter' ? 'photo' : v;
    case 'back': return v === 'photo' ? 'letter' : v;
    case 'replay': return v === 'letter' || v === 'photo' ? 'closed' : v;
  }
}
