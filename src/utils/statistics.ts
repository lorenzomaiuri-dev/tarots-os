import { ReadingSession } from '../types/reading';
import { getDeck } from '../services/deckRegistry';

export const calculateStats = (readings: ReadingSession[], deckId: string) => {
  const totalReadings = readings.length;
  
  const deck = getDeck(deckId);
  const suitCounts: Record<string, number> = {};

  // Initialize counts based on the groups defined in the deck
  if (deck?.info.groups) {
    Object.keys(deck.info.groups).forEach(key => {
      suitCounts[key] = 0;
    });
  }

  const cardCounts: Record<string, number> = {};
  let totalCards = 0;

  readings.forEach(reading => {
    reading.cards.forEach(drawn => {
      cardCounts[drawn.cardId] = (cardCounts[drawn.cardId] || 0) + 1;

      if (deck) {
        const cardDef = deck.cards.find(c => c.id === drawn.cardId);
        if (cardDef) {
          // Logic: If major, use 'major' key. If minor, use the 'suit' key.
          const groupKey = cardDef.meta.type === 'major' ? 'major' : cardDef.meta.suit;
          
          if (groupKey && suitCounts.hasOwnProperty(groupKey)) {
            suitCounts[groupKey]++;
          }
        }
      }
      totalCards++;
    });
  });

  // Find Top Card
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