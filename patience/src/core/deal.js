// Shuffling and dealing, with optional seeded reproducibility.
import { buildDeck } from './deck';

// mulberry32: small, fast deterministic PRNG. Same seed, same sequence.
export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Fisher-Yates shuffle; does not modify the input array.
export const shuffle = (array, rng = Math.random) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Deal a game's initial zones. Passing a seed makes the deal reproducible;
// omitting it deals a random game.
export const dealGame = (game, seed) => {
  const rng = seed === undefined ? Math.random : mulberry32(seed);
  return game.deal(shuffle(buildDeck(game.deckConfig), rng));
};
