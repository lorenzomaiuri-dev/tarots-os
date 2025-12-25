import { Deck, DeckInfo } from '../types/deck';
import i18n, { loadDeckTranslations } from '../locales/i18n';

// 1. Define the structure of our deck loader
type DeckBundle = {
  data: Deck;
  images: Record<string, any>;
  translations: {
    en: any;
    it: any;
  };
};

// 2. The "Static Manifest" 
// (Metro requires paths to be explicit, but we map them here)
const DECK_MANIFEST: Record<string, () => DeckBundle> = {
  'rider-waite': () => ({
    data: require('../data/decks/rider-waite/deck.json'),
    images: require('../data/decks//rider-waite/images').default,
    translations: {
      en: require('../locales/en/decks/rider-waite.json'),
      it: require('../locales/it/decks/rider-waite.json'),
    },
  }),
  // Add new decks here...
  // 'thoth': () => ({ ... })
};

// Internal cache to avoid re-loading
const loadedDecks: Record<string, DeckBundle> = {};

/**
 * Loads a deck and its translations into memory
 */
export const loadDeck = (deckId: string): DeckBundle | null => {
  if (loadedDecks[deckId]) return loadedDecks[deckId];

  const loader = DECK_MANIFEST[deckId];
  if (!loader) return null;

  const bundle = loader();
  
  // Register translations with i18next for all supported languages
  Object.entries(bundle.translations).forEach(([lang, data]) => {
    loadDeckTranslations(deckId, lang, data);
  });

  loadedDecks[deckId] = bundle;
  return bundle;
};

export const getAvailableDecks = (): DeckInfo[] => {
  // We execute the loaders to get info, or maintain a separate metadata list
  return Object.keys(DECK_MANIFEST).map(id => {
    const bundle = loadDeck(id);
    return bundle!.data.info;
  });
};

export const getDeck = (deckId: string): Deck | null => {
  return loadDeck(deckId)?.data || null;
};

export const getCardImageSource = (deckId: string, imageId: string): any => {
  const bundle = loadDeck(deckId);
  return bundle?.images[imageId] || null;
};

export const getCardBackImage = (deckId: string): any => {
    const bundle = loadDeck(deckId);
    return bundle?.images['back_image'] || null;
}