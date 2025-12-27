export interface SpreadPosition {
  id: string;        // es: "1", "2"
  label: string;      // es: "past", "obstacle"
  layout?: { x: number; y: number; rotation?: number }; 
}

export interface Spread {
  id: string;        // es: "three-card", "celtic-cross"
  slots: SpreadPosition[];
  defaultQuestionKey: string;
}

export interface DrawnCard {
  cardId: string;    // es: "maj_00"
  deckId: string;
  positionId: string;
  isReversed: boolean;
}

export interface ReadingSession {
  id: string;
  timestamp: number;      // Unix timestamp
  spreadId: string;
  customQuestion?: string;
  deckId: string;
  cards: DrawnCard[];
  
  aiInterpretation?: string; 
  userNotes?: string;
  
  // Metadata
  seed?: string;
  modelUsed?: string;
}

export interface HistoryState {
  readings: ReadingSession[];
  
  // Actions
  addReading: (reading: ReadingSession) => void;
  updateReadingInterpretation: (id: string, text: string) => void;
  deleteReading: (id: string) => void;
  clearHistory: () => void;
  updateUserNotes: (id: string, notes: string) => void;
}