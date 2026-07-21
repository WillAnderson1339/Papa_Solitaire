// Actions for the game

// Draw cards from stock to waste
export const drawFromStock = (stock, waste, count = 1) => {
  if (stock.length === 0) {
    // If stock is empty, recycle waste pile
    if (waste.length === 0) {
      return { stock, waste };
    }
    
    const recycledStock = waste.map(card => ({ ...card, faceUp: false })).reverse();
    return {
      stock: recycledStock,
      waste: []
    };
  }
  
  // Draw cards
  const drawnCards = [];
  const newStock = [...stock];
  
  for (let i = 0; i < count && newStock.length > 0; i++) {
    const card = { ...newStock.pop(), faceUp: true };
    drawnCards.push(card);
  }
  
  return {
    stock: newStock,
    waste: [...waste, ...drawnCards]
  };
};

// Move a card from waste to tableau
export const moveWasteToTableau = (waste, tableau, columnIndex) => {
  if (waste.length === 0) {
    return { waste, tableau };
  }
  
  const card = waste[waste.length - 1];
  const newWaste = waste.slice(0, -1);
  const newTableau = [...tableau];
  newTableau[columnIndex] = [...newTableau[columnIndex], card];
  
  return {
    waste: newWaste,
    tableau: newTableau
  };
};

// Move a card from waste to foundation
export const moveWasteToFoundation = (waste, foundations, foundationIndex) => {
  if (waste.length === 0) {
    return { waste, foundations };
  }
  
  const card = waste[waste.length - 1];
  const newWaste = waste.slice(0, -1);
  const newFoundations = [...foundations];
  newFoundations[foundationIndex] = [...newFoundations[foundationIndex], card];
  
  return {
    waste: newWaste,
    foundations: newFoundations
  };
};

// Move a card from tableau to foundation
export const moveTableauToFoundation = (tableau, foundations, columnIndex, cardIndex, foundationIndex) => {
  const column = tableau[columnIndex];
  if (column.length === 0 || cardIndex >= column.length) {
    return { tableau, foundations };
  }
  
  // Only the top card can be moved to foundation
  if (cardIndex !== column.length - 1) {
    return { tableau, foundations };
  }
  
  const card = column[cardIndex];
  const newTableau = [...tableau];
  newTableau[columnIndex] = column.slice(0, cardIndex);
  
  // Flip the new top card if needed
  if (newTableau[columnIndex].length > 0 && !newTableau[columnIndex][newTableau[columnIndex].length - 1].faceUp) {
    newTableau[columnIndex][newTableau[columnIndex].length - 1] = {
      ...newTableau[columnIndex][newTableau[columnIndex].length - 1],
      faceUp: true
    };
  }
  
  const newFoundations = [...foundations];
  newFoundations[foundationIndex] = [...newFoundations[foundationIndex], card];
  
  return {
    tableau: newTableau,
    foundations: newFoundations
  };
};

// Move cards between tableau columns
export const moveTableauToTableau = (tableau, sourceColumnIndex, cardIndex, targetColumnIndex) => {
  const sourceColumn = tableau[sourceColumnIndex];
  if (sourceColumn.length === 0 || cardIndex >= sourceColumn.length) {
    return { tableau };
  }
  
  // Get cards to move
  const cardsToMove = sourceColumn.slice(cardIndex);
  
  // Create new tableau
  const newTableau = [...tableau];
  newTableau[sourceColumnIndex] = sourceColumn.slice(0, cardIndex);
  
  // Flip the new top card if needed
  if (newTableau[sourceColumnIndex].length > 0 && !newTableau[sourceColumnIndex][newTableau[sourceColumnIndex].length - 1].faceUp) {
    newTableau[sourceColumnIndex][newTableau[sourceColumnIndex].length - 1] = {
      ...newTableau[sourceColumnIndex][newTableau[sourceColumnIndex].length - 1],
      faceUp: true
    };
  }
  
  // Add cards to target column
  newTableau[targetColumnIndex] = [...newTableau[targetColumnIndex], ...cardsToMove];
  
  return {
    tableau: newTableau
  };
};

// Move a card from foundation to tableau
export const moveFoundationToTableau = (foundations, tableau, foundationIndex, columnIndex) => {
  const foundation = foundations[foundationIndex];
  if (foundation.length === 0) {
    return { foundations, tableau };
  }
  
  const card = foundation[foundation.length - 1];
  const newFoundations = [...foundations];
  newFoundations[foundationIndex] = foundation.slice(0, -1);
  
  const newTableau = [...tableau];
  newTableau[columnIndex] = [...newTableau[columnIndex], card];
  
  return {
    foundations: newFoundations,
    tableau: newTableau
  };
};

// Auto-move cards to foundation where possible
export const autoMoveToFoundation = (tableau, foundations, waste) => {
  let moved = false;
  let newTableau = [...tableau];
  let newFoundations = [...foundations];
  let newWaste = [...waste];
  
  // Keep trying to move cards until no more moves are possible
  let keepTrying = true;
  while (keepTrying) {
    keepTrying = false;
    
    // Try to move from waste
    if (newWaste.length > 0) {
      const card = newWaste[newWaste.length - 1];
      for (let i = 0; i < 4; i++) {
        const foundation = newFoundations[i];
        // Check if card can be moved to foundation
        if ((foundation.length === 0 && card.value === 'A') ||
            (foundation.length > 0 && 
             card.suit === foundation[foundation.length - 1].suit &&
             getCardValue(card.value) === getCardValue(foundation[foundation.length - 1].value) + 1)) {
          // Move card to foundation
          newFoundations[i] = [...foundation, card];
          newWaste = newWaste.slice(0, -1);
          moved = true;
          keepTrying = true;
          break;
        }
      }
    }
    
    // Try to move from tableau
    for (let i = 0; i < 7; i++) {
      const column = newTableau[i];
      if (column.length === 0) continue;
      
      const card = column[column.length - 1];
      if (!card.faceUp) continue;
      
      for (let j = 0; j < 4; j++) {
        const foundation = newFoundations[j];
        // Check if card can be moved to foundation
        if ((foundation.length === 0 && card.value === 'A') ||
            (foundation.length > 0 && 
             card.suit === foundation[foundation.length - 1].suit &&
             getCardValue(card.value) === getCardValue(foundation[foundation.length - 1].value) + 1)) {
          // Move card to foundation
          newFoundations[j] = [...foundation, card];
          newTableau[i] = column.slice(0, -1);
          
          // Flip the new top card if needed
          if (newTableau[i].length > 0 && !newTableau[i][newTableau[i].length - 1].faceUp) {
            newTableau[i][newTableau[i].length - 1] = {
              ...newTableau[i][newTableau[i].length - 1],
              faceUp: true
            };
          }
          
          moved = true;
          keepTrying = true;
          break;
        }
      }
      
      if (keepTrying) break;
    }
  }
  
  return {
    tableau: newTableau,
    foundations: newFoundations,
    waste: newWaste,
    moved
  };
};

// Helper function to get card value as number
const getCardValue = (value) => {
  const values = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
  return values[value] || 0;
};
