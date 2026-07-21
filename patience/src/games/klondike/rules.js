// Card values in order from Ace to King
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Check if a move to tableau is valid
export const isValidMove = (card, targetCard, isEmptyColumn) => {
  // If the target column is empty, only Kings can be placed
  if (isEmptyColumn) {
    return card.value === 'K';
  }
  
  // If the target column is not empty, check if the move is valid
  if (!targetCard || !targetCard.faceUp) {
    return false;
  }
  
  // Cards must be of alternate colors
  const isAlternateColor = (
    (card.suit === 'hearts' || card.suit === 'diamonds') && 
    (targetCard.suit === 'clubs' || targetCard.suit === 'spades')
  ) || (
    (card.suit === 'clubs' || card.suit === 'spades') && 
    (targetCard.suit === 'hearts' || targetCard.suit === 'diamonds')
  );
  
  // Cards must be in descending order (e.g., red 6 on black 7)
  const cardIndex = VALUES.indexOf(card.value);
  const targetIndex = VALUES.indexOf(targetCard.value);
  const isDescending = cardIndex === targetIndex - 1;
  
  return isAlternateColor && isDescending;
};

// Check if a move to foundation is valid
export const isValidFoundationMove = (card, foundation) => {
  // If foundation is empty, only Aces can be placed
  if (foundation.length === 0) {
    return card.value === 'A';
  }
  
  // Get the top card of the foundation
  const topCard = foundation[foundation.length - 1];
  
  // Cards must be of the same suit
  const isSameSuit = card.suit === topCard.suit;
  
  // Cards must be in ascending order (e.g., 7 on 6)
  const cardIndex = VALUES.indexOf(card.value);
  const topCardIndex = VALUES.indexOf(topCard.value);
  const isAscending = cardIndex === topCardIndex + 1;
  
  return isSameSuit && isAscending;
};

// Check if there are any valid moves available
export const hasValidMoves = (tableau, foundations, waste, stock) => {
  // Check if there are cards in the stock
  if (stock.length > 0) {
    return true;
  }
  
  // Check if there are cards in the waste
  if (waste.length > 0) {
    const wasteCard = waste[waste.length - 1];
    
    // Check if waste card can be moved to foundation
    for (let i = 0; i < 4; i++) {
      if (isValidFoundationMove(wasteCard, foundations[i])) {
        return true;
      }
    }
    
    // Check if waste card can be moved to tableau
    for (let i = 0; i < 7; i++) {
      const tableauStack = tableau[i];
      if (tableauStack.length === 0) {
        if (wasteCard.value === 'K') {
          return true;
        }
      } else {
        const topCard = tableauStack[tableauStack.length - 1];
        if (topCard.faceUp && isValidMove(wasteCard, topCard, false)) {
          return true;
        }
      }
    }
  }
  
  // Check for moves between tableau columns
  for (let i = 0; i < 7; i++) {
    const sourceStack = tableau[i];
    if (sourceStack.length === 0 || !sourceStack[sourceStack.length - 1].faceUp) {
      continue;
    }
    
    // Check each face-up card in the stack
    for (let j = 0; j < sourceStack.length; j++) {
      if (!sourceStack[j].faceUp) {
        continue;
      }
      
      const card = sourceStack[j];
      
      // Check if card can be moved to foundation
      for (let k = 0; k < 4; k++) {
        if (isValidFoundationMove(card, foundations[k])) {
          return true;
        }
      }
      
      // Check if card can be moved to another tableau column
      for (let k = 0; k < 7; k++) {
        if (k === i) {
          continue;
        }
        
        const targetStack = tableau[k];
        if (targetStack.length === 0) {
          if (card.value === 'K') {
            return true;
          }
        } else {
          const topCard = targetStack[targetStack.length - 1];
          if (topCard.faceUp && isValidMove(card, topCard, false)) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};

// Check if the game is won
export const isGameWon = (foundations) => {
  // Game is won when all foundations have 13 cards (A through K)
  return foundations.every(foundation => foundation.length === 13);
};
