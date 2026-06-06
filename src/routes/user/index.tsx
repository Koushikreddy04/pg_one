import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, type Variants } from "framer-motion";
import {
  LayoutDashboard, Search, Home, Users, Wallet, Wrench,
  Megaphone, UserCircle, LogOut, Bell, Compass,
  Menu, ChevronDown, ChevronRight, MapPin, Star,
  Shield, Wifi, Utensils, Dumbbell, Car, Wind,
  CheckCircle2, Clock, AlertCircle, ArrowRight,
  Phone, Mail, Calendar, Heart, MessageCircle,
  TrendingUp, BedDouble, Building2, FileText,
  Sparkles, Bot, Check,
} from "lucide-react";
import { getSession, clearSession } from "@/lib/session";

export const Route = createFileRoute("/user/")({
  component: UserDashboard,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ══════════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════════ */

const MY_PG = {
  name: "Skyline Residency",
  room: "Room 204 · Double Sharing",
  location: "Hitech City, Hyderabad",
  rent: 9500,
  dueDate: "1 Jul 2025",
  moveIn: "1 Apr 2025",
  owner: "Ramesh Kumar",
  ownerPhone: "98765 43210",
  rating: 4.8,
  amenities: [
    { icon: Wifi,     label: "Wi-Fi" },
    { icon: Utensils, label: "Food" },
    { icon: Dumbbell, label: "Gym" },
    { icon: Car,      label: "Parking" },
    { icon: Wind,     label: "AC" },
  ],
};

const PAYMENT_HISTORY = [
  { id: "P1", month: "Jun 2025", amount: 9500, status: "Paid",    date: "1 Jun 2025", method: "UPI" },
  { id: "P2", month: "May 2025", amount: 9500, status: "Paid",    date: "1 May 2025", method: "Bank" },
  { id: "P3", month: "Apr 2025", amount: 9500, status: "Paid",    date: "1 Apr 2025", method: "UPI" },
  { id: "P4", month: "Jul 2025", amount: 9500, status: "Pending", date: "1 Jul 2025", method: "—" },
];

const PG_LISTINGS = [
  { id: "L1", name: "Skyline Residency", area: "Hitech City", city: "Hyderabad", price: 9500,  match: 96, rating: 4.8, amenities: [Wifi, Utensils, Dumbbell], type: "Double", verified: true },
  { id: "L2", name: "Aurora Co-living",  area: "Madhapur",    city: "Hyderabad", price: 8800,  match: 92, rating: 4.6, amenities: [Wifi, Utensils],           type: "Triple", verified: true },
  { id: "L3", name: "Nest North",        area: "Indiranagar", city: "Bengaluru", price: 11200, match: 89, rating: 4.4, amenities: [Wifi, Utensils, Car],       type: "Single", verified: true },
  { id: "L4", name: "The Loft House",    area: "Gachibowli",  city: "Hyderabad", price: 9900,  match: 87, rating: 4.3, amenities: [Wifi, Dumbbell],            type: "Double", verified: false },
  { id: "L5", name: "Velocity Stays",    area: "Baner",       city: "Pune",      price: 8200,  match: 85, rating: 4.5, amenities: [Wifi, Utensils],            type: "Triple", verified: true },
  { id: "L6", name: "Marine Studios",    area: "Powai",       city: "Mumbai",    price: 13500, match: 82, rating: 4.7, amenities: [Wifi, Utensils, Dumbbell],  type: "Single", verified: true },
];

const ROOMMATES = [
  { id: "R1", name: "Rohan Iyer",    role: "Product Designer",  food: "Non-veg", schedule: "Day shift",   score: 94, langs: "English, Tamil", initials: "RI" },
  { id: "R2", name: "Karan Kapoor",  role: "Frontend Dev",      food: "Veg",     schedule: "Night shift",  score: 91, langs: "Hindi, English", initials: "KK" },
  { id: "R3", name: "Sneha Reddy",   role: "Data Analyst",      food: "Veg",     schedule: "Day shift",   score: 88, langs: "Telugu, English", initials: "SR" },
];

const MAINTENANCE_TICKETS = [
  { id: "M1", title: "AC not cooling properly", category: "Electrical", status: "In Progress", date: "2 Jun 2025", priority: "High" },
  { id: "M2", title: "WiFi speed slow",          category: "WiFi",       status: "Assigned",    date: "5 Jun 2025", priority: "Medium" },
  { id: "M3", title: "Tap leaking",              category: "Plumbing",   status: "Completed",   date: "20 May 2025", priority: "Low" },
];

const ANNOUNCEMENTS = [
  { id: "A1", title: "Water supply disruption", body: "Water will be unavailable on 6 Jun from 10am–2pm for tank cleaning.", date: "5 Jun 2025" },
  { id: "A2", title: "Rent due reminder",        body: "July rent is due on 1st July. Please pay via UPI or bank transfer.", date: "28 Jun 2025" },
  { id: "A3", title: "Community meet",           body: "Monthly community meet this Saturday at 6pm in the common area.", date: "24 Jun 2025" },
];

const ACTIVITY = [
  { icon: CheckCircle2, text: "Rent paid for June",         time: "1 Jun",   color: "text-emerald-400" },
  { icon: Wrench,       text: "Maintenance ticket raised",  time: "2 Jun",   color: "text-amber-400" },
  { icon: Bell,         text: "New announcement posted",    time: "5 Jun",   color: "text-primary" },
  { icon: Users,        text: "Roommate request received",  time: "7 Jun",   color: "text-violet-400" },
];

/* ══════════════════════════════════════════════════════════════
   SIDEBAR NAV
══════════════════════════════════════════════════════════════ */

const NAV = [
  { id: "home",        label: "Home",          icon: LayoutDashboard },
  { id: "search",      label: "Find PG",       icon: Search },
  { id: "mypg",        label: "My PG",         icon: Home },
  { id: "roommates",   label: "Roommates",     icon: Users },
  { id: "payments",    label: "Payments",      icon: Wallet },
  { id: "maintenance", label: "Maintenance",   icon: Wrench },
  { id: "community",   label: "Community",     icon: Megaphone },
  { id: "profile",     label: "Profile",       icon: UserCircle },
];

/* ══════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const stagger: Variants = { show: { transition: { staggerChildren: 0.07 } } };

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } } } as Variants}
      className={className}>
      {children}
    </motion.div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl glass-strong shadow-soft transition-all hover:shadow-elegant ${className}`}>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid:          "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Pending:       "bg-amber-500/15   text-amber-400   border-amber-500/20",
    "In Progress": "bg-amber-500/15   text-amber-400   border-amber-500/20",
    Assigned:      "bg-blue-500/15    text-blue-400    border-blue-500/20",
    Completed:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Open:          "bg-red-500/15     text-red-400     border-red-500/20",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-white/10 text-muted-foreground border-white/10"}`}>
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   1. HOME
══════════════════════════════════════════════════════════════ */

function HomeSection({ name }: { name: string }) {
  const nextDue = PAYMENT_HISTORY.find((p) => p.status === "Pending");
  const openTickets = MAINTENANCE_TICKETS.filter((m) => m.status !== "Completed").length;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      {/* greeting */}
      <FadeUp>
        <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, oklch(0.74 0.13 220 / 0.2), oklch(0.65 0.22 25 / 0.1))" }}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative">
            <p className="text-xs text-primary font-medium uppercase tracking-wider">Good morning</p>
            <h2 className="mt-1 text-2xl font-semibold">{name} 👋</h2>
            <p className="mt-1 text-sm text-muted-foreground">You're all set at {MY_PG.name}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
                <BedDouble className="h-3.5 w-3.5 text-primary" />
                {MY_PG.room}
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {MY_PG.location}
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Next Rent Due",     value: `₹${MY_PG.rent.toLocaleString()}`, sub: nextDue?.date ?? "—",   icon: Wallet,     color: "from-primary/20 to-cyan-500/20",     text: "text-primary" },
          { label: "PG Rating",         value: `${MY_PG.rating}`,                 sub: "Skyline Residency",     icon: Star,       color: "from-amber-500/20 to-orange-500/20", text: "text-amber-400" },
          { label: "Open Tickets",      value: String(openTickets),               sub: "maintenance issues",    icon: Wrench,     color: "from-red-500/20 to-rose-500/20",     text: "text-red-400" },
          { label: "Roommate Matches",  value: String(ROOMMATES.length),          sub: "compatible profiles",   icon: Users,      color: "from-violet-500/20 to-purple-500/20",text: "text-violet-400" },
        ].map((s, i) => (
          <FadeUp key={s.label} delay={i * 0.07}>
            <Card className={`p-5 relative overflow-hidden bg-gradient-to-br ${s.color}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.text}`} />
              </div>
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
            </Card>
          </FadeUp>
        ))}
      </div>

      {/* activity + announcements */}
      <div className="grid gap-5 lg:grid-cols-2">
        <FadeUp>
          <Card className="p-5">
            <p className="text-sm font-semibold mb-4">Recent Activity</p>
            <div className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 ${a.color}`}>
                    <a.icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="flex-1 text-xs">{a.text}</p>
                  <span className="text-[10px] text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Card className="p-5">
            <p className="text-sm font-semibold mb-4">📢 Latest Announcements</p>
            <div className="space-y-3">
              {ANNOUNCEMENTS.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs font-medium">{a.title}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2">{a.body}</p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">{a.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </FadeUp>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   2. FIND PG (SEARCH)
══════════════════════════════════════════════════════════════ */

function FindPG() {
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const filtered = PG_LISTINGS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <FadeUp>
        {/* AI search bar */}
        <div className="relative overflow-hidden rounded-2xl p-5" style={{ background: "linear-gradient(135deg, oklch(0.74 0.13 220 / 0.15), oklch(0.22 0.05 258))" }}>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tell AI what you need… e.g. 'PG near Hitech City under ₹10k'"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button className="hidden rounded-xl px-4 py-2 text-xs font-medium text-primary-foreground sm:block" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Under ₹10k", "Veg food", "Near metro", "AC rooms", "Single sharing"].map((tag) => (
              <button key={tag} onClick={() => setSearch(tag)}
                className="rounded-full bg-white/8 px-3 py-1 text-[10px] text-muted-foreground hover:bg-white/15 hover:text-foreground transition-all">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </FadeUp>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} listings found</p>
        <p className="text-xs text-primary font-medium">Sorted by match score</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((pg, i) => (
            <motion.div key={pg.id} layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden group">
                {/* hero */}
                <div className="relative h-36 bg-gradient-to-br from-primary/20 to-violet-500/15 flex items-center justify-center">
                  <Building2 className="h-14 w-14 text-primary/25" />
                  <div className="absolute left-3 top-3 rounded-full glass px-2.5 py-1 text-[10px] font-semibold text-primary">
                    {pg.match}% match
                  </div>
                  {pg.verified && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full glass px-2 py-1 text-[10px] text-primary">
                      <Shield className="h-3 w-3" />
                    </div>
                  )}
                  <button
                    onClick={() => setSaved((p) => p.includes(pg.id) ? p.filter((x) => x !== pg.id) : [...p, pg.id])}
                    className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full glass transition-colors hover:bg-white/20">
                    <Heart className={`h-3.5 w-3.5 transition-colors ${saved.includes(pg.id) ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{pg.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />{pg.area}, {pg.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{pg.rating}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {pg.amenities.map((A, j) => (
                      <div key={j} className="grid h-7 w-7 place-items-center rounded-lg bg-white/5">
                        <A className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                    <span className="ml-auto text-[10px] text-muted-foreground">{pg.type} sharing</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <p className="text-sm font-semibold text-gradient-primary">
                      ₹{pg.price.toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal">/mo</span>
                    </p>
                    <button className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}>
                      View <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   3. MY PG
══════════════════════════════════════════════════════════════ */

function MyPG() {
  const [tab, setTab] = useState<"overview" | "amenities" | "rules">("overview");
  const tabs = ["overview", "amenities", "rules"] as const;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <FadeUp>
        <Card className="overflow-hidden">
          {/* hero */}
          <div className="relative h-44 bg-gradient-to-br from-primary/25 to-violet-500/20 flex items-center justify-center">
            <Building2 className="h-20 w-20 text-primary/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <h2 className="text-xl font-semibold">{MY_PG.name}</h2>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />{MY_PG.location}
              </p>
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-medium text-primary">
              <Shield className="h-3 w-3" /> Verified
            </div>
          </div>

          {/* info row */}
          <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
            {[
              { label: "Room",      value: "204",            sub: "Double sharing" },
              { label: "Rent",      value: `₹${MY_PG.rent.toLocaleString()}`, sub: "per month" },
              { label: "Move-in",   value: "1 Apr",          sub: "2025" },
            ].map((s) => (
              <div key={s.label} className="p-4 text-center">
                <p className="text-base font-semibold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label} · {s.sub}</p>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div className="border-b border-white/5 px-4">
            <div className="flex gap-1 pt-2">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`rounded-t-lg px-4 py-2.5 text-xs font-medium capitalize transition-all ${tab === t ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} className="p-5">
              {tab === "overview" && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Owner</p>
                      <p className="text-sm font-medium">{MY_PG.owner}</p>
                      <div className="mt-2 flex gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] text-primary hover:bg-primary/20 transition-colors">
                          <Phone className="h-3 w-3" /> Call
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-white/10 transition-colors">
                          <MessageCircle className="h-3 w-3" /> Message
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Next Rent Due</p>
                      <p className="text-sm font-semibold text-amber-400">₹{MY_PG.rent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">{MY_PG.dueDate}</p>
                      <button className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium text-primary-foreground"
                        style={{ background: "var(--gradient-primary)" }}>
                        Pay Now
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-muted-foreground mb-2">PG Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(MY_PG.rating) ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{MY_PG.rating}</span>
                    </div>
                  </div>
                </div>
              )}
              {tab === "amenities" && (
                <div className="grid grid-cols-3 gap-3">
                  {MY_PG.amenities.map((a) => (
                    <div key={a.label} className="flex flex-col items-center gap-2 rounded-xl bg-white/5 p-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <a.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs">{a.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "rules" && (
                <div className="space-y-2">
                  {["No guests after 10pm", "Veg food only in common kitchen", "Quiet hours 11pm–7am", "No smoking inside premises", "Monthly rent by 1st of each month"].map((r) => (
                    <div key={r} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </FadeUp>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   4. ROOMMATES
══════════════════════════════════════════════════════════════ */

function RoommatesSection() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Roommate Matches</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Based on your lifestyle preferences</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {ROOMMATES.map((r, i) => (
          <FadeUp key={r.id} delay={i * 0.1}>
            <Card className="p-5 group relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-semibold text-primary-foreground shrink-0"
                    style={{ background: "var(--gradient-primary)" }}>
                    {r.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gradient-primary">{r.score}%</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">match</p>
                  </div>
                </div>

                {/* match bar */}
                <div className="mt-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE, delay: i * 0.1 }} />
                </div>

                <div className="mt-4 space-y-1.5 text-xs">
                  {[
                    { l: "Food", v: r.food },
                    { l: "Schedule", v: r.schedule },
                    { l: "Languages", v: r.langs },
                  ].map((d) => (
                    <div key={d.l} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{d.l}</span>
                      <span className="font-medium">{d.v}</span>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full rounded-xl glass py-2.5 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> Connect
                </button>
              </div>
            </Card>
          </FadeUp>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   5. PAYMENTS
══════════════════════════════════════════════════════════════ */

function PaymentsSection() {
  const paid   = PAYMENT_HISTORY.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pending = PAYMENT_HISTORY.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <h2 className="text-lg font-semibold">Payments</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Paid",    value: `₹${paid.toLocaleString()}`,    color: "from-emerald-500/20 to-teal-500/20",  text: "text-emerald-400" },
          { label: "Pending",       value: `₹${pending.toLocaleString()}`, color: "from-amber-500/20 to-orange-500/20",  text: "text-amber-400" },
          { label: "Monthly Rent",  value: `₹${MY_PG.rent.toLocaleString()}`, color: "from-primary/15 to-cyan-500/15",   text: "text-primary" },
        ].map((c, i) => (
          <FadeUp key={c.label} delay={i * 0.07}>
            <Card className={`p-5 bg-gradient-to-br ${c.color}`}>
              <p className="text-xs text-muted-foreground mb-2">{c.label}</p>
              <p className={`text-2xl font-semibold ${c.text}`}>{c.value}</p>
            </Card>
          </FadeUp>
        ))}
      </div>

      {/* pending payment CTA */}
      {pending > 0 && (
        <FadeUp>
          <div className="flex items-center justify-between rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium">Rent due on {MY_PG.dueDate}</p>
                <p className="text-xs text-muted-foreground">₹{MY_PG.rent.toLocaleString()} pending</p>
              </div>
            </div>
            <button className="rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shrink-0"
              style={{ background: "var(--gradient-primary)" }}>
              Pay Now
            </button>
          </div>
        </FadeUp>
      )}

      <FadeUp>
        <Card className="overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4">
            <p className="text-sm font-semibold">Payment History</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                  {["Month", "Amount", "Date", "Method", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYMENT_HISTORY.map((p, i) => (
                  <tr key={p.id} className={`border-b border-white/5 hover:bg-white/4 transition-colors ${i === PAYMENT_HISTORY.length - 1 ? "border-0" : ""}`}>
                    <td className="px-5 py-3.5 font-medium">{p.month}</td>
                    <td className="px-5 py-3.5 text-primary font-semibold">₹{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{p.date}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{p.method}</td>
                    <td className="px-5 py-3.5"><StatusPill status={p.status} /></td>
                    <td className="px-5 py-3.5">
                      {p.status === "Paid" && (
                        <button className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] text-primary hover:bg-primary/20 transition-colors">Receipt</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeUp>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   6. MAINTENANCE
══════════════════════════════════════════════════════════════ */

function MaintenanceSection() {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Raise and track your requests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}>
          + New Request
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <Card className="p-5">
              <p className="text-sm font-semibold mb-4">New Maintenance Request</p>
              <div className="space-y-3">
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Describe the issue…"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <div className="flex gap-2">
                  <button onClick={() => { setShowForm(false); setNewTitle(""); }}
                    className="flex-1 rounded-xl py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
                    style={{ background: "var(--gradient-primary)" }}>
                    Submit
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="rounded-xl glass px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-2">
        {MAINTENANCE_TICKETS.map((m, i) => (
          <FadeUp key={m.id} delay={i * 0.08}>
            <Card className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{m.title}</p>
                <StatusPill status={m.status} />
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-lg bg-white/5 px-2 py-0.5">{m.category}</span>
                <span className={`rounded-lg px-2 py-0.5 ${m.priority === "High" ? "bg-red-500/10 text-red-400" : m.priority === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-white/5"}`}>
                  {m.priority}
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {m.date}
                </span>
              </div>
            </Card>
          </FadeUp>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   7. COMMUNITY
══════════════════════════════════════════════════════════════ */

function CommunitySection() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <h2 className="text-lg font-semibold">Community</h2>

      <div className="grid gap-5 lg:grid-cols-2">
        <FadeUp>
          <Card className="p-5">
            <p className="text-sm font-semibold mb-4">📢 Announcements</p>
            <div className="space-y-3">
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="rounded-xl bg-white/5 p-4 border border-white/8">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{a.body}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">{a.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </FadeUp>

        <div className="space-y-4">
          <FadeUp delay={0.1}>
            <Card className="p-5">
              <p className="text-sm font-semibold mb-3">📅 Notice Board</p>
              {["Water tank cleaning — Sunday 8am", "New food menu from July 1st", "Gym hours changed: 6am–10pm"].map((n) => (
                <div key={n} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 text-xs">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {n}
                </div>
              ))}
            </Card>
          </FadeUp>

          <FadeUp delay={0.15}>
            <Card className="p-5">
              <p className="text-sm font-semibold mb-3">📊 Poll</p>
              <p className="text-xs text-muted-foreground mb-3">When should we hold the community meet?</p>
              {[["Saturday evening", 60], ["Sunday afternoon", 30], ["Weekday night", 10]].map(([opt, pct]) => (
                <div key={opt} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 mb-2 hover:bg-white/10 cursor-pointer transition-all">
                  <span className="text-xs">{opt}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-primary/20 overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-6">{pct}%</span>
                  </div>
                </div>
              ))}
            </Card>
          </FadeUp>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   8. PROFILE
══════════════════════════════════════════════════════════════ */

function ProfileSection({ name, email }: { name: string; email: string }) {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <h2 className="text-lg font-semibold">Profile</h2>

      <div className="grid gap-5 lg:grid-cols-3">
        <FadeUp className="lg:col-span-1">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-2xl text-2xl font-bold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}>
              {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <h3 className="mt-4 text-base font-semibold">{name}</h3>
            <p className="text-xs text-muted-foreground">{email}</p>
            <div className="mt-3 flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
              <span className="text-xs text-primary font-medium">Resident</span>
            </div>
            <button className="mt-5 w-full rounded-xl glass py-2.5 text-xs font-medium hover:bg-white/10 transition-all">
              Edit Profile
            </button>
          </Card>
        </FadeUp>

        <FadeUp delay={0.1} className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { title: "Personal Info", icon: UserCircle, rows: ["Full Name: " + name, "Email: " + email, "Phone: 98765 43210", "City: Hyderabad"] },
              { title: "Preferences",   icon: Heart,      rows: ["Food: Vegetarian", "Schedule: Day shift", "Languages: Hindi, English", "Budget: ₹8k–₹12k"] },
              { title: "Documents",     icon: FileText,   rows: ["Aadhar Card — Uploaded", "PAN Card — Pending", "Rental Agreement — Signed"] },
            ].map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.08}>
                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold">{s.title}</p>
                  </div>
                  <div className="space-y-2">
                    {s.rows.map((r) => (
                      <div key={r} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-xs">
                        <span className="text-muted-foreground">{r.split(":")[0]}</span>
                        <span className="font-medium">{r.split(":").slice(1).join(":").trim()}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </FadeUp>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */

function Sidebar({ active, setActive, collapsed, setCollapsed, name }: {
  active: string; setActive: (s: string) => void;
  collapsed: boolean; setCollapsed: (b: boolean) => void;
  name: string;
}) {
  const navigate = useNavigate();
  function logout() { clearSession(); navigate({ to: "/" }); }

  return (
    <motion.aside animate={{ width: collapsed ? 64 : 220 }} transition={{ duration: 0.3, ease: EASE }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-card/80 backdrop-blur-xl overflow-hidden">
      {/* logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/5 px-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg shadow-glow" style={{ background: "var(--gradient-primary)" }}>
          <Compass className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-xs font-semibold tracking-tight whitespace-nowrap">
            Resident Portal
          </motion.span>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => (
          <button key={item.id} onClick={() => setActive(item.id)}
            title={collapsed ? item.label : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
              active === item.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}>
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && active === item.id && (
              <motion.div layoutId="user-nav-dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* footer */}
      <div className="shrink-0 border-t border-white/5 p-2 space-y-0.5">
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all">
          <Menu className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════ */

function UserDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const session = getSession();
  const name  = session?.name  ?? "Resident";
  const email = session?.email ?? "";

  useEffect(() => {
    if (!session || session.role !== "user") navigate({ to: "/auth" });
  }, []);

  const PAGE_MAP: Record<string, React.ReactElement> = {
    home:        <HomeSection name={name} />,
    search:      <FindPG />,
    mypg:        <MyPG />,
    roommates:   <RoommatesSection />,
    payments:    <PaymentsSection />,
    maintenance: <MaintenanceSection />,
    community:   <CommunitySection />,
    profile:     <ProfileSection name={name} email={email} />,
  };

  const current = NAV.find((n) => n.id === active);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} name={name} />

      <motion.div animate={{ marginLeft: collapsed ? 64 : 220 }} transition={{ duration: 0.3, ease: EASE }}>
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {current && <current.icon className="h-4 w-4 text-primary" />}
            <div>
              <h1 className="text-sm font-semibold">{current?.label ?? "Dashboard"}</h1>
              <p className="text-[10px] text-muted-foreground">StaySphere Resident Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/10 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </button>
            <div className="flex items-center gap-2.5 rounded-xl glass px-3 py-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold text-primary-foreground shrink-0"
                style={{ background: "var(--gradient-primary)" }}>
                {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium">{name}</p>
                <p className="text-[10px] text-muted-foreground">Resident</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}>
              {PAGE_MAP[active]}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
