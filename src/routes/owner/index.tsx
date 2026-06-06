import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, type Variants } from "framer-motion";
import {
  LayoutDashboard, Building2, BedDouble, Users, Wallet, Wrench,
  BarChart3, Megaphone, FileText, Settings, LogOut, Bell, Compass,
  Menu, ChevronDown, ChevronRight, TrendingUp,
  MapPin, Plus, Search, Eye, Edit3, AlertCircle, CheckCircle2,
  Clock, Zap, Home, Phone, Mail, Calendar, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Droplets, Wifi, Star,
  Shield, FileCheck, UserPlus, Activity,
} from "lucide-react";
import { getSession, clearSession } from "@/lib/session";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const Route = createFileRoute("/owner/")({
  component: OwnerDashboard,
});

/* ══════════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════════ */

const PROPERTIES = [
  { id: "P1", name: "Skyline Residency", location: "Hitech City, Hyderabad", occupancy: 94, revenue: 94000, beds: { total: 32, occupied: 30, vacant: 2 }, verified: true, rating: 4.8 },
  { id: "P2", name: "Aurora Co-living",  location: "Madhapur, Hyderabad",    occupancy: 81, revenue: 70400, beds: { total: 20, occupied: 16, vacant: 4 }, verified: true, rating: 4.6 },
  { id: "P3", name: "Nest North",         location: "Indiranagar, Bengaluru",  occupancy: 88, revenue: 88000, beds: { total: 24, occupied: 21, vacant: 3 }, verified: false, rating: 4.4 },
];

const ROOMS = [
  { id: "R101", property: "Skyline", type: "Single", sharing: 1, ac: true,  price: 12000, beds: [{ id: "B1", status: "occupied" }] },
  { id: "R102", property: "Skyline", type: "Double", sharing: 2, ac: true,  price: 9500,  beds: [{ id: "B1", status: "occupied" }, { id: "B2", status: "vacant" }] },
  { id: "R103", property: "Skyline", type: "Triple", sharing: 3, ac: false, price: 7800,  beds: [{ id: "B1", status: "occupied" }, { id: "B2", status: "occupied" }, { id: "B3", status: "reserved" }] },
  { id: "R201", property: "Aurora",  type: "Double", sharing: 2, ac: true,  price: 10000, beds: [{ id: "B1", status: "occupied" }, { id: "B2", status: "occupied" }] },
  { id: "R202", property: "Aurora",  type: "Single", sharing: 1, ac: false, price: 8500,  beds: [{ id: "B1", status: "maintenance" }] },
  { id: "R301", property: "Nest",    type: "Triple", sharing: 3, ac: true,  price: 8000,  beds: [{ id: "B1", status: "occupied" }, { id: "B2", status: "vacant" }, { id: "B3", status: "occupied" }] },
];

const RESIDENTS = [
  { id: "RS1", name: "Aanya Verma",   room: "R102", property: "Skyline", moveIn: "1 Apr 2025", rent: 9500,  status: "Paid",    food: "Veg",    phone: "98765 43210", email: "aanya@email.com" },
  { id: "RS2", name: "Rohan Iyer",    room: "R101", property: "Skyline", moveIn: "15 Mar 2025", rent: 12000, status: "Pending", food: "Non-veg", phone: "91234 56789", email: "rohan@email.com" },
  { id: "RS3", name: "Meera Khan",    room: "R103", property: "Skyline", moveIn: "10 Feb 2025", rent: 7800,  status: "Overdue", food: "Vegan",   phone: "99887 76655", email: "meera@email.com" },
  { id: "RS4", name: "Karan Kapoor",  room: "R201", property: "Aurora",  moveIn: "1 May 2025",  rent: 10000, status: "Paid",    food: "Veg",    phone: "87654 32109", email: "karan@email.com" },
  { id: "RS5", name: "Sneha Reddy",   room: "R301", property: "Nest",    moveIn: "20 Apr 2025", rent: 8000,  status: "Paid",    food: "Veg",    phone: "76543 21098", email: "sneha@email.com" },
  { id: "RS6", name: "Arjun Mehta",   room: "R202", property: "Aurora",  moveIn: "5 Jan 2025",  rent: 8500,  status: "Pending", food: "Non-veg", phone: "65432 10987", email: "arjun@email.com" },
];

const PAYMENTS = [
  { id: "PAY001", resident: "Aanya Verma",  property: "Skyline", amount: 9500,  due: "1 Jun 2025", status: "Paid",    method: "UPI" },
  { id: "PAY002", resident: "Rohan Iyer",   property: "Skyline", amount: 12000, due: "1 Jun 2025", status: "Pending", method: "—" },
  { id: "PAY003", resident: "Meera Khan",   property: "Skyline", amount: 7800,  due: "1 May 2025", status: "Overdue", method: "—" },
  { id: "PAY004", resident: "Karan Kapoor", property: "Aurora",  amount: 10000, due: "1 Jun 2025", status: "Paid",    method: "Bank" },
  { id: "PAY005", resident: "Sneha Reddy",  property: "Nest",    amount: 8000,  due: "1 Jun 2025", status: "Paid",    method: "UPI" },
  { id: "PAY006", resident: "Arjun Mehta",  property: "Aurora",  amount: 8500,  due: "1 Jun 2025", status: "Pending", method: "—" },
];

const MAINTENANCE = [
  { id: "MT001", title: "AC not cooling",       room: "R101", property: "Skyline", category: "Electrical", status: "In Progress", raised: "2 Jun 2025", priority: "High" },
  { id: "MT002", title: "Tap leaking",           room: "R202", property: "Aurora",  category: "Plumbing",   status: "Open",        raised: "3 Jun 2025", priority: "Medium" },
  { id: "MT003", title: "WiFi intermittent",     room: "R103", property: "Skyline", category: "WiFi",       status: "Assigned",    raised: "1 Jun 2025", priority: "Low" },
  { id: "MT004", title: "Tube light fused",      room: "R301", property: "Nest",    category: "Electrical", status: "Completed",   raised: "28 May 2025", priority: "Low" },
  { id: "MT005", title: "Door lock broken",      room: "R102", property: "Skyline", category: "Cleaning",   status: "Open",        raised: "4 Jun 2025", priority: "High" },
];

const ANNOUNCEMENTS = [
  { id: "AN1", title: "Water supply disruption",  body: "Water will be unavailable on 6 Jun from 10am–2pm for tank cleaning.", date: "5 Jun 2025", property: "All" },
  { id: "AN2", title: "Rent due reminder",         body: "June rent is due on 1st July. Please pay via UPI or bank transfer.", date: "28 May 2025", property: "All" },
  { id: "AN3", title: "Common area maintenance",  body: "Common area cleaning every Sunday 8–10am. Residents please cooperate.", date: "20 May 2025", property: "Skyline" },
];

const DOCUMENTS = [
  { id: "D1", name: "Rental Agreement — Aanya V.",  type: "Agreement", property: "Skyline", date: "1 Apr 2025", status: "Signed" },
  { id: "D2", name: "Rental Agreement — Rohan I.",  type: "Agreement", property: "Skyline", date: "15 Mar 2025", status: "Signed" },
  { id: "D3", name: "KYC — Meera Khan",             type: "KYC",       property: "Skyline", date: "10 Feb 2025", status: "Verified" },
  { id: "D4", name: "Property License — Skyline",   type: "License",   property: "Skyline", date: "1 Jan 2025", status: "Active" },
  { id: "D5", name: "KYC — Karan Kapoor",           type: "KYC",       property: "Aurora",  date: "1 May 2025", status: "Pending" },
];

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 180000 },
  { month: "Feb", revenue: 195000 },
  { month: "Mar", revenue: 210000 },
  { month: "Apr", revenue: 198000 },
  { month: "May", revenue: 230000 },
  { month: "Jun", revenue: 252400 },
];

const ACTIVITY_FEED = [
  { icon: UserPlus,    text: "Sneha Reddy moved in",        sub: "Nest North · Room 301",  time: "2h ago", color: "text-emerald-400" },
  { icon: Wallet,      text: "Rent received ₹9,500",         sub: "Aanya Verma · Skyline",  time: "4h ago", color: "text-primary" },
  { icon: Wrench,      text: "Maintenance ticket raised",    sub: "AC not cooling · R101",  time: "6h ago", color: "text-amber-400" },
  { icon: FileCheck,   text: "Agreement signed",             sub: "Rohan Iyer · Skyline",   time: "1d ago", color: "text-violet-400" },
  { icon: AlertCircle, text: "Rent overdue",                 sub: "Meera Khan · ₹7,800",   time: "2d ago", color: "text-red-400" },
];

/* ══════════════════════════════════════════════════════════════
   SIDEBAR NAV
══════════════════════════════════════════════════════════════ */

const NAV = [
  { id: "overview",    label: "Overview",     icon: LayoutDashboard },
  { id: "properties",  label: "Properties",   icon: Building2 },
  { id: "rooms",       label: "Rooms & Beds", icon: BedDouble },
  { id: "residents",   label: "Residents",    icon: Users },
  { id: "payments",    label: "Payments",     icon: Wallet },
  { id: "maintenance", label: "Maintenance",  icon: Wrench },
  { id: "analytics",   label: "Analytics",    icon: BarChart3 },
  { id: "community",   label: "Community",    icon: Megaphone },
  { id: "documents",   label: "Documents",    icon: FileText },
  { id: "settings",    label: "Settings",     icon: Settings },
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

function AnimCounter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1400; const start = performance.now(); let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{v.toLocaleString()}{suffix}</span>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid:        "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Pending:     "bg-amber-500/15   text-amber-400   border-amber-500/20",
    Overdue:     "bg-red-500/15     text-red-400     border-red-500/20",
    Active:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Open:        "bg-red-500/15     text-red-400     border-red-500/20",
    Assigned:    "bg-blue-500/15    text-blue-400    border-blue-500/20",
    "In Progress":"bg-amber-500/15  text-amber-400   border-amber-500/20",
    Completed:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Signed:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Verified:    "bg-primary/15     text-primary     border-primary/20",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-white/10 text-muted-foreground border-white/10"}`}>
      {status}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl glass-strong shadow-soft transition-all hover:shadow-elegant ${className}`}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REVENUE BAR CHART
══════════════════════════════════════════════════════════════ */

function RevenueChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...MONTHLY_REVENUE.map((m) => m.revenue));

  return (
    <div ref={ref} className="flex items-end gap-2 h-32 mt-4">
      {MONTHLY_REVENUE.map((m, i) => {
        const pct = (m.revenue / max) * 100;
        return (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="w-full relative rounded-t-lg overflow-hidden bg-white/5" style={{ height: "100px" }}>
              <motion.div
                className="absolute bottom-0 w-full rounded-t-lg"
                style={{ background: "var(--gradient-primary)" }}
                initial={{ height: 0 }}
                animate={inView ? { height: `${pct}%` } : { height: 0 }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
              />
              <div className="absolute inset-x-0 bottom-full mb-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="rounded-lg bg-card px-2 py-0.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                  ₹{(m.revenue / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">{m.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   OCCUPANCY DONUT
══════════════════════════════════════════════════════════════ */

function OccupancyDonut({ pct }: { pct: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = 44; const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} stroke="oklch(1 0 0 / 0.07)" strokeWidth="8" fill="none" />
        <motion.circle cx="50" cy="50" r={r} stroke="url(#grad)" strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: c - (c * pct) / 100 } : {}}
          transition={{ duration: 1.4, ease: EASE }} />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.74 0.13 220)" />
            <stop offset="100%" stopColor="oklch(0.82 0.15 200)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-xl font-semibold tabular-nums">{pct}%</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">occupied</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BED STATUS DOT
══════════════════════════════════════════════════════════════ */

function BedDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    occupied:    "bg-primary shadow-[0_0_8px_oklch(0.74_0.13_220/0.6)]",
    vacant:      "bg-emerald-400 shadow-[0_0_8px_oklch(0.76_0.18_162/0.5)]",
    reserved:    "bg-amber-400 shadow-[0_0_8px_oklch(0.85_0.18_80/0.5)]",
    maintenance: "bg-red-400 shadow-[0_0_8px_oklch(0.65_0.22_25/0.5)]",
  };
  const labels: Record<string, string> = {
    occupied: "Occupied", vacant: "Vacant", reserved: "Reserved", maintenance: "Maintenance",
  };
  return (
    <div className="group relative">
      <div className={`h-3.5 w-3.5 rounded-full transition-transform group-hover:scale-125 ${map[status] ?? "bg-white/20"}`} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 rounded-lg bg-card border border-white/10 px-2 py-1 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {labels[status] ?? status}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════════════════════════════════ */

function QuickActions() {
  const actions = [
    { icon: Plus,       label: "Add Property",   color: "from-blue-500/20 to-cyan-500/20",     text: "text-blue-400" },
    { icon: UserPlus,   label: "Add Resident",   color: "from-violet-500/20 to-purple-500/20", text: "text-violet-400" },
    { icon: BedDouble,  label: "Add Room",        color: "from-emerald-500/20 to-teal-500/20",  text: "text-emerald-400" },
    { icon: Megaphone,  label: "Announcement",   color: "from-amber-500/20 to-orange-500/20",  text: "text-amber-400" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a) => (
        <button key={a.label}
          className={`group flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br ${a.color} border border-white/8 p-4 transition-all hover:-translate-y-1 hover:shadow-glow`}>
          <div className={`grid h-10 w-10 place-items-center rounded-xl bg-white/5 ${a.text}`}>
            <a.icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   1. OVERVIEW
══════════════════════════════════════════════════════════════ */

function Overview() {
  const totalRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue;
  const totalBeds = PROPERTIES.reduce((s, p) => s + p.beds.total, 0);
  const occupiedBeds = PROPERTIES.reduce((s, p) => s + p.beds.occupied, 0);
  const overallOccupancy = Math.round((occupiedBeds / totalBeds) * 100);
  const pendingPay = PAYMENTS.filter((p) => p.status === "Pending" || p.status === "Overdue").reduce((s, p) => s + p.amount, 0);

  const TOP_STATS = [
    { label: "Total Properties",  value: PROPERTIES.length, suffix: "",  icon: Building2,  color: "from-blue-500/25 to-cyan-500/25",     text: "text-blue-400",    change: "+1 this month" },
    { label: "Occupancy Rate",    value: overallOccupancy,  suffix: "%", icon: Activity,   color: "from-primary/20 to-cyan-400/20",     text: "text-primary",     change: "+3% vs last month" },
    { label: "Monthly Revenue",   value: totalRevenue / 1000, suffix: "k", prefix: "₹", icon: Wallet, color: "from-emerald-500/25 to-teal-500/25", text: "text-emerald-400", change: "+12% vs last month" },
    { label: "Pending Payments",  value: pendingPay / 1000,  suffix: "k", prefix: "₹", icon: AlertCircle, color: "from-amber-500/25 to-orange-500/25", text: "text-amber-400", change: "3 residents" },
    { label: "Active Residents",  value: RESIDENTS.length,  suffix: "",  icon: Users,     color: "from-violet-500/25 to-purple-500/25", text: "text-violet-400",  change: "+2 this month" },
    { label: "Available Beds",    value: totalBeds - occupiedBeds, suffix: "", icon: BedDouble, color: "from-rose-500/25 to-pink-500/25", text: "text-rose-400", change: `of ${totalBeds} total` },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-7">

      {/* stat grid */}
      <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TOP_STATS.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp}>
            <Card className="p-5 overflow-hidden relative group cursor-default">
              <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${s.color} blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${s.color} ${s.text}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  <AnimCounter to={Math.round(s.value)} prefix={s.prefix ?? ""} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.change}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* charts row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* revenue chart */}
        <FadeUp className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-semibold">Revenue Trend</p>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly earnings across all properties</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> +12%
              </div>
            </div>
            <RevenueChart />
          </Card>
        </FadeUp>

        {/* occupancy donut */}
        <FadeUp delay={0.1}>
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold">Overall Occupancy</p>
              <p className="text-xs text-muted-foreground mt-0.5">Beds filled across properties</p>
            </div>
            <div className="flex items-center gap-5 mt-6">
              <OccupancyDonut pct={overallOccupancy} />
              <div className="space-y-2">
                {[
                  { label: "Occupied", val: occupiedBeds,             color: "bg-primary" },
                  { label: "Vacant",   val: totalBeds - occupiedBeds, color: "bg-emerald-400" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2 text-sm">
                    <div className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                    <span className="text-muted-foreground text-xs">{r.label}</span>
                    <span className="font-semibold ml-auto pl-4">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </FadeUp>
      </div>

      {/* quick actions + activity */}
      <div className="grid gap-5 lg:grid-cols-3">
        <FadeUp className="lg:col-span-2 space-y-4">
          <p className="text-sm font-semibold">Quick Actions</p>
          <QuickActions />
        </FadeUp>

        <FadeUp delay={0.1}>
          <Card className="p-5">
            <p className="text-sm font-semibold mb-4">Recent Activity</p>
            <div className="space-y-3">
              {ACTIVITY_FEED.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 ${a.color}`}>
                    <a.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{a.sub}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{a.time}</span>
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
   2. PROPERTIES
══════════════════════════════════════════════════════════════ */

function Properties() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Properties</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{PROPERTIES.length} properties registered</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:opacity-90"
          style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Add Property
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PROPERTIES.map((p, i) => (
          <motion.div key={p.id} variants={fadeUp}>
            <Card className="overflow-hidden group">
              {/* hero */}
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-primary/30" />
                {p.verified && (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-medium text-primary">
                    <Shield className="h-3 w-3" /> Verified
                  </div>
                )}
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-medium">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {p.location}
                </p>

                {/* stats row */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Occupancy", value: `${p.occupancy}%` },
                    { label: "Revenue",   value: `₹${(p.revenue / 1000).toFixed(0)}k` },
                    { label: "Beds",      value: `${p.beds.occupied}/${p.beds.total}` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/5 p-2.5 text-center">
                      <p className="text-sm font-semibold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* occupancy bar */}
                <div className="mt-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.occupancy}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
                  />
                </div>

                {/* actions */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-xl glass py-2 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> Manage
                  </button>
                  <button className="flex-1 rounded-xl glass py-2 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" /> Analytics
                  </button>
                  <button className="rounded-xl glass p-2 text-xs hover:bg-white/10 transition-all">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   3. ROOMS & BEDS
══════════════════════════════════════════════════════════════ */

const BED_LEGEND = [
  { status: "occupied",    label: "Occupied",    color: "bg-primary" },
  { status: "vacant",      label: "Vacant",      color: "bg-emerald-400" },
  { status: "reserved",    label: "Reserved",    color: "bg-amber-400" },
  { status: "maintenance", label: "Maintenance", color: "bg-red-400" },
];

function RoomsAndBeds() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Rooms & Beds</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{ROOMS.length} rooms across all properties</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-4">
        {BED_LEGEND.map((l) => (
          <div key={l.status} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`h-3 w-3 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* room grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ROOMS.map((room, i) => (
          <motion.div key={room.id} variants={fadeUp}>
            <Card className="p-5 group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{room.id}</span>
                    {room.ac && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">AC</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{room.property} · {room.type} sharing</p>
                </div>
                <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* bed visual */}
              <div className="mt-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2.5">Bed Status</p>
                <div className="flex items-center gap-3">
                  {room.beds.map((bed) => (
                    <BedDot key={bed.id} status={bed.status} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {room.beds.filter((b) => b.status === "occupied").length}/{room.beds.length} occupied
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-sm font-semibold text-gradient-primary">₹{room.price.toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal">/mo</span></span>
                <span className="text-xs text-muted-foreground">{room.sharing}-sharing</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   4. RESIDENTS
══════════════════════════════════════════════════════════════ */

function Residents() {
  const [search, setSearch] = useState("");
  const filtered = RESIDENTS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.room.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Residents</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{RESIDENTS.length} active residents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search residents…"
              className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-48" />
          </div>
          <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-primary)" }}>
            <UserPlus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                {["Resident", "Room", "Move-in", "Rent", "Status", "Food", "Contact"].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, i) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-b border-white/5 hover:bg-white/4 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-primary-foreground"
                          style={{ background: "var(--gradient-primary)" }}>
                          {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-[10px] text-muted-foreground">{r.property}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{r.room}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Calendar className="h-3 w-3" /> {r.moveIn}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-primary">₹{r.rent.toLocaleString()}</td>
                    <td className="px-5 py-4"><StatusPill status={r.status} /></td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{r.food}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors" title={r.phone}>
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors" title={r.email}>
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* move-in checklist */}
      <FadeUp>
        <Card className="p-6">
          <p className="text-sm font-semibold mb-4">Move-In Checklist</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Deposit Paid",        done: true  },
              { label: "Documents Verified",  done: true  },
              { label: "Agreement Signed",    done: true  },
              { label: "Room Assigned",       done: false },
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${item.done ? "border-emerald-500/25 bg-emerald-500/8" : "border-white/8 bg-white/4"}`}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300 }}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${item.done ? "bg-emerald-500" : "bg-white/10"}`}>
                  {item.done
                    ? <CheckCircle2 className="h-4 w-4 text-white" />
                    : <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                </motion.div>
                <span className={`text-xs font-medium ${item.done ? "text-emerald-400" : "text-muted-foreground"}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </FadeUp>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   5. PAYMENTS
══════════════════════════════════════════════════════════════ */

function Payments() {
  const collected = PAYMENTS.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pending   = PAYMENTS.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const overdue   = PAYMENTS.filter((p) => p.status === "Overdue").reduce((s, p) => s + p.amount, 0);
  const upcoming  = PAYMENTS.reduce((s, p) => s + p.amount, 0);

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <h2 className="text-lg font-semibold">Payments</h2>

      {/* summary cards */}
      <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Collected", value: collected, color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-400", icon: ArrowUpRight },
          { label: "Pending",         value: pending,   color: "from-amber-500/20 to-orange-500/20", text: "text-amber-400",   icon: Clock },
          { label: "Overdue",         value: overdue,   color: "from-red-500/20 to-rose-500/20",     text: "text-red-400",    icon: ArrowDownRight },
          { label: "Upcoming Dues",   value: upcoming,  color: "from-primary/15 to-cyan-500/15",     text: "text-primary",   icon: Calendar },
        ].map((c) => (
          <motion.div key={c.label} variants={fadeUp}>
            <Card className={`p-5 bg-gradient-to-br ${c.color} relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <c.icon className={`h-4 w-4 ${c.text}`} />
              </div>
              <p className={`text-2xl font-semibold ${c.text}`}>
                ₹<AnimCounter to={c.value} />
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* table */}
      <FadeUp>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                  {["Resident", "Property", "Amount", "Due Date", "Status", "Method", "Receipt"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYMENTS.map((p, i) => (
                  <tr key={p.id} className={`border-b border-white/5 hover:bg-white/4 transition-colors ${i === PAYMENTS.length - 1 ? "border-0" : ""}`}>
                    <td className="px-5 py-4 font-medium">{p.resident}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{p.property}</td>
                    <td className="px-5 py-4 font-semibold text-primary">₹{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{p.due}</td>
                    <td className="px-5 py-4"><StatusPill status={p.status} /></td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{p.method}</td>
                    <td className="px-5 py-4">
                      {p.status === "Paid" && (
                        <button className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] text-primary hover:bg-primary/20 transition-colors">
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeUp>

      {/* revenue chart */}
      <FadeUp>
        <Card className="p-6">
          <p className="text-sm font-semibold mb-1">Revenue Analytics</p>
          <p className="text-xs text-muted-foreground">Monthly income across all properties</p>
          <RevenueChart />
        </Card>
      </FadeUp>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   6. MAINTENANCE
══════════════════════════════════════════════════════════════ */

const MAINT_ICONS: Record<string, React.ElementType> = {
  Electrical: Zap,
  Plumbing:   Droplets,
  WiFi:       Wifi,
  Cleaning:   Home,
};

function Maintenance() {
  const [filter, setFilter] = useState("All");
  const statuses = ["All", "Open", "Assigned", "In Progress", "Completed"];
  const filtered = filter === "All" ? MAINTENANCE : MAINTENANCE.filter((m) => m.status === filter);

  const counts = statuses.slice(1).map((s) => ({
    label: s, count: MAINTENANCE.filter((m) => m.status === s).length,
  }));

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{MAINTENANCE.length} total tickets</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> New Ticket
        </button>
      </div>

      {/* summary pills */}
      <div className="flex flex-wrap gap-3">
        {counts.map((c) => (
          <div key={c.label} className="flex items-center gap-2 rounded-xl glass px-4 py-2">
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <span className="text-sm font-semibold">{c.count}</span>
          </div>
        ))}
      </div>

      {/* filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${filter === s ? "text-primary-foreground shadow-glow" : "glass text-muted-foreground hover:text-foreground"}`}
            style={filter === s ? { background: "var(--gradient-primary)" } : {}}>
            {s}
          </button>
        ))}
      </div>

      {/* ticket cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((m) => {
            const Icon = MAINT_ICONS[m.category] ?? Wrench;
            const priorityColor = m.priority === "High" ? "text-red-400 bg-red-500/10" : m.priority === "Medium" ? "text-amber-400 bg-amber-500/10" : "text-muted-foreground bg-white/5";
            return (
              <motion.div key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}>
                <Card className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{m.title}</p>
                        <StatusPill status={m.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{m.property} · Room {m.room}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <span className={`rounded-lg px-2 py-0.5 font-medium ${priorityColor}`}>{m.priority}</span>
                        <span className="text-muted-foreground">{m.category}</span>
                        <span className="text-muted-foreground ml-auto">{m.raised}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   7. ANALYTICS
══════════════════════════════════════════════════════════════ */

function Analytics() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <h2 className="text-lg font-semibold">Analytics</h2>

      <div className="grid gap-5 lg:grid-cols-2">
        <FadeUp>
          <Card className="p-6">
            <p className="text-sm font-semibold">Revenue Growth</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Monthly earnings trend</p>
            <RevenueChart />
          </Card>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Card className="p-6">
            <p className="text-sm font-semibold">Property Performance</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-5">Occupancy per property</p>
            <div className="space-y-4">
              {PROPERTIES.map((p, i) => (
                <div key={p.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-primary font-semibold">{p.occupancy}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.occupancy}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.15, ease: EASE }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Card className="p-6">
            <p className="text-sm font-semibold">Occupancy Overview</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-5">Beds status breakdown</p>
            <div className="flex items-center gap-8">
              <OccupancyDonut pct={Math.round((PROPERTIES.reduce((s, p) => s + p.beds.occupied, 0) / PROPERTIES.reduce((s, p) => s + p.beds.total, 0)) * 100)} />
              <div className="space-y-3 flex-1">
                {[
                  { label: "Occupied",    val: PROPERTIES.reduce((s, p) => s + p.beds.occupied, 0), color: "bg-primary" },
                  { label: "Vacant",      val: PROPERTIES.reduce((s, p) => s + p.beds.vacant, 0),   color: "bg-emerald-400" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                      <span className="text-xs text-muted-foreground">{r.label}</span>
                    </div>
                    <span className="text-sm font-semibold">{r.val} beds</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </FadeUp>

        <FadeUp delay={0.15}>
          <Card className="p-6">
            <p className="text-sm font-semibold">Resident Retention</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-5">Stay duration breakdown</p>
            <div className="space-y-3">
              {[
                { label: "< 3 months",  pct: 20, count: 1 },
                { label: "3–6 months",  pct: 40, count: 2 },
                { label: "6–12 months", pct: 60, count: 3 },
                { label: "> 1 year",    pct: 20, count: 1 },
              ].map((r, i) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium">{r.count} residents</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-primary/70"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${r.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
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
   8. COMMUNITY
══════════════════════════════════════════════════════════════ */

function Community() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Community</h2>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Announcement
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FadeUp>
          <Card className="p-5">
            <p className="text-sm font-semibold mb-4">📢 Announcements</p>
            <div className="space-y-3">
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="rounded-xl bg-white/5 p-4 border border-white/8">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{a.title}</p>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{a.property}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{a.body}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">{a.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="space-y-4">
            <Card className="p-5">
              <p className="text-sm font-semibold mb-3">📅 Notice Board</p>
              {["Water tank cleaning — Sunday 8am", "Gym closed for maintenance Wed", "New food menu from July 1st"].map((n) => (
                <div key={n} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-xs">{n}</span>
                </div>
              ))}
            </Card>

            <Card className="p-5">
              <p className="text-sm font-semibold mb-3">📊 Quick Poll</p>
              <p className="text-xs text-muted-foreground mb-3">When should we hold the community meet?</p>
              {["Saturday evening", "Sunday afternoon", "Weekday night"].map((opt, i) => (
                <div key={opt} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 mb-2 cursor-pointer hover:bg-white/10 transition-all">
                  <span className="text-xs">{opt}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-primary/30 overflow-hidden" style={{ width: "60px" }}>
                      <div className="h-full bg-primary rounded-full" style={{ width: `${[60, 30, 10][i]}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{[60, 30, 10][i]}%</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </FadeUp>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   9. DOCUMENTS
══════════════════════════════════════════════════════════════ */

const DOC_ICONS: Record<string, React.ElementType> = {
  Agreement: FileText, KYC: Shield, License: FileCheck,
};

function Documents() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Upload
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DOCUMENTS.map((d, i) => {
          const Icon = DOC_ICONS[d.type] ?? FileText;
          return (
            <motion.div key={d.id} variants={fadeUp}>
              <Card className="p-5 group flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.property} · {d.date}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-muted-foreground">{d.type}</span>
                    <StatusPill status={d.status} />
                  </div>
                </div>
                <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   10. SETTINGS
══════════════════════════════════════════════════════════════ */

function SettingsPage() {
  const sections = [
    { title: "Business Profile",  icon: Building2, fields: ["Business Name", "GST Number", "Business Address", "City"] },
    { title: "Notifications",     icon: Bell,      fields: ["Email alerts for rent", "SMS on maintenance", "Weekly report"] },
    { title: "Team Members",      icon: Users,     fields: ["Manager Name", "Manager Email", "Manager Phone"] },
    { title: "Subscription",      icon: Zap,       fields: ["Current Plan: Professional", "Next billing: 1 Jul 2025"] },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 0.08}>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{s.title}</p>
              </div>
              <div className="space-y-3">
                {s.fields.map((f) => (
                  <div key={f} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{f}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </Card>
          </FadeUp>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */

function Sidebar({
  active, setActive, collapsed, setCollapsed,
}: {
  active: string; setActive: (s: string) => void;
  collapsed: boolean; setCollapsed: (b: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-card/80 backdrop-blur-xl overflow-hidden"
    >
      {/* logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/5 px-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg shadow-glow"
          style={{ background: "var(--gradient-primary)" }}>
          <Compass className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-xs font-semibold tracking-tight whitespace-nowrap overflow-hidden">
            Owner Dashboard
          </motion.span>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {NAV.map((item) => (
          <button key={item.id} onClick={() => setActive(item.id)}
            title={collapsed ? item.label : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
              active === item.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}>
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && active === item.id && (
              <motion.div layoutId="nav-dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
        <button onClick={() => { clearSession(); navigate({ to: "/" }); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

/* ══════════════════════════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════════════════════════ */

function Topbar({ active, collapsed }: { active: string; collapsed: boolean }) {
  const current = NAV.find((n) => n.id === active);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {current && <current.icon className="h-4 w-4 text-primary" />}
        <div>
          <h1 className="text-sm font-semibold">{current?.label ?? "Dashboard"}</h1>
          <p className="text-[10px] text-muted-foreground">StaySphere Owner Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/10 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </button>
        <div className="flex items-center gap-2.5 rounded-xl glass px-3 py-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}>RK</div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium">Ramesh Kumar</p>
            <p className="text-[10px] text-muted-foreground">PG Owner</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE RENDERER
══════════════════════════════════════════════════════════════ */

const PAGE_MAP: Record<string, () => React.ReactElement> = {
  overview:    () => <Overview />,
  properties:  () => <Properties />,
  rooms:       () => <RoomsAndBeds />,
  residents:   () => <Residents />,
  payments:    () => <Payments />,
  maintenance: () => <Maintenance />,
  analytics:   () => <Analytics />,
  community:   () => <Community />,
  documents:   () => <Documents />,
  settings:    () => <SettingsPage />,
};

/* ══════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════ */

function OwnerDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const session = getSession();

  useEffect(() => {
    if (!session || session.role !== "owner") navigate({ to: "/auth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

      <motion.div
        animate={{ marginLeft: collapsed ? 64 : 220 }}
        transition={{ duration: 0.3, ease: EASE }}>
        <Topbar active={active} collapsed={collapsed} />

        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}>
              {PAGE_MAP[active]?.()}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
