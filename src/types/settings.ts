import { AIModelConfig } from './ai';

export interface AppPreferences {
  allowReversed: boolean;
  hapticsEnabled: boolean;
  onlyMajorArcana: boolean;
  animationEnabled: boolean;
  biometricsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface SettingsState {
  // State
  userName: string;
  themeMode: 'light' | 'dark' | 'system';
  activeDeckId: string;
  isOnboardingCompleted: boolean;
  aiConfig: AIModelConfig;
  preferences: AppPreferences;

  // Actions
  setUserName: (name: string) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  completeOnboarding: () => void;
  setActiveDeckId: (deckId: string) => void;
  setAiConfig: (config: Partial<AIModelConfig>) => void; // Update only API key
  updatePreferences: (prefs: Partial<AppPreferences>) => void;
  resetAllSettings: () => void;
}
