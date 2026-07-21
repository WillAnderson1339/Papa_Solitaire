// Register all available games.
import { registerGame } from './registry';
import { klondike } from './klondike';
import { freecell } from './freecell';

registerGame(klondike);
registerGame(freecell);

export const DEFAULT_GAME_ID = klondike.id;
