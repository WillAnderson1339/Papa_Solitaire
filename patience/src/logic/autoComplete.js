import { isValidFoundationMove } from './rules';

// Move every playable card from the waste and tableau column tops to the
// foundations, repeating until no more moves are possible.
export const autoComplete = (tableau, foundations, waste) => {
  let newTableau = [...tableau];
  let newWaste = [...waste];
  let newFoundations = [...foundations];

  let keepMoving = true;
  let movesMade = 0;

  while (keepMoving) {
    keepMoving = false;

    // Try to move from waste
    if (newWaste.length > 0) {
      const card = newWaste[newWaste.length - 1];
      for (let i = 0; i < 4; i++) {
        if (isValidFoundationMove(card, newFoundations[i])) {
          newFoundations[i] = [...newFoundations[i], card];
          newWaste = newWaste.slice(0, -1);
          keepMoving = true;
          movesMade++;
          break;
        }
      }
    }

    // Try to move from tableau
    for (let i = 0; i < 7; i++) {
      if (newTableau[i].length === 0) continue;

      const card = newTableau[i][newTableau[i].length - 1];
      for (let j = 0; j < 4; j++) {
        if (isValidFoundationMove(card, newFoundations[j])) {
          newFoundations[j] = [...newFoundations[j], card];
          newTableau[i] = newTableau[i].slice(0, -1);
          keepMoving = true;
          movesMade++;
          break;
        }
      }

      if (keepMoving) break;
    }
  }

  return {
    tableau: newTableau,
    foundations: newFoundations,
    waste: newWaste,
    movesMade
  };
};
