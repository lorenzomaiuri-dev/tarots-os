export type CardType = 'major' | 'minor' | 'oracle' | 'other';
export type CardSuit = 'wands' | 'cups' | 'swords' | 'pentacles' | 'none';

export interface DeckGroup {
  color: string;
  labelKey: string; // The i18n key found in common.json
}

export interface CardMeta {
  type: CardType;
  suit?: CardSuit;
  number?: number;
  element?: string;
  zodiac?: string;
}

export interface Card {
  id: string;
  sortIndex: number;
  image: string;
  meta: CardMeta;
}

export interface DeckInfo {
  id: string;
  author?: string;
  totalCards: number;
  // Dynamic groups mapping: e.g. "major" -> { color: "#...", labelKey: "..." }
  groups: Record<string, DeckGroup>; 
}

export interface Deck {
  info: DeckInfo;
  cards: Card[];
}