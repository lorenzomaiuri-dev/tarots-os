import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { StorageService } from '../services/storage';
import { getDailySeed, drawCards } from '../services/rng';
import { getDeck } from '../services/deckRegistry';
import { DrawnCard } from '../types/reading';
import { STORAGE_KEYS } from "../constants";

export const useDailyDraw = () => {
  const { activeDeckId, preferences, userName } = useSettingsStore();
  const [dailyCard, setDailyCard] = useState<DrawnCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get seed
  const seedBase = getDailySeed();
  const personalSeed = userName ? `${seedBase}-${userName}` : seedBase;

  // es: "daily_card_state_userName-2025-12-24"
  const todayKey = `${STORAGE_KEYS.DAILY_CARD}_${personalSeed}`;

  // 1. Load state
  useEffect(() => {
    const loadDaily = async () => {
      try {
        const saved = await StorageService.getItem<DrawnCard>(todayKey);
        if (saved) {
          // TODO: CHECK IF ACTIVE DECK IS THE SAME
          setDailyCard(saved);
        }
      } catch (e) {
        console.error("Error loading daily card", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDaily();
  }, [todayKey]);

  // 2. Drawing function
  const drawNow = useCallback(async () => {
    const deck = getDeck(activeDeckId);
    if (!deck) return;    
    
    // Filter major arcana based on preferences
    let deckToUse = deck;
    if (preferences.onlyMajorArcana) {
      deckToUse = {
        ...deck,
        cards: deck.cards.filter(c => c.meta.type === 'major')
      };
    }

    const result = drawCards(deckToUse, 1, personalSeed, preferences.allowReversed);
    const drawn = result[0];

    const newDailyCard: DrawnCard = {
      cardId: drawn.card.id,
      deckId: activeDeckId,
      positionId: 'daily',
      isReversed: drawn.isReversed
    };

    setDailyCard(newDailyCard);
    await StorageService.setItem(todayKey, newDailyCard);
  }, [activeDeckId, preferences, todayKey]);

  return {
    dailyCard,
    isLoading,
    drawNow,
    isAlreadyDrawn: !!dailyCard
  };
};