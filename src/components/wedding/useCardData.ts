import { useEffect, useMemo, useState } from "react";
import type { CardData } from "./types";
import { DEFAULT_DATA } from "./types";
import { useLang } from "@/i18n";
import { DATA_BY_LANG } from "@/i18n/translations";
import { getIDB, setIDB, removeIDB } from "@/lib/idb";

// Edits are stored per-language so each translation can be customized
// independently. Keys: wedding-card-data-v3-<lang>
const KEY_PREFIX = "wedding-card-data-v3-";
const GLOBAL_MEMORIES_KEY = "wedding-card-memories-global";

export function useCardData() {
  const { lang } = useLang();
  const [overrides, setOverrides] = useState<Partial<CardData> | null>(null);
  const [globalMemories, setGlobalMemories] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    
    Promise.all([
      getIDB(KEY_PREFIX + lang).catch(() => null),
      getIDB(GLOBAL_MEMORIES_KEY).catch(() => null)
    ]).then(([idbData, memoriesData]) => {
      // Handle language specific data
      let finalData = idbData;
      if (!finalData) {
        try {
          const raw = localStorage.getItem(KEY_PREFIX + lang);
          if (raw) finalData = JSON.parse(raw);
        } catch {}
        if (finalData) setIDB(KEY_PREFIX + lang, finalData).catch(() => {});
      }

      // Handle global memories
      let finalMemories = memoriesData;
      if (!finalMemories) {
        // Migration: extract memories from current lang if global doesn't exist yet
        if (finalData && finalData.memories) {
          finalMemories = finalData.memories;
        } else {
          finalMemories = [];
        }
        if (finalMemories.length > 0) {
          setIDB(GLOBAL_MEMORIES_KEY, finalMemories).catch(() => {});
        }
      }

      setOverrides(finalData || null);
      setGlobalMemories(finalMemories || []);
      setLoaded(true);
    });
  }, [lang]);

  const data = useMemo<CardData>(() => {
    const langDefaults = DATA_BY_LANG[lang] ?? {};
    const merged = { ...DEFAULT_DATA, ...langDefaults, ...(overrides ?? {}) } as CardData;
    // Always apply global memories across all languages
    merged.memories = globalMemories;
    return merged;
  }, [lang, overrides, globalMemories]);

  const save = (next: CardData) => {
    const nextMemories = next.memories || [];
    setGlobalMemories(nextMemories);
    
    // Store language-specific data (without memories to save space)
    const dataToStore = { ...next };
    delete dataToStore.memories;
    setOverrides(dataToStore);
    
    setIDB(KEY_PREFIX + lang, dataToStore).catch(() => {
      try { localStorage.setItem(KEY_PREFIX + lang, JSON.stringify(dataToStore)); } catch {}
    });
    setIDB(GLOBAL_MEMORIES_KEY, nextMemories).catch(() => {});
  };

  const reset = () => {
    setOverrides(null);
    setGlobalMemories([]);
    removeIDB(KEY_PREFIX + lang).catch(() => {});
    removeIDB(GLOBAL_MEMORIES_KEY).catch(() => {});
    try { localStorage.removeItem(KEY_PREFIX + lang); } catch { /* ignore */ }
  };

  return { data, save, reset, loaded };
}
