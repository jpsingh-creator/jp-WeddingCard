import { useEffect, useMemo, useState } from "react";
import type { CardData } from "./types";
import { DEFAULT_DATA } from "./types";
import { useLang } from "@/i18n";
import { DATA_BY_LANG } from "@/i18n/translations";

// Edits are stored per-language so each translation can be customized
// independently. Keys: wedding-card-data-v3-<lang>
const KEY_PREFIX = "wedding-card-data-v3-";

export function useCardData() {
  const { lang } = useLang();
  const [overrides, setOverrides] = useState<Partial<CardData> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    try {
      const raw = localStorage.getItem(KEY_PREFIX + lang);
      setOverrides(raw ? JSON.parse(raw) : null);
    } catch {
      setOverrides(null);
    }
    setLoaded(true);
  }, [lang]);

  const data = useMemo<CardData>(() => {
    const langDefaults = DATA_BY_LANG[lang] ?? {};
    return { ...DEFAULT_DATA, ...langDefaults, ...(overrides ?? {}) } as CardData;
  }, [lang, overrides]);

  const save = (next: CardData) => {
    setOverrides(next);
    try { localStorage.setItem(KEY_PREFIX + lang, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const reset = () => {
    setOverrides(null);
    try { localStorage.removeItem(KEY_PREFIX + lang); } catch { /* ignore */ }
  };

  return { data, save, reset, loaded };
}
