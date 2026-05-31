import { useSearch } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import couple from "@/assets/couple-cartoon.png";
import silhouette from "@/assets/couple-silhouette.png";
import mandala from "@/assets/mandala.png";
import peacock from "@/assets/peacock.png";
import diya from "@/assets/diya.png";
import { Petals } from "@/components/wedding/Petals";
import { Curtain } from "@/components/wedding/Curtain";
import { GaneshaIntro } from "@/components/wedding/GaneshaIntro";
import { Countdown } from "@/components/wedding/Countdown";
import { Reveal } from "@/components/wedding/Reveal";
import { useCardData } from "@/components/wedding/useCardData";
import { openDirections } from "@/components/wedding/directions";
import { EditPanel } from "@/components/wedding/EditPanel";
import { MemoriesSlideshow } from "@/components/wedding/MemoriesSlideshow";
import { PerfPanel } from "@/components/wedding/PerfPanel";
import { LanguageSwitcher } from "@/components/wedding/LanguageSwitcher";
import { useLang } from "@/i18n";

const EDIT_KEY = "123";

export type Search = { edit?: string };

export const headFn = () => ({
    meta: [
      { title: "Shubh Vivah · Parvati weds Shiva" },
      { name: "description", content: "With blessings of elders, join us in celebrating the sacred union of Parvati & Shiva." },
      { property: "og:title", content: "Shubh Vivah · Parvati weds Shiva" },
      { property: "og:description", content: "A traditional Hindu wedding invitation." },
    ],
});

export const validateSearch = (s: Record<string, unknown>): Search => ({
  edit: typeof s.edit === "string" ? s.edit : undefined,
});


export function WeddingCard() {
  const search = useSearch({ strict: false }) as Search;
  const edit = search.edit;
  const { t } = useLang();
  const { data, save, reset, loaded } = useCardData();
  const [ganeshaDone, setGaneshaDone] = useState(false);
  const [curtainDone, setCurtainDone] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const startCurtain = () => setGaneshaDone(true);

  // Secret admin trigger logic
  const secretClicks = useRef(0);
  const firstClickTime = useRef(0);

  const handleSecretClick = () => {
    const now = Date.now();
    if (secretClicks.current === 0) {
      firstClickTime.current = now;
    }

    if (now - firstClickTime.current > 1500) {
      // Took longer than 1.5s, restart the count
      secretClicks.current = 1;
      firstClickTime.current = now;
    } else {
      secretClicks.current += 1;
      if (secretClicks.current >= 5) {
        secretClicks.current = 0;
        setShowPinPrompt(true);
      }
    }
  };

  const submitPin = () => {
    if (pinInput === "556") {
      setShowEdit(true);
      setShowPinPrompt(false);
      setPinInput("");
    } else {
      alert("Incorrect PIN");
      setPinInput("");
    }
  };

  const editor = edit === EDIT_KEY;

  useEffect(() => {
    if (curtainDone) document.body.style.overflow = "auto";
    else document.body.style.overflow = "hidden";
  }, [curtainDone]);

  // Register service worker for offline caching after first scan
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  if (!loaded) return null;

  const wedding = data.events.find((e) => e.id === "wedding") ?? data.events[0];

  return (
    <div className="relative min-h-screen text-ivory">
      {/* Admin PIN Prompt */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a0f0f] border border-[#d4af37]/30 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-xl text-[#d4af37] font-serif mb-4">Admin Access</h3>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
              className="w-full bg-black/50 border border-[#d4af37]/50 rounded-lg p-3 text-center text-ivory tracking-widest text-2xl focus:outline-none focus:border-[#d4af37] mb-6"
              autoFocus
            />
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowPinPrompt(false); setPinInput(""); }}
                className="flex-1 px-4 py-2 border border-[#d4af37]/30 text-ivory rounded-lg hover:bg-[#d4af37]/10 transition-colors font-label tracking-widest text-sm"
              >
                CANCEL
              </button>
              <button 
                onClick={submitPin}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8323] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity font-label tracking-widest text-sm"
              >
                UNLOCK
              </button>
            </div>
          </div>
        </div>
      )}

      <LanguageSwitcher />
      <GaneshaIntro onDone={startCurtain} />
      {ganeshaDone && <Curtain onDone={() => setCurtainDone(true)} />}
      <Petals />

      {/* Glow background mandala */}
      <img
        src={mandala}
        alt=""
        aria-hidden
        className="pointer-events-none fixed -top-40 -right-40 w-[600px] opacity-15 animate-spin-slow"
      />
      <img
        src={mandala}
        alt=""
        aria-hidden
        className="pointer-events-none fixed -bottom-60 -left-40 w-[600px] opacity-10 animate-spin-reverse"
      />

      {/* SECRET INVISIBLE ADMIN TRIGGER */}
      {/* Rapidly click the very top-left corner of the screen 5 times to open the editor */}
      <div 
        className="fixed top-0 left-0 w-24 h-24 z-[100] cursor-default opacity-0"
        onClick={handleSecretClick}
        title=""
      />

      {showEdit && (
        <EditPanel data={data} onSave={save} onClose={() => setShowEdit(false)} onReset={reset} />
      )}
      <PerfPanel />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />

        <Reveal>
          <p className="font-label uppercase tracking-[0.45em] text-gold-soft text-[10px] md:text-xs">{t.ganeshaSalutation}</p>
        </Reveal>

        <Reveal delay={200}>
          <div className="relative my-3 flex items-center justify-center">
            <img src={mandala} alt="" aria-hidden className="absolute w-[360px] md:w-[480px] opacity-40 animate-spin-slow" />
            <img
              src={couple}
              alt={`${data.brideName} and ${data.groomName} cartoon illustration`}
              width={1024}
              height={1024}
              className="relative w-[240px] md:w-[340px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-scale-in"
            />
          </div>
        </Reveal>

        <Reveal delay={500}>
          <p className="font-script text-shimmer text-6xl md:text-8xl leading-tight mt-2">
            {data.brideName}
          </p>
          <p className="font-display text-gold tracking-[0.5em] text-xs md:text-sm my-3">
            ✦ {t.weds} ✦
          </p>
          <p className="font-script text-shimmer text-6xl md:text-8xl leading-tight">
            {data.groomName}
          </p>
        </Reveal>

        <Reveal delay={800}>
          <p className="font-serif italic text-gold-soft mt-6 max-w-md">{data.muhurtam}</p>
        </Reveal>

        <Reveal delay={1000}>
          <div className="mt-6 animate-bounce text-gold/70 text-2xl">⌄</div>
        </Reveal>
      </section>

      {/* INVITATION */}
      <section className="relative px-5 py-20 max-w-2xl mx-auto text-center">
        <Reveal>
          <div className="divider-ornate font-label text-xs tracking-[0.3em]">{t.invitation}</div>
        </Reveal>
        <Reveal delay={200}>
          <img
            src={silhouette}
            alt="Bride and groom silhouette"
            width={1024}
            height={768}
            className="mx-auto w-56 md:w-80 my-6 animate-sway"
          />
        </Reveal>
        <Reveal delay={350}>
          <p className="font-serif italic text-lg md:text-xl leading-relaxed text-ivory/90">
            {data.invitation}
          </p>
        </Reveal>
        <Reveal delay={500}>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <FamilyCard side={t.bride} name={data.brideName} parents={data.brideParents} grandparents={data.brideGrandparents} />
            <FamilyCard side={t.groom} name={data.groomName} parents={data.groomParents} grandparents={data.groomGrandparents} />
          </div>
        </Reveal>
      </section>

      {/* COUNTDOWN */}
      <section className="relative px-5 py-16 text-center">
        <Reveal>
          <div className="divider-ornate font-label text-xs tracking-[0.3em]">{t.countingMoments}</div>
        </Reveal>
        <Reveal delay={200}>
          <p className="font-script text-gold text-5xl md:text-6xl mt-4 mb-6">{t.tillBigDay}</p>
        </Reveal>
        <Reveal delay={350}>
          <Countdown iso={data.weddingISO} />
        </Reveal>
      </section>

      {/* OTHER FEATURES */}
      {data.otherFeatures && data.otherFeatures.length > 0 && (
        <section className="relative px-5 py-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="divider-ornate font-label text-xs tracking-[0.3em]">Other Features</div>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {data.otherFeatures.map((feat, i) => (
              <Reveal key={feat.id || i} delay={200 + (i * 100)}>
                <a href={feat.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 glass-card text-gold font-label tracking-wider text-xs md:text-sm uppercase px-6 py-4 rounded-full shadow-gold hover:-translate-y-1 hover:bg-gold/10 active:scale-95 transition-all">
                  {feat.label.toLowerCase().includes("live") ? (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  ) : (
                    <span>✧</span>
                  )}
                  {feat.label}
                </a>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* EVENTS */}
      <section className="relative px-5 py-20 max-w-3xl mx-auto">
        <Reveal>
          <div className="divider-ornate font-label text-xs tracking-[0.3em]">{t.celebrations}</div>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="font-script text-shimmer text-6xl md:text-7xl text-center mt-3 mb-10">{t.ourRituals}</h2>
        </Reveal>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent -translate-x-1/2" />
          <div className="space-y-6">
            {data.events.map((ev, i) => (
              <Reveal key={ev.id} delay={i * 100}>
                <div className="glass-card p-5 md:p-6 group transition-all hover:-translate-y-1 hover:shadow-gold active:scale-[0.98]">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl md:text-4xl shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6">{ev.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-xl md:text-2xl text-shimmer">{ev.name}</h3>
                        <span className="font-label text-xs text-gold-soft tracking-wider">{ev.time}</span>
                      </div>
                      <p className="font-serif italic text-gold-soft mt-1">{ev.date}</p>
                      <p className="font-serif text-ivory mt-2">{ev.venue}</p>
                      <p className="font-serif text-sm text-ivory/70">{ev.address}</p>
                      <button
                        onClick={() => openDirections(ev.mapsQuery)}
                        className="mt-3 inline-flex items-center gap-2 bg-gold-grad text-maroon-deep font-label tracking-wider text-xs uppercase px-4 py-2 rounded-full shadow-gold active:scale-95 transition-transform"
                      >
                        <span>📍</span> {t.getDirections}
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ACCOMMODATION */}
      {data.accommodation && (
        <section className="relative px-5 py-10 max-w-2xl mx-auto text-center">
          <Reveal>
            <div className="divider-ornate font-label text-xs tracking-[0.3em]">Accommodation</div>
          </Reveal>
          <Reveal delay={200}>
            <div className="glass-card p-6 md:p-8 mt-8 border border-gold/20 flex flex-col items-center">
              <span className="text-4xl mb-4 block animate-bounce">{data.accommodationIcon || '🏨'}</span>
              <p className="font-serif italic text-lg leading-relaxed text-ivory/90 whitespace-pre-line">
                {data.accommodation}
              </p>
              {data.accommodationAddress && (
                <p className="font-serif text-sm text-ivory/70 mt-4">{data.accommodationAddress}</p>
              )}
              {data.accommodationMapsQuery && (
                <button
                  onClick={() => openDirections(data.accommodationMapsQuery!)}
                  className="mt-6 inline-flex items-center gap-2 bg-gold-grad text-maroon-deep font-label tracking-wider text-xs uppercase px-5 py-2.5 rounded-full shadow-gold active:scale-95 transition-transform"
                >
                  <span>📍</span> {t.getDirections}
                </button>
              )}
            </div>
          </Reveal>
        </section>
      )}

      {/* PEACOCK BLESSING */}
      <section className="relative px-5 py-20 text-center max-w-xl mx-auto">
        <Reveal>
          <img
            src={peacock}
            alt="Peacock"
            width={1024}
            height={1024}
            className="mx-auto w-64 md:w-80 animate-sway drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
          />
        </Reveal>
        <Reveal delay={200}>
          <p className="font-script text-shimmer text-5xl md:text-6xl mt-4">{t.blessingTitle}</p>
          <p className="font-serif italic text-gold-soft mt-2">{t.blessingSub}</p>
        </Reveal>
      </section>

      {/* MEMORIES SLIDESHOW */}
      {data.memories && data.memories.length > 0 && (
        <MemoriesSlideshow memories={data.memories} />
      )}

      {/* DIYAS / CONTACT */}
      <section className="relative px-5 py-16 text-center">
        <Reveal>
          <div className="divider-ornate font-label text-xs tracking-[0.3em]">{t.withWarmRegards}</div>
        </Reveal>

        <div className="flex justify-center gap-10 my-8">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ animationDelay: `${i * 0.2}s` }} className="animate-flicker">
              <img src={diya} alt="" aria-hidden width={80} height={80} className="w-16 md:w-20 drop-shadow-[0_0_20px_rgba(255,180,80,0.8)]" />
            </div>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto">
            {data.contactPhones.map((c) => (
              <a
                key={c.phone}
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="glass-card p-4 active:scale-95 transition-transform"
              >
                <div className="font-label text-[10px] uppercase tracking-[0.25em] text-gold-soft">{c.label}</div>
                <div className="font-display text-lg text-shimmer mt-1">{c.phone}</div>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={400}>
          <p className="font-script text-gold text-5xl mt-12">{t.thanks}</p>
          <p className="font-serif italic text-ivory/70 mt-2 text-sm">{t.thanksSub}</p>
        </Reveal>

        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-gold-soft/40 mt-12">{t.closing}</p>
      </section>
    </div>
  );
}

function FamilyCard({ side, name, parents, grandparents }: { side: string; name: string; parents: string; grandparents?: string }) {
  return (
    <div className="glass-card p-5 transition-transform active:scale-95 flex flex-col h-full">
      <p className="font-label uppercase tracking-[0.3em] text-[10px] text-gold-soft">{side}</p>
      <div className="flex-1 flex flex-col justify-center py-2">
        {grandparents && (
          <p className="font-serif italic text-gold-soft/80 text-xs mb-2 leading-relaxed">{grandparents}</p>
        )}
        <p className="font-script text-shimmer text-4xl mt-1 mb-2">{name}</p>
        <p className="font-serif italic text-ivory/80 text-sm mt-1">{parents}</p>
      </div>
    </div>
  );
}
