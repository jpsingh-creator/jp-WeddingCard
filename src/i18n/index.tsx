import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, UI, type LangCode, type UIStrings } from "./translations";

const LS_KEY = "wedding-card-lang";

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: UIStrings;
  languages: typeof LANGUAGES;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY) as LangCode | null;
      if (saved && UI[saved]) {
        setLangState(saved);
        return;
      }
      const nav = (typeof navigator !== "undefined" ? navigator.language : "en").toLowerCase();
      if (nav.startsWith("hi")) setLangState("hi");
      else if (nav.startsWith("te")) setLangState("te");
      else if (nav.startsWith("ta")) setLangState("ta");
      else if (nav.startsWith("kn")) setLangState("kn");
      else if (nav.startsWith("ml")) setLangState("ml");
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: LangCode) => {
    setLangState(l);
    try { localStorage.setItem(LS_KEY, l); } catch { /* ignore */ }
  };

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: UI[lang] ?? UI.en, languages: LANGUAGES }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
