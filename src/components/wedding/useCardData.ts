import { useEffect, useMemo, useState } from "react";
import type { CardData } from "./types";
import { DEFAULT_DATA } from "./types";
import { useLang } from "@/i18n";
import { DATA_BY_LANG } from "@/i18n/translations";
import { getIDB, setIDB, removeIDB } from "@/lib/idb";

// Local fallbacks
const KEY_PREFIX = "wedding-card-data-v3-";
const GLOBAL_MEMORIES_KEY = "wedding-card-memories-global";

export function useCardData() {
  const { lang } = useLang();
  const [overrides, setOverrides] = useState<Partial<CardData> | null>(null);
  const [globalMemories, setGlobalMemories] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Cloud API endpoints for JSON state
    const cardDataUrl = `/api/media/db/card-data-${lang}.json`;
    const memoriesUrl = `/api/media/db/memories.json`;

    // 1. Fetch from Cloud R2 DB first
    // 2. Fallback to IndexedDB (IDB) if cloud fails (e.g. offline or localhost without binding)
    // 3. Fallback to LocalStorage (LS) if IDB fails
    Promise.all([
      fetch(cardDataUrl)
        .then(res => res.ok ? res.json() : Promise.reject('No cloud data'))
        .catch(() => getIDB(KEY_PREFIX + lang).catch(() => null)),
      fetch(memoriesUrl)
        .then(res => res.ok ? res.json() : Promise.reject('No cloud memories'))
        .catch(() => getIDB(GLOBAL_MEMORIES_KEY).catch(() => null))
    ]).then(([cloudOrIdbData, cloudOrIdbMemories]) => {
      
      let finalData = cloudOrIdbData;
      if (!finalData) {
        try {
          const raw = localStorage.getItem(KEY_PREFIX + lang);
          if (raw) finalData = JSON.parse(raw);
        } catch {}
      }
      // If we loaded from cloud, cache locally
      if (finalData) setIDB(KEY_PREFIX + lang, finalData).catch(() => {});

      let finalMemories = cloudOrIdbMemories;
      if (!finalMemories) {
        try {
          const raw = localStorage.getItem(GLOBAL_MEMORIES_KEY);
          if (raw) finalMemories = JSON.parse(raw);
        } catch {}
      }

      if (!finalMemories) {
        // Migration: extract memories from current lang if global doesn't exist yet
        if (finalData && finalData.memories) {
          finalMemories = finalData.memories;
        } else {
          finalMemories = globalMemories.length > 0 ? globalMemories : [];
        }
      }
      if (finalMemories.length > 0) {
        setIDB(GLOBAL_MEMORIES_KEY, finalMemories).catch(() => {});
      }

      setOverrides(finalData || null);
      setGlobalMemories(finalMemories);
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
    
    // 1. Sync to Cloud R2 Database
    fetch(`/api/media/db/card-data-${lang}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToStore)
    }).catch(console.error);

    fetch(`/api/media/db/memories.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextMemories)
    }).catch(console.error);

    // 2. Sync to local storage / IndexedDB as fallback
    setIDB(KEY_PREFIX + lang, dataToStore).catch(() => {
      try { localStorage.setItem(KEY_PREFIX + lang, JSON.stringify(dataToStore)); } catch {}
    });
    setIDB(GLOBAL_MEMORIES_KEY, nextMemories).catch(() => {
      try { localStorage.setItem(GLOBAL_MEMORIES_KEY, JSON.stringify(nextMemories)); } catch {}
    });
  };

  const reset = () => {
    setOverrides(null);
    setGlobalMemories([]);
    
    // Delete from cloud
    fetch(`/api/media/db/card-data-${lang}.json`, { method: 'DELETE' }).catch(console.error);
    fetch(`/api/media/db/memories.json`, { method: 'DELETE' }).catch(console.error);

    // Delete locally
    removeIDB(KEY_PREFIX + lang).catch(() => {});
    removeIDB(GLOBAL_MEMORIES_KEY).catch(() => {});
    try { localStorage.removeItem(KEY_PREFIX + lang); } catch { /* ignore */ }
  };

  return { data, save, reset, loaded };
}
