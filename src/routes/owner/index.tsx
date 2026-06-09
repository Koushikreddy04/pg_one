import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, type Variants } from "framer-motion";
import { AddPropertyWizard } from "./add-property";
import {
  LayoutDashboard, Building2, BedDouble, Users, Wallet, Wrench,
  BarChart3, Megaphone, FileText, Settings, LogOut, Bell, Compass,
  Menu, ChevronDown, ChevronRight, TrendingUp,
  MapPin, Plus, Search, Eye, AlertCircle, CheckCircle2,
  Clock, Zap, Home, Phone, Mail, Calendar, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Droplets, Wifi, Star, Wind,
  Shield, FileCheck, UserPlus, Activity, Trash2, Pencil, X, IndianRupee,
  Upload, User, SlidersHorizontal, MessageCircle, History,
} from "lucide-react";
import { getSession, clearSession, getStoredProperties, updateStoredProperty, deleteStoredProperty, type StoredProperty, getStoredRooms, addStoredRoom, updateStoredRoom, deleteStoredRoom, type StoredRoom, getStoredResidents, addStoredResident, deleteStoredResident, updateStoredResident, type StoredResident } from "@/lib/session";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const Route = createFileRoute("/owner/")({
  component: OwnerDashboard,
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MOCK DATA
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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

// RESIDENTS mocks are now seeded and managed dynamically inside localStorage (ss_residents)

const PAYMENTS = [
  { id: "PAY001", resident: "Aanya Verma",  property: "Skyline", amount: 9500,  due: "1 Jun 2025", status: "Paid",    method: "UPI" },
  { id: "PAY002", resident: "Rohan Iyer",   property: "Skyline", amount: 12000, due: "1 Jun 2025", status: "Pending", method: "â€”" },
  { id: "PAY003", resident: "Meera Khan",   property: "Skyline", amount: 7800,  due: "1 May 2025", status: "Overdue", method: "â€”" },
  { id: "PAY004", resident: "Karan Kapoor", property: "Aurora",  amount: 10000, due: "1 Jun 2025", status: "Paid",    method: "Bank" },
  { id: "PAY005", resident: "Sneha Reddy",  property: "Nest",    amount: 8000,  due: "1 Jun 2025", status: "Paid",    method: "UPI" },
  { id: "PAY006", resident: "Arjun Mehta",  property: "Aurora",  amount: 8500,  due: "1 Jun 2025", status: "Pending", method: "â€”" },
];

const MAINTENANCE = [
  { id: "MT001", title: "AC not cooling",       room: "R101", property: "Skyline", category: "Electrical", status: "In Progress", raised: "2 Jun 2025", priority: "High" },
  { id: "MT002", title: "Tap leaking",           room: "R202", property: "Aurora",  category: "Plumbing",   status: "Open",        raised: "3 Jun 2025", priority: "Medium" },
  { id: "MT003", title: "WiFi intermittent",     room: "R103", property: "Skyline", category: "WiFi",       status: "Assigned",    raised: "1 Jun 2025", priority: "Low" },
  { id: "MT004", title: "Tube light fused",      room: "R301", property: "Nest",    category: "Electrical", status: "Completed",   raised: "28 May 2025", priority: "Low" },
  { id: "MT005", title: "Door lock broken",      room: "R102", property: "Skyline", category: "Cleaning",   status: "Open",        raised: "4 Jun 2025", priority: "High" },
];

export interface StoredAnnouncement {
  id: string;
  title: string;
  body: string;
  property: string;
  startDate: string;
  endDate: string;
  dateStr: string;
}

const getStoredAnnouncements = (): StoredAnnouncement[] => {
  if (typeof window === "undefined") return [];
  const KEY = "ss_announcements";
  let announcements: StoredAnnouncement[] = [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      announcements = JSON.parse(raw) as StoredAnnouncement[];
    }
  } catch {}

  if (announcements.length === 0) {
    const initialMocks = [
      { id: "AN1", title: "Water supply disruption", body: "Water will be unavailable on 6 Jun from 10amâ€“2pm for tank cleaning.", property: "All", startDate: "2026-06-05T10:00", endDate: "2026-06-06T14:00", dateStr: "5 Jun 2026, 10:00 AM - 6 Jun 2026, 2:00 PM" },
      { id: "AN2", title: "Rent due reminder", body: "June rent is due on 1st July. Please pay via UPI or bank transfer.", property: "All", startDate: "2026-06-01T09:00", endDate: "2026-07-01T23:59", dateStr: "1 Jun 2026, 9:00 AM - 1 Jul 2026, 11:59 PM" },
      { id: "AN3", title: "Common area maintenance", body: "Common area cleaning every Sunday 8â€“10am. Residents please cooperate.", property: "Skyline", startDate: "2026-06-01T08:00", endDate: "2026-08-31T10:00", dateStr: "1 Jun 2026, 8:00 AM - 31 Aug 2026, 10:00 AM" },
    ];
    localStorage.setItem(KEY, JSON.stringify(initialMocks));
    return initialMocks;
  }
  return announcements;
};

const getStoredNotices = (): string[] => {
  if (typeof window === "undefined") return [];
  const KEY = "ss_notice_board";
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      return JSON.parse(raw) as string[];
    }
  } catch {}
  const initialNotices = [
    "Water tank cleaning â€” Sunday 8am",
    "Gym closed for maintenance Wed",
    "New food menu from July 1st"
  ];
  try {
    localStorage.setItem(KEY, JSON.stringify(initialNotices));
  } catch {}
  return initialNotices;
};

export interface StoredPollOption {
  text: string;
  votes: number;
}

export interface StoredPoll {
  id: string;
  question: string;
  options: StoredPollOption[];
}

const getStoredPolls = (): StoredPoll[] => {
  if (typeof window === "undefined") return [];
  const KEY = "ss_polls";
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoredPoll[];
  } catch {}
  const defaults: StoredPoll[] = [
    {
      id: "poll-1",
      question: "When should we hold the community meet?",
      options: [
        { text: "Saturday evening", votes: 12 },
        { text: "Sunday afternoon", votes: 6 },
        { text: "Weekday night", votes: 2 }
      ]
    }
  ];
  try {
    localStorage.setItem(KEY, JSON.stringify(defaults));
  } catch {}
  return defaults;
};



const DOCUMENTS = [
  { id: "D1", name: "Rental Agreement â€” Aanya V.",  type: "Agreement", property: "Skyline", date: "1 Apr 2025", status: "Signed" },
  { id: "D2", name: "Rental Agreement â€” Rohan I.",  type: "Agreement", property: "Skyline", date: "15 Mar 2025", status: "Signed" },
  { id: "D3", name: "KYC â€” Meera Khan",             type: "KYC",       property: "Skyline", date: "10 Feb 2025", status: "Verified" },
  { id: "D4", name: "Property License â€” Skyline",   type: "License",   property: "Skyline", date: "1 Jan 2025", status: "Active" },
  { id: "D5", name: "KYC â€” Karan Kapoor",           type: "KYC",       property: "Aurora",  date: "1 May 2025", status: "Pending" },
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
  { icon: UserPlus,    text: "Sneha Reddy moved in",        sub: "Nest North Â· Room 301",  time: "2h ago", color: "text-emerald-400" },
  { icon: Wallet,      text: "Rent received â‚¹9,500",         sub: "Aanya Verma Â· Skyline",  time: "4h ago", color: "text-primary" },
  { icon: Wrench,      text: "Maintenance ticket raised",    sub: "AC not cooling Â· R101",  time: "6h ago", color: "text-amber-400" },
  { icon: FileCheck,   text: "Agreement signed",             sub: "Rohan Iyer Â· Skyline",   time: "1d ago", color: "text-violet-400" },
  { icon: AlertCircle, text: "Rent overdue",                 sub: "Meera Khan Â· â‚¹7,800",   time: "2d ago", color: "text-red-400" },
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SIDEBAR NAV
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SHARED PRIMITIVES
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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
    Ongoing:     "bg-amber-500/15   text-amber-400   border-amber-500/20",
    Completed:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Solved:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   REVENUE BAR CHART
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function RevenueChart({ data }: { data?: { month: string; revenue: number }[] }) {
  const chartData = data || MONTHLY_REVENUE;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...chartData.map((m) => m.revenue), 1);

  return (
    <div ref={ref} className="flex items-end gap-2 h-32 mt-4">
      {chartData.map((m, i) => {
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
                  â‚¹{(m.revenue / 1000).toFixed(0)}k
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   OCCUPANCY DONUT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BED STATUS DOT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   QUICK ACTIONS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function QuickActions({ onAddProperty, onAddRoom }: { onAddProperty: () => void; onAddRoom: () => void }) {
  const actions = [
    { icon: Plus,       label: "Add Property",   color: "from-blue-500/20 to-cyan-500/20",     text: "text-blue-400",    onClick: onAddProperty },
    { icon: UserPlus,   label: "Add Resident",   color: "from-violet-500/20 to-purple-500/20", text: "text-violet-400",  onClick: undefined },
    { icon: BedDouble,  label: "Add Room",        color: "from-emerald-500/20 to-teal-500/20",  text: "text-emerald-400", onClick: onAddRoom },
    { icon: Megaphone,  label: "Announcement",   color: "from-amber-500/20 to-orange-500/20",  text: "text-amber-400",   onClick: undefined },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a) => (
        <button key={a.label} onClick={a.onClick}
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   1. OVERVIEW
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function RatingsCard({ properties }: { properties: typeof PROPERTIES }) {
  const [selectedProp, setSelectedProp] = useState<string>("all");
  const [dropOpen, setDropOpen]         = useState(false);

  const allRatings  = properties.map((p) => p.rating);
  const avgRating   = allRatings.length ? +(allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : 0;

  const display = selectedProp === "all"
    ? { name: "All Properties", rating: avgRating, list: properties }
    : (() => { const p = properties.find((x) => x.id === selectedProp); return p ? { name: p.name, rating: p.rating, list: [p] } : { name: "All", rating: avgRating, list: properties }; })();

  const stars = (r: number) => Array.from({ length: 5 }, (_, i) => i + 1 <= Math.round(r));

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Customer Ratings</p>
          <p className="text-xs text-muted-foreground mt-0.5">Resident reviews across PGs</p>
        </div>
        <div className="relative">
          <button onClick={() => setDropOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-xl glass border border-white/10 px-2.5 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors">
            {selectedProp === "all" ? "All Properties" : properties.find((p) => p.id === selectedProp)?.name ?? "All"}
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropOpen ? "rotate-180" : ""}`} />
          </button>
          {dropOpen && (
            <div className="absolute right-0 mt-1 z-20 min-w-[170px] rounded-xl bg-card border border-white/10 shadow-xl p-1" onClick={() => setDropOpen(false)}>
              <button onClick={() => setSelectedProp("all")}
                className={`flex w-full rounded-lg px-3 py-2 text-xs transition-colors ${selectedProp === "all" ? "bg-primary/15 text-primary" : "hover:bg-white/8 text-muted-foreground"}`}>
                All Properties
              </button>
              {properties.map((p) => (
                <button key={p.id} onClick={() => setSelectedProp(p.id)}
                  className={`flex w-full rounded-lg px-3 py-2 text-xs transition-colors ${selectedProp === p.id ? "bg-primary/15 text-primary" : "hover:bg-white/8 text-muted-foreground"}`}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* big avg rating */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 shrink-0">
          <p className="text-3xl font-bold text-amber-400 tabular-nums">{display.rating}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">/ 5.0</p>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1">
            {stars(display.rating).map((filled, i) => (
              <Star key={i} className={`h-5 w-5 ${filled ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Based on resident feedback</p>
          {selectedProp === "all" && (
            <p className="text-[10px] text-muted-foreground">{properties.length} properties averaged</p>
          )}
        </div>
      </div>

      {/* per-property list */}
      <div className="space-y-2 border-t border-white/8 pt-3">
        {display.list.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{p.name}</p>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {stars(p.rating).map((filled, i) => (
                  <Star key={i} className={`h-3 w-3 ${filled ? "fill-amber-400 text-amber-400" : "text-white/15"}`} />
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-400 w-8 text-right">{p.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Overview({ onAddProperty, onAddRoom }: { onAddProperty: () => void; onAddRoom: () => void }) {
  const totalRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue;
  const totalBeds = PROPERTIES.reduce((s, p) => s + p.beds.total, 0);
  const occupiedBeds = PROPERTIES.reduce((s, p) => s + p.beds.occupied, 0);
  const overallOccupancy = Math.round((occupiedBeds / totalBeds) * 100);
  const pendingPay = PAYMENTS.filter((p) => p.status === "Pending" || p.status === "Overdue").reduce((s, p) => s + p.amount, 0);

  const TOP_STATS = [
    { label: "Total Properties",  value: PROPERTIES.length, suffix: "",  icon: Building2,  color: "from-blue-500/25 to-cyan-500/25",     text: "text-blue-400",    change: "+1 this month" },
    { label: "Occupancy Rate",    value: overallOccupancy,  suffix: "%", icon: Activity,   color: "from-primary/20 to-cyan-400/20",     text: "text-primary",     change: "+3% vs last month" },
    { label: "Monthly Revenue",   value: totalRevenue / 1000, suffix: "k", prefix: "â‚¹", icon: Wallet, color: "from-emerald-500/25 to-teal-500/25", text: "text-emerald-400", change: "+12% vs last month" },
    { label: "Pending Payments",  value: pendingPay / 1000,  suffix: "k", prefix: "â‚¹", icon: AlertCircle, color: "from-amber-500/25 to-orange-500/25", text: "text-amber-400", change: "3 residents" },
    { label: "Active Residents",  value: getStoredResidents().length,  suffix: "",  icon: Users,     color: "from-violet-500/25 to-purple-500/25", text: "text-violet-400",  change: "+2 this month" },
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
          <QuickActions onAddProperty={onAddProperty} onAddRoom={onAddRoom} />
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   2. PROPERTIES
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

type PropItem = typeof PROPERTIES[number] & { _stored?: StoredProperty };

const PROPERTY_TYPES_LIST = ["PG", "Hostel", "Co-living", "Flat Share"];
const AMENITY_LIST = [
  { id: "wifi",     label: "ðŸ“¶ WiFi" },
  { id: "food",     label: "ðŸ› Food" },
  { id: "ac",       label: "â„ï¸ AC" },
  { id: "laundry",  label: "ðŸ§º Laundry" },
  { id: "parking",  label: "ðŸš— Parking" },
  { id: "cctv",     label: "ðŸ“· CCTV" },
  { id: "power",    label: "âš¡ Power Backup" },
  { id: "security", label: "ðŸ›¡ï¸ Security" },
];

function InlineField({ label, value, onChange, icon: Icon, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  icon: React.ElementType; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
      </div>
    </div>
  );
}

function ManageDrawer({ p, onClose }: { p: PropItem; onClose: () => void }) {
  const stored = p._stored;

  /* basic fields */
  const [name,      setName]      = useState(p.name);
  const [location,  setLocation]  = useState(p.location);
  const [type,      setType]      = useState(stored?.type ?? "");
  const [rent,      setRent]      = useState(stored ? String(stored.rent) : "");
  const [totalBeds, setTotalBeds] = useState(stored ? String(stored.totalBeds) : String(p.beds.total));
  const [amenities, setAmenities] = useState<string[]>(stored?.amenities ?? []);

  /* rooms â€” same inline editor logic as add-property Step2 */
  type RoomDraft = { id: string; label: string; sharing: string; price: string; beds: string; ac: boolean };
  const initRooms = (): RoomDraft[] => {
    if (!stored) return [];
    return Object.entries(stored.rooms).filter(([, v]) => v !== null).map(([id, v]) => ({
      id,
      label:   (v as { label?: string }).label   ?? id,
      sharing: (v as { sharing?: string }).sharing ?? "",
      price:   (v as { price: string }).price,
      beds:    (v as { beds: string }).beds,
      ac:      (v as { ac: boolean }).ac,
    }));
  };
  const [rooms,   setRooms]   = useState<RoomDraft[]>(initRooms);
  const [editing, setEditing] = useState<Record<string, RoomDraft>>({});

  const toggleAmenity = (id: string) =>
    setAmenities((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);

  const addRoom = () => {
    const r: RoomDraft = { id: `r-${Date.now()}`, label: "", sharing: "", price: "", beds: "", ac: false };
    setRooms((prev) => [...prev, r]);
    setEditing((e) => ({ ...e, [r.id]: r }));
  };
  const patchDraft = (id: string, patch: Partial<RoomDraft>) =>
    setEditing((e) => ({ ...e, [id]: { ...e[id], ...patch } }));
  const commitRoom = (id: string) => {
    const d = editing[id]; if (!d) return;
    setRooms((prev) => prev.map((r) => r.id === id ? d : r));
    setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
  };
  const startEdit = (r: RoomDraft) => setEditing((e) => ({ ...e, [r.id]: { ...r } }));
  const removeRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
  };
  const pickSharing = (id: string, n: string) => {
    const draft = editing[id] ?? rooms.find((r) => r.id === id)!;
    const num = Number(n);
    const autoLabel = num === 1 ? "Single Sharing" : num === 2 ? "Double Sharing" : num === 3 ? "Triple Sharing" : `${n}-Sharing`;
    patchDraft(id, { sharing: n, label: autoLabel });
  };

  const save = () => {
    if (stored) {
      updateStoredProperty(stored.id, {
        name, location,
        type: type as StoredProperty["type"],
        rent: Number(rent),
        totalBeds: Number(totalBeds),
        amenities,
        rooms: Object.fromEntries(rooms.map((r) => [
          r.id, { price: r.price, beds: r.beds, ac: r.ac, label: r.label, sharing: r.sharing }
        ])),
      });
    }
    onClose();
  };

  const QUICK = ["1","2","3","4","5","6","8","10"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
        transition={{ ease: EASE, duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto bg-card border-l border-white/10">

        {/* sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 backdrop-blur-sm border-b border-white/8 px-6 py-4">
          <div>
            <p className="font-bold">Manage Property</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stored ? p.name : `${p.name} (read-only)`}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          {!stored && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
              This is a demo property. Add a new property via "Add Property" to enable editing.
            </div>
          )}

          {/* â”€â”€ Section 1: Basic Info â”€â”€ */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic Info</p>
            <InlineField label="Property Name" value={name} onChange={setName} icon={Building2} placeholder="e.g. Skyline Residency" />
            <InlineField label="Location / Area" value={location} onChange={setLocation} icon={MapPin} placeholder="e.g. Hitech City, Hyderabad" />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Property Type</label>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES_LIST.map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                      type === t ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <InlineField label="Starting Rent (â‚¹/month)" value={rent} onChange={setRent} icon={IndianRupee} type="number" placeholder="e.g. 6000" />
            <InlineField label="Total Beds" value={totalBeds} onChange={setTotalBeds} icon={BedDouble} type="number" placeholder="e.g. 20" />
          </div>

          {/* â”€â”€ Section 2: Room Types â”€â”€ */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Types</p>
            {rooms.map((room) => {
              const draft = editing[room.id];
              const isEdit = !!draft;
              const d = draft ?? room;
              return (
                <div key={room.id} className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                  isEdit ? "border-primary/40 bg-primary/6" : "border-white/10 bg-white/4"
                }`}>
                  {isEdit ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Persons sharing</label>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK.map((n) => (
                            <button key={n} type="button" onClick={() => pickSharing(room.id, n)}
                              className={`rounded-xl border px-2.5 py-1 text-xs font-semibold transition-all ${
                                d.sharing === n ? "border-primary/50 bg-primary/20 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                              }`}>{n}</button>
                          ))}
                          <div className="relative">
                            <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <input type="number" value={d.sharing} onChange={(e) => pickSharing(room.id, e.target.value)}
                              placeholder="custom"
                              className="w-20 rounded-xl bg-white/5 border border-white/10 pl-7 pr-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input type="text" value={d.label} onChange={(e) => patchDraft(room.id, { label: e.target.value })}
                          placeholder="Room type nameâ€¦"
                          className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <input type="number" value={d.price} onChange={(e) => patchDraft(room.id, { price: e.target.value })} placeholder="Price/mo"
                            className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                        </div>
                        <div className="relative">
                          <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <input type="number" value={d.beds} onChange={(e) => patchDraft(room.id, { beds: e.target.value })} placeholder="Beds"
                            className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                        </div>
                      </div>
                      <button type="button" onClick={() => patchDraft(room.id, { ac: !d.ac })}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all ${
                          d.ac ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"
                        }`}>
                        <span className="flex items-center gap-2"><Wind className="h-4 w-4" /> AC Room</span>
                        <div className={`relative h-5 w-9 rounded-full transition-colors ${d.ac ? "bg-primary" : "bg-white/20"}`}>
                          <motion.div animate={{ x: d.ac ? 16 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow" />
                        </div>
                      </button>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => removeRoom(room.id)}
                          className="flex-1 rounded-xl border border-red-500/20 bg-red-500/8 py-2 text-xs font-medium text-red-400 hover:bg-red-500/15">Remove</button>
                        <button type="button" disabled={!d.label || !d.sharing || !d.price || !d.beds}
                          onClick={() => commitRoom(room.id)}
                          className="flex-grow rounded-xl py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
                          style={{ background: "var(--gradient-primary)" }}>
                          <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Done
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary font-bold text-sm">{room.sharing}</div>
                          <p className="text-sm font-semibold truncate">{room.label}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => startEdit(room)}
                            className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-white/10 flex items-center gap-1">
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button type="button" onClick={() => removeRoom(room.id)}
                            className="grid h-7 w-7 place-items-center rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs text-primary font-semibold">â‚¹{Number(room.price).toLocaleString()}/mo</span>
                        <span className="rounded-lg bg-white/8 px-2.5 py-1 text-xs text-muted-foreground">{room.beds} beds</span>
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${room.ac ? "bg-primary/10 text-primary" : "bg-white/8 text-muted-foreground"}`}>{room.ac ? "â„ï¸ AC" : "Non-AC"}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={addRoom}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 py-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all">
              <Plus className="h-4 w-4" /> Add Room Type
            </button>
          </div>

          {/* â”€â”€ Section 3: Amenities â”€â”€ */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amenities</p>
            <div className="grid grid-cols-2 gap-2">
              {AMENITY_LIST.map(({ id, label }) => {
                const on = amenities.includes(id);
                return (
                  <button key={id} type="button" onClick={() => toggleAmenity(id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                      on ? "border-primary/50 bg-primary/12 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}>
                    <span>{label.split(" ")[0]}</span>
                    <span className="truncate">{label.split(" ").slice(1).join(" ")}</span>
                    {on && <CheckCircle2 className="h-3.5 w-3.5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* save button */}
          <button onClick={save} disabled={!stored}
            className="w-full rounded-xl py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--gradient-primary)" }}>
            Save All Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PropertyAnalyticsPanel({ p, onClose }: { p: PropItem; onClose: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const monthlyData = [
    { month: "Jan", rev: Math.round(p.revenue * 0.72), occ: Math.max(60, p.occupancy - 22) },
    { month: "Feb", rev: Math.round(p.revenue * 0.80), occ: Math.max(65, p.occupancy - 16) },
    { month: "Mar", rev: Math.round(p.revenue * 0.88), occ: Math.max(70, p.occupancy - 10) },
    { month: "Apr", rev: Math.round(p.revenue * 0.84), occ: Math.max(68, p.occupancy - 14) },
    { month: "May", rev: Math.round(p.revenue * 0.94), occ: Math.max(78, p.occupancy - 6) },
    { month: "Jun", rev: p.revenue,                    occ: p.occupancy },
  ];
  const maxRev = Math.max(...monthlyData.map((m) => m.rev));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
        transition={{ ease: EASE, duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto bg-card border-l border-white/10 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-base">Analytics</p>
            <p className="text-xs text-muted-foreground mt-0.5">{p.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Occupancy",    val: `${p.occupancy}%`,                       color: "text-primary",       bg: "bg-primary/10" },
            { label: "Monthly Rev",  val: `â‚¹${(p.revenue/1000).toFixed(0)}k`,      color: "text-emerald-400",   bg: "bg-emerald-500/10" },
            { label: "Total Beds",   val: String(p.beds.total),                     color: "text-violet-400",    bg: "bg-violet-500/10" },
            { label: "Vacant Beds",  val: String(p.beds.vacant),                   color: "text-amber-400",     bg: "bg-amber-500/10" },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-2xl ${bg} border border-white/8 p-4`}>
              <p className={`text-xl font-bold ${color}`}>{val}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Revenue bar chart */}
        <div className="rounded-2xl glass-strong p-5">
          <p className="text-sm font-semibold mb-1">Monthly Revenue</p>
          <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
          <div ref={ref} className="flex items-end gap-2 h-28">
            {monthlyData.map((m, i) => {
              const pct = (m.rev / maxRev) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-white/5" style={{ height: "96px" }}>
                    <motion.div className="absolute bottom-0 w-full rounded-t-lg"
                      style={{ background: "var(--gradient-primary)" }}
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${pct}%` } : { height: 0 }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }} />
                    <div className="absolute inset-x-0 bottom-full mb-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded-lg bg-card px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap">
                        â‚¹{(m.rev/1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy trend histogram */}
        <div className="rounded-2xl glass-strong p-5">
          <p className="text-sm font-semibold mb-1">Occupancy Trend</p>
          <p className="text-xs text-muted-foreground mb-4">% beds filled per month</p>
          <div className="flex items-end gap-2 h-20">
            {monthlyData.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full relative rounded-t-lg overflow-hidden bg-white/5" style={{ height: "64px" }}>
                  <motion.div className="absolute bottom-0 w-full rounded-t-lg bg-emerald-400/70"
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${m.occ}%` } : { height: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }} />
                  <div className="absolute inset-x-0 bottom-full mb-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-lg bg-card px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap">{m.occ}%</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bed breakdown donut */}
        <div className="rounded-2xl glass-strong p-5">
          <p className="text-sm font-semibold mb-4">Bed Status Breakdown</p>
          <div className="flex items-center gap-6">
            <OccupancyDonut pct={p.occupancy} />
            <div className="space-y-2.5">
              {[
                { label: "Occupied", val: p.beds.occupied, color: "bg-primary" },
                { label: "Vacant",   val: p.beds.vacant,   color: "bg-emerald-400" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                  <span className="text-sm font-semibold ml-auto pl-4">{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-2xl glass-strong p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Guest Rating</p>
            <p className="text-xs text-muted-foreground mt-0.5">Based on resident feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-bold">{p.rating}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Properties({ onAddProperty, properties, onRefresh }: { onAddProperty: () => void; properties: typeof PROPERTIES; onRefresh: () => void }) {
  const [managing,   setManaging]   = useState<PropItem | null>(null);
  const [analytics,  setAnalytics]  = useState<PropItem | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const list = properties;

  const handleDelete = (id: string) => {
    deleteStoredProperty(id);
    onRefresh();
    setConfirmDel(null);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Properties</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{list.length} properties registered</p>
        </div>
        <button onClick={onAddProperty} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:opacity-90"
          style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Add Property
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p, i) => (
          <motion.div key={p.id} variants={fadeUp}>
            <Card className="overflow-hidden group">
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

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Occupancy", value: `${p.occupancy}%` },
                    { label: "Revenue",   value: `â‚¹${(p.revenue / 1000).toFixed(0)}k` },
                    { label: "Beds",      value: `${p.beds.occupied}/${p.beds.total}` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/5 p-2.5 text-center">
                      <p className="text-sm font-semibold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.occupancy}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE, delay: i * 0.1 }} />
                </div>

                {/* actions: Manage | Analytics | Delete */}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setManaging(p)}
                    className="flex-1 rounded-xl glass py-2 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> Manage
                  </button>
                  <button onClick={() => setAnalytics(p)}
                    className="flex-1 rounded-xl glass py-2 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" /> Analytics
                  </button>
                  <button onClick={() => setConfirmDel(p.id)}
                    className="rounded-xl bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setConfirmDel(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl glass-strong border border-white/10 p-6 space-y-4 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Delete Property?</p>
                <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)}
                  className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10">Cancel</button>
                <button onClick={() => handleDelete(confirmDel)}
                  className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage drawer */}
      <AnimatePresence>
        {managing && (
          <ManageDrawer p={managing} onClose={() => { onRefresh(); setManaging(null); }} />
        )}
      </AnimatePresence>

      {/* Analytics panel */}
      <AnimatePresence>
        {analytics && (
          <PropertyAnalyticsPanel p={analytics} onClose={() => setAnalytics(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADD ROOM MODAL
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const ROOM_AMENITIES = [
  { id: "wifi",    label: "ðŸ“¶ WiFi" },
  { id: "ward",    label: "ðŸªž Wardrobe" },
  { id: "desk",    label: "ðŸ“š Study Table" },
  { id: "balc",    label: "ðŸŒ¿ Balcony" },
  { id: "tv",      label: "ðŸ“º TV" },
  { id: "geyser",  label: "ðŸš¿ Geyser" },
  { id: "fan",     label: "ðŸ’¨ Fan" },
  { id: "power",   label: "âš¡ Power Backup" },
];

const FURNISHING_OPTS = ["Fully Furnished", "Semi Furnished", "Basic"];

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
        value ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"
      }`}>
      <span>{label}</span>
      <div className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-primary" : "bg-white/20"}`}>
        <motion.div animate={{ x: value ? 16 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow" />
      </div>
    </button>
  );
}

function AddRoomModal({ onClose, onSaved, editRoom }: { onClose: () => void; onSaved: () => void; editRoom?: StoredRoom }) {
  const photoRef = useRef<HTMLInputElement>(null);
  const allProperties = [
    ...PROPERTIES.map((p) => ({ id: p.id, name: p.name })),
    ...getStoredProperties().map((p) => ({ id: p.id, name: p.name })),
  ];
  const [form, setForm] = useState({
    propertyId:  editRoom?.propertyId   ?? "",
    name:        editRoom?.name         ?? "",
    totalBeds:   editRoom ? String(editRoom.totalBeds) : "",
    availBeds:   editRoom ? String(editRoom.availBeds) : "",
    rent:        editRoom ? String(editRoom.rent)      : "",
    ac:          editRoom?.ac           ?? false,
    bath:        editRoom?.bath         ?? false,
    furnishing:  editRoom?.furnishing   ?? "",
    amenities:   editRoom?.amenities    ?? ([] as string[]),
    photos:      [] as File[],
    notes:       editRoom?.notes        ?? "",
  });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));
  const toggleAmenity = (id: string) =>
    set("amenities", form.amenities.includes(id) ? form.amenities.filter((a) => a !== id) : [...form.amenities, id]);
  const pickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).slice(0, 5 - form.photos.length);
    set("photos", [...form.photos, ...picked].slice(0, 5));
    e.target.value = "";
  };
  const canSave = !!(form.propertyId && form.name && form.totalBeds && form.availBeds && form.rent);

  const handleSave = () => {
    const propName = allProperties.find((p) => p.id === form.propertyId)?.name ?? "";
    const data = {
      propertyId: form.propertyId, propertyName: propName,
      name: form.name, totalBeds: Number(form.totalBeds), availBeds: Number(form.availBeds),
      rent: Number(form.rent), ac: form.ac, bath: form.bath, furnishing: form.furnishing,
      amenities: form.amenities, notes: form.notes,
    };
    if (editRoom) { updateStoredRoom(editRoom.id, data); }
    else          { addStoredRoom(data); }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ ease: EASE, duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[90vw] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-white/10 shadow-2xl">

        {/* sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-card border-b border-white/8 px-5 py-4">
          <div>
            <p className="font-bold text-sm">Add Room</p>
            <p className="text-xs text-muted-foreground">Fill in the room details</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* Property Selector */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Select Property</p>
            {allProperties.length === 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
                No properties registered yet. Add a property first.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {allProperties.map((p) => (
                  <button key={p.id} type="button" onClick={() => set("propertyId", p.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all ${
                      form.propertyId === p.id
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}>
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{p.name}</span>
                    {form.propertyId === p.id && <CheckCircle2 className="h-4 w-4 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</p>
            <InlineField label="Room Name / Number" value={form.name} onChange={(v) => set("name", v)}
              icon={BedDouble} placeholder="e.g. Room A-101" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Total Beds</label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => set("totalBeds", String(Math.max(1, Number(form.totalBeds) - 1)))}
                    className="h-9 w-9 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-base hover:bg-white/10 transition-colors">âˆ’</button>
                  <input type="number" value={form.totalBeds} onChange={(e) => set("totalBeds", e.target.value)}
                    placeholder="0" min={1}
                    className="flex-1 min-w-0 rounded-lg bg-white/5 border border-white/10 px-1 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button" onClick={() => set("totalBeds", String(Number(form.totalBeds) + 1))}
                    className="h-9 w-9 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-base hover:bg-white/10 transition-colors">+</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Available Beds</label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => set("availBeds", String(Math.max(0, Number(form.availBeds) - 1)))}
                    className="h-9 w-9 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-base hover:bg-white/10 transition-colors">âˆ’</button>
                  <input type="number" value={form.availBeds} onChange={(e) => set("availBeds", e.target.value)}
                    placeholder="0" min={0}
                    className="flex-1 min-w-0 rounded-lg bg-white/5 border border-white/10 px-1 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button" onClick={() => set("availBeds", String(Number(form.availBeds) + 1))}
                    className="h-9 w-9 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-base hover:bg-white/10 transition-colors">+</button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Monthly Rent (Per Bed)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input type="number" value={form.rent} onChange={(e) => set("rent", e.target.value)} placeholder="6500"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <p className="text-[10px] text-muted-foreground pl-1">Rent for one bed</p>
            </div>
          </div>

          {/* Room Features */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Room Features</p>
            <Toggle value={form.ac}   onChange={(v) => set("ac", v)}   label="â„ï¸ AC Available" />
            <Toggle value={form.bath} onChange={(v) => set("bath", v)} label="ðŸš¿ Attached Bathroom" />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Furnishing Type</label>
              <div className="grid grid-cols-3 gap-2">
                {FURNISHING_OPTS.map((f) => (
                  <button key={f} type="button" onClick={() => set("furnishing", f)}
                    className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                      form.furnishing === f ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amenities</p>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_AMENITIES.map(({ id, label }) => {
                const on = form.amenities.includes(id);
                return (
                  <button key={id} type="button" onClick={() => toggleAmenity(id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                      on ? "border-primary/50 bg-primary/12 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}>
                    <span>{label.split(" ")[0]}</span>
                    <span className="truncate">{label.split(" ").slice(1).join(" ")}</span>
                    {on && <CheckCircle2 className="h-3 w-3 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Room Photos</p>
            <button type="button" onClick={() => form.photos.length < 5 && photoRef.current?.click()}
              className={`flex w-full min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-all ${
                form.photos.length >= 5 ? "border-white/10 opacity-50 cursor-default" : "border-white/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
              }`}>
              <Upload className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{form.photos.length}/5 Â· min 1 recommended</p>
            </button>
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={pickPhotos} />
            {form.photos.length > 0 && (
              <div className="grid grid-cols-5 gap-1.5">
                {form.photos.map((f, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" alt="" />
                    <button type="button" onClick={() => set("photos", form.photos.filter((_, idx) => idx !== i))}
                      className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description / Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="e.g. Spacious room with balcony, newly renovatedâ€¦" rows={2}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10 transition-all">Cancel</button>
            <button type="button" disabled={!canSave} onClick={handleSave}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40 transition-all"
              style={{ background: "var(--gradient-primary)" }}>{editRoom ? "Update Room" : "Save Room"}</button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   3. ROOMS & BEDS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const BED_LEGEND = [
  { status: "occupied",    label: "Occupied",    color: "bg-primary" },
  { status: "vacant",      label: "Vacant",      color: "bg-emerald-400" },
  { status: "reserved",    label: "Reserved",    color: "bg-amber-400" },
  { status: "maintenance", label: "Maintenance", color: "bg-red-400" },
];

function RoomsAndBeds({ onAddRoom }: { onAddRoom: () => void }) {
  const [modalRoom, setModalRoom] = useState<StoredRoom | null | "new">(null);
  const [rooms, setRooms] = useState<StoredRoom[]>(() => getStoredRooms());
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = () => setRooms(getStoredRooms());

  const handleDelete = (id: string) => { deleteStoredRoom(id); refresh(); setConfirmDel(null); };

  const allRooms = [
    ...ROOMS.map((r) => ({ _static: r, _stored: undefined as StoredRoom | undefined })),
    ...rooms.map((r) => ({ _static: undefined, _stored: r })),
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Rooms & Beds</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{allRooms.length} rooms across all properties</p>
        </div>
        <button onClick={() => setModalRoom("new")} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      <AnimatePresence>
        {modalRoom !== null && (
          <AddRoomModal
            onClose={() => setModalRoom(null)}
            onSaved={refresh}
            editRoom={modalRoom !== "new" ? modalRoom : undefined}
          />
        )}
      </AnimatePresence>

      {/* legend */}
      <div className="flex flex-wrap gap-4">
        {BED_LEGEND.map((l) => (
          <div key={l.status} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`h-3 w-3 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* room grid â€” static + stored */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* static mock rooms */}
        {ROOMS.map((room) => (
          <motion.div key={room.id} variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-sm font-semibold">{room.id}</span>
                {room.ac && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">AC</span>}
              </div>
              <p className="text-xs text-muted-foreground">{room.property} Â· {room.type} sharing</p>

              <div className="mt-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Bed Status</p>
                <div className="flex items-center gap-3">
                  {room.beds.map((bed) => <BedDot key={bed.id} status={bed.status} />)}
                  <span className="text-xs text-muted-foreground ml-1">
                    {room.beds.filter((b) => b.status === "occupied").length}/{room.beds.length} occupied
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-sm font-semibold">â‚¹{room.price.toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal">/mo</span></span>
                <span className="text-xs text-muted-foreground">{room.sharing}-sharing</span>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => setModalRoom({ id: room.id, name: room.id, totalBeds: room.beds.length, availBeds: room.beds.filter((b) => b.status === "vacant").length, rent: room.price, ac: room.ac, bath: false, furnishing: "", amenities: [], notes: "" })}
                  className="flex-1 rounded-xl glass py-2 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1">
                  <Pencil className="h-3.5 w-3.5" /> Manage
                </button>
                <button onClick={() => setConfirmDel(room.id)}
                  className="rounded-xl bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* stored (user-added) rooms */}
        <AnimatePresence>
          {rooms.map((room) => (
            <motion.div key={room.id} variants={fadeUp}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
              <Card className="p-5">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold">{room.name}</span>
                  {room.ac && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">AC</span>}
                  {room.bath && <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">Bath</span>}
                  {room.furnishing && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{room.furnishing}</span>}
                </div>
                {(() => {
                  const n = room.totalBeds;
                  const label = n === 1 ? "Single sharing" : n === 2 ? "Double sharing" : n === 3 ? "Triple sharing" : `${n}-sharing`;
                  return <p className="text-xs text-muted-foreground">{room.propertyName ? `${room.propertyName} Â· ${label}` : label}</p>;
                })()}
                <p className="text-xs text-muted-foreground">{room.availBeds}/{room.totalBeds} beds available</p>

                <div className="mt-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Bed Status</p>
                  <div className="flex items-center gap-2 flex-wrap">
                  {Array.from({ length: room.totalBeds }).map((_, i) => (
                      <BedDot key={i} status={i < (room.totalBeds - room.availBeds) ? "occupied" : "vacant"} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      {room.totalBeds - room.availBeds}/{room.totalBeds} occupied
                    </span>
                  </div>
                </div>

                {room.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {room.amenities.slice(0, 4).map((a) => {
                      const found = ROOM_AMENITIES.find((x) => x.id === a);
                      return found ? (
                        <span key={a} className="rounded-lg bg-white/8 px-2 py-0.5 text-[10px] text-muted-foreground">{found.label.split(" ")[0]}</span>
                      ) : null;
                    })}
                    {room.amenities.length > 4 && <span className="text-[10px] text-muted-foreground">+{room.amenities.length - 4}</span>}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-semibold text-primary">â‚¹{room.rent.toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal">/mo per bed</span></span>
                  <span className="text-xs text-muted-foreground">{room.totalBeds}-sharing</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => setModalRoom(room)}
                    className="flex-1 rounded-xl glass py-2 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-1">
                    <Pencil className="h-3.5 w-3.5" /> Manage
                  </button>
                  <button onClick={() => setConfirmDel(room.id)}
                    className="rounded-xl bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* confirm delete */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDel(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl glass-strong border border-white/10 p-6 space-y-4 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400 mx-auto"><Trash2 className="h-6 w-6" /></div>
              <div>
                <p className="font-semibold">Delete Room?</p>
                <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10">Cancel</button>
                <button onClick={() => handleDelete(confirmDel)} className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   4. RESIDENTS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function AddResidentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const idRef = useRef<HTMLInputElement>(null);
  
  const allProperties = [
    ...PROPERTIES.map((p) => ({ id: p.id, name: p.name })),
    ...getStoredProperties().map((p) => ({ id: p.id, name: p.name })),
  ];

  const [form, setForm] = useState({
    name: "",
    room: "",
    property: "",
    rentType: "Monthly" as "Monthly" | "Day-wise",
    startDate: "",
    endDate: "",
    rent: "",
    food: "Veg" as StoredResident["food"],
    phone: "",
    email: "",
    idProofName: "",
    showManualRoom: false,
    isRoomDropdownOpen: false,
    advanceAmount: "",
  });

  const [roomSearch, setRoomSearch] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const pickId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) set("idProofName", f.name);
    e.target.value = "";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const canSave = !!(
    form.name &&
    form.room &&
    form.property &&
    form.rent &&
    form.phone &&
    form.email &&
    (form.rentType === "Day-wise" ? form.startDate && form.endDate : form.startDate)
  );

  const handleSave = () => {
    const moveInStr = form.rentType === "Day-wise"
      ? `${formatDate(form.startDate)} - ${formatDate(form.endDate)}`
      : formatDate(form.startDate);

    const advAmount = Number(form.advanceAmount) || 0;
    const advStatus = advAmount > 0 ? "Paid" : "Not Paid";

    addStoredResident({
      name: form.name,
      room: form.room,
      property: form.property,
      moveIn: moveInStr,
      rent: Number(form.rent),
      status: "Pending", // Default rent status to Pending
      food: form.food,
      phone: form.phone,
      email: form.email,
      idProofName: form.idProofName,
      rentType: form.rentType,
      startDate: form.startDate,
      endDate: form.endDate,
      advanceStatus: advStatus,
      advanceAmount: advAmount,
    });
    onSaved();
    onClose();
  };

  const handlePropertyChange = (propName: string) => {
    setForm((p) => ({
      ...p,
      property: propName,
      room: "",
      rent: "",
      showManualRoom: false,
      isRoomDropdownOpen: false,
    }));
    setRoomSearch("");
  };

  const getRoomsForProperty = (propertyName: string) => {
    if (!propertyName) return [];
    
    const staticPropMap: Record<string, string> = {
      "Skyline Residency": "Skyline",
      "Aurora Co-living": "Aurora",
      "Nest North": "Nest",
    };
    const staticPropName = staticPropMap[propertyName] ?? propertyName;
    
    const staticRooms = ROOMS.filter((r) => r.property === staticPropName).map((r) => {
      const totalBeds = r.beds.length;
      const occupiedBeds = r.beds.filter((b) => b.status === "occupied" || b.status === "reserved").length;
      const availBeds = totalBeds - occupiedBeds;
      return {
        id: r.id,
        name: r.id,
        totalBeds,
        availBeds,
        rent: r.price,
      };
    });

    const storedRooms = getStoredRooms().filter((r) => r.propertyName === propertyName).map((r) => ({
      id: r.id,
      name: r.name,
      totalBeds: r.totalBeds,
      availBeds: r.availBeds,
      rent: r.rent,
    }));

    return [...staticRooms, ...storedRooms];
  };

  const roomsForSelectedProperty = getRoomsForProperty(form.property);
  const filteredRooms = roomsForSelectedProperty.filter((r) =>
    r.name.toLowerCase().includes(roomSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }} transition={{ ease: EASE, duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[90vw] max-w-md max-h-[88vh] overflow-y-auto rounded-2xl bg-card border border-white/10 shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between bg-card border-b border-white/8 px-5 py-4">
          <div>
            <p className="font-bold text-sm">Add Resident</p>
            <p className="text-xs text-muted-foreground">Fill in the resident details</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* Personal Info */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Personal Info</p>
            <InlineField label="Full Name" value={form.name} onChange={(v) => set("name", v)} icon={User} placeholder="e.g. Aanya Verma" />
            <InlineField label="Email Address" type="email" value={form.email} onChange={(v) => set("email", v)} icon={Mail} placeholder="resident@email.com" />
            <InlineField label="Phone Number" type="tel" value={form.phone} onChange={(v) => set("phone", v)} icon={Phone} placeholder="9876543210" />
          </div>

          {/* Room & Property */}
          <div className="space-y-4 border-y border-white/5 py-4">
            {/* Property Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select PG Property</label>
              {allProperties.length === 0 ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
                  No properties registered yet. Add a property first.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {allProperties.map((p) => {
                    const isSelected = form.property === p.name;
                    return (
                      <button key={p.id} type="button" onClick={() => handlePropertyChange(p.name)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-medium text-left transition-all ${
                          isSelected
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}>
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.name}</span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 ml-auto shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Room Selector Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Room</label>
              
              {!form.property ? (
                <div className="rounded-xl border border-white/5 bg-white/4 px-4 py-3 text-xs text-muted-foreground text-center">
                  Select a PG property first to see available rooms.
                </div>
              ) : roomsForSelectedProperty.length === 0 ? (
                <div className="space-y-2">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
                    No rooms registered for this property. Enter room manually below.
                  </div>
                  <InlineField label="Room Number (Manual)" value={form.room} onChange={(v) => set("room", v)} icon={BedDouble} placeholder="e.g. R101" />
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="relative">
                    <button type="button" onClick={() => {
                      set("isRoomDropdownOpen", !form.isRoomDropdownOpen);
                      setRoomSearch("");
                    }}
                      className="flex w-full items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-white/10">
                      <div className="flex items-center gap-2.5 text-left truncate">
                        <BedDouble className="h-4 w-4 text-muted-foreground shrink-0" />
                        {form.room ? (
                          <span className="font-medium text-foreground">
                            {form.room} Â· {roomsForSelectedProperty.find(r => r.name === form.room) ? (
                              `${roomsForSelectedProperty.find(r => r.name === form.room)?.availBeds === 0 ? 'Full' : `${roomsForSelectedProperty.find(r => r.name === form.room)?.totalBeds! - roomsForSelectedProperty.find(r => r.name === form.room)?.availBeds!}/${roomsForSelectedProperty.find(r => r.name === form.room)?.totalBeds!} occupied`} Â· â‚¹${roomsForSelectedProperty.find(r => r.name === form.room)?.rent}`
                            ) : "Selected"}
                          </span>
                        ) : (
                          <span>Select a room...</span>
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${form.isRoomDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {form.isRoomDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1.5 z-20 max-h-[220px] overflow-y-auto rounded-xl bg-card border border-white/10 shadow-2xl p-1 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <div className="sticky top-0 z-10 bg-card p-1.5 pb-2 border-b border-white/5">
                          <input
                            type="text"
                            value={roomSearch}
                            onChange={(e) => setRoomSearch(e.target.value)}
                            placeholder="Search rooms..."
                            onClick={(e) => e.stopPropagation()}
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                          />
                        </div>
                        {filteredRooms.length === 0 ? (
                          <div className="px-3.5 py-3 text-xs text-muted-foreground text-center">
                            No matching rooms found.
                          </div>
                        ) : (
                          filteredRooms.map((r) => {
                            const isSelected = form.room === r.name;
                            const occupancyText = r.availBeds === 0 ? "Full" : `${r.totalBeds - r.availBeds}/${r.totalBeds} occupied`;
                            const isFull = r.availBeds === 0;

                            return (
                              <button key={r.id} type="button" onClick={() => {
                                setForm((p) => ({
                                  ...p,
                                  room: r.name,
                                  rent: String(r.rent),
                                  isRoomDropdownOpen: false,
                                }));
                                setRoomSearch("");
                              }}
                                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs text-left transition-all rounded-lg hover:bg-white/10 ${
                                  isSelected ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground"
                                }`}>
                                <div className="flex items-center gap-2.5 truncate">
                                  <BedDouble className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="font-semibold text-xs truncate">{r.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] shrink-0 text-muted-foreground">
                                  <span className={isFull ? "text-red-400 font-medium" : ""}>{occupancyText}</span>
                                  <span className="font-semibold">â‚¹{r.rent}</span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button type="button" onClick={() => set("showManualRoom", !form.showManualRoom)} className="text-[10px] text-primary hover:underline">
                      {form.showManualRoom ? "Hide manual input" : "Or enter room manually"}
                    </button>
                  </div>

                  {form.showManualRoom && (
                    <InlineField label="Room Number (Manual)" value={form.room} onChange={(v) => set("room", v)} icon={BedDouble} placeholder="e.g. R101" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Move-in & Rent */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Move-in & Rent</p>
            
            {/* Rent Cycle Option */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Rent Option</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Monthly", "Day-wise"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => set("rentType", t)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                      form.rentType === t
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Dates Selection based on Rent Option */}
            {form.rentType === "Day-wise" ? (
              <div className="grid grid-cols-2 gap-3">
                <InlineField label="Start Date" type="date" value={form.startDate} onChange={(v) => set("startDate", v)} icon={Calendar} />
                <InlineField label="End Date" type="date" value={form.endDate} onChange={(v) => set("endDate", v)} icon={Calendar} />
              </div>
            ) : (
              <InlineField label="Start Date" type="date" value={form.startDate} onChange={(v) => set("startDate", v)} icon={Calendar} />
            )}

            {/* Rent/Money Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {form.rentType === "Day-wise" ? "Daily Rent / Money (â‚¹)" : "Monthly Rent (â‚¹)"}
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input type="number" value={form.rent} onChange={(e) => set("rent", e.target.value)} placeholder={form.rentType === "Day-wise" ? "e.g. 500" : "e.g. 8500"}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            {/* Advance Amount */}
            <div className="space-y-1.5 pt-2.5 border-t border-white/5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advance Amount Paid (â‚¹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input type="number" value={form.advanceAmount} onChange={(e) => set("advanceAmount", e.target.value)} placeholder="e.g. 5000"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>
          </div>

          {/* Food Preference */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Food Preference</p>
            <div className="grid grid-cols-3 gap-2">
              {(["Veg", "Non-veg", "Vegan"] as const).map((f) => (
                <button key={f} type="button" onClick={() => set("food", f)}
                  className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                    form.food === f ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          {/* ID Proof */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ID Proof</p>
            <button type="button" onClick={() => idRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className={form.idProofName ? "text-primary text-xs font-medium truncate" : "text-muted-foreground text-xs truncate"}>
                {form.idProofName || "Upload Aadhaar / Passport / DL (PDF or image)"}
              </span>
            </button>
            <input ref={idRef} type="file" accept="image/*,.pdf" className="hidden" onChange={pickId} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10 transition-all">Cancel</button>
            <button type="button" disabled={!canSave} onClick={handleSave}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40 transition-all"
              style={{ background: "var(--gradient-primary)" }}>Add Resident</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Residents() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [storedResidents, setStoredResidents] = useState<StoredResident[]>(() => getStoredResidents());
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    properties: [] as string[],
    cycles: [] as string[],
    moveInStart: "",
    moveInEnd: "",
    minRent: "",
    maxRent: "",
    minAdvance: "",
    maxAdvance: "",
    advanceStatuses: [] as string[],
    rentStatuses: [] as string[],
    foods: [] as string[],
  });

  const refresh = () => setStoredResidents(getStoredResidents());

  const allResidents: (StoredResident & { _stored?: boolean })[] = storedResidents.map((r) => ({ ...r, _stored: true }));

  const uniqueProperties = Array.from(
    new Set(allResidents.map((r) => r.property).filter(Boolean))
  );

  const parseMoveInDate = (moveInStr: string): Date | null => {
    if (!moveInStr) return null;
    const firstPart = moveInStr.split(" - ")[0].trim();
    const d = new Date(firstPart);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const toggleFilter = (key: 'properties' | 'cycles' | 'advanceStatuses' | 'rentStatuses' | 'foods', value: string) => {
    setFilters((p) => {
      const arr = p[key] as string[];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...p, [key]: next };
    });
  };

  const activeFilterCount =
    filters.properties.length +
    filters.cycles.length +
    filters.advanceStatuses.length +
    filters.rentStatuses.length +
    filters.foods.length +
    (filters.moveInStart || filters.moveInEnd ? 1 : 0) +
    (filters.minRent || filters.maxRent ? 1 : 0) +
    (filters.minAdvance || filters.maxAdvance ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      properties: [],
      cycles: [],
      moveInStart: "",
      moveInEnd: "",
      minRent: "",
      maxRent: "",
      minAdvance: "",
      maxAdvance: "",
      advanceStatuses: [],
      rentStatuses: [],
      foods: [],
    });
  };

  const filtered = allResidents.filter((r) => {
    // 1. Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(searchLower) ||
      r.room.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    // 2. Property filter
    if (filters.properties.length > 0) {
      const propLower = r.property.toLowerCase();
      const matched = filters.properties.some((p) => {
        const pl = p.toLowerCase();
        return pl.includes(propLower) || propLower.includes(pl);
      });
      if (!matched) return false;
    }

    // 3. Cycle filter
    if (filters.cycles.length > 0) {
      const cycle = r.rentType || "Monthly";
      if (!filters.cycles.includes(cycle)) return false;
    }

    // 4. Move-in date filter
    if (filters.moveInStart || filters.moveInEnd) {
      const moveInDate = parseMoveInDate(r.moveIn);
      if (moveInDate) {
        if (filters.moveInStart) {
          const start = new Date(filters.moveInStart);
          if (moveInDate < start) return false;
        }
        if (filters.moveInEnd) {
          const end = new Date(filters.moveInEnd);
          end.setHours(23, 59, 59, 999);
          if (moveInDate > end) return false;
        }
      } else {
        return false;
      }
    }

    // 5. Rent filter
    if (filters.minRent && r.rent < Number(filters.minRent)) return false;
    if (filters.maxRent && r.rent > Number(filters.maxRent)) return false;

    // 6. Advance filter
    const advAmt = r.advanceAmount ?? (r.status === "Paid" ? r.rent : 0);
    if (filters.minAdvance && advAmt < Number(filters.minAdvance)) return false;
    if (filters.maxAdvance && advAmt > Number(filters.maxAdvance)) return false;

    // 7. Advance Status filter
    if (filters.advanceStatuses.length > 0) {
      const advStatus = r.advanceStatus ?? (r.status === "Paid" ? "Paid" : "Not Paid");
      if (!filters.advanceStatuses.includes(advStatus)) return false;
    }

    // 8. Rent Status filter
    if (filters.rentStatuses.length > 0) {
      if (!filters.rentStatuses.includes(r.status)) return false;
    }

    // 9. Food filter
    if (filters.foods.length > 0) {
      if (!filters.foods.includes(r.food)) return false;
    }

    return true;
  });

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Residents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{allResidents.length} active residents</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search residentsâ€¦"
                className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-48" />
            </div>
            <button onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-all ${
                activeFilterCount > 0
                  ? "border-primary/50 bg-primary/10 text-primary animate-pulse-subtle"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}>
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-primary)" }}>
              <UserPlus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] bg-white/3 border border-white/5 rounded-2xl p-3">
            <span className="text-muted-foreground mr-1">Active Filters:</span>
            {filters.properties.map((p) => (
              <span key={p} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                {p}
                <button onClick={() => toggleFilter('properties', p)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.cycles.map((c) => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                {c}
                <button onClick={() => toggleFilter('cycles', c)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.rentStatuses.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Rent: {s}
                <button onClick={() => toggleFilter('rentStatuses', s)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.advanceStatuses.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Advance: {s}
                <button onClick={() => toggleFilter('advanceStatuses', s)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.foods.map((f) => (
              <span key={f} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Food: {f}
                <button onClick={() => toggleFilter('foods', f)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {(filters.moveInStart || filters.moveInEnd) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Move-in: {filters.moveInStart ? formatDate(filters.moveInStart) : "..."} - {filters.moveInEnd ? formatDate(filters.moveInEnd) : "..."}
                <button onClick={() => setFilters(prev => ({ ...prev, moveInStart: "", moveInEnd: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {(filters.minRent || filters.maxRent) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Rent: â‚¹{filters.minRent || "0"} - â‚¹{filters.maxRent || "âˆž"}
                <button onClick={() => setFilters(prev => ({ ...prev, minRent: "", maxRent: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {(filters.minAdvance || filters.maxAdvance) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Advance: â‚¹{filters.minAdvance || "0"} - â‚¹{filters.maxAdvance || "âˆž"}
                <button onClick={() => setFilters(prev => ({ ...prev, minAdvance: "", maxAdvance: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={resetFilters} className="text-primary hover:underline font-semibold ml-2 text-[11px] transition-all">
              Clear all
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <AddResidentModal onClose={() => setShowModal(false)} onSaved={refresh} />}
      </AnimatePresence>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                {["Resident", "Room", "Cycle", "Move-in", "Rent", "Advance", "Status", "Food", "ID Proof", "Contact", ""].map((h) => (
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
                          <p className="font-medium text-foreground">{r.name}</p>
                          <p className="text-[10px] text-muted-foreground">{r.property}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{r.room}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        r.rentType === "Day-wise"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        {r.rentType || "Monthly"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs whitespace-nowrap">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" /> {r.moveIn}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary">â‚¹{r.rent.toLocaleString()}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {r.rentType === "Day-wise" ? "/ day" : "/ month"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const advAmt = r.advanceAmount ?? (r.status === "Paid" ? r.rent : 0);
                        const advStatus = r.advanceStatus ?? (r.status === "Paid" ? "Paid" : "Not Paid");
                        const isPaid = advStatus === "Paid";
                        return (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground text-xs">â‚¹{advAmt.toLocaleString()}</span>
                            <span className={`inline-flex items-center w-max rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase ${
                              isPaid
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                : "bg-slate-500/15 text-slate-400 border border-white/5"
                            }`}>
                              {advStatus}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4"><StatusPill status={r.status} /></td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        r.food === "Veg"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : r.food === "Vegan"
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {r.food}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {r.idProofName ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary max-w-[120px]" title={r.idProofName}>
                          <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate text-[11px]">{r.idProofName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">â€”</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground" title={r.phone}>
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground" title={r.email}>
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {"_stored" in r && r._stored && (
                        <button onClick={() => setConfirmDel(r.id)}
                          className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* confirm delete */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDel(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl glass-strong border border-white/10 p-6 space-y-4 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400 mx-auto"><Trash2 className="h-6 w-6" /></div>
              <div>
                <p className="font-semibold">Remove Resident?</p>
                <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10">Cancel</button>
                <button onClick={() => { deleteStoredResident(confirmDel); refresh(); setConfirmDel(null); }}
                  className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* sliding filter drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
            <motion.div
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm h-full bg-card border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <div>
                  <h3 className="font-bold text-sm">Filters</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Refine your resident directory</p>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-xs text-primary hover:underline font-medium">
                      Reset
                    </button>
                  )}
                  <button onClick={() => setIsFilterOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* 1. Property filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PG Property</label>
                  <div className="space-y-1.5">
                    {uniqueProperties.map((prop) => {
                      const isChecked = filters.properties.includes(prop);
                      return (
                        <button key={prop} type="button" onClick={() => toggleFilter('properties', prop)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{prop}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Rent Cycle */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rent Cycle</label>
                  <div className="space-y-1.5">
                    {["Monthly", "Day-wise"].map((cycle) => {
                      const isChecked = filters.cycles.includes(cycle);
                      return (
                        <button key={cycle} type="button" onClick={() => toggleFilter('cycles', cycle)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{cycle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Rent Status */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rent Status</label>
                  <div className="space-y-1.5">
                    {["Paid", "Pending", "Overdue"].map((status) => {
                      const isChecked = filters.rentStatuses.includes(status);
                      return (
                        <button key={status} type="button" onClick={() => toggleFilter('rentStatuses', status)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{status}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Advance Status */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advance Status</label>
                  <div className="space-y-1.5">
                    {["Paid", "Not Paid"].map((status) => {
                      const isChecked = filters.advanceStatuses.includes(status);
                      return (
                        <button key={status} type="button" onClick={() => toggleFilter('advanceStatuses', status)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{status}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Food Preference */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Food Preference</label>
                  <div className="space-y-1.5">
                    {["Veg", "Non-veg", "Vegan"].map((food) => {
                      const isChecked = filters.foods.includes(food);
                      return (
                        <button key={food} type="button" onClick={() => toggleFilter('foods', food)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{food}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Move-in Date Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Move-in Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Start Date</span>
                      <input type="date" value={filters.moveInStart} onChange={(e) => setFilters(prev => ({ ...prev, moveInStart: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">End Date</span>
                      <input type="date" value={filters.moveInEnd} onChange={(e) => setFilters(prev => ({ ...prev, moveInEnd: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>

                {/* 7. Rent Amount Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rent Amount Range (â‚¹)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Min" value={filters.minRent} onChange={(e) => setFilters(prev => ({ ...prev, minRent: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <input type="number" placeholder="Max" value={filters.maxRent} onChange={(e) => setFilters(prev => ({ ...prev, maxRent: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  </div>
                </div>

                {/* 8. Advance Amount Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advance Amount Range (â‚¹)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Min" value={filters.minAdvance} onChange={(e) => setFilters(prev => ({ ...prev, minAdvance: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <input type="number" placeholder="Max" value={filters.maxAdvance} onChange={(e) => setFilters(prev => ({ ...prev, maxAdvance: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/8 px-6 py-5 bg-card sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full rounded-xl py-3 text-xs font-bold text-primary-foreground shadow-glow flex items-center justify-center gap-2"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Show {filtered.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300 }}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${item.done ? "bg-emerald-500" : "bg-white/10"}`}>
                  {item.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   5. PAYMENTS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

export interface StoredPayment {
  id: string;
  residentId: string;
  residentName: string;
  propertyName: string;
  room: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  overdueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  method: string;
  installments: { date: string; amount: number; method: string }[];
}

const parseNormalizeDate = (dateStr: string | undefined): Date => {
  if (!dateStr) return new Date();
  const clean = dateStr.trim();
  
  if (clean.includes(" - ")) {
    return parseNormalizeDate(clean.split(" - ")[0]);
  }
  
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return d;
  }
  
  const parts = clean.split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    const m = months[monthStr.substring(0, 3)];
    if (m !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, m, day);
    }
  }
  
  return new Date();
};

const getStoredPayments = (residents: (StoredResident | { id: string; name: string; property: string; room: string; rent: number; status: string })[]): StoredPayment[] => {
  const KEY = "ss_payments";
  let payments: StoredPayment[] = [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      payments = JSON.parse(raw) as StoredPayment[];
    }
  } catch {}

  let modified = false;
  if (payments.length < 10) {
    payments = [];
    residents.forEach((r) => {
      const moveInDate = parseNormalizeDate(r.moveIn || r.startDate);
      const startYear = moveInDate.getFullYear();
      const startMonth = moveInDate.getMonth();
      
      const currentYear = 2026;
      const currentMonth = 5; // June (0-indexed 5)
      
      let yr = startYear;
      let m = startMonth;
      
      while (yr < currentYear || (yr === currentYear && m <= currentMonth)) {
        const monthStr = String(m + 1).padStart(2, '0');
        const dueDate = `${yr}-${monthStr}-01`;
        const overdueDate = `${yr}-${monthStr}-06`;
        
        let status: "Paid" | "Pending" | "Overdue" = "Paid";
        let paidAmount = r.rent;
        let method = "UPI";
        
        // For the latest month (June 2026), let's vary the statuses to match the mocks
        if (yr === 2026 && m === 5) {
          if (r.id === "RS2") {
            status = "Pending";
            paidAmount = 4000;
            method = "Cash";
          } else if (r.id === "RS3") {
            status = "Overdue";
            paidAmount = 0;
            method = "â€”";
          } else if (r.id === "RS6") {
            status = "Pending";
            paidAmount = 0;
            method = "â€”";
          } else {
            status = "Paid";
            paidAmount = r.rent;
            method = "UPI";
          }
        } else if (yr === 2026 && m === 4) { // May 2026
          if (r.id === "RS3") {
            status = "Overdue";
            paidAmount = 0;
            method = "â€”";
          }
        }
        
        payments.push({
          id: `PAY-${yr}-${monthStr}-${r.id}`,
          residentId: r.id,
          residentName: r.name,
          propertyName: r.property === "Skyline" ? "Skyline Residency" : r.property === "Aurora" ? "Aurora Co-living" : r.property === "Nest" ? "Nest North" : r.property,
          room: r.room,
          totalAmount: r.rent,
          paidAmount: paidAmount,
          dueDate: dueDate,
          overdueDate: overdueDate,
          status: status,
          method: method,
          installments: paidAmount > 0 ? [{ date: dueDate, amount: paidAmount, method: method }] : []
        });
        
        m++;
        if (m > 11) {
          m = 0;
          yr++;
        }
      }
    });
    modified = true;
  }

  // Check if any resident is missing from payments
  residents.forEach((r) => {
    if (!payments.some((p) => p.residentId === r.id)) {
      payments.push({
        id: `PAY-${Date.now()}-${r.id}`,
        residentId: r.id,
        residentName: r.name,
        propertyName: r.property,
        room: r.room,
        totalAmount: r.rent,
        paidAmount: 0,
        dueDate: new Date().toISOString().split("T")[0],
        overdueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Pending",
        method: "â€”",
        installments: []
      });
      modified = true;
    }
  });

  if (modified) {
    localStorage.setItem(KEY, JSON.stringify(payments));
  }
  return payments;
};

const saveStoredPayments = (payments: StoredPayment[]) => {
  localStorage.setItem("ss_payments", JSON.stringify(payments));
};

function Payments() {
  const [storedResidents, setStoredResidents] = useState<StoredResident[]>(() => getStoredResidents());
  
  const allResidents = storedResidents;

  const [payments, setPayments] = useState<StoredPayment[]>(() => getStoredPayments(allResidents));
  const [search, setSearch] = useState("");
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    properties: [] as string[],
    cycles: [] as string[],
    statuses: [] as string[],
    methods: [] as string[],
    dueStart: "",
    dueEnd: "",
    overdueStart: "",
    overdueEnd: "",
    minTotal: "",
    maxTotal: "",
    minPaid: "",
    maxPaid: "",
  });

  // Modal states
  const [collectPaymentData, setCollectPaymentData] = useState<StoredPayment | null>(null);
  const [viewHistoryData, setViewHistoryData] = useState<StoredPayment | null>(null);

  // Form states for collection
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMethod, setCollectMethod] = useState("UPI");
  const [collectDate, setCollectDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Open collection modal
  const startCollection = (p: StoredPayment) => {
    setCollectPaymentData(p);
    setCollectAmount(String(p.totalAmount - p.paidAmount));
    setCollectMethod("UPI");
    setCollectDate(new Date().toISOString().split("T")[0]);
  };

  // Save collected payment
  const handleSaveCollection = () => {
    if (!collectPaymentData) return;

    const amt = Number(collectAmount) || 0;
    if (amt <= 0) return;

    const updated = payments.map((p) => {
      if (p.id === collectPaymentData.id) {
        const nextPaid = p.paidAmount + amt;
        let nextStatus: StoredPayment["status"] = "Pending";
        if (nextPaid >= p.totalAmount) {
          nextStatus = "Paid";
        } else if (new Date() > new Date(p.overdueDate) && nextPaid < p.totalAmount) {
          nextStatus = "Overdue";
        }

        const nextInstallments = [
          ...p.installments,
          { date: collectDate, amount: amt, method: collectMethod }
        ];

        return {
          ...p,
          paidAmount: nextPaid,
          status: nextStatus,
          method: collectMethod,
          installments: nextInstallments,
        };
      }
      return p;
    });

    setPayments(updated);
    saveStoredPayments(updated);
    setCollectPaymentData(null);
  };

  const sendWhatsAppReminder = (p: StoredPayment) => {
    const pendingAmount = p.totalAmount - p.paidAmount;
    const msg = `Hi ${p.residentName}, this is a friendly reminder from StaySphere regarding your rent payment for room ${p.room} at ${p.propertyName}. Rent amount: â‚¹${p.totalAmount}. Paid: â‚¹${p.paidAmount}. Pending: â‚¹${pendingAmount}. Due date: ${p.dueDate}. Please pay your dues. Thank you!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // Dynamic filter helpers
  const uniqueProperties = Array.from(
    new Set(payments.map((p) => p.propertyName).filter(Boolean))
  );

  const toggleFilter = (key: 'properties' | 'cycles' | 'statuses' | 'methods', value: string) => {
    setFilters((p) => {
      const arr = p[key] as string[];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...p, [key]: next };
    });
  };

  const activeFilterCount =
    filters.properties.length +
    filters.cycles.length +
    filters.statuses.length +
    filters.methods.length +
    (filters.dueStart || filters.dueEnd ? 1 : 0) +
    (filters.overdueStart || filters.overdueEnd ? 1 : 0) +
    (filters.minTotal || filters.maxTotal ? 1 : 0) +
    (filters.minPaid || filters.maxPaid ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      properties: [],
      cycles: [],
      statuses: [],
      methods: [],
      dueStart: "",
      dueEnd: "",
      overdueStart: "",
      overdueEnd: "",
      minTotal: "",
      maxTotal: "",
      minPaid: "",
      maxPaid: "",
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const filteredPayments = payments.filter((p) => {
    // 1. Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch =
      p.residentName.toLowerCase().includes(searchLower) ||
      p.room.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    // Retrieve resident details to find cycle type
    const res = allResidents.find((r) => r.id === p.residentId);
    const cycle = res?.rentType || p.rentType || "Monthly";

    // 2. Property
    if (filters.properties.length > 0) {
      const propLower = p.propertyName.toLowerCase();
      const matched = filters.properties.some((filterProp) => {
        const fpl = filterProp.toLowerCase();
        return fpl.includes(propLower) || propLower.includes(fpl);
      });
      if (!matched) return false;
    }

    // 3. Cycle
    if (filters.cycles.length > 0) {
      if (!filters.cycles.includes(cycle)) return false;
    }

    // 4. Status
    if (filters.statuses.length > 0) {
      let currentStatus: string = p.status;
      if (p.paidAmount >= p.totalAmount) {
        currentStatus = "Paid";
      } else if (p.paidAmount > 0) {
        currentStatus = "Part Paid";
      } else {
        const isOverdue = p.status === "Overdue" || (p.status === "Pending" && new Date() > new Date(p.overdueDate));
        currentStatus = isOverdue ? "Overdue" : "Unpaid";
      }
      
      if (!filters.statuses.includes(currentStatus)) return false;
    }

    // 5. Method
    if (filters.methods.length > 0) {
      if (!filters.methods.includes(p.method)) return false;
    }

    // 6. Due Date Range
    if (filters.dueStart || filters.dueEnd) {
      const dDate = new Date(p.dueDate);
      if (!isNaN(dDate.getTime())) {
        if (filters.dueStart && dDate < new Date(filters.dueStart)) return false;
        if (filters.dueEnd) {
          const end = new Date(filters.dueEnd);
          end.setHours(23, 59, 59, 999);
          if (dDate > end) return false;
        }
      } else {
        return false;
      }
    }

    // 7. Overdue Date Range
    if (filters.overdueStart || filters.overdueEnd) {
      const oDate = new Date(p.overdueDate);
      if (!isNaN(oDate.getTime())) {
        if (filters.overdueStart && oDate < new Date(filters.overdueStart)) return false;
        if (filters.overdueEnd) {
          const end = new Date(filters.overdueEnd);
          end.setHours(23, 59, 59, 999);
          if (oDate > end) return false;
        }
      } else {
        return false;
      }
    }

    // 8. Total Rent Range
    if (filters.minTotal && p.totalAmount < Number(filters.minTotal)) return false;
    if (filters.maxTotal && p.totalAmount > Number(filters.maxTotal)) return false;

    // 9. Paid Amount Range
    if (filters.minPaid && p.paidAmount < Number(filters.minPaid)) return false;
    if (filters.maxPaid && p.paidAmount > Number(filters.maxPaid)) return false;

    return true;
  });

  // Dynamic Summaries
  const collected = filteredPayments.reduce((s, p) => s + p.paidAmount, 0);
  const pending = filteredPayments.reduce((s, p) => s + Math.max(0, p.totalAmount - p.paidAmount), 0);
  
  // Overdue calculation
  const overdue = filteredPayments
    .filter((p) => {
      const isOverdue = p.status === "Overdue" || (p.status === "Pending" && new Date() > new Date(p.overdueDate));
      return isOverdue && p.paidAmount < p.totalAmount;
    })
    .reduce((s, p) => s + Math.max(0, p.totalAmount - p.paidAmount), 0);
    
  const upcoming = filteredPayments.reduce((s, p) => s + p.totalAmount, 0);

  // Dynamic monthly revenue data for the chart based on active filters
  const totalExpected = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const filteredExpected = filteredPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  const scaleFactor = totalExpected > 0 ? filteredExpected / totalExpected : 0;
  const filteredCollectedJune = filteredPayments.reduce((sum, p) => sum + p.paidAmount, 0);

  const dynamicRevenue = MONTHLY_REVENUE.map((m) => {
    if (m.month === "Jun") {
      return { month: m.month, revenue: filteredCollectedJune };
    } else {
      return { month: m.month, revenue: Math.round(m.revenue * scaleFactor) };
    }
  });

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Payments</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Track rent payments and partial installments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search paymentsâ€¦"
                className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-48" />
            </div>
            <button onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-all ${
                activeFilterCount > 0
                  ? "border-primary/50 bg-primary/10 text-primary animate-pulse-subtle"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}>
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] bg-white/3 border border-white/5 rounded-2xl p-3">
            <span className="text-muted-foreground mr-1">Active Filters:</span>
            {filters.properties.map((p) => (
              <span key={p} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                {p}
                <button onClick={() => toggleFilter('properties', p)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.cycles.map((c) => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                {c}
                <button onClick={() => toggleFilter('cycles', c)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.statuses.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Status: {s}
                <button onClick={() => toggleFilter('statuses', s)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.methods.map((m) => (
              <span key={m} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Method: {m}
                <button onClick={() => toggleFilter('methods', m)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {(filters.dueStart || filters.dueEnd) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Due: {filters.dueStart ? formatDate(filters.dueStart) : "..."} - {filters.dueEnd ? formatDate(filters.dueEnd) : "..."}
                <button onClick={() => setFilters(prev => ({ ...prev, dueStart: "", dueEnd: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {(filters.overdueStart || filters.overdueEnd) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Overdue: {filters.overdueStart ? formatDate(filters.overdueStart) : "..."} - {filters.overdueEnd ? formatDate(filters.overdueEnd) : "..."}
                <button onClick={() => setFilters(prev => ({ ...prev, overdueStart: "", overdueEnd: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {(filters.minTotal || filters.maxTotal) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Rent: â‚¹{filters.minTotal || "0"} - â‚¹{filters.maxTotal || "âˆž"}
                <button onClick={() => setFilters(prev => ({ ...prev, minTotal: "", maxTotal: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {(filters.minPaid || filters.maxPaid) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Paid: â‚¹{filters.minPaid || "0"} - â‚¹{filters.maxPaid || "âˆž"}
                <button onClick={() => setFilters(prev => ({ ...prev, minPaid: "", maxPaid: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={resetFilters} className="text-primary hover:underline font-semibold ml-2 text-[11px] transition-all font-medium">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* summary cards */}
      <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Collected", value: collected, color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-400", icon: ArrowUpRight },
          { label: "Pending Dues",    value: pending,   color: "from-amber-500/20 to-orange-500/20", text: "text-amber-400",   icon: Clock },
          { label: "Overdue Amount",  value: overdue,   color: "from-red-500/20 to-rose-500/20",     text: "text-red-400",    icon: ArrowDownRight },
          { label: "Expected Revenue", value: upcoming,  color: "from-primary/15 to-cyan-500/15",     text: "text-primary",   icon: Calendar },
        ].map((c) => (
          <motion.div key={c.label} variants={fadeUp}>
            <Card className={`p-5 bg-gradient-to-br ${c.color} relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <c.icon className={`h-4 w-4 ${c.text}`} />
              </div>
              <p className={`text-2xl font-semibold ${c.text}`}>
                â‚¹<AnimCounter to={c.value} />
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
                  {["Resident & PG", "Room", "Billing / Progress", "Payment Dates", "Status", "Payment Method", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p, i) => {
                  const pendingAmount = Math.max(0, p.totalAmount - p.paidAmount);
                  const isOverdue = p.status === "Overdue" || (p.status === "Pending" && new Date() > new Date(p.overdueDate));
                  
                  // Calculate progress percentage
                  const pct = Math.min(100, Math.round((p.paidAmount / p.totalAmount) * 100)) || 0;
                  
                  return (
                    <tr key={p.id} className={`border-b border-white/5 hover:bg-white/4 transition-colors ${i === payments.length - 1 ? "border-0" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{p.residentName}</span>
                          <span className="text-[10px] text-muted-foreground">{p.propertyName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{p.room}</td>
                      <td className="px-5 py-4 min-w-[150px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-medium">
                            <span className="text-primary font-semibold">â‚¹{p.paidAmount.toLocaleString()} <span className="text-muted-foreground font-normal">paid</span></span>
                            <span className="text-muted-foreground">of â‚¹{p.totalAmount.toLocaleString()}</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-amber-500" : "bg-red-500/40"
                            }`} style={{ width: `${pct}%` }}></div>
                          </div>
                          
                          {pendingAmount > 0 && (
                            <p className="text-[9px] text-amber-400 font-medium">â‚¹{pendingAmount.toLocaleString()} remaining due</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground/75" /> Due: {p.dueDate}</span>
                          <span className="flex items-center gap-1 text-[10px] text-red-400/80 font-medium">Overdue: {p.overdueDate}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {(() => {
                          if (p.paidAmount >= p.totalAmount) {
                            return <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Paid</span>;
                          }
                          if (p.paidAmount > 0) {
                            return <span className="rounded-full border border-amber-500/20 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">Part Paid</span>;
                          }
                          return (
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              isOverdue ? "border-red-500/20 bg-red-500/15 text-red-400" : "border-amber-500/20 bg-amber-500/15 text-amber-400"
                            }`}>
                              {isOverdue ? "Overdue" : "Unpaid"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground font-medium">{p.method}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {pendingAmount > 0 ? (
                            <button onClick={() => startCollection(p)}
                              className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-sm"
                              title="Collect Due Rent">
                              <IndianRupee className="h-3.5 w-3.5" /> Collect
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                            </span>
                          )}
                          
                          {pendingAmount > 0 && (
                            <button onClick={() => sendWhatsAppReminder(p)}
                              className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-1.5 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                              title="Send WhatsApp Reminder">
                              <MessageCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          
                          {p.installments.length > 0 && (
                            <button onClick={() => setViewHistoryData(p)}
                              className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                              title="View Payment Installment Log">
                              <History className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeUp>

      {/* Collect Payment Modal */}
      <AnimatePresence>
        {collectPaymentData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setCollectPaymentData(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card border border-white/10 p-6 space-y-4">
              <div>
                <p className="font-bold text-sm">Collect Rent Payment</p>
                <p className="text-xs text-muted-foreground">Record partial/installment payments</p>
              </div>

              {/* Resident details card */}
              <div className="rounded-xl bg-white/5 border border-white/5 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resident</span>
                  <span className="font-semibold text-foreground">{collectPaymentData.residentName} ({collectPaymentData.room})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PG Property</span>
                  <span className="font-semibold text-foreground">{collectPaymentData.propertyName}</span>
                </div>
                <div className="border-t border-white/5 my-1.5"></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-semibold text-foreground">â‚¹{collectPaymentData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span className="font-semibold text-emerald-400">â‚¹{collectPaymentData.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-primary pt-1 border-t border-white/5">
                  <span>Pending Dues</span>
                  <span>â‚¹{(collectPaymentData.totalAmount - collectPaymentData.paidAmount).toLocaleString()}</span>
                </div>
              </div>

              {/* Amount to receive */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Received (â‚¹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input type="number" value={collectAmount} onChange={(e) => setCollectAmount(e.target.value)}
                    max={collectPaymentData.totalAmount - collectPaymentData.paidAmount}
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" />
                </div>
              </div>

              {/* Method select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Method</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["UPI", "Cash", "Bank", "Card"].map((m) => (
                    <button key={m} type="button" onClick={() => setCollectMethod(m)}
                      className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                        collectMethod === m
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}>{m}</button>
                  ))}
                </div>
              </div>

              {/* Date received */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Received</label>
                <input type="date" value={collectDate} onChange={(e) => setCollectDate(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setCollectPaymentData(null)}
                  className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleSaveCollection}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-all"
                  style={{ background: "var(--gradient-primary)" }}>Confirm Payment</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
        {viewHistoryData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewHistoryData(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Installment History</p>
                  <p className="text-xs text-muted-foreground">{viewHistoryData.residentName} ({viewHistoryData.room})</p>
                </div>
                <button onClick={() => setViewHistoryData(null)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1 divide-y divide-white/5">
                {viewHistoryData.installments.map((inst, index) => (
                  <div key={index} className="flex items-center justify-between text-xs py-2 first:pt-0">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">â‚¹{inst.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Via {inst.method}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {inst.date}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5">
                <button onClick={() => setViewHistoryData(null)}
                  className="w-full rounded-xl glass py-2.5 text-sm font-semibold hover:bg-white/10 transition-all text-center">
                  Close Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* sliding filter drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
            <motion.div
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm h-full bg-card border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <div>
                  <h3 className="font-bold text-sm">Filters</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Refine payment logs & charts</p>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-xs text-primary hover:underline font-medium">
                      Reset
                    </button>
                  )}
                  <button onClick={() => setIsFilterOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* 1. Property filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PG Property</label>
                  <div className="space-y-1.5">
                    {uniqueProperties.map((prop) => {
                      const isChecked = filters.properties.includes(prop);
                      return (
                        <button key={prop} type="button" onClick={() => toggleFilter('properties', prop)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{prop}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Rent Cycle */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rent Cycle</label>
                  <div className="space-y-1.5">
                    {["Monthly", "Day-wise"].map((cycle) => {
                      const isChecked = filters.cycles.includes(cycle);
                      return (
                        <button key={cycle} type="button" onClick={() => toggleFilter('cycles', cycle)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{cycle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Payment Status */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Status</label>
                  <div className="space-y-1.5">
                    {["Paid", "Part Paid", "Unpaid", "Overdue"].map((status) => {
                      const isChecked = filters.statuses.includes(status);
                      return (
                        <button key={status} type="button" onClick={() => toggleFilter('statuses', status)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{status}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Method</label>
                  <div className="space-y-1.5">
                    {["UPI", "Cash", "Bank", "Card", "â€”"].map((method) => {
                      const isChecked = filters.methods.includes(method);
                      return (
                        <button key={method} type="button" onClick={() => toggleFilter('methods', method)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{method}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Due Date Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-medium font-medium">Due Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Start</span>
                      <input type="date" value={filters.dueStart} onChange={(e) => setFilters(prev => ({ ...prev, dueStart: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">End</span>
                      <input type="date" value={filters.dueEnd} onChange={(e) => setFilters(prev => ({ ...prev, dueEnd: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>

                {/* 6. Overdue Date Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-medium font-medium">Overdue Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Start</span>
                      <input type="date" value={filters.overdueStart} onChange={(e) => setFilters(prev => ({ ...prev, overdueStart: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">End</span>
                      <input type="date" value={filters.overdueEnd} onChange={(e) => setFilters(prev => ({ ...prev, overdueEnd: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>

                {/* 7. Total Rent Amount Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-medium font-medium">Rent Amount Range (â‚¹)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Min" value={filters.minTotal} onChange={(e) => setFilters(prev => ({ ...prev, minTotal: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <input type="number" placeholder="Max" value={filters.maxTotal} onChange={(e) => setFilters(prev => ({ ...prev, maxTotal: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  </div>
                </div>

                {/* 8. Paid Amount Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-medium font-medium">Paid Amount Range (â‚¹)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Min" value={filters.minPaid} onChange={(e) => setFilters(prev => ({ ...prev, minPaid: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <input type="number" placeholder="Max" value={filters.maxPaid} onChange={(e) => setFilters(prev => ({ ...prev, maxPaid: e.target.value }))}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/8 px-6 py-5 bg-card sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full rounded-xl py-3 text-xs font-bold text-primary-foreground shadow-glow flex items-center justify-center gap-2"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Show {filteredPayments.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* revenue chart */}
      <FadeUp>
        <Card className="p-6">
          <p className="text-sm font-semibold mb-1">Revenue Analytics</p>
          <p className="text-xs text-muted-foreground">Monthly income across all properties</p>
          <RevenueChart data={dynamicRevenue} />
        </Card>
      </FadeUp>
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   6. MAINTENANCE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const MAINT_ICONS: Record<string, React.ElementType> = {
  Electrical: Zap,
  Plumbing:   Droplets,
  WiFi:       Wifi,
  Cleaning:   Home,
};

interface StoredMaintenance {
  id: string;
  title: string;
  room: string;
  property: string;
  category: string;
  status: "Open" | "Ongoing" | "Completed";
  raised: string;
  priority: "High" | "Medium" | "Low";
  targetDate?: string;
  residentName: string;
  residentPhone: string;
  residentEmail: string;
  notes?: string;
}

const getStoredMaintenance = (): StoredMaintenance[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ss_maintenance");
  let tickets: any[] = [];
  if (stored) {
    try {
      tickets = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  // Resident details lookup mapping to populate legacy entries
  const residentLookup: Record<string, { name: string; phone: string; email: string }> = {
    "R102": { name: "Aanya Verma", phone: "98765 43210", email: "aanya@email.com" },
    "R101": { name: "Rohan Iyer", phone: "91234 56789", email: "rohan@email.com" },
    "R103": { name: "Meera Khan", phone: "99887 76655", email: "meera@email.com" },
    "R202": { name: "Arjun Mehta", phone: "65432 10987", email: "arjun@email.com" },
    "R301": { name: "Sneha Reddy", phone: "76543 21098", email: "sneha@email.com" },
  };

  const defaults: StoredMaintenance[] = [
    { id: "MT001", title: "AC not cooling", room: "R102", property: "Skyline", category: "Electrical", status: "Ongoing", raised: "2026-06-02", priority: "High", residentName: "Aanya Verma", residentPhone: "98765 43210", residentEmail: "aanya@email.com", targetDate: "2026-06-10", notes: "Compressor has a gas leak." },
    { id: "MT002", title: "Tap leaking", room: "R202", property: "Aurora", category: "Plumbing", status: "Open", raised: "2026-06-03", priority: "Medium", residentName: "Arjun Mehta", residentPhone: "65432 10987", residentEmail: "arjun@email.com", notes: "Tap drips continuously." },
    { id: "MT003", title: "WiFi intermittent", room: "R101", property: "Skyline", category: "WiFi", status: "Ongoing", raised: "2026-06-01", priority: "Low", residentName: "Rohan Iyer", residentPhone: "91234 56789", residentEmail: "rohan@email.com", targetDate: "2026-06-09", notes: "Drops connection randomly." },
    { id: "MT004", title: "Tube light fused", room: "R301", property: "Nest", category: "Electrical", status: "Completed", raised: "2026-05-28", priority: "Low", residentName: "Sneha Reddy", residentPhone: "76543 21098", residentEmail: "sneha@email.com", targetDate: "2026-05-29", notes: "Replaced the light rod." },
    { id: "MT005", title: "Door lock broken", room: "R103", property: "Skyline", category: "Cleaning", status: "Open", raised: "2026-06-04", priority: "High", residentName: "Meera Khan", residentPhone: "99887 76655", residentEmail: "meera@email.com", notes: "Door does not lock from inside." }
  ];

  if (tickets.length === 0) {
    localStorage.setItem("ss_maintenance", JSON.stringify(defaults));
    return defaults;
  }

  // Ensure all existing tickets have resident details populated
  let updated = false;
  const migrated = tickets.map((t) => {
    const lookup = residentLookup[t.room] || { name: "Guest Resident", phone: "99999 99999", email: "resident@email.com" };
    const name = t.residentName || lookup.name;
    const phone = t.residentPhone || lookup.phone;
    const email = t.residentEmail || lookup.email;

    if (!t.residentName || !t.residentPhone || !t.residentEmail) {
      updated = true;
      return {
        ...t,
        residentName: name,
        residentPhone: phone,
        residentEmail: email,
      };
    }
    return t;
  });

  if (updated) {
    localStorage.setItem("ss_maintenance", JSON.stringify(migrated));
  }
  return migrated;
};

const saveStoredMaintenance = (tickets: StoredMaintenance[]) => {
  localStorage.setItem("ss_maintenance", JSON.stringify(tickets));
};

function Maintenance() {
  const [tickets, setTickets] = useState<StoredMaintenance[]>(() => getStoredMaintenance());
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    properties: [] as string[],
    categories: [] as string[],
    statuses: [] as string[],
    priorities: [] as string[],
    raisedStart: "",
    raisedEnd: "",
  });

  // Modal editing states
  const [selectedTicket, setSelectedTicket] = useState<StoredMaintenance | null>(null);
  const [editStatus, setEditStatus] = useState<StoredMaintenance["status"]>("Open");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Sync edits on ticket selection change
  useEffect(() => {
    if (selectedTicket) {
      setEditStatus(selectedTicket.status);
      setEditTargetDate(selectedTicket.targetDate || "");
      setEditNotes(selectedTicket.notes || "");
    }
  }, [selectedTicket]);

  const handleSaveChanges = () => {
    if (!selectedTicket) return;
    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: editStatus,
          targetDate: editTargetDate || undefined,
          notes: editNotes,
        };
      }
      return t;
    });
    setTickets(updated);
    saveStoredMaintenance(updated);
    setSelectedTicket(null);
  };

  const activeFilterCount =
    filters.properties.length +
    filters.categories.length +
    filters.statuses.length +
    filters.priorities.length +
    (filters.raisedStart || filters.raisedEnd ? 1 : 0);

  const toggleFilter = (key: 'properties' | 'categories' | 'statuses' | 'priorities', value: string) => {
    setFilters((p) => {
      const arr = p[key] as string[];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...p, [key]: next };
    });
  };

  const resetFilters = () => {
    setFilters({
      properties: [],
      categories: [],
      statuses: [],
      priorities: [],
      raisedStart: "",
      raisedEnd: "",
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const uniqueProperties = Array.from(
    new Set(tickets.map((t) => t.property).filter(Boolean))
  );

  const filteredTickets = tickets.filter((t) => {
    // 1. Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(searchLower) ||
      t.room.toLowerCase().includes(searchLower) ||
      t.residentName.toLowerCase().includes(searchLower) ||
      t.property.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    // 2. Property
    if (filters.properties.length > 0) {
      if (!filters.properties.includes(t.property)) return false;
    }

    // 3. Category
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(t.category)) return false;
    }

    // 4. Status (Mapped custom states)
    if (filters.statuses.length > 0) {
      const matched = filters.statuses.some((fs) => {
        if (fs === "Will be Solved") return t.status !== "Completed" && !!t.targetDate;
        if (fs === "Open") return t.status === "Open" && !t.targetDate;
        if (fs === "Ongoing") return t.status === "Ongoing";
        if (fs === "Completed") return t.status === "Completed";
        return false;
      });
      if (!matched) return false;
    }

    // 5. Priority
    if (filters.priorities.length > 0) {
      if (!filters.priorities.includes(t.priority)) return false;
    }

    // 6. Date Raised range filter
    if (filters.raisedStart || filters.raisedEnd) {
      const rDate = new Date(t.raised);
      if (!isNaN(rDate.getTime())) {
        if (filters.raisedStart && rDate < new Date(filters.raisedStart)) return false;
        if (filters.raisedEnd) {
          const end = new Date(filters.raisedEnd);
          end.setHours(23, 59, 59, 999);
          if (rDate > end) return false;
        }
      } else {
        return false;
      }
    }

    return true;
  });

  // Dynamic summaries
  const solvedCount = filteredTickets.filter((t) => t.status === "Completed").length;
  const processingCount = filteredTickets.filter((t) => t.status === "Ongoing").length;
  const willBeSolvedCount = filteredTickets.filter((t) => t.status !== "Completed" && !!t.targetDate).length;
  const openCount = filteredTickets.filter((t) => t.status === "Open" && !t.targetDate).length;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Maintenance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Click any ticket to view resident details and schedule resolution date</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticketsâ€¦"
                className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-48" />
            </div>
            <button onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-all ${
                activeFilterCount > 0
                  ? "border-primary/50 bg-primary/10 text-primary animate-pulse-subtle"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}>
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] bg-white/3 border border-white/5 rounded-2xl p-3">
            <span className="text-muted-foreground mr-1">Active Filters:</span>
            {filters.properties.map((p) => (
              <span key={p} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Property: {p}
                <button onClick={() => toggleFilter('properties', p)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.categories.map((c) => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Category: {c}
                <button onClick={() => toggleFilter('categories', c)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.statuses.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Status: {s === "Completed" ? "Solved" : s === "Ongoing" ? "On Processing" : s === "Open" ? "Open (No Date)" : s}
                <button onClick={() => toggleFilter('statuses', s)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {filters.priorities.map((p) => (
              <span key={p} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Priority: {p}
                <button onClick={() => toggleFilter('priorities', p)} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {(filters.raisedStart || filters.raisedEnd) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary">
                Raised: {filters.raisedStart ? formatDate(filters.raisedStart) : "..."} - {filters.raisedEnd ? formatDate(filters.raisedEnd) : "..."}
                <button onClick={() => setFilters(prev => ({ ...prev, raisedStart: "", raisedEnd: "" }))} className="hover:text-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={resetFilters} className="text-primary hover:underline font-semibold ml-2 text-[11px] transition-all font-medium">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* summary cards */}
      <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Solved Issues", value: solvedCount, color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-400", icon: CheckCircle2 },
          { label: "On Processing", value: processingCount, color: "from-amber-500/20 to-orange-500/20", text: "text-amber-400", icon: Clock },
          { label: "Will be Solved", value: willBeSolvedCount, color: "from-cyan-500/20 to-blue-500/20", text: "text-cyan-400", icon: Calendar },
          { label: "Open Issues", value: openCount, color: "from-red-500/20 to-rose-500/20", text: "text-red-400", icon: AlertCircle },
        ].map((c) => (
          <motion.div key={c.label} variants={fadeUp}>
            <Card className={`p-5 bg-gradient-to-br ${c.color} relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <c.icon className={`h-4 w-4 ${c.text}`} />
              </div>
              <p className={`text-2xl font-semibold ${c.text}`}>
                <AnimCounter to={c.value} />
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ticket table */}
      <FadeUp>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                  {["Ticket & ID", "Property & Room", "Raised By", "Raised Date", "Target Date", "Priority", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredTickets.map((m, i) => {
                    const Icon = MAINT_ICONS[m.category] ?? Wrench;
                    const priorityColor = m.priority === "High" ? "text-red-400 bg-red-500/10" : m.priority === "Medium" ? "text-amber-400 bg-amber-500/10" : "text-muted-foreground bg-white/5";
                    
                    return (
                      <tr key={m.id} className={`border-b border-white/5 hover:bg-white/4 transition-colors ${i === filteredTickets.length - 1 ? "border-0" : ""}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground text-xs sm:text-sm">{m.title}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{m.id} Â· {m.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium">
                          <div className="flex flex-col">
                            <span className="text-foreground">{m.property}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">Room {m.room || "Common Area"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-foreground">{m.residentName}</td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(m.raised)}</td>
                        <td className="px-5 py-4 text-xs font-medium">
                          {m.targetDate ? (
                            <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                              <Calendar className="h-3.5 w-3.5 animate-pulse" /> {formatDate(m.targetDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">â€”</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${priorityColor}`}>{m.priority}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={m.status === "Completed" ? "Solved" : m.status} />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedTicket(m)}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all shadow-sm"
                            title="Manage & Edit Ticket"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredTickets.length === 0 && (
              <div className="px-6 py-12 text-center text-xs text-muted-foreground">
                No tickets found matching the active criteria.
              </div>
            )}
          </div>
        </Card>
      </FadeUp>

      {/* Sliding Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
            <motion.div
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm h-full bg-card border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <div>
                  <h3 className="font-bold text-sm">Filters</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Refine maintenance issues</p>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-xs text-primary hover:underline font-medium">
                      Reset
                    </button>
                  )}
                  <button onClick={() => setIsFilterOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* Property filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PG Property</label>
                  <div className="space-y-1.5">
                    {uniqueProperties.map((prop) => {
                      const isChecked = filters.properties.includes(prop);
                      return (
                        <button key={prop} type="button" onClick={() => toggleFilter('properties', prop)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{prop}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category filter */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                  <div className="space-y-1.5">
                    {["Electrical", "Plumbing", "WiFi", "Cleaning", "General"].map((cat) => {
                      const isChecked = filters.categories.includes(cat);
                      return (
                        <button key={cat} type="button" onClick={() => toggleFilter('categories', cat)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status filter */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Category</label>
                  <div className="space-y-1.5">
                    {["Open", "Ongoing", "Completed", "Will be Solved"].map((st) => {
                      const isChecked = filters.statuses.includes(st);
                      return (
                        <button key={st} type="button" onClick={() => toggleFilter('statuses', st)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{st === "Completed" ? "Solved (Completed)" : st === "Ongoing" ? "On Processing (Ongoing)" : st === "Open" ? "Open (No Date)" : st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority filter */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div className="space-y-1.5">
                    {["High", "Medium", "Low"].map((pr) => {
                      const isChecked = filters.priorities.includes(pr);
                      return (
                        <button key={pr} type="button" onClick={() => toggleFilter('priorities', pr)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{pr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Raised Range */}
                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-medium">Date Raised</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Start</span>
                      <input type="date" value={filters.raisedStart} onChange={(e) => setFilters(prev => ({ ...prev, raisedStart: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">End</span>
                      <input type="date" value={filters.raisedEnd} onChange={(e) => setFilters(prev => ({ ...prev, raisedEnd: e.target.value }))}
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/8 px-6 py-5 bg-card sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full rounded-xl py-3 text-xs font-bold text-primary-foreground shadow-glow flex items-center justify-center gap-2"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Show {filteredTickets.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedTicket(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-card border border-white/10 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-thin">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono bg-white/5 rounded px-2 py-0.5 text-muted-foreground border border-white/5">{selectedTicket.id}</span>
                    <StatusPill status={selectedTicket.status === "Completed" ? "Solved" : selectedTicket.status} />
                    {selectedTicket.targetDate && (
                      <span className="rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Scheduled Solve: {formatDate(selectedTicket.targetDate)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-snug mt-1">{selectedTicket.title}</h3>
                  <p className="text-xs text-muted-foreground">Category: <span className="text-foreground font-semibold">{selectedTicket.category}</span> Â· Priority: <span className="font-semibold text-foreground">{selectedTicket.priority}</span></p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Location details */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-white/3 border border-white/5 p-4 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">PG Property</span>
                  <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" /> {selectedTicket.property}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Room Number</span>
                  <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4 text-primary" /> Room {selectedTicket.room || "Common Area"}
                  </span>
                </div>
              </div>

              {/* Raised person details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ticket Raised By</h4>
                <div className="rounded-xl bg-white/3 border border-white/5 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{selectedTicket.residentName}</p>
                      <p className="text-[10px] text-muted-foreground">Resident</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Call direct link */}
                    <a href={`tel:${selectedTicket.residentPhone}`} 
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                      title="Call Resident">
                      <Phone className="h-4 w-4" />
                    </a>
                    {/* WhatsApp link */}
                    <button onClick={() => {
                      const msg = `Hi ${selectedTicket.residentName}, this is StaySphere regarding your maintenance ticket ${selectedTicket.id} (${selectedTicket.title}).`;
                      window.open(`https://api.whatsapp.com/send?phone=${selectedTicket.residentPhone.replace(/\s+/g, '')}&text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                      title="Chat via WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    {/* Email link */}
                    <a href={`mailto:${selectedTicket.residentEmail}`}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                      title="Send Email">
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Description / Notes raised */}
              {selectedTicket.notes && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Resident Issue Description</span>
                  <div className="rounded-xl bg-white/3 border border-white/5 p-4 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.notes}
                  </div>
                </div>
              )}

              {/* Date details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-white/2 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Date Raised</span>
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/75" /> {formatDate(selectedTicket.raised)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Status Check</span>
                  <span className="text-foreground font-semibold flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground/75" /> {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Edit Details Form */}
              <div className="border-t border-white/8 pt-4 space-y-4">
                <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider">Update Ticket Status</h4>
                
                {/* Status Updation Cards */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Status</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { 
                        key: "Open", 
                        label: "Open Issue", 
                        desc: "New issue awaiting action", 
                        icon: AlertCircle, 
                        activeStyle: "border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
                        iconStyle: "text-red-400 bg-red-500/10"
                      },
                      { 
                        key: "Ongoing", 
                        label: "On Processing", 
                        desc: "Work is actively ongoing", 
                        icon: Clock, 
                        activeStyle: "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
                        iconStyle: "text-amber-400 bg-amber-500/10"
                      },
                      { 
                        key: "Completed", 
                        label: "Solved", 
                        desc: "Issue resolved successfully", 
                        icon: CheckCircle2, 
                        activeStyle: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
                        iconStyle: "text-emerald-400 bg-emerald-500/10"
                      }
                    ].map((s) => {
                      const IconComponent = s.icon;
                      const isSelected = editStatus === s.key;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setEditStatus(s.key as any)}
                          className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                            isSelected 
                              ? s.activeStyle 
                              : "border-white/10 bg-white/3 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          }`}
                        >
                          <div className={`grid h-8 w-8 place-items-center rounded-xl mb-2.5 ${isSelected ? s.iconStyle : "bg-white/5 text-muted-foreground"}`}>
                            <IconComponent className="h-4.5 w-4.5" />
                          </div>
                          <p className="text-xs font-bold text-foreground mb-1">{s.label}</p>
                          <p className="text-[9px] text-muted-foreground leading-normal max-w-[100px]">{s.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Solve Date */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Target Solve Date</span>
                    {editTargetDate && (
                      <button onClick={() => setEditTargetDate("")} className="text-[10px] text-red-400 hover:underline">Clear Date</button>
                    )}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
                    <input type="date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Expected date when issue will be solved (sets status to 'Will be Solved').</p>
                </div>

                {/* Resolution Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Resolution Notes / Action Logs</label>
                  <textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter details on electrician scheduled, parts needed, or actions taken..."
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 border-t border-white/8 pt-4">
                <button type="button" onClick={() => setSelectedTicket(null)}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 text-xs font-semibold text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveChanges}
                  className="flex-1 rounded-xl py-3 text-xs font-bold text-primary-foreground shadow-glow flex items-center justify-center gap-1"
                  style={{ background: "var(--gradient-primary)" }}>
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const normalizePropertyName = (name: string | undefined): string => {
  if (!name) return "";
  const clean = name.toLowerCase().trim();
  if (clean.includes("skyline")) return "skyline";
  if (clean.includes("aurora")) return "aurora";
  if (clean.includes("nest")) return "nest";
  return clean;
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   7. ANALYTICS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function Analytics() {
  const [selectedProperty, setSelectedProperty] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load data sources
  const [storedResidents] = useState<StoredResident[]>(() => getStoredResidents());
  const allResidents = storedResidents;
  const [payments] = useState<StoredPayment[]>(() => getStoredPayments(allResidents));
  const [tickets] = useState<StoredMaintenance[]>(() => getStoredMaintenance());

  // Date Range Filters for each graph (Default to last 5 months: Feb 2026 to June 2026)
  const [payFromDate, setPayFromDate] = useState("2026-02-01");
  const [payToDate, setPayToDate] = useState("2026-06-30");

  const [resFromDate, setResFromDate] = useState("2026-02-01");
  const [resToDate, setResToDate] = useState("2026-06-30");

  const [ticketFromDate, setTicketFromDate] = useState("2026-02-01");
  const [ticketToDate, setTicketToDate] = useState("2026-06-30");

  // Helper to generate months in selected date range
  const getMonthsInRange = (fromStr: string, toStr: string) => {
    const start = new Date(fromStr);
    const end = new Date(toStr);
    const months = [];
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [];
    }
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    
    let count = 0;
    while (current <= last && count < 24) {
      months.push({
        key: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        label: current.toLocaleString('default', { month: 'short' }) + " '" + String(current.getFullYear()).slice(-2),
        year: current.getFullYear(),
        month: current.getMonth()
      });
      current.setMonth(current.getMonth() + 1);
      count++;
    }
    return months;
  };

  // Combined property names
  const allPropertiesList = Array.from(new Set([
    ...PROPERTIES.map(p => p.name),
    ...getStoredProperties().map(p => p.name)
  ])).filter(Boolean);

  // Active Bed Occupancy dynamic calculation
  const combinedPropertiesBeds = allPropertiesList.map((propName) => {
    const mockProp = PROPERTIES.find(p => normalizePropertyName(p.name) === normalizePropertyName(propName));
    const storedProp = getStoredProperties().find(p => normalizePropertyName(p.name) === normalizePropertyName(propName));
    
    const totalBeds = mockProp ? mockProp.beds.total : (storedProp ? storedProp.totalBeds : 10);
    const occupiedBeds = allResidents.filter(r => normalizePropertyName(r.property) === normalizePropertyName(propName)).length;
    const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
    
    return {
      name: propName,
      total: totalBeds,
      occupied: occupiedBeds,
      vacant: vacantBeds
    };
  });

  const activeBedsData = selectedProperty === "All"
    ? {
        total: combinedPropertiesBeds.reduce((s, p) => s + p.total, 0),
        occupied: combinedPropertiesBeds.reduce((s, p) => s + p.occupied, 0),
        vacant: combinedPropertiesBeds.reduce((s, p) => s + p.vacant, 0),
      }
    : (() => {
        const found = combinedPropertiesBeds.find(p => normalizePropertyName(p.name) === normalizePropertyName(selectedProperty));
        return found ? { total: found.total, occupied: found.occupied, vacant: found.vacant } : { total: 0, occupied: 0, vacant: 0 };
      })();

  // 1. Rent Payments Calculations (Bar Chart Expected vs Collected)
  const payMonths = getMonthsInRange(payFromDate, payToDate);
  const filteredPayments = selectedProperty === "All" 
    ? payments 
    : payments.filter(p => normalizePropertyName(p.propertyName) === normalizePropertyName(selectedProperty));

  const barChartData = payMonths.map((m) => {
    let expected = 0;
    let collected = 0;
    
    filteredPayments.forEach((p) => {
      // Sum expected rent whose dueDate month matches
      if (p.dueDate && p.dueDate.substring(0, 7) === m.key) {
        expected += p.totalAmount;
      }
      
      // Sum collected rent based on installment transaction dates matching the month
      if (p.installments && p.installments.length > 0) {
        p.installments.forEach((inst) => {
          if (inst.date && inst.date.substring(0, 7) === m.key) {
            collected += inst.amount;
          }
        });
      } else {
        // Fallback: use dueDate if no installments logged but payment is paid/partially paid
        if (p.dueDate && p.dueDate.substring(0, 7) === m.key) {
          collected += p.paidAmount;
        }
      }
    });

    return {
      month: m.label,
      expected,
      collected,
    };
  });

  const barMaxVal = Math.max(...barChartData.flatMap(d => [d.expected, d.collected]), 1);

  // 2. Resident Growth Calculations (Line/Area Chart)
  const resMonths = getMonthsInRange(resFromDate, resToDate);
  const filteredResidents = selectedProperty === "All" 
    ? allResidents 
    : allResidents.filter(r => normalizePropertyName(r.property) === normalizePropertyName(selectedProperty));

  const lineChartData = resMonths.map((m) => {
    const startOfMonth = new Date(m.year, m.month, 1);
    const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59);
    
    // Count active residents in this month
    const activeCount = filteredResidents.filter((r) => {
      const moveIn = parseNormalizeDate(r.moveIn || r.startDate);
      const moveOut = r.endDate ? parseNormalizeDate(r.endDate) : null;
      
      const checkInBeforeEnd = moveIn <= endOfMonth;
      const checkOutAfterStart = moveOut === null || moveOut >= startOfMonth;
      
      return checkInBeforeEnd && checkOutAfterStart;
    }).length;

    return {
      month: m.label,
      count: activeCount
    };
  });

  const lineMaxVal = Math.max(...lineChartData.map(d => d.count), 1);

  // Construct SVG spline path and area under the line dynamically
  const N = lineChartData.length;
  const paddingX = 40;
  const startY = 160;
  const chartHeight = 120;

  let splinePath = "";
  let splineArea = "";
  let splinePoints: { x: number; y: number; month: string; count: number }[] = [];

  if (N > 0) {
    const spacing = N > 1 ? (500 - 2 * paddingX) / (N - 1) : 0;
    splinePoints = lineChartData.map((val, i) => {
      const x = paddingX + i * spacing;
      const y = startY - (val.count / lineMaxVal) * chartHeight;
      return { x, y, month: val.month, count: val.count };
    });

    splinePath = splinePoints.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = splinePoints[i - 1];
      const spacingVal = p.x - prev.x;
      const cpX1 = prev.x + spacingVal / 2;
      const cpY1 = prev.y;
      const cpX2 = p.x - spacingVal / 2;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, "");

    const firstPt = splinePoints[0];
    const lastPt = splinePoints[N - 1];
    splineArea = `${splinePath} L ${lastPt.x} ${startY} L ${firstPt.x} ${startY} Z`;
  }

  // 3. Complaints Histogram Calculations (Horizontal frequency distribution by Category & Date Filter)
  const ticketFromDateObj = new Date(ticketFromDate);
  const ticketToDateObj = new Date(ticketToDate);
  ticketFromDateObj.setHours(0, 0, 0, 0);
  ticketToDateObj.setHours(23, 59, 59, 999);

  const filteredTickets = (selectedProperty === "All" 
    ? tickets 
    : tickets.filter(t => normalizePropertyName(t.property) === normalizePropertyName(selectedProperty)))
    .filter((t) => {
      const raisedDate = parseNormalizeDate(t.raised);
      return raisedDate >= ticketFromDateObj && raisedDate <= ticketToDateObj;
    });

  const categoryCounts = {
    Electrical: 0,
    Plumbing:   0,
    WiFi:       0,
    Cleaning:   0,
    General:    0,
  };

  filteredTickets.forEach((t) => {
    const cat = t.category;
    if (cat in categoryCounts) {
      categoryCounts[cat as keyof typeof categoryCounts]++;
    } else {
      categoryCounts.General++;
    }
  });

  const totalTicketsCount = filteredTickets.length;

  const histogramData = [
    { category: "Electrical", count: categoryCounts.Electrical, icon: Zap,      color: "bg-red-500 bg-gradient-to-r from-red-500 to-rose-500" },
    { category: "Plumbing",   count: categoryCounts.Plumbing,   icon: Droplets, fill: "#3b82f6", color: "bg-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500" },
    { category: "WiFi",       count: categoryCounts.WiFi,       icon: Wifi,     color: "bg-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-500" },
    { category: "Cleaning",   count: categoryCounts.Cleaning,   icon: Home,     color: "bg-amber-500 bg-gradient-to-r from-amber-500 to-orange-500" },
    { category: "General",    count: categoryCounts.General,    icon: Wrench,   color: "bg-purple-500 bg-gradient-to-r from-purple-500 to-violet-500" },
  ];

  const inViewRef = useRef(null);
  const inView = useInView(inViewRef, { once: true });

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Performance charts filtered by PG Property</p>
        </div>

        {/* Property Filter Dropdown */}
        <div className="relative shrink-0">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-white/10 hover:text-foreground transition-all">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Property: {selectedProperty === "All" ? "All Properties" : selectedProperty}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-white/10 shadow-2xl p-1.5 z-20 space-y-0.5 backdrop-blur-md">
                <button onClick={() => { setSelectedProperty("All"); setIsDropdownOpen(false); }}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    selectedProperty === "All" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}>
                  All Properties
                </button>
                {allPropertiesList.map((propName) => (
                  <button key={propName} onClick={() => { setSelectedProperty(propName); setIsDropdownOpen(false); }}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      selectedProperty === propName ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}>
                    {propName}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Bar Chart: Rent Collections & Dues */}
        <FadeUp>
          <Card className="p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Rent Payments & Dues (Bar Chart)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Expected Revenue vs. Actual Rent Collections</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-muted-foreground font-medium">Range:</span>
                <input
                  type="date"
                  value={payFromDate}
                  onChange={(e) => setPayFromDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer text-[10px]"
                />
                <span className="text-muted-foreground">â€”</span>
                <input
                  type="date"
                  value={payToDate}
                  onChange={(e) => setPayToDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer text-[10px]"
                />
              </div>
            </div>
            
            {barChartData.length === 0 ? (
              <div className="h-48 mt-6 flex flex-col justify-center items-center text-center text-xs text-muted-foreground">
                <p>No monthly data in this range.</p>
                <p className="mt-1">Adjust the date filters to see analytics.</p>
              </div>
            ) : (
              <div className="w-full mt-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 min-w-[320px]">
                  {barChartData.map((m, i) => {
                    const expPct = (m.expected / barMaxVal) * 100;
                    const colPct = (m.collected / barMaxVal) * 100;
                    
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="w-full flex items-end justify-center gap-1.5 h-[140px] relative">
                          {/* Expected Rent Bar */}
                          <div className="w-2.5 sm:w-4 rounded-t bg-white/5 relative h-full flex items-end">
                            <motion.div
                              className="w-full rounded-t"
                              style={{ background: "var(--gradient-primary)" }}
                              initial={{ height: 0 }}
                              animate={{ height: `${expPct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.05, ease: EASE }}
                            />
                          </div>
                          
                          {/* Collected Rent Bar */}
                          <div className="w-2.5 sm:w-4 rounded-t bg-white/5 relative h-full flex items-end">
                            <motion.div
                              className="w-full rounded-t bg-emerald-500 bg-gradient-to-t from-emerald-600 to-teal-400"
                              initial={{ height: 0 }}
                              animate={{ height: `${colPct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.05 + 0.02, ease: EASE }}
                            />
                          </div>

                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <div className="rounded-xl bg-card border border-white/10 p-2 text-[10px] space-y-0.5 shadow-xl text-left min-w-[110px]">
                              <p className="font-bold text-foreground mb-0.5">{m.month} Summary</p>
                              <p className="text-primary font-medium">Expected: â‚¹{(m.expected / 1000).toFixed(1)}k</p>
                              <p className="text-emerald-400 font-medium">Collected: â‚¹{(m.collected / 1000).toFixed(1)}k</p>
                              <p className="text-muted-foreground border-t border-white/5 pt-0.5 mt-0.5">
                                Rate: {m.expected > 0 ? Math.round((m.collected / m.expected) * 100) : 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] mt-4 border-t border-white/5 pt-3 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: "var(--gradient-primary)" }} />
                <span className="text-muted-foreground">Expected Rent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-muted-foreground">Collected Rent</span>
              </div>
            </div>
          </Card>
        </FadeUp>

        {/* 2. Line Chart: Resident Growth */}
        <FadeUp delay={0.05}>
          <Card className="p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Resident Growth (Line/Area Chart)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tenant growth curves over time</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-muted-foreground font-medium">Range:</span>
                <input
                  type="date"
                  value={resFromDate}
                  onChange={(e) => setResFromDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer text-[10px]"
                />
                <span className="text-muted-foreground">â€”</span>
                <input
                  type="date"
                  value={resToDate}
                  onChange={(e) => setResToDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer text-[10px]"
                />
              </div>
            </div>

            {lineChartData.length === 0 ? (
              <div className="h-48 mt-6 flex flex-col justify-center items-center text-center text-xs text-muted-foreground">
                <p>No monthly data in this range.</p>
                <p className="mt-1">Adjust the date filters to see analytics.</p>
              </div>
            ) : (
              <div className="h-48 mt-4 relative w-full flex justify-center items-center">
                <svg viewBox="0 0 500 200" className="h-full w-full">
                  <defs>
                    {/* Line Gradient */}
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    {/* Area Fill Gradient */}
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* SVG Grid Lines */}
                  {[0.25, 0.5, 0.75].map((yPct, idx) => (
                    <line key={idx} x1={paddingX} y1={40 + idx * 40} x2={500 - paddingX} y2={40 + idx * 40}
                      stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                  ))}

                  {/* Spline Area under the line */}
                  {splineArea && (
                    <motion.path
                      d={splineArea}
                      fill="url(#areaGrad)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  )}

                  {/* Spline Line Path */}
                  {splinePath && (
                    <motion.path
                      d={splinePath}
                      stroke="url(#lineGrad)"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                  )}

                  {/* Vertices/Circles */}
                  {splinePoints.map((pt, i) => (
                    <g key={pt.month} className="group cursor-pointer relative">
                      <motion.circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5.5"
                        fill="#a855f7"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: i * 0.05, stiffness: 200 }}
                        whileHover={{ scale: 1.6 }}
                      />
                      {/* Tooltip on SVG overlay */}
                      <title>{`${pt.month}: ${pt.count} Residents`}</title>
                    </g>
                  ))}

                  {/* X Axis Labels */}
                  {splinePoints.map((pt) => (
                    <text key={pt.month} x={pt.x} y="192" fill="#94a3b8" fontSize="10.5"
                      textAnchor="middle" fontWeight="600">{pt.month}</text>
                  ))}
                </svg>
              </div>
            )}

            {/* Line Legend */}
            <div className="flex items-center gap-1.5 text-[10px] mt-4 border-t border-white/5 pt-3 justify-center">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Total Residents Occupancy</span>
            </div>
          </Card>
        </FadeUp>

        {/* 3. Complaints Category Histogram */}
        <FadeUp delay={0.1}>
          <Card className="p-6 flex flex-col justify-between" ref={inViewRef}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Complaints Category (Histogram)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Frequency distribution of maintenance tickets</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-muted-foreground font-medium">Range:</span>
                <input
                  type="date"
                  value={ticketFromDate}
                  onChange={(e) => setTicketFromDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer text-[10px]"
                />
                <span className="text-muted-foreground">â€”</span>
                <input
                  type="date"
                  value={ticketToDate}
                  onChange={(e) => setTicketToDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer text-[10px]"
                />
              </div>
            </div>

            {totalTicketsCount === 0 ? (
              <div className="h-[210px] flex flex-col justify-center items-center text-center text-xs text-muted-foreground">
                <p>No complaints logged in this range.</p>
                <p className="mt-1">Adjust the date filters to see analytics.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                {histogramData.map((h, i) => {
                  const CategoryIcon = h.icon;
                  const pct = totalTicketsCount > 0 ? Math.round((h.count / totalTicketsCount) * 100) : 0;
                  
                  return (
                    <div key={h.category} className="flex items-center gap-3">
                      <div className="grid h-7.5 w-7.5 place-items-center rounded-lg bg-white/5 text-muted-foreground shrink-0 border border-white/5">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                          <span>{h.category}</span>
                          <span className="text-muted-foreground text-[11px] font-medium">{h.count} tickets ({pct}%)</span>
                        </div>
                        
                        {/* Progress bar representing histogram bin */}
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${h.color}`}
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${pct}%` } : { width: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Histogram footer summary */}
            <div className="text-[10px] text-muted-foreground text-center mt-6 border-t border-white/5 pt-3">
              Total Complaints Logged: <span className="font-bold text-foreground">{totalTicketsCount} tickets</span>
            </div>
          </Card>
        </FadeUp>

        {/* 4. Occupancy Summary Card */}
        <FadeUp delay={0.15}>
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Occupancy Overview</p>
              <p className="text-xs text-muted-foreground mt-0.5">Beds status breakdown for {selectedProperty === "All" ? "all properties" : selectedProperty}</p>
            </div>

            <div className="flex items-center gap-8 mt-5">
              <OccupancyDonut pct={activeBedsData.total > 0 ? Math.round((activeBedsData.occupied / activeBedsData.total) * 100) : 0} />
              <div className="space-y-3 flex-1">
                {[
                  { label: "Occupied",    val: activeBedsData.occupied, color: "bg-primary" },
                  { label: "Vacant",      val: activeBedsData.vacant,   color: "bg-emerald-400" },
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

            <div className="text-[10px] text-muted-foreground text-center mt-6 border-t border-white/5 pt-3">
              {selectedProperty === "All" ? "Aggregated Bed Capacity" : `Total Capacity of ${selectedProperty}`}: <span className="font-bold text-foreground">{activeBedsData.total} beds</span>
            </div>
          </Card>
        </FadeUp>
      </div>
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   8. COMMUNITY
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function Community() {
  const [announcements, setAnnouncements] = useState<StoredAnnouncement[]>(() => getStoredAnnouncements());
  const [notices, setNotices] = useState<string[]>(() => getStoredNotices());
  const [polls, setPolls] = useState<StoredPoll[]>(() => getStoredPolls());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [property, setProperty] = useState("All");

  const getInitialDateTime = (offsetHours = 0) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    d.setMinutes(0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
  };

  const [startDate, setStartDate] = useState(() => getInitialDateTime());
  const [endDate, setEndDate] = useState(() => getInitialDateTime(24));

  // Notice modal states
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNoticeText, setNewNoticeText] = useState("");

  // Poll modal states
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const [storedProperties] = useState<StoredProperty[]>(() => getStoredProperties());
  const allPropertiesList = Array.from(new Set([
    ...PROPERTIES.map(p => p.name),
    ...storedProperties.map(p => p.name)
  ])).filter(Boolean);

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", { 
      day: "numeric", 
      month: "short", 
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    
    const formattedRange = `${formatDateStr(startDate)} - ${formatDateStr(endDate)}`;
    
    const newAnn: StoredAnnouncement = {
      id: `AN-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      property,
      startDate,
      endDate,
      dateStr: formattedRange
    };
    
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem("ss_announcements", JSON.stringify(updated));
    
    // reset form
    setTitle("");
    setBody("");
    setProperty("All");
    setStartDate(getInitialDateTime());
    setEndDate(getInitialDateTime(24));
    setIsModalOpen(false);
  };

  const handleSaveNotice = () => {
    if (!newNoticeText.trim()) return;
    const updated = [newNoticeText.trim(), ...notices];
    setNotices(updated);
    localStorage.setItem("ss_notice_board", JSON.stringify(updated));
    setNewNoticeText("");
    setIsNoticeModalOpen(false);
  };

  const handleSavePoll = () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) return;
    
    const newPoll: StoredPoll = {
      id: `poll-${Date.now()}`,
      question: pollQuestion.trim(),
      options: pollOptions.filter(o => o.trim()).map(opt => ({ text: opt.trim(), votes: 0 }))
    };
    
    const updated = [newPoll, ...polls];
    setPolls(updated);
    localStorage.setItem("ss_polls", JSON.stringify(updated));
    
    // reset form
    setPollQuestion("");
    setPollOptions(["", ""]);
    setIsPollModalOpen(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem("ss_announcements", JSON.stringify(updated));
  };

  const handleDeleteNotice = (idxToDelete: number) => {
    const updated = notices.filter((_, idx) => idx !== idxToDelete);
    setNotices(updated);
    localStorage.setItem("ss_notice_board", JSON.stringify(updated));
  };

  const handleDeletePoll = (id: string) => {
    const updated = polls.filter(p => p.id !== id);
    setPolls(updated);
    localStorage.setItem("ss_polls", JSON.stringify(updated));
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Community</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Announcement
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FadeUp>
          <Card className="p-5">
            <p className="text-sm font-semibold mb-4">ðŸ“¢ Announcements</p>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No announcements published yet.
                </div>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="rounded-xl bg-white/5 p-4 border border-white/8 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">
                          {a.property === "All" ? "All Properties" : a.property}
                        </span>
                        <button
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          className="rounded-lg p-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                          title="Delete Announcement"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
                    <p className="text-[10px] text-muted-foreground/60 pt-1 border-t border-white/5 mt-2">Active: {a.dateStr}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <p className="text-sm font-semibold">ðŸ“… Notice Board</p>
                <button
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 px-2 py-1 text-[10px] font-semibold text-primary transition-all"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {notices.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No notices posted.</p>
                ) : (
                  notices.map((n, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 py-2.5 border-b border-white/5 last:border-0 group">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary mt-1.5" />
                        <span className="text-xs text-foreground/90 leading-relaxed">{n}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteNotice(idx)}
                        className="rounded-lg p-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Notice"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <p className="text-sm font-semibold">ðŸ“Š Quick Poll</p>
                <button
                  onClick={() => setIsPollModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 px-2 py-1 text-[10px] font-semibold text-primary transition-all"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              
              {polls.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No active polls.</p>
              ) : (
                (() => {
                  const activePoll = polls[0];
                  const total = activePoll.options.reduce((s, o) => s + o.votes, 0) || 1;
                  return (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-foreground/95 font-medium">{activePoll.question}</p>
                        <button
                          onClick={() => handleDeletePoll(activePoll.id)}
                          className="rounded-lg p-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                          title="Delete Poll"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {activePoll.options.map((opt) => {
                          const pct = Math.round((opt.votes / total) * 100);
                          return (
                            <div key={opt.text} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                              <span className="text-xs text-foreground/80">{opt.text}</span>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-primary/20 overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground w-6 text-right">{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 text-right">
                        Total votes: {activePoll.options.reduce((s, o) => s + o.votes, 0)}
                      </p>
                    </div>
                  );
                })()
              )}
            </Card>
          </div>
        </FadeUp>
      </div>

      {/* Add Announcement Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl space-y-4 text-left relative z-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-semibold text-foreground">New Announcement</h3>
                <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description / Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter announcement description..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all resize-none"
                  />
                </div>

                {/* Target Property */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Target Property</label>
                  <select
                    value={property}
                    onChange={(e) => setProperty(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
                  >
                    <option value="All">All Properties</option>
                    {allPropertiesList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Date range inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !body.trim()}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Publish Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Notice Modal */}
      <AnimatePresence>
        {isNoticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="fixed inset-0" onClick={() => setIsNoticeModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl space-y-4 text-left relative z-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-semibold text-foreground">Add Notice to Board</h3>
                <button onClick={() => setIsNoticeModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Notice Text</label>
                <textarea
                  value={newNoticeText}
                  onChange={(e) => setNewNoticeText(e.target.value)}
                  placeholder="e.g. Water tank cleaning â€” Sunday 8am"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotice}
                  disabled={!newNoticeText.trim()}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Post Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Poll Modal */}
      <AnimatePresence>
        {isPollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="fixed inset-0" onClick={() => setIsPollModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl space-y-4 text-left relative z-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-semibold text-foreground">Create New Poll</h3>
                <button onClick={() => setIsPollModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Poll Question</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="e.g. When should we hold the community meet?"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Options (Min 2)</label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {pollOptions.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...pollOptions];
                            newOpts[index] = e.target.value;
                            setPollOptions(newOpts);
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:bg-white/8 transition-all"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== index))}
                            className="rounded-lg p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors pt-1"
                  >
                    <Plus className="h-3 w-3" /> Add Option
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => setIsPollModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePoll}
                  disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Create Poll
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   9. DOCUMENTS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function Documents() {
  const [search, setSearch] = useState("");
  const [storedResidents, setStoredResidents] = useState<StoredResident[]>(() => getStoredResidents());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<StoredResident | null>(null);

  const [filters, setFilters] = useState({
    properties: [] as string[],
    proofStatus: [] as string[], // "Uploaded" | "Pending"
    stayTypes: [] as string[], // "Monthly" | "Day-wise"
  });

  const refresh = () => setStoredResidents(getStoredResidents());

  // Metrics
  const totalResidents = storedResidents.length;
  const providedProofs = storedResidents.filter((r) => r.idProofName).length;
  const missingProofs = totalResidents - providedProofs;
  const submissionRate = totalResidents ? Math.round((providedProofs / totalResidents) * 100) : 0;

  const uniqueProperties = Array.from(
    new Set(storedResidents.map((r) => r.property).filter(Boolean))
  );

  const toggleFilter = (key: 'properties' | 'proofStatus' | 'stayTypes', value: string) => {
    setFilters((p) => {
      const arr = p[key] as string[];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...p, [key]: next };
    });
  };

  const activeFilterCount =
    filters.properties.length +
    filters.proofStatus.length +
    filters.stayTypes.length;

  const resetFilters = () => {
    setFilters({
      properties: [],
      proofStatus: [],
      stayTypes: [],
    });
  };

  // Filtered residents list
  const filtered = storedResidents.filter((r) => {
    // Search
    const searchLower = search.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(searchLower) ||
      (r.property && r.property.toLowerCase().includes(searchLower)) ||
      r.room.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    // Property
    if (filters.properties.length > 0) {
      if (!filters.properties.includes(r.property)) return false;
    }

    // Proof Status
    if (filters.proofStatus.length > 0) {
      const status = r.idProofName ? "Uploaded" : "Pending";
      if (!filters.proofStatus.includes(status)) return false;
    }

    // Stay Type
    if (filters.stayTypes.length > 0) {
      const stayType = r.rentType || "Monthly";
      if (!filters.stayTypes.includes(stayType)) return false;
    }

    return true;
  });

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      {/* 4 Glassmorphic Metric Cards */}
      <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Residents", value: totalResidents, suffix: "", icon: Users, color: "from-blue-500/20 to-cyan-500/20", text: "text-blue-400", change: "Active directory records" },
          { label: "Provided Proofs", value: providedProofs, suffix: "", icon: FileCheck, color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-400", change: "Verified submissions" },
          { label: "Missing Documents", value: missingProofs, suffix: "", icon: AlertCircle, color: "from-rose-500/20 to-pink-500/20", text: "text-rose-400", change: "Pending verification" },
          { label: "Submission Rate", value: submissionRate, suffix: "%", icon: Activity, color: "from-primary/20 to-cyan-400/20", text: "text-primary", change: "Target: 100% compliance" }
        ].map((s) => (
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
                  <AnimCounter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.change}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Verification Documents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} residents shown</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, room or PGâ€¦"
                className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64" 
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-all ${
                activeFilterCount > 0
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dismissible Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {filters.properties.map((p) => (
              <span key={p} className="flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                <span>{p}</span>
                <button onClick={() => toggleFilter('properties', p)} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.proofStatus.map((s) => (
              <span key={s} className="flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                <span>{s} ID Proof</span>
                <button onClick={() => toggleFilter('proofStatus', s)} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.stayTypes.map((t) => (
              <span key={t} className="flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                <span>{t} Stay</span>
                <button onClick={() => toggleFilter('stayTypes', t)} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline pl-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Residents Documents Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/35" />
              <p className="text-sm font-medium">No residents match the active query or filter criteria</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                  {["Resident", "Property & Room", "Stay Type", "Move-In Date", "ID Proof Name", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((r, i) => (
                    <motion.tr 
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }} 
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.04 }}
                      className={`border-b border-white/5 hover:bg-white/4 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-primary-foreground"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs text-foreground font-medium">{r.property}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">Room {r.room}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          r.rentType === "Day-wise"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {r.rentType || "Monthly"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs whitespace-nowrap">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>{r.moveIn}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {r.idProofName ? (
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium truncate max-w-[180px]" title={r.idProofName}>
                            <FileText className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                            <span className="truncate">{r.idProofName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-red-400/80 font-medium">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500/60" />
                            <span>Missing Proof</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {r.idProofName ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/20">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewDoc(r)} title="View" className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors">
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button onClick={() => setConfirmDel(r.id)} title="Delete" className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDel(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-xs rounded-2xl glass-strong border border-white/10 p-6 space-y-4 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400 mx-auto"><Trash2 className="h-6 w-6" /></div>
              <div><p className="font-semibold">Delete Resident Record?</p><p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p></div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10">Cancel</button>
                <button onClick={() => { deleteStoredResident(confirmDel!); refresh(); setConfirmDel(null); }} className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View document modal */}
      <AnimatePresence>
        {viewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewDoc(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl glass-strong border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between"><p className="font-semibold">Document Details</p><button onClick={() => setViewDoc(null)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button></div>
              <div className="space-y-2.5">
                {([['Resident', viewDoc.name], ['Email', viewDoc.email], ['Property', viewDoc.property], ['Room', viewDoc.room], ['Stay Type', viewDoc.rentType || 'Monthly'], ['Move-In', viewDoc.moveIn]] as [string, string][]).map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5"><span className="text-xs text-muted-foreground">{label}</span><span className="text-sm font-medium">{val}</span></div>
                ))}
              </div>
              <div className="rounded-xl bg-white/5 flex items-center justify-center h-28 gap-2 text-muted-foreground">
                {viewDoc.idProofName ? <><FileText className="h-7 w-7 opacity-40" /><span className="text-xs">{viewDoc.idProofName}</span></> : <span className="text-xs">No document uploaded</span>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* sliding filter drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
            <motion.div
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm h-full bg-card border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <div>
                  <h3 className="font-bold text-sm">Document Filters</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Filter by property, status, or stay</p>
                </div>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-xs text-primary hover:underline font-medium">
                      Reset
                    </button>
                  )}
                  <button onClick={() => setIsFilterOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* 1. Property filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PG Property</label>
                  <div className="space-y-1.5">
                    {uniqueProperties.map((prop) => {
                      const isChecked = filters.properties.includes(prop);
                      return (
                        <button key={prop} type="button" onClick={() => toggleFilter('properties', prop)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground font-medium font-medium">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{prop}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. ID Proof Status filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID Proof Status</label>
                  <div className="space-y-1.5">
                    {[
                      { key: "Uploaded", label: "Provided ID Proof (Uploaded)" },
                      { key: "Pending", label: "Missing ID Proof (Pending)" },
                    ].map((item) => {
                      const isChecked = filters.proofStatus.includes(item.key);
                      return (
                        <button key={item.key} type="button" onClick={() => toggleFilter('proofStatus', item.key)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground font-medium">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Stay Type filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stay Type</label>
                  <div className="space-y-1.5">
                    {[
                      { key: "Monthly", label: "Monthly Stay" },
                      { key: "Day-wise", label: "Day-wise Stay" },
                    ].map((item) => {
                      const isChecked = filters.stayTypes.includes(item.key);
                      return (
                        <button key={item.key} type="button" onClick={() => toggleFilter('stayTypes', item.key)}
                          className="flex items-center gap-2.5 w-full py-1 text-left text-xs transition-colors hover:text-foreground text-muted-foreground font-medium font-medium">
                          <div className={`grid h-4 w-4 place-items-center rounded border transition-all ${
                            isChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5"
                          }`}>
                            {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="border-t border-white/8 p-6">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full rounded-xl py-3 text-center text-xs font-semibold text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   10. SETTINGS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SIDEBAR
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TOPBAR
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function Topbar({ active, collapsed, onProfile }: { active: string; collapsed: boolean; onProfile: () => void }) {
  const navigate = useNavigate();
  const current = NAV.find((n) => n.id === active);
  const session = getSession();
  const name = session?.name ?? "Owner";
  const email = session?.email ?? "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    clearSession();
    navigate({ to: "/auth" });
  }

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

        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl glass px-3 py-2 hover:bg-white/10 transition-colors"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold text-primary-foreground shrink-0"
              style={{ background: "var(--gradient-primary)" }}>{initials}</div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium">{name}</p>
              <p className="text-[10px] text-muted-foreground">PG Owner</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl bg-card border border-white/10 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-4 border-b border-white/8 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-primary-foreground shrink-0"
                  style={{ background: "var(--gradient-primary)" }}>{initials}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{email}</p>
                  <span className="inline-flex items-center mt-0.5 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">PG Owner</span>
                </div>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button onClick={() => { setProfileOpen(false); onProfile(); }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors">
                  <User className="h-4 w-4" /> My Profile
                </button>
                <button onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors">
                  <Settings className="h-4 w-4" /> Settings
                </button>
              </div>
              <div className="p-1.5 border-t border-white/8">
                <button onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {profileOpen && <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />}
    </header>
  );
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ PROFILE PAGE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
function ProfilePage() {
  const navigate = useNavigate();
  const session  = getSession();
  const name     = session?.name  ?? "Owner";
  const email    = session?.email ?? "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const properties = [...PROPERTIES, ...getStoredProperties().map((p) => ({ id: p.id, name: p.name, location: p.location, rating: p.rating, beds: { total: p.totalBeds, occupied: 0 } }))];
  const avgRating  = properties.length ? +(properties.reduce((s, p) => s + (p.rating || 0), 0) / properties.length).toFixed(1) : 0;
  const totalBeds  = properties.reduce((s, p) => s + p.beds.total, 0);

  function handleLogout() { clearSession(); navigate({ to: "/auth" }); }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6 max-w-2xl mx-auto">
      {/* hero card */}
      <FadeUp>
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-2xl text-2xl font-bold text-primary-foreground shrink-0"
              style={{ background: "var(--gradient-primary)" }}>{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold">{name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
              <span className="inline-flex items-center mt-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">PG Owner</span>
            </div>
          </div>
        </Card>
      </FadeUp>

      {/* stats row */}
      <FadeUp delay={0.05}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Properties",  value: String(properties.length), icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Avg Rating",  value: String(avgRating),          icon: Star,      color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Total Beds",  value: String(totalBeds),          icon: BedDouble, color: "text-violet-400", bg: "bg-violet-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className={`p-4 ${bg} border border-white/8`}>
              <div className={`grid h-8 w-8 place-items-center rounded-xl bg-white/5 ${color} mb-3`}><Icon className="h-4 w-4" /></div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      </FadeUp>

      {/* account info */}
      <FadeUp delay={0.1}>
        <Card className="p-6 space-y-4">
          <p className="text-sm font-semibold">Account Information</p>
          {[
            { label: "Full Name",     value: name,        icon: User },
            { label: "Email Address", value: email,       icon: Mail },
            { label: "Role",          value: "PG Owner",  icon: Shield },
            { label: "Member Since",  value: "Jan 2025",  icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 rounded-xl bg-white/4 px-4 py-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary shrink-0"><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </Card>
      </FadeUp>

      {/* properties list */}
      <FadeUp delay={0.15}>
        <Card className="p-6 space-y-4">
          <p className="text-sm font-semibold">My Properties</p>
          {properties.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary shrink-0"><Building2 className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.location} &middot; {p.beds.total} beds</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">{p.rating || "Ã¢â‚¬â€"}</span>
              </div>
            </div>
          ))}
        </Card>
      </FadeUp>

      {/* logout */}
      <FadeUp delay={0.2}>
        <button onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all">
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </FadeUp>
    </motion.div>
  );
}

const PAGE_MAP: Record<string, (props: { onAddProperty: () => void; properties: typeof PROPERTIES; onRefresh: () => void; onAddRoom: () => void }) => React.ReactElement> = {
  overview:    ({ onAddProperty, onAddRoom }) => <Overview onAddProperty={onAddProperty} onAddRoom={onAddRoom} />,
  properties:  ({ onAddProperty, properties, onRefresh }) => <Properties onAddProperty={onAddProperty} properties={properties} onRefresh={onRefresh} />,
  rooms:       ({ onAddRoom }) => <RoomsAndBeds onAddRoom={onAddRoom} />,
  residents:   () => <Residents />,
  payments:    () => <Payments />,
  maintenance: () => <Maintenance />,
  analytics:   () => <Analytics />,
  community:   () => <Community />,
  documents:   () => <Documents />,
  settings:    () => <SettingsPage />,
  profile:     () => <ProfilePage />,
} as Record<string, (props: { onAddProperty: () => void; properties: typeof PROPERTIES; onRefresh: () => void; onAddRoom: () => void }) => React.ReactElement>;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ROOT COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function OwnerDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [extraProps, setExtraProps] = useState(() => getStoredProperties());
  const session = getSession();

  useEffect(() => {
    if (!session || session.role !== "owner") navigate({ to: "/auth" });
  }, []);

  const allProperties = [
    ...PROPERTIES.map((p) => ({ ...p, _stored: undefined as StoredProperty | undefined })),
    ...extraProps.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      occupancy: 0,
      revenue: 0,
      beds: { total: p.totalBeds, occupied: 0, vacant: p.totalBeds },
      verified: p.verified,
      rating: p.rating,
      _stored: p,
    })),
  ];

  const openWizard = () => setShowWizard(true);
  const closeWizard = () => { setExtraProps(getStoredProperties()); setShowWizard(false); };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

      <motion.div
        animate={{ marginLeft: collapsed ? 64 : 220 }}
        transition={{ duration: 0.3, ease: EASE }}>
        <Topbar active={active} collapsed={collapsed} onProfile={() => setActive("profile")} />

        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}>
              {PAGE_MAP[active]?.({ onAddProperty: openWizard, properties: allProperties, onRefresh: () => setExtraProps(getStoredProperties()), onAddRoom: () => {} })}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      <AnimatePresence>
        {showWizard && (
          <AddPropertyWizard onClose={closeWizard} onPublished={closeWizard} />
        )}
      </AnimatePresence>


    </div>
  );
}
