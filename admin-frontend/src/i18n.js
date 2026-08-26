import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const SUPPORTED_LANGUAGES = [
  'en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'gu', 'pa', 'bn', 'or', 'ur', 'ar', 
  'zh-CN', 'zh-TW', 'ja', 'ko', 'th', 'vi', 'id', 'ms', 'fr', 'de', 'es', 'pt', 
  'it', 'nl', 'ru', 'tr', 'pl', 'uk', 'sv', 'no', 'fi', 'da', 'el', 'ro', 'hu', 
  'cs', 'sk', 'bg', 'he'
];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
      requestOptions: {
        cache: 'default',
      },
    },
    react: {
      useSuspense: false,
    },
  });

// Handle RTL text direction
i18n.on('languageChanged', (lng) => {
  const rtlLanguages = ['ar', 'he', 'ur', 'fa'];
  const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
