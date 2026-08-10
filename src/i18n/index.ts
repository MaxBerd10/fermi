import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // NOTE: do NOT also set `lng` here — an explicit `lng` option makes
    // i18next use it directly and skip LanguageDetector's result entirely,
    // which defeats the language switcher (it would always reset back to
    // this value on reload, no matter what's in localStorage).
    fallbackLng: 'uz',
    debug: false,
    resources: messages,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Legacy site always defaulted to 'uz' regardless of browser/OS
      // language — only an explicit in-app language-switcher choice
      // (persisted to localStorage) should override that, never the
      // browser's Accept-Language/navigator.language.
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  })
  .then(() => {
    // The 'languageChanged' listener below misses the very first
    // resolution (it fires during init, before this .then callback can
    // attach it), so set it once here too.
    document.documentElement.lang = i18n.language.slice(0, 2);
  });

// Keeps <html lang> in sync with the active UI language — index.html hardcodes
// lang="uz" for the initial (pre-JS) load, but never updated after a language
// switch, which is wrong for screen readers and search engines alike.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng.slice(0, 2);
});

export default i18n;