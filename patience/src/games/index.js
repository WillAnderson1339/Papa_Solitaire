// Register all available games.
import { registerGame } from './registry';
import { klondike } from './klondike';

registerGame(klondike);

export const DEFAULT_GAME_ID = klondike.id;
