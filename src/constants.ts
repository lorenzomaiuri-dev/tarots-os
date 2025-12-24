export const STORAGE_KEYS = {
  SETTINGS: 'app_settings',
  HISTORY: 'reading_history',
  DAILY_CARD: 'daily_card_state',
} as const;

export const DEFAULTS = {
  ACTIVE_DECK: 'rider-waite',
  THEME: 'system',
  AI_MODEL: 'tngtech/deepseek-r1t2-chimera:free',
  PROVIDER: 'openrouter', // TODO: Default free on OpenRouter
} as const;

export const AI_CONFIG = {
  BASE_URL: 'https://openrouter.ai/api/v1',
  APP_NAME: 'Tarots AI',
  SITE_URL: 'https://github.com/lorenzomaiuri-dev/tarots-ai',
  TEMPERATURE: 0.7  // TODO: from config, Not too creative
} as const;