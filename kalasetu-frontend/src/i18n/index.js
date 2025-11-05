import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { welcome: 'Welcome', signIn: 'Sign In', signOut: 'Sign Out' } },
  hi: { translation: { welcome: 'स्वागत है', signIn: 'साइन इन', signOut: 'साइन आउट' } },
  mr: { translation: { welcome: 'स्वागत आहे', signIn: 'साइन इन', signOut: 'साइन आउट' } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;


