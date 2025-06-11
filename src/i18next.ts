// src/i18n.ts
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import global_en from './locales/en/global.json'
import global_es from './locales/es/global.json'

const savedLanguage = localStorage.getItem('language') || 'es'

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: savedLanguage,
  fallbackLng: 'es',
  resources: {
    en: { global: global_en },
    es: { global: global_es },
  },
})

export default i18next
