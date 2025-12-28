import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULTS, STORAGE_KEYS } from '../constants';
import { SettingsState } from '../types/settings';
import { zustandStorage } from './storageAdapter';

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
        language: 'en',
      },

      // --- Actions ---
      setUserName: (name) => set({ userName: name }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      completeOnboarding: () => set({ isOnboardingCompleted: true }),
      setActiveDeckId: (id) => set({ activeDeckId: id }),

      setAiConfig: (newConfig) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, ...newConfig },
        })),

      updatePreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs },
        })),

      resetAllSettings: () =>
        set({
          preferences: {
            hapticsEnabled: true,
            allowReversed: true,
            onlyMajorArcana: false,
            animationEnabled: true,
            theme: 'system',
            language: 'en',
          },
          aiConfig: {
            provider: DEFAULTS.PROVIDER,
            modelId: DEFAULTS.AI_MODEL,
            apiKey: '', // Start empty
          },
          isOnboardingCompleted: false,
        }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => zustandStorage), // Use native storage
    }
  )
);
