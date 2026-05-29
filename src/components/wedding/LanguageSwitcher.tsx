import { useState } from "react";
import { useLang } from "@/i18n";
import { UI } from "@/i18n/translations";

export function LanguageSwitcher() {
  const { lang, setLang, languages, t } = useLang();
  const [open, setOpen] = useState(false);

  // Only show languages that have UI strings filled in (extensible).
  const available = languages.filter((l) => UI[l.code]);
  const current = available.find((l) => l.code === lang) ?? available[0];

  return (
    <div className="fixed top-4 right-4 z-[90]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.language}
        className="bg-black/40 backdrop-blur-md border border-gold/40 text-gold font-label uppercase tracking-[0.2em] text-[10px] px-3 py-2 rounded-full shadow-gold active:scale-95"
      >
        🌐 {current.short}
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 min-w-[140px] bg-black/80 backdrop-blur-md border border-gold/40 rounded-xl overflow-hidden shadow-gold"
          role="listbox"
        >
          {available.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`block w-full text-left px-4 py-2 text-sm font-serif transition-colors ${
                l.code === lang ? "bg-gold/20 text-gold" : "text-ivory hover:bg-gold/10"
              }`}
              role="option"
              aria-selected={l.code === lang}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
