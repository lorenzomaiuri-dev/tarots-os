import { ReadingSession } from '../types/reading';
import { getDeck } from '../services/deckRegistry';

export const calculateStats = (readings: ReadingSession[], deckId: string) => {
  // 1. FILTER: Only process readings that belong to the active deckId.
  // This prevents Card IDs from other decks from breaking the logic.
  const filteredReadings = readings.filter(r => r.deckId === deckId);
  
  const totalReadings = filteredReadings.length;
  const deck = getDeck(deckId);
  const suitCounts: Record<string, number> = {};
  const cardCounts: Record<string, number> = {};
  let totalCards = 0;

  // 2. Initialize counts based on the groups defined in the deck
  if (deck?.info.groups) {
    Object.keys(deck.info.groups).forEach(key => {
      suitCounts[key] = 0;
    });
  }

  // 3. Process only the filtered readings
  filteredReadings.forEach(reading => {
    reading.cards.forEach(drawn => {
      // Track how many times each specific card appeared
      cardCounts[drawn.cardId] = (cardCounts[drawn.cardId] || 0) + 1;
      totalCards++;

      if (deck) {
        // Find the card definition in the current deck
        const cardDef = deck.cards.find(c => c.id === drawn.cardId);
        if (cardDef) {
          // Logic: If major, use 'major' key. If minor, use the 'suit' key.
          const groupKey = cardDef.meta.type === 'major' ? 'major' : cardDef.meta.suit;
          
          if (groupKey && suitCounts.hasOwnProperty(groupKey)) {
            suitCounts[groupKey]++;
          }
        }
      }
    });
  });

  // 4. Find Top Card (Most recurring card for THIS deck)
  let topCardId = null;
  let maxCount = 0;
  
  Object.entries(cardCounts).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCardId = id;
    }
  });

  return {
    totalReadings,
    topCardId,
    topCardCount: maxCount,
    suitCounts,
    totalCards
  };
};