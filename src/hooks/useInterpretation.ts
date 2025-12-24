import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { generateInterpretation } from '../services/ai';
import { buildInterpretationPrompt } from '../services/promptBuilder';
import { getDeck } from '../services/deckRegistry';
import { Spread, DrawnCard } from '../types/reading';

export const useInterpretation = () => {
  const { aiConfig } = useSettingsStore();
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interpretReading = async (
    deckId: string,
    spread: Spread,
    drawnCards: DrawnCard[],
    question?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const deck = getDeck(deckId);
      if (!deck) throw new Error('Deck not found');

      // 1. Build prompt
      const messages = buildInterpretationPrompt(deck, spread, drawnCards, question);

      // 2. Call AI service
      const text = await generateInterpretation(messages, aiConfig);
      
      setResult(text);
    } catch (err: any) {
      console.error('Interpretation Error:', err);
      setError(err.message || 'Errore during the generation');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    result,
    isLoading,
    error,
    interpretReading,
    reset: () => setResult(null)
  };
};