import { useEffect, useMemo, useState } from "react";
import { LANGUAGES, TRANSLATIONS } from "../utils/constants";
import { LanguageContext } from "./languageContext";

const APP_TO_GOOGLE_LANGUAGE = Object.freeze({
  en: "en",
  hi: "hi",
  mr: "mr",
  gu: "gu",
  ta: "ta",
  bn: "bn",
  te: "te",
});

function syncGoogleTranslateLanguage(language) {
  if (typeof document === "undefined") {
    return;
  }

  const targetLanguage = APP_TO_GOOGLE_LANGUAGE[language] || "hi";
  const cookieValue = `/auto/${targetLanguage}`;
  document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;

  try {
    localStorage.setItem("googtrans", cookieValue);
  } catch {
    // Ignore localStorage errors in restricted environments.
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("astro_language") || "hi",
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language || "hi";
    }

    syncGoogleTranslateLanguage(language);
  }, [language]);

  const value = useMemo(() => {
    const dictionary = TRANSLATIONS[language] || TRANSLATIONS.hi;

    return {
      language,
      availableLanguages: LANGUAGES,
      setLanguage: (nextLanguage) => {
        localStorage.setItem("astro_language", nextLanguage);
        setLanguage(nextLanguage);
      },
      t: (key, fallback = "") =>
        dictionary[key] || TRANSLATIONS.en[key] || fallback,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
