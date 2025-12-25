import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import 'intl-pluralrules';

import itCommon from './it/common.json';
import itSpreads from './it/spreads.json';
import itPrompts from './it/prompts.json';
import enCommon from './en/common.json';
import enSpreads from './en/spreads.json';
import enPrompts from './en/prompts.json';

const resources = {
  it: { common: itCommon, spreads: itSpreads, prompts: itPrompts },
  en: { common: enCommon, spreads: enSpreads, prompts: enPrompts },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLocales()[0].languageCode ?? 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    ns: ['common', 'spreads', 'prompts'],
    defaultNS: 'common',
  });

/**
 * Dynamically adds a deck's translations to i18next
 */
export const loadDeckTranslations = (deckId: string, lang: string, translationData: any) => {
  if (!i18n.hasResourceBundle(lang, deckId)) {
    i18n.addResourceBundle(lang, deckId, translationData, true, true);
  }
};

export default i18n;