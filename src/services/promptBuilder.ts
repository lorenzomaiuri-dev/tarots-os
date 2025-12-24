import { Deck } from '../types/deck';
import { Spread, DrawnCard } from '../types/reading';
import i18n from '../locales/i18n';
import { AI_PROMPT_KEYS } from '../constants';

/**
 * Builds the message payload for the AI using localized templates.
 */
export const buildInterpretationPrompt = (
  deck: Deck,
  spread: Spread,
  drawnCards: DrawnCard[],
  userQuestion: string = ''
) => {
  // 1. Determine the target language name (e.g., "Italiano" or "English")
  // useful for the System Prompt variable {{language}}
  const currentLangCode = i18n.language; 
  const targetLanguageName = currentLangCode.startsWith('it') ? 'Italiano' : 'English';

  // 2. Build System Prompt
  // We inject the target language to ensure the AI speaks the correct language
  const systemPrompt = i18n.t(AI_PROMPT_KEYS.SYSTEM, { 
    language: targetLanguageName 
  });

  // 3. Build Context Block
  const deckName = i18n.t(`decks:${deck.info.id}.name`, { defaultValue: deck.info.id });
  const spreadName = i18n.t(`spreads:${spread.id}.name`, { defaultValue: spread.id });
  
  const contextBlock = i18n.t(AI_PROMPT_KEYS.CONTEXT, {
    deckName,
    spreadName,
    question: userQuestion || 'General reflection' // Fallback if empty
  });

  // 4. Build Cards List
  const cardsHeader = i18n.t(AI_PROMPT_KEYS.CARDS_HEADER);
  
  const cardsList = drawnCards.map((draw, idx) => {
    const card = deck.cards.find(c => c.id === draw.cardId);
    if (!card) return '';

    const position = spread.slots.find(p => p.id === draw.positionId);
    
    // Dynamic lookups
    const cardName = i18n.t(`decks:${deck.info.id}.cards.${card.id}.name`);
    const cardKeywords = i18n.t(`decks:${deck.info.id}.cards.${card.id}.keywords`);
    const positionName = i18n.t(`spreads:${spread.id}.positions.${position?.id}.label`);
    const positionMeaning = i18n.t(`spreads:${spread.id}.positions.${position?.id}.description`);
    
    const status = draw.isReversed 
      ? i18n.t(AI_PROMPT_KEYS.STATUS_REVERSED) 
      : i18n.t(AI_PROMPT_KEYS.STATUS_UPRIGHT);

    const metaString = `${card.meta.type} ${card.meta.suit ? `(${card.meta.suit})` : ''}`;

    // Interpolate single line template
    return i18n.t(AI_PROMPT_KEYS.CARD_LINE, {
      index: idx + 1,
      positionName,
      positionMeaning,
      cardName,
      status,
      keywords: cardKeywords,
      meta: metaString
    });
  }).join('\n');

  // 5. Final Instruction
  const finalInstruction = i18n.t(AI_PROMPT_KEYS.FINAL_INSTRUCTION);

  // 6. Assemble User Prompt
  const userPrompt = `
${contextBlock}

${cardsHeader}
${cardsList}

${finalInstruction}
  `.trim();

  // Return the OpenRouter/OpenAI standard message format
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
};