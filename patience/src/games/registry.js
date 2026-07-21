// Registry of the games the application can play.

const games = new Map();

export const registerGame = (game) => {
  games.set(game.id, game);
};

export const getGame = (id) => games.get(id);

export const listGames = () => [...games.values()];
