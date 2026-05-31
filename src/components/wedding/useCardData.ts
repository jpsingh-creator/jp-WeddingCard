import { useEffect, useMemo, useState } from "react";
import type { CardData } from "./types";
import { DEFAULT_DATA } from "./types";
import { useLang } from "@/i18n";
import { DATA_BY_LANG } from "@/i18n/translations";
import { getIDB, setIDB, removeIDB } from "@/lib/idb";

// Edits are stored per-language so each translation can be customized
// independently. Keys: wedding-card-data-v3-<lang>
const KEY_PREFIX = "wedding-card-data-v3-";

export function useCardData() {
  const { lang } = useLang();
  const [overrides, setOverrides] = useState<Partial<CardData> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    
    getIDB(KEY_PREFIX + lang).then((idbData) => {
      if (idbData) {
        setOverrides(idbData);
        setLoaded(true);
      } else {
        // Fallback to localstorage if not in IDB
        let lsData = null;
        try {
          const raw = localStorage.getItem(KEY_PREFIX + lang);
          if (raw) lsData = JSON.parse(raw);
        } catch {}
        
        setOverrides(lsData);
        if (lsData) {
          // Migrate to IDB
          setIDB(KEY_PREFIX + lang, lsData).catch(() => {});
        }
        setLoaded(true);
      }
    }).catch(() => {
      // If IDB fails entirely
      try {
        const raw = localStorage.getItem(KEY_PREFIX + lang);
        setOverrides(raw ? JSON.parse(raw) : null);
      } catch {
        setOverrides(null);
      }
      setLoaded(true);
    });
  }, [lang]);

  const data = useMemo<CardData>(() => {
    const langDefaults = DATA_BY_LANG[lang] ?? {};
    return { ...DEFAULT_DATA, ...langDefaults, ...(overrides ?? {}) } as CardData;
  }, [lang, overrides]);

  const save = (next: CardData) => {
    setOverrides(next);
    setIDB(KEY_PREFIX + lang, next).catch(() => {
      // If IDB fails (rare), try to fallback to localStorage
      try { localStorage.setItem(KEY_PREFIX + lang, JSON.stringify(next)); } catch { /* ignore */ }
    });
  };

  const reset = () => {
    setOverrides(null);
    removeIDB(KEY_PREFIX + lang).catch(() => {});
    try { localStorage.removeItem(KEY_PREFIX + lang); } catch { /* ignore */ }
  };

  return { data, save, reset, loaded };
}
