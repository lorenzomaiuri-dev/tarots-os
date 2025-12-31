export const STORAGE_KEYS = {
  SETTINGS: 'app_settings',
  HISTORY: 'reading_history',
  DAILY_CARD: 'daily_card_state',
} as const;

export const DEFAULTS = {
  BASE_URL: 'https://openrouter.ai/api/v1',
  ACTIVE_DECK: 'rider-waite',
  THEME: 'system',
  AI_MODEL: 'tngtech/deepseek-r1t2-chimera:free',
  PROVIDER: 'openrouter', // TODO: Default free on OpenRouter
} as const;

export const AI_CONFIG = {
  APP_NAME: 'Tarots OS',
  SITE_URL: 'https://github.com/lorenzomaiuri-dev/tarots-os',
  TEMPERATURE: 0.7, // TODO: from config, Not too creative
} as const;

export const AI_PROMPT_KEYS = {
  // The system instruction (Persona)
  SYSTEM: 'prompts:system_instruction',

  // The context block (Deck, Spread, Question)
  CONTEXT: 'prompts:context_block',

  // The header for the list of cards
  CARDS_HEADER: 'prompts:cards_header',

  // Template for a single card line
  CARD_LINE: 'prompts:card_line',

  // The final instruction to the AI
  FINAL_INSTRUCTION: 'prompts:final_instruction',

  // Helpers for status
  STATUS_UPRIGHT: 'prompts:status_upright',
  STATUS_REVERSED: 'prompts:status_reversed',
} as const;

export const PRIVACY_POLICY_URL =
  'https://html-preview.github.io/?url=https://github.com/lorenzomaiuri-dev/tarots-os/blob/main/privacy.html';

export const TERMS_CONDITIONS_URL =
  'https://html-preview.github.io/?url=https://github.com/lorenzomaiuri-dev/tarots-os/blob/main/terms.html';

export const CHANGELOG_URL =
  'https://raw.githubusercontent.com/lorenzomaiuri-dev/tarots-os/main/changelog.json';
