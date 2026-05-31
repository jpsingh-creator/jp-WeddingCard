import { useState, useRef } from "react";
import type { CardData, EventItem, MemoryItem } from "./types";

const suggestEmoji = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('haldi')) return '🌼';
  if (n.includes('mehendi') || n.includes('mehndi')) return '🌿';
  if (n.includes('sangeet')) return '🎵';
  if (n.includes('wedding') || n.includes('vivaha') || n.includes('muhurtam')) return '🪔';
  if (n.includes('reception')) return '🥂';
  if (n.includes('roka') || n.includes('engagement') || n.includes('sagai')) return '💍';
  if (n.includes('tilak')) return '🕉️';
  if (n.includes('baraat') || n.includes('barat')) return '🥁';
  if (n.includes('pooja') || n.includes('puja') || n.includes('ganesh')) return '🥥';
  if (n.includes('vidai') || n.includes('bidaai')) return '🌸';
  return '';
};

export function EditPanel({
  data,
  onSave,
  onClose,
  onReset,
}: {
  data: CardData;
  onSave: (d: CardData) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [d, setD] = useState<CardData>(data);

  const update = (patch: Partial<CardData>) => setD({ ...d, ...patch });
  const updateEvent = (i: number, patch: Partial<EventItem>) => {
    if (patch.name !== undefined) {
      const suggested = suggestEmoji(patch.name);
      if (suggested) patch.emoji = suggested;
    }
    const events = d.events.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    setD({ ...d, events });
  };

  const addEvent = () => {
    const newEvent: EventItem = {
      id: "event-" + Date.now(),
      name: "New Event",
      emoji: "✨",
      date: "New Date",
      time: "New Time",
      venue: "Venue Name",
      address: "Address",
      mapsQuery: "",
    };
    setD({ ...d, events: [...d.events, newEvent] });
  };

  const removeEvent = (id: string) => {
    setD({ ...d, events: d.events.filter(e => e.id !== id) });
  };

  const moveEventUp = (i: number) => {
    if (i === 0) return;
    const events = [...d.events];
    [events[i - 1], events[i]] = [events[i], events[i - 1]];
    setD({ ...d, events });
  };

  const moveEventDown = (i: number) => {
    if (i === d.events.length - 1) return;
    const events = [...d.events];
    [events[i], events[i + 1]] = [events[i + 1], events[i]];
    setD({ ...d, events });
  };

  const addFeature = () => {
    const newFeature = {
      id: "feature-" + Date.now(),
      label: "New Feature",
      url: "",
    };
    setD({ ...d, otherFeatures: [...(d.otherFeatures || []), newFeature] });
  };

  const removeFeature = (id: string) => {
    setD({ ...d, otherFeatures: (d.otherFeatures || []).filter(f => f.id !== id) });
  };

  // ——— Memories ———
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMemories = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const mediaType: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
        const newMemory: MemoryItem = {
          id: 'memory-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          dataUrl,
          caption: '',
          mediaType,
        };
        setD((prev) => ({ ...prev, memories: [...(prev.memories || []), newMemory] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMemory = (id: string) => {
    setD({ ...d, memories: (d.memories || []).filter(m => m.id !== id) });
  };

  const updateMemoryCaption = (id: string, caption: string) => {
    setD({
      ...d,
      memories: (d.memories || []).map(m => m.id === id ? { ...m, caption } : m),
    });
  };

  const moveMemoryUp = (i: number) => {
    if (i === 0) return;
    const memories = [...(d.memories || [])];
    [memories[i - 1], memories[i]] = [memories[i], memories[i - 1]];
    setD({ ...d, memories });
  };

  const moveMemoryDown = (i: number) => {
    const memories = d.memories || [];
    if (i === memories.length - 1) return;
    const updated = [...memories];
    [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
    setD({ ...d, memories: updated });
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 md:p-6">
      <div className="glass-card w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:px-7 md:py-5 border-b border-gold/20 shrink-0">
          <h2 className="font-display text-xl md:text-2xl text-shimmer">Edit Card</h2>
          <button onClick={onClose} className="text-gold-soft hover:text-gold text-sm font-label">Close ✕</button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 md:p-7 overflow-y-auto space-y-6 flex-1">
          <div className="grid md:grid-cols-2 gap-x-4 gap-y-6">
            <div className="space-y-4">
              <Field label="Bride name" value={d.brideName} onChange={(v) => update({ brideName: v })} />
              <Field label="Bride parents" value={d.brideParents} onChange={(v) => update({ brideParents: v })} />
              <Field label="Bride grandparents (optional)" value={d.brideGrandparents || ""} onChange={(v) => update({ brideGrandparents: v })} hint="e.g. Granddaughter of..." />
            </div>
            <div className="space-y-4">
              <Field label="Groom name" value={d.groomName} onChange={(v) => update({ groomName: v })} />
              <Field label="Groom parents" value={d.groomParents} onChange={(v) => update({ groomParents: v })} />
              <Field label="Groom grandparents (optional)" value={d.groomGrandparents || ""} onChange={(v) => update({ groomGrandparents: v })} hint="e.g. Grandson of..." />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Wedding ISO datetime (countdown)" value={d.weddingISO} onChange={(v) => update({ weddingISO: v })} hint="e.g. 2026-11-26T10:30:00" />
            <Field label="Muhurtam (display text)" value={d.muhurtam} onChange={(v) => update({ muhurtam: v })} />
          </div>
          
          <Field label="Invitation note" value={d.invitation} onChange={(v) => update({ invitation: v })} multiline />

          <div className="pt-4 border-t border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label uppercase tracking-[0.2em] text-gold text-sm">Events</h3>
              <button
                onClick={addEvent}
                className="text-gold-soft hover:text-gold text-xs font-label flex items-center gap-1 bg-gold/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <span>+</span> Add Event
              </button>
            </div>
            <div className="space-y-4">
              {d.events.map((ev, i) => (
                <div key={ev.id} className="relative rounded-xl border border-gold/30 p-4 md:p-5 space-y-3 bg-black/30">
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg px-2 py-1 border border-gold/10">
                    <button onClick={() => moveEventUp(i)} disabled={i === 0} className="text-gold-soft hover:text-gold text-sm disabled:opacity-30" title="Move up">↑</button>
                    <button onClick={() => moveEventDown(i)} disabled={i === d.events.length - 1} className="text-gold-soft hover:text-gold text-sm disabled:opacity-30" title="Move down">↓</button>
                    <div className="w-px h-3 bg-gold/20 mx-1"></div>
                    <button onClick={() => removeEvent(ev.id)} className="text-rose/70 hover:text-rose text-sm font-label" title="Remove this event">✕</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 pr-16 md:pr-24">
                    <Field label="Name" value={ev.name} onChange={(v) => updateEvent(i, { name: v })} />
                    <Field label="Emoji" value={ev.emoji} onChange={(v) => updateEvent(i, { emoji: v })} />
                    <Field label="Date" value={ev.date} onChange={(v) => updateEvent(i, { date: v })} />
                    <Field label="Time" value={ev.time} onChange={(v) => updateEvent(i, { time: v })} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <Field label="Venue" value={ev.venue} onChange={(v) => updateEvent(i, { venue: v })} />
                    <Field label="Address" value={ev.address} onChange={(v) => updateEvent(i, { address: v })} />
                  </div>
                  <Field label="Maps search query" value={ev.mapsQuery} onChange={(v) => updateEvent(i, { mapsQuery: v })} hint="What to search on Google Maps for directions" />
                </div>
              ))}
            </div>
            <button
              onClick={addEvent}
              className="w-full mt-4 border border-dashed border-gold/50 text-gold-soft hover:text-gold hover:border-gold hover:bg-gold/10 py-4 rounded-xl font-label text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl leading-none">+</span> Add New Event
            </button>
          </div>

          <div className="pt-4 border-t border-gold/20">
            <h3 className="font-label uppercase tracking-[0.2em] text-gold text-sm mb-4">Accommodation</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-24 shrink-0">
                  <Field label="Icon" value={d.accommodationIcon || ""} onChange={(v) => update({ accommodationIcon: v })} hint="e.g. 🏨" />
                </div>
                <div className="flex-1">
                  <Field label="Accommodation Info" value={d.accommodation || ""} onChange={(v) => update({ accommodation: v })} multiline hint="Optional info about stay for guests" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Address" value={d.accommodationAddress || ""} onChange={(v) => update({ accommodationAddress: v })} />
                <Field label="Maps search query" value={d.accommodationMapsQuery || ""} onChange={(v) => update({ accommodationMapsQuery: v })} hint="What to search on Google Maps for directions" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gold/20">
            <h3 className="font-label uppercase tracking-[0.2em] text-gold text-sm mb-4">Contact phones</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {d.contactPhones.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1">
                    <Field label="Label" value={c.label} onChange={(v) => {
                      const list = d.contactPhones.map((x, idx) => idx === i ? { ...x, label: v } : x);
                      setD({ ...d, contactPhones: list });
                    }} />
                  </div>
                  <div className="flex-1">
                    <Field label="Phone" value={c.phone} onChange={(v) => {
                      const list = d.contactPhones.map((x, idx) => idx === i ? { ...x, phone: v } : x);
                      setD({ ...d, contactPhones: list });
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label uppercase tracking-[0.2em] text-gold text-sm">Other Features</h3>
              <button
                onClick={addFeature}
                className="text-gold-soft hover:text-gold text-xs font-label flex items-center gap-1 bg-gold/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <span>+</span> Add Feature
              </button>
            </div>
            
            <div className="space-y-4">
              {(d.otherFeatures || []).map((feature, i) => (
                <div key={feature.id} className="relative rounded-xl border border-gold/30 p-4 md:p-5 space-y-3 bg-black/30">
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg px-2 py-1 border border-gold/10">
                    <button onClick={() => removeFeature(feature.id)} className="text-rose/70 hover:text-rose text-sm font-label" title="Remove this feature">✕</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 pr-10">
                    <Field label="Label" value={feature.label} onChange={(v) => {
                      const list = [...(d.otherFeatures || [])];
                      list[i] = { ...list[i], label: v };
                      setD({ ...d, otherFeatures: list });
                    }} hint="e.g. Live Video" />
                    <Field label="Link / URL" value={feature.url} onChange={(v) => {
                      const list = [...(d.otherFeatures || [])];
                      list[i] = { ...list[i], url: v };
                      setD({ ...d, otherFeatures: list });
                    }} hint="https://..." />
                  </div>
                </div>
              ))}
              {(d.otherFeatures?.length === 0 || !d.otherFeatures) && (
                <div className="text-center p-4 border border-dashed border-gold/30 rounded-xl text-gold-soft/50 font-serif text-sm">
                  No other features added. You can add live streams, photo drives, etc.
                </div>
              )}
            </div>
          </div>

          {/* MEMORIES */}
          <div className="pt-4 border-t border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label uppercase tracking-[0.2em] text-gold text-sm">📸 Memories Slideshow</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gold-soft hover:text-gold text-xs font-label flex items-center gap-1 bg-gold/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <span>+</span> Add Photos / Videos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => addMemories(e.target.files)}
              />
            </div>

            {(d.memories && d.memories.length > 0) ? (
              <div className="space-y-3">
                {d.memories.map((mem, i) => (
                  <div key={mem.id} className="relative rounded-xl border border-gold/30 p-3 bg-black/30 flex gap-3 items-start">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gold/20">
                      {mem.mediaType === 'video' ? (
                        <video src={mem.dataUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={mem.dataUrl} alt={mem.caption || 'Memory'} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Caption + info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-label text-[10px] uppercase tracking-wider text-gold-soft/70">
                          {mem.mediaType === 'video' ? '🎬 Video' : '📷 Photo'}
                        </span>
                      </div>
                      <input
                        value={mem.caption}
                        onChange={(e) => updateMemoryCaption(mem.id, e.target.value)}
                        placeholder="Add a caption..."
                        className="w-full bg-black/30 border border-gold/20 rounded-lg px-3 py-1.5 text-ivory font-serif text-sm focus:outline-none focus:border-gold placeholder:text-ivory/30"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col items-center gap-1 bg-black/50 backdrop-blur-md rounded-lg px-1.5 py-1 border border-gold/10">
                      <button onClick={() => moveMemoryUp(i)} disabled={i === 0} className="text-gold-soft hover:text-gold text-sm disabled:opacity-30" title="Move up">↑</button>
                      <button onClick={() => moveMemoryDown(i)} disabled={i === (d.memories || []).length - 1} className="text-gold-soft hover:text-gold text-sm disabled:opacity-30" title="Move down">↓</button>
                      <div className="w-full h-px bg-gold/20"></div>
                      <button onClick={() => removeMemory(mem.id)} className="text-rose/70 hover:text-rose text-sm font-label" title="Remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gold/30 rounded-xl text-gold-soft/50 font-serif text-sm space-y-2">
                <p className="text-2xl">📸</p>
                <p>No memories added yet.</p>
                <p className="text-[10px] text-gold-soft/30">Add photos & videos of the bride and groom to show as a beautiful slideshow on the invitation.</p>
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-3 border border-dashed border-gold/50 text-gold-soft hover:text-gold hover:border-gold hover:bg-gold/10 py-3 rounded-xl font-label text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl leading-none">+</span> Add from Device
            </button>

            <p className="text-[10px] text-gold-soft/30 mt-2 text-center font-serif">
              💡 Tip: High-quality photos and videos are supported! (Stored securely on your device).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap gap-3 p-5 md:px-7 md:py-5 border-t border-gold/20 shrink-0 bg-black/20 rounded-b-3xl">
          <button
            onClick={() => { onSave(d); onClose(); }}
            className="bg-gold-grad text-maroon-deep font-label tracking-wider px-6 py-2.5 rounded-full shadow-gold active:scale-95 transition-transform font-bold"
          >Save changes</button>
          <button
            onClick={onClose}
            className="border border-gold/50 text-gold-soft hover:bg-gold/5 px-6 py-2.5 rounded-full font-label active:scale-95 transition-all"
          >Cancel</button>
          <button
            onClick={() => { if (confirm("Reset all to defaults?")) { onReset(); onClose(); } }}
            className="ml-auto text-rose/70 hover:text-rose text-xs font-label px-3 py-2"
          >Reset to defaults</button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, multiline, hint,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className="font-label uppercase tracking-[0.2em] text-gold-soft text-[10px]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full bg-black/30 border border-gold/30 rounded-lg px-3 py-2 text-ivory font-serif focus:outline-none focus:border-gold"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-black/30 border border-gold/30 rounded-lg px-3 py-2 text-ivory font-serif focus:outline-none focus:border-gold"
        />
      )}
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
