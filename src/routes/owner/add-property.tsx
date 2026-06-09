import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Building2, MapPin, IndianRupee,
  BedDouble, Upload, Plus, Check, Wifi, Utensils, Wind, WashingMachine,
  Car, Camera, Zap, ShieldCheck, Image, Sparkles, Pencil, Users,
} from "lucide-react";
import { addStoredProperty, getSession } from "@/lib/session";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── types ── */
export interface CustomRoom {
  id: string;
  label: string;   // e.g. "6-Sharing", "Single", custom name
  sharing: string; // number as string e.g. "6"
  price: string;
  beds: string;
  ac: boolean;
}

interface FormData {
  name: string; type: string; location: string; rent: string; totalBeds: string;
  photos: File[];
  rooms: CustomRoom[];
  amenities: string[];
  extraPhotos: File[];
}

const PROPERTY_TYPES = ["PG", "Hostel", "Co-living", "Flat Share"];

const AMENITIES = [
  { id: "wifi",     label: "📶 WiFi" },
  { id: "food",     label: "🍛 Food" },
  { id: "ac",       label: "❄️ AC" },
  { id: "laundry",  label: "🧺 Laundry" },
  { id: "parking",  label: "🚗 Parking" },
  { id: "cctv",     label: "📷 CCTV" },
  { id: "power",    label: "⚡ Power Backup" },
  { id: "security", label: "🛡️ Security" },
];

/* quick-pick sharing suggestions */
const QUICK_SHARING = ["1", "2", "3", "4", "5", "6", "8", "10"];

/* ── step bar ── */
function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
            s < step  ? "bg-primary text-primary-foreground" :
            s === step ? "ring-2 ring-primary bg-primary/15 text-primary" :
            "bg-white/8 text-muted-foreground"
          }`}>
            {s < step ? <Check className="h-3.5 w-3.5" /> : s}
          </div>
          {s < 5 && <div className={`h-0.5 w-6 rounded-full transition-all duration-500 ${s < step ? "bg-primary" : "bg-white/10"}`} />}
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">Step {step} of 5</span>
    </div>
  );
}

/* ── generic input ── */
function Field({ label, value, onChange, placeholder, icon: Icon, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon: React.ElementType; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all" />
      </div>
    </div>
  );
}

/* ── photo upload ── */
function PhotoUpload({ files, onChange, label, max }: {
  files: File[]; onChange: (f: File[]) => void; label: string; max: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).slice(0, max - files.length);
    onChange([...files, ...picked].slice(0, max));
    e.target.value = "";
  };
  return (
    <div className="space-y-3">
      <button type="button" onClick={() => files.length < max && ref.current?.click()}
        className={`flex w-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all ${
          files.length >= max ? "border-white/10 opacity-50 cursor-default" : "border-white/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
        }`}>
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{files.length}/{max} · JPG, PNG, HEIC · 📱 Camera supported</p>
      </button>
      <input ref={ref} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={pick} />
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
              <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" alt="" />
              <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── AC toggle ── */
function AcToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
        value ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"
      }`}>
      <span className="flex items-center gap-2"><Wind className="h-4 w-4" /> AC Room</span>
      <div className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-primary" : "bg-white/20"}`}>
        <motion.div animate={{ x: value ? 16 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow" />
      </div>
    </button>
  );
}

/* ══ STEP 1 ══ */
function Step1({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Basic Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Just the essentials to get you listed</p>
      </div>
      <Field label="Property Name" value={data.name} onChange={(v) => update({ name: v })} placeholder="e.g. Skyline Residency" icon={Building2} />
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Property Type</label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => update({ type: t })}
              className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                data.type === t ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}>{t}</button>
          ))}
        </div>
      </div>
      <Field label="Location / Area" value={data.location} onChange={(v) => update({ location: v })} placeholder="e.g. Hitech City, Hyderabad" icon={MapPin} />
      <Field label="Starting Rent (₹ / month)" value={data.rent} onChange={(v) => update({ rent: v })} placeholder="e.g. 4000" icon={IndianRupee} type="number" />
      <Field label="Total Beds" value={data.totalBeds} onChange={(v) => update({ totalBeds: v })} placeholder="e.g. 40" icon={BedDouble} type="number" />
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Cover Photos (up to 3)</label>
        <PhotoUpload files={data.photos} onChange={(photos) => update({ photos })} label="Upload cover photos" max={3} />
      </div>
    </div>
  );
}

/* ══ STEP 2 — fully dynamic room setup ══ */
function Step2({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const blank = (): CustomRoom => ({ id: `room-${Date.now()}`, label: "", sharing: "", price: "", beds: "", ac: false });
  const [editing, setEditing] = useState<Record<string, CustomRoom>>({});

  const addNew = () => {
    const r = blank();
    update({ rooms: [...data.rooms, r] });
    setEditing((e) => ({ ...e, [r.id]: r }));
  };

  const commitEdit = (id: string) => {
    const draft = editing[id];
    if (!draft) return;
    update({ rooms: data.rooms.map((r) => (r.id === id ? draft : r)) });
    setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  const startEdit = (r: CustomRoom) => setEditing((e) => ({ ...e, [r.id]: { ...r } }));

  const patchDraft = (id: string, patch: Partial<CustomRoom>) =>
    setEditing((e) => ({ ...e, [id]: { ...e[id], ...patch } }));

  const pickSharing = (id: string, n: string) => {
    const draft = editing[id];
    const autoLabel = !draft.label || QUICK_SHARING.map((q) =>
      q === "1" ? "Single Sharing" : q === "2" ? "Double Sharing" : q === "3" ? "Triple Sharing" : `${q}-Sharing`
    ).includes(draft.label);
    const num = Number(n);
    const label = autoLabel
      ? (num === 1 ? "Single Sharing" : num === 2 ? "Double Sharing" : num === 3 ? "Triple Sharing" : `${n}-Sharing`)
      : draft.label;
    patchDraft(id, { sharing: n, label });
  };

  const removeRoom = (id: string) => {
    update({ rooms: data.rooms.filter((r) => r.id !== id) });
    setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Room Setup</h2>
        <p className="text-sm text-muted-foreground mt-1">Add any room type — single, 6-sharing, dormitory, anything</p>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {data.rooms.map((room) => {
            const draft = editing[room.id];
            const isEditing = !!draft;
            const display = draft ?? room;

            return (
              <motion.div key={room.id}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                  isEditing ? "border-primary/40 bg-primary/6" : "border-white/10 bg-white/4"
                }`}>

                {isEditing ? (
                  /* ── inline edit form ── */
                  <>
                    {/* sharing quick-pick */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Persons sharing</label>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_SHARING.map((n) => (
                          <button key={n} type="button" onClick={() => pickSharing(room.id, n)}
                            className={`rounded-xl border px-2.5 py-1 text-xs font-semibold transition-all ${
                              display.sharing === n
                                ? "border-primary/50 bg-primary/20 text-primary"
                                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                            }`}>
                            {n === "1" ? "1" : n === "2" ? "2" : n === "3" ? "3" : n}
                          </button>
                        ))}
                        <div className="relative">
                          <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <input type="number" value={display.sharing}
                            onChange={(e) => pickSharing(room.id, e.target.value)}
                            placeholder="custom"
                            className="w-20 rounded-xl bg-white/5 border border-white/10 pl-7 pr-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* room name */}
                    <div className="relative">
                      <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <input type="text" value={display.label}
                        onChange={(e) => patchDraft(room.id, { label: e.target.value })}
                        placeholder="Room type name e.g. 6-Sharing, Dormitory…"
                        className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    </div>

                    {/* price + beds */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input type="number" value={display.price}
                          onChange={(e) => patchDraft(room.id, { price: e.target.value })}
                          placeholder="Price/mo"
                          className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      </div>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input type="number" value={display.beds}
                          onChange={(e) => patchDraft(room.id, { beds: e.target.value })}
                          placeholder="Beds"
                          className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      </div>
                    </div>

                    {/* AC toggle */}
                    <AcToggle value={display.ac} onChange={(v) => patchDraft(room.id, { ac: v })} />

                    {/* actions */}
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => removeRoom(room.id)}
                        className="flex-1 rounded-xl border border-red-500/20 bg-red-500/8 py-2 text-xs font-medium text-red-400 hover:bg-red-500/15 transition-all">
                        Remove
                      </button>
                      <button type="button"
                        disabled={!display.label || !display.sharing || !display.price || !display.beds}
                        onClick={() => commitEdit(room.id)}
                        className="flex-2 flex-grow rounded-xl py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-40 transition-all"
                        style={{ background: "var(--gradient-primary)" }}>
                        <Check className="inline h-3.5 w-3.5 mr-1" />Done
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── saved display row ── */
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary font-bold text-sm">
                          {room.sharing}
                        </div>
                        <p className="text-sm font-semibold truncate">{room.label}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button type="button" onClick={() => startEdit(room)}
                          className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-white/10 transition-colors flex items-center gap-1">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button type="button" onClick={() => removeRoom(room.id)}
                          className="grid h-7 w-7 place-items-center rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs text-primary font-semibold">₹{Number(room.price).toLocaleString()}/mo</span>
                      <span className="rounded-lg bg-white/8 px-2.5 py-1 text-xs text-muted-foreground">{room.beds} beds</span>
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${room.ac ? "bg-primary/10 text-primary" : "bg-white/8 text-muted-foreground"}`}>
                        {room.ac ? "❄️ AC" : "Non-AC"}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* add button */}
      <button type="button" onClick={addNew}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 py-4 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all">
        <Plus className="h-5 w-5" /> Add Room Type
      </button>

      {data.rooms.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">Add at least one room type to continue</p>
      )}
    </div>
  );
}

/* ══ STEP 3 — Amenities ══ */
function Step3({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const toggle = (id: string) =>
    update({ amenities: data.amenities.includes(id) ? data.amenities.filter((a) => a !== id) : [...data.amenities, id] });
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Amenities</h2>
        <p className="text-sm text-muted-foreground mt-1">Tap to select what you offer</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {AMENITIES.map(({ id, label }) => {
          const on = data.amenities.includes(id);
          return (
            <button key={id} type="button" onClick={() => toggle(id)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-medium transition-all active:scale-95 ${
                on ? "border-primary/50 bg-primary/12 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}>
              <span className="text-base">{label.split(" ")[0]}</span>
              <span>{label.split(" ").slice(1).join(" ")}</span>
              {on && <Check className="h-3.5 w-3.5 ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
      {data.amenities.length > 0 && (
        <p className="text-center text-xs text-primary font-medium">{data.amenities.length} selected ✓</p>
      )}
    </div>
  );
}

/* ══ STEP 4 — Photos ══ */
function Step4({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Property Photos</h2>
        <p className="text-sm text-muted-foreground mt-1">Good photos get 3× more inquiries</p>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <Image className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium">Upload room & building photos</p>
          <p className="text-xs text-muted-foreground mt-0.5">Show rooms, common areas, entrance</p>
        </div>
      </div>
      <PhotoUpload files={data.extraPhotos} onChange={(extraPhotos) => update({ extraPhotos })} label="Upload room & building photos" max={6} />
    </div>
  );
}

/* ══ STEP 5 — Review & Publish ══ */
function Step5({ data, onPublish }: { data: FormData; onPublish: () => void }) {
  const allPhotos = [...data.photos, ...data.extraPhotos];
  const activeAmenities = AMENITIES.filter((a) => data.amenities.includes(a.id));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Review & Publish</h2>
        <p className="text-sm text-muted-foreground mt-1">Your listing preview</p>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {allPhotos.length > 0 ? (
          <div className={`grid gap-0.5 h-44 ${allPhotos.length >= 3 ? "grid-cols-3" : allPhotos.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {allPhotos.slice(0, 3).map((f, i) => (
              <img key={i} src={URL.createObjectURL(f)} className="h-full w-full object-cover" alt="" />
            ))}
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/20 to-violet-500/20">
            <Building2 className="h-16 w-16 text-primary/30" />
          </div>
        )}

        <div className="p-5 space-y-4 bg-white/3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-bold">{data.name || "Your Property"}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" /> {data.location || "Location not set"}
              </p>
            </div>
            {data.type && <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs text-primary font-medium">{data.type}</span>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-sm font-bold text-primary">{data.rent ? `₹${Number(data.rent).toLocaleString()}` : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Starting rent/mo</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-sm font-bold">{data.totalBeds || "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Total beds</p>
            </div>
          </div>

          {data.rooms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.rooms.map((r) => (
                <span key={r.id} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs text-primary font-medium">
                  {r.label} · ₹{Number(r.price).toLocaleString()}
                </span>
              ))}
            </div>
          )}

          {activeAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeAmenities.map(({ id, label }) => (
                <span key={id} className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-muted-foreground">{label}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3.5 flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-400">Your listing goes <strong>live immediately</strong> after publishing.</p>
      </div>

      <button onClick={onPublish}
        className="w-full rounded-xl py-4 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "var(--gradient-primary)" }}>
        🚀 Publish Property
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WIZARD SHELL
══════════════════════════════════════════════════════════════ */
export function AddPropertyWizard({ onClose, onPublished }: {
  onClose: () => void; onPublished: () => void;
}) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<FormData>({
    name: "", type: "", location: "", rent: "", totalBeds: "",
    photos: [], rooms: [], amenities: [], extraPhotos: [],
  });

  const update = (patch: Partial<FormData>) => setData((p) => ({ ...p, ...patch }));

  const canNext = () => {
    if (step === 1) return !!(data.name && data.type && data.location && data.rent && data.totalBeds);
    if (step === 2) return data.rooms.length > 0;
    return true;
  };

  const publish = () => {
    const session = getSession();
    addStoredProperty({
      name: data.name,
      location: data.location,
      type: data.type,
      rent: Number(data.rent),
      totalBeds: Number(data.totalBeds),
      amenities: data.amenities,
      rooms: Object.fromEntries(data.rooms.map((r) => [r.id, { price: r.price, beds: r.beds, ac: r.ac, label: r.label, sharing: r.sharing }])),
      owner: session?.name ?? "Unknown",
      status: "Active",
      verified: false,
      rating: 0,
    });
    setDone(true);
    setTimeout(onPublished, 1800);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl glass-strong border border-white/10 p-12 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
            className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-8 w-8" />
          </motion.div>
          <p className="text-lg font-bold">Property Published! 🎉</p>
          <p className="text-sm text-muted-foreground">Your listing is now live on StaySphere.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 24 }}
        transition={{ ease: EASE, duration: 0.3 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl glass-strong border border-white/10 p-6">

        <button onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-xl hover:bg-white/10 transition-colors">
          <X className="h-4 w-4" />
        </button>

        <StepBar step={step} />

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ ease: EASE, duration: 0.22 }}>
            {step === 1 && <Step1 data={data} update={update} />}
            {step === 2 && <Step2 data={data} update={update} />}
            {step === 3 && <Step3 data={data} update={update} />}
            {step === 4 && <Step4 data={data} update={update} />}
            {step === 5 && <Step5 data={data} onPublish={publish} />}
          </motion.div>
        </AnimatePresence>

        {step < 5 && (
          <div className={`flex mt-6 gap-3 ${step > 1 ? "justify-between" : "justify-end"}`}>
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 rounded-xl glass px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-all">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 transition-all active:scale-[0.98]"
              style={{ background: "var(--gradient-primary)" }}>
              {step === 4 ? "Preview" : "Continue"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
