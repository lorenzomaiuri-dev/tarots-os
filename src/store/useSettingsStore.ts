import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storageAdapter';
import { SettingsState } from '../types/settings';
import { STORAGE_KEYS, DEFAULTS } from '../constants';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // --- Default ---
      userName: '', // Start empty
      themeMode: DEFAULTS.THEME,
      activeDeckId: DEFAULTS.ACTIVE_DECK,
      isOnboardingCompleted: false,
      
      aiConfig: {
        provider: DEFAULTS.PROVIDER,
        modelId: DEFAULTS.AI_MODEL,
        apiKey: '', // Start empty
      },

      preferences: {
        hapticsEnabled: true,
        allowReversed: true,
        onlyMajorArcana: false,
        animationEnabled: true,
        theme: 'system',
        language: 'en'
      },

      // --- Actions ---
      setUserName: (name) => set({ userName: name }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      completeOnboarding: () => set({ isOnboardingCompleted: true }),
      setActiveDeckId: (id) => set({ activeDeckId: id }),
      
      setAiConfig: (newConfig) => 
        set((state) => ({ 
          aiConfig: { ...state.aiConfig, ...newConfig } 
        })),      

      updatePreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs }
        })),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => zustandStorage), // Use native storage
    }
  )
);