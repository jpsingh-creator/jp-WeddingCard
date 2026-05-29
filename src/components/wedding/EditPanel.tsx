import { useState } from "react";
import type { CardData, EventItem } from "./types";

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
    const events = d.events.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    setD({ ...d, events });
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center p-3 overflow-auto">
      <div className="glass-card w-full max-w-2xl my-6 p-5 md:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-shimmer">Edit Card</h2>
          <button onClick={onClose} className="text-gold-soft hover:text-gold text-sm font-label">Close ✕</button>
        </div>

        <Field label="Bride name" value={d.brideName} onChange={(v) => update({ brideName: v })} />
        <Field label="Bride parents" value={d.brideParents} onChange={(v) => update({ brideParents: v })} />
        <Field label="Groom name" value={d.groomName} onChange={(v) => update({ groomName: v })} />
        <Field label="Groom parents" value={d.groomParents} onChange={(v) => update({ groomParents: v })} />
        <Field label="Wedding ISO datetime (countdown)" value={d.weddingISO} onChange={(v) => update({ weddingISO: v })} hint="e.g. 2026-11-26T10:30:00" />
        <Field label="Muhurtam (display text)" value={d.muhurtam} onChange={(v) => update({ muhurtam: v })} />
        <Field label="Invitation note" value={d.invitation} onChange={(v) => update({ invitation: v })} multiline />

        <div className="pt-2">
          <h3 className="font-label uppercase tracking-[0.2em] text-gold text-xs mb-2">Events</h3>
          <div className="space-y-3">
            {d.events.map((ev, i) => (
              <div key={ev.id} className="rounded-xl border border-gold/30 p-3 space-y-2 bg-black/20">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Name" value={ev.name} onChange={(v) => updateEvent(i, { name: v })} />
                  <Field label="Emoji" value={ev.emoji} onChange={(v) => updateEvent(i, { emoji: v })} />
                  <Field label="Date" value={ev.date} onChange={(v) => updateEvent(i, { date: v })} />
                  <Field label="Time" value={ev.time} onChange={(v) => updateEvent(i, { time: v })} />
                </div>
                <Field label="Venue" value={ev.venue} onChange={(v) => updateEvent(i, { venue: v })} />
                <Field label="Address" value={ev.address} onChange={(v) => updateEvent(i, { address: v })} />
                <Field label="Maps search query" value={ev.mapsQuery} onChange={(v) => updateEvent(i, { mapsQuery: v })} hint="What to search on Google Maps for directions" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <h3 className="font-label uppercase tracking-[0.2em] text-gold text-xs mb-2">Contact phones</h3>
          {d.contactPhones.map((c, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <Field label="Label" value={c.label} onChange={(v) => {
                const list = d.contactPhones.map((x, idx) => idx === i ? { ...x, label: v } : x);
                setD({ ...d, contactPhones: list });
              }} />
              <Field label="Phone" value={c.phone} onChange={(v) => {
                const list = d.contactPhones.map((x, idx) => idx === i ? { ...x, phone: v } : x);
                setD({ ...d, contactPhones: list });
              }} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-gold/20">
          <button
            onClick={() => { onSave(d); onClose(); }}
            className="bg-gold-grad text-maroon-deep font-label tracking-wider px-5 py-2 rounded-full shadow-gold active:scale-95 transition-transform"
          >Save changes</button>
          <button
            onClick={onClose}
            className="border border-gold/50 text-gold-soft px-5 py-2 rounded-full font-label active:scale-95 transition-transform"
          >Cancel</button>
          <button
            onClick={() => { if (confirm("Reset all to defaults?")) { onReset(); onClose(); } }}
            className="ml-auto text-rose/80 hover:text-rose text-xs font-label"
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
