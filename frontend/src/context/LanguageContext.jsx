import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = {
  fr: { code: 'fr', name: 'Francais', flag: '🇫🇷' },
  ln: { code: 'ln', name: 'Lingala', flag: '🇨🇩' },
  kg: { code: 'kg', name: 'Kikongo', flag: '🇨🇩' },
  lu: { code: 'lu', name: 'Tshiluba', flag: '🇨🇩' },
  sw: { code: 'sw', name: 'Swahili', flag: '🇨🇩' },
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('carelink_language') || 'fr';
  });

  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const module = await import(`../locales/${currentLanguage}.json`);
        setTranslations(module.default || module);
      } catch (err) {
        console.error('Erreur chargement traductions:', err);
        // Fallback francais
        const frModule = await import('../locales/fr.json');
        setTranslations(frModule.default || frModule);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
    localStorage.setItem('carelink_language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (langCode) => {
    if (LANGUAGES[langCode]) {
      setCurrentLanguage(langCode);
    }
  };

  const t = (key, fallback = '') => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    return value || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      t, 
      languages: LANGUAGES,
      loading 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage doit etre utilise dans un LanguageProvider');
  }
  return context;
}