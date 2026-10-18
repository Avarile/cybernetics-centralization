// The truth behind the figure: a person built one layer a day. Only a layer that is
// persisted (cured) stays; a layer that isn't drains away and adds nothing. Without
// retention, even cured layers are washed off at the end of each window.

export const LAYER_H = 2.4; // world units per layer
// The person, bottom to top: plinth, body, shoulders, neck, head. One radius per layer.
export const PROFILE = [
  17, 17,
  12, 11.5, 11, 10.5, 10, 9.6, 9.3, 9, 8.8, 8.6, 8.5,
  8.5, 8.6, 8.8, 9.2, 9.8, 10.4, 11, 11.6, 12, 12.2, 12, 11.2, 9.5,
  5.5, 5,
  7.5, 9.5, 10.6, 11.2, 11.5, 11.5, 11.2, 10.6, 9.5, 7.8, 5.5, 2.5,
];
export const N = PROFILE.length;
export const WINDOW = 12; // days a print is kept when retention is off

// The arms hang beside the body from the hands (layer 12) up into the shoulders (layer 23).
export const ARM = { from: 12, to: 23, y: 14 };
export function armR(index) {
  return index < ARM.from || index > ARM.to ? 0 : index === ARM.from ? 3.6 : 3.1;
}
// Volume of one layer (in r² units), and of the whole person: the canister holds exactly one person.
export function volumeOf(index) {
  return PROFILE[index] * PROFILE[index] + 2 * armR(index) * armR(index);
}
export const PERSON = PROFILE.reduce((sum, _, index) => sum + volumeOf(index), 0);

export function fresh() {
  return { day: 0, acc: 0.5, layers: 0, kept: 0, lost: 0, wasted: 0, washes: 0 };
}

// One day. Persistence is spread evenly: at 60 %, exactly 3 days in 5 are cured.
// Returns what happened so the page can animate it; the state is updated in place.
export function step(state, persist, retain) {
  if (state.layers >= N) return { done: true };
  state.day += 1;
  const index = state.layers;
  state.acc += persist;
  const cured = state.acc >= 1 - 1e-9;
  if (cured) {
    state.acc -= 1;
    state.layers += 1;
    state.kept += 1;
  } else {
    state.lost += 1;
    state.wasted += volumeOf(index);
  }
  let washed = 0;
  if (!retain && state.day % WINDOW === 0 && state.layers > 0) {
    washed = state.layers;
    for (let i = 0; i < state.layers; i++) state.wasted += volumeOf(i);
    state.lost += state.layers;
    state.kept -= state.layers;
    state.layers = 0;
    state.washes += 1;
  }
  return { index, cured, washed, done: state.layers >= N };
}

// Days to finish the person, or Infinity when it can never be finished.
export function daysToFinish(persist, retain) {
  if (persist <= 0) return Infinity;
  const s = fresh();
  for (let guard = 0; guard < 10000; guard++) if (step(s, persist, retain).done) return s.day;
  return Infinity;
}
