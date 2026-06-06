import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Search, Sparkles, MapPin, Shield, Star, Wifi, Utensils, Dumbbell, Car,
  Users, Home, ListChecks, Globe2, Phone, ShoppingBag, CalendarDays,
  ArrowRight, Check, Play, Eye, Compass, Wallet, HeartHandshake,
  Bot, Building2, TrendingUp, BellRing, Cog, ChevronRight, Menu, X,
} from "lucide-react";

import heroCity from "@/assets/hero-city.jpg";
import room1 from "@/assets/pg-room-1.jpg";
import room2 from "@/assets/pg-room-2.jpg";
import room3 from "@/assets/pg-room-3.jpg";
import cityHyd from "@/assets/city-hyderabad.jpg";
import cityBlr from "@/assets/city-bengaluru.jpg";
import cityMum from "@/assets/city-mumbai.jpg";
import cityPun from "@/assets/city-pune.jpg";
import cityChn from "@/assets/city-chennai.jpg";
import cityDel from "@/assets/city-delhi.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StaySphere — Find Your Perfect PG Before You Even Arrive" },
      { name: "description", content: "AI-powered relocation platform helping students and professionals discover verified PGs, roommates and local communities across India." },
    ],
  }),
  component: Landing,
});

/* ─── shared primitives ──────────────────────────────────────── */

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"}
      variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay } } }}
      className={className}>
      {children}
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
      </span>
      <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
        <span className="text-gradient">{title}</span>
      </h2>
      {subtitle && <p className="mt-4 text-balance text-base text-muted-foreground md:text-lg">{subtitle}</p>}
    </Reveal>
  );
}

/* ─── loader ─────────────────────────────────────────────────── */

function LoadingScreen({ done }: { done: boolean }) {
  return (
    <motion.div initial={{ opacity: 1 }} animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ pointerEvents: done ? "none" : "auto" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="absolute inset-0" style={{ background: "var(--gradient-radial)" }} />
      <div className="relative flex flex-col items-center gap-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}
          className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-2xl animate-pulse-glow" style={{ background: "var(--gradient-primary)" }} />
          <div className="absolute inset-0 grid place-items-center text-primary-foreground">
            <Compass className="h-8 w-8" />
          </div>
        </motion.div>
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-tight text-gradient">StaySphere</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">Preparing your sphere…</p>
        </div>
        <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/5">
          <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2" style={{ background: "var(--gradient-primary)" }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── navigation ─────────────────────────────────────────────── */

const NAV_LINKS = ["Discover", "Roommates", "Cities", "Dashboard", "Pricing"];

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "py-3" : "py-5"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5">
        <div className={`flex w-full items-center justify-between rounded-full px-4 py-2.5 transition-all ${scrolled ? "glass-strong shadow-elegant" : ""}`}>
          {/* logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">StaySphere</span>
          </a>

          {/* desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{n}</a>
            ))}
          </nav>

          {/* desktop auth buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/auth"
              className="rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
              style={{ background: "var(--gradient-primary)" }}>
              Register Free
            </Link>
          </div>

          {/* mobile hamburger */}
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-2 rounded-2xl glass-strong p-4 md:hidden">
          {NAV_LINKS.map((n) => (
            <a key={n} href={`#${n.toLowerCase()}`}
              className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
              onClick={() => setOpen(false)}>{n}</a>
          ))}
          <div className="mt-3 flex gap-2">
            <Link to="/auth" onClick={() => setOpen(false)}
              className="flex-1 rounded-full border border-white/10 py-2.5 text-center text-sm text-muted-foreground hover:bg-white/5 transition-colors">
              Sign In
            </Link>
            <Link to="/auth" onClick={() => setOpen(false)}
              className="flex-1 rounded-full py-2.5 text-center text-sm font-medium text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}>
              Register
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

/* ─── hero ───────────────────────────────────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-32 md:pt-44">
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <img src={heroCity} alt="" className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, oklch(0.18 0.03 255 / 0.4), oklch(0.18 0.03 255 / 0.9) 70%, var(--background))" }} />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full opacity-30 blur-3xl animate-float-slow" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute -right-32 top-60 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl animate-float-slow" style={{ background: "var(--gradient-accent)", animationDelay: "3s" }} />
      </div>

      <motion.div style={{ opacity }} className="relative mx-auto max-w-7xl px-5 pb-32 text-center md:pb-44">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            New · AI Match Engine v2
          </span>
        </Reveal>

        <Reveal delay={0.15}>
          <h1 className="mx-auto mt-7 max-w-5xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]">
            Find Your Perfect PG <br className="hidden md:block" />
            <span className="text-gradient-primary">Before You Even Arrive</span>
          </h1>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            AI-powered relocation platform helping students and professionals discover
            verified PGs, roommates, and local communities — in a single, beautiful place.
          </p>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth"
              className="group flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-primary)" }}>
              Find My PG <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#cities" className="flex items-center gap-2 rounded-full glass-strong px-6 py-3.5 text-sm font-medium transition-all hover:bg-white/10">
              <Globe2 className="h-4 w-4" /> Explore Cities
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.6}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs text-muted-foreground">
            {["Verified Listings", "Zero Brokerage", "AI Match Score", "24/7 Concierge"].map((t) => (
              <div key={t} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> {t}</div>
            ))}
          </div>
        </Reveal>
      </motion.div>
    </section>
  );
}

/* ─── AI search demo ─────────────────────────────────────────── */

const AI_SUGGESTIONS = [
  { name: "Skyline Residency", area: "Hitech City", price: "₹9,500", match: 96, img: room1 },
  { name: "Aurora Co-living",  area: "Madhapur",    price: "₹8,800", match: 92, img: room2 },
  { name: "The Loft House",    area: "Gachibowli",  price: "₹9,900", match: 89, img: room3 },
];

function AISearch() {
  const [typed, setTyped] = useState("");
  const full = "I got a job in Hyderabad and need a PG under ₹10,000 near Hitech City.";
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) { clearInterval(id); setTimeout(() => setShowResults(true), 600); }
    }, 35);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="discover" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader eyebrow="AI Concierge" title="Just describe your dream PG. We'll do the searching."
          subtitle="Type naturally — our AI understands your budget, commute, food and lifestyle." />
        <Reveal delay={0.2} className="mt-14">
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute -inset-2 rounded-3xl opacity-50 blur-2xl animate-gradient" style={{ background: "var(--gradient-primary)" }} />
            <div className="relative rounded-3xl glass-strong p-2 shadow-elegant">
              <div className="flex items-center gap-3 rounded-2xl bg-background/40 p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="flex-1 text-left text-sm text-foreground md:text-base">
                  {typed}<span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-primary" />
                </p>
                <button className="hidden rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground md:flex md:items-center md:gap-1.5" style={{ background: "var(--gradient-primary)" }}>
                  <Search className="h-4 w-4" /> Match
                </button>
              </div>
              <div className="flex flex-wrap gap-2 px-3 pb-3 pt-2">
                {["Budget ₹10k", "Hitech City", "Near metro", "Veg food", "Working professional"].map((t) => (
                  <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {AI_SUGGESTIONS.map((p, i) => (
            <motion.div key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={showResults ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group overflow-hidden rounded-3xl glass-strong shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="relative h-44 overflow-hidden">
                <img src={p.img} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute right-3 top-3 rounded-full glass px-3 py-1 text-xs font-semibold text-primary">{p.match}% match</div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{p.name}</h3>
                  <span className="text-sm font-medium text-primary">{p.price}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {p.area}</p>
                <Link to="/auth" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all">
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── compatibility score ────────────────────────────────────── */

const COMPAT = [
  { label: "Budget Match",      value: 94, icon: Wallet },
  { label: "Food Preference",   value: 88, icon: Utensils },
  { label: "Distance to Work",  value: 92, icon: MapPin },
  { label: "Lifestyle Match",   value: 86, icon: HeartHandshake },
  { label: "Safety Score",      value: 97, icon: Shield },
];

function ProgressCircle({ value }: { value: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = 42; const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" fill="none" />
        <motion.circle cx="50" cy="50" r={r} stroke="var(--primary)" strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: c - (c * value) / 100 } : {}}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-2xl font-semibold tabular-nums">{value}%</span>
      </div>
    </div>
  );
}

function Compatibility() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader eyebrow="Smart Compatibility" title="A match score, not a guess."
          subtitle="Our AI scores every PG against 50+ signals — so you move in confident, not curious." />
        <div className="mt-16 grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {COMPAT.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.08}>
              <div className="flex h-full flex-col items-center rounded-3xl glass-strong p-6 text-center transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><c.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 text-sm font-medium text-muted-foreground">{c.label}</h3>
                <div className="mt-4"><ProgressCircle value={c.value} /></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── featured PGs ───────────────────────────────────────────── */

const PGS = [
  { name: "Skyline Residency", area: "Hitech City, Hyderabad", price: 9500,  match: 96, img: room1, amenities: [Wifi, Utensils, Dumbbell, Car] },
  { name: "Aurora Co-living",  area: "Madhapur, Hyderabad",   price: 8800,  match: 92, img: room2, amenities: [Wifi, Utensils, Dumbbell] },
  { name: "The Loft House",    area: "Gachibowli, Hyderabad", price: 9900,  match: 89, img: room3, amenities: [Wifi, Utensils, Car] },
  { name: "Nest North",        area: "Indiranagar, Bengaluru", price: 11200, match: 95, img: room1, amenities: [Wifi, Utensils, Dumbbell, Car] },
  { name: "Marine Studios",    area: "Powai, Mumbai",          price: 13500, match: 90, img: room3, amenities: [Wifi, Utensils, Dumbbell] },
  { name: "Velocity Stays",    area: "Baner, Pune",            price: 8200,  match: 93, img: room2, amenities: [Wifi, Utensils] },
];

function FeaturedPGs() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex items-end justify-between gap-6">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Featured</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              <span className="text-gradient">Hand-picked PGs for you</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/auth" className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground md:inline-flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PGS.map((pg, i) => (
            <Reveal key={pg.name} delay={(i % 3) * 0.1}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl glass-strong shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant">
                <div className="relative h-56 overflow-hidden">
                  <img src={pg.img} alt={pg.name} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-medium text-primary">
                    <Shield className="h-3 w-3" /> Verified
                  </div>
                  <div className="absolute right-3 top-3 rounded-full glass px-3 py-1 text-xs font-semibold text-foreground">
                    <span className="text-primary">{pg.match}</span>% match
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div>
                    <h3 className="text-lg font-semibold">{pg.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{pg.area}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {pg.amenities.map((A, j) => (
                      <div key={j} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5"><A className="h-3.5 w-3.5" /></div>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">starting</p>
                      <p className="text-lg font-semibold text-gradient-primary">₹{pg.price.toLocaleString()}<span className="text-xs text-muted-foreground">/mo</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full glass px-3 py-2 text-xs hover:bg-white/10"><Eye className="h-3.5 w-3.5" /></button>
                      <Link to="/auth" className="rounded-full px-4 py-2 text-xs font-medium text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── virtual tour ───────────────────────────────────────────── */

function VirtualTour() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Virtual Room Tour</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              <span className="text-gradient">Walk through every room before you book.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              360° previews, cinematic walk-throughs, and an interactive explorer let you experience a PG without leaving the couch.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {[{ icon: Compass, label: "360° Preview" }, { icon: Play, label: "Video Walkthrough" }, { icon: Eye, label: "Interactive Explorer" }].map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-2xl glass px-4 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><f.icon className="h-4 w-4" /></div>
                  <span className="text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] opacity-30 blur-3xl animate-gradient" style={{ background: "var(--gradient-primary)" }} />
              <div className="relative overflow-hidden rounded-3xl glass-strong shadow-elegant">
                <img src={room1} alt="Virtual tour preview" className="h-[440px] w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button className="absolute inset-0 grid place-items-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full backdrop-blur-md transition-transform hover:scale-110 animate-pulse-glow" style={{ background: "var(--gradient-primary)" }}>
                    <Play className="h-7 w-7 translate-x-0.5 text-primary-foreground" />
                  </span>
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl glass-strong px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Now Touring</p>
                    <p className="text-sm font-semibold">Skyline Residency · Room 204</p>
                  </div>
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">LIVE</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── roommates ──────────────────────────────────────────────── */

const ROOMMATES = [
  { name: "Aanya Verma", role: "Software Engineer", food: "Vegetarian", langs: "Hindi, English", score: 94, color: "from-pink-500/30 to-violet-500/30" },
  { name: "Rohan Iyer",  role: "Product Designer",  food: "Non-veg",    langs: "English, Tamil",  score: 91, color: "from-cyan-400/30 to-blue-500/30" },
  { name: "Meera Khan",  role: "Data Analyst",       food: "Vegan",     langs: "English, Hindi",  score: 88, color: "from-amber-400/30 to-rose-500/30" },
];

function Roommates() {
  return (
    <section id="roommates" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Roommate Matching" title="Find people you'll actually love living with."
          subtitle="Compatibility goes beyond rent. Match by lifestyle, schedule, food, languages and vibe." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {ROOMMATES.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.1}>
              <div className="group relative overflow-hidden rounded-3xl glass-strong p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${r.color} blur-3xl transition-opacity group-hover:opacity-100`} />
                <div className="relative flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    {r.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.role}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-semibold text-gradient-primary">{r.score}%</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">lifestyle</p>
                  </div>
                </div>
                <div className="relative mt-6 space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Food</span><span>{r.food}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Languages</span><span>{r.langs}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Schedule</span><span>Day shift</span></div>
                </div>
                <Link to="/auth" className="mt-6 block w-full rounded-full glass px-4 py-2.5 text-center text-sm font-medium transition-all hover:bg-white/10">Connect</Link>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3} className="mt-10 text-center">
          <Link to="/auth" className="rounded-full px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow" style={{ background: "var(--gradient-primary)" }}>
            Find Compatible Roommates
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── relocation dashboard ───────────────────────────────────── */

const MODULES = [
  { icon: Home,         label: "Accommodation",    value: "Booked",     note: "Skyline · 204" },
  { icon: ListChecks,   label: "Move-in Checklist", value: "8 / 12",    note: "On track" },
  { icon: Wifi,         label: "Broadband",         value: "Active",     note: "Airtel 300 Mbps" },
  { icon: Utensils,     label: "Food Services",      value: "Subscribed", note: "Veg · 2 meals" },
  { icon: Car,          label: "Local Transport",    value: "Metro Pass", note: "Auto-renewed" },
  { icon: Phone,        label: "Emergency",          value: "5 Contacts", note: "Verified" },
];

function Dashboard() {
  return (
    <section id="dashboard" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Relocation Dashboard" title="Every move-in detail in one calm command center."
          subtitle="Track accommodation, set up utilities, find food & transport, and keep emergency info one tap away." />
        <Reveal delay={0.2} className="mt-14">
          <div className="relative overflow-hidden rounded-[2rem] glass-strong shadow-elegant">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="grid gap-px bg-white/5 md:grid-cols-3">
              {MODULES.map((m, i) => (
                <motion.div key={m.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.6 }}
                  className="group relative bg-card/60 p-7 transition-colors hover:bg-card">
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><m.icon className="h-5 w-5" /></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{m.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── community ──────────────────────────────────────────────── */

const COMMUNITY = [
  { icon: Users,        title: "Student Groups",  note: "1.2k+ active",       color: "from-cyan-400/40 to-blue-600/40" },
  { icon: Building2,    title: "IT Communities",  note: "Tech meetups · AMAs", color: "from-fuchsia-500/40 to-purple-700/40" },
  { icon: CalendarDays, title: "Local Events",    note: "Weekly in your city", color: "from-amber-400/40 to-orange-600/40" },
  { icon: ShoppingBag,  title: "Buy/Sell",        note: "Verified marketplace", color: "from-emerald-400/40 to-teal-600/40" },
];

function Community() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Community" title="Land in a city — not alone."
          subtitle="Plug straight into the networks that make a new city feel like home." />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {COMMUNITY.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="group relative h-56 overflow-hidden rounded-3xl glass-strong p-6 transition-all hover:-translate-y-1">
                <div className={`absolute -inset-1 bg-gradient-to-br ${c.color} opacity-30 blur-3xl transition-opacity group-hover:opacity-60`} />
                <div className="relative flex h-full flex-col">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl glass"><c.icon className="h-6 w-6 text-primary" /></div>
                  <h3 className="mt-auto text-xl font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── testimonials ───────────────────────────────────────────── */

const TESTI = [
  { name: "Priya Shah",   role: "Software Engineer · Microsoft", quote: "Booked my PG in Hyderabad from Bangalore in one evening. The AI suggestions were uncannily accurate.", initials: "PS" },
  { name: "Arjun Mehta",  role: "PG Owner · Pune",              quote: "Lead quality, occupancy and rent tracking — finally a tool that respects my time and my residents.",   initials: "AM" },
  { name: "Sneha Reddy",  role: "MBA Student · IIM B",           quote: "Roommate match was a 95%. We actually became friends. The relocation checklist is gold.",              initials: "SR" },
  { name: "Karan Kapoor", role: "Designer · Razorpay",           quote: "Felt like a concierge, not a listings site. Move-in day was the smoothest I've ever had.",            initials: "KK" },
];

function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % TESTI.length), 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeader eyebrow="Stories" title="People who found home with StaySphere." />
        <Reveal delay={0.15} className="mt-14">
          <div className="relative overflow-hidden rounded-3xl glass-strong p-10 shadow-elegant md:p-14">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative">
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-6 text-balance text-2xl font-medium leading-snug md:text-3xl">"{TESTI[i].quote}"</p>
              <div className="mt-8 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>{TESTI[i].initials}</div>
                <div>
                  <p className="font-semibold">{TESTI[i].name}</p>
                  <p className="text-sm text-muted-foreground">{TESTI[i].role}</p>
                </div>
              </div>
            </motion.div>
            <div className="mt-10 flex gap-2">
              {TESTI.map((_, k) => (
                <button key={k} onClick={() => setI(k)} className={`h-1 rounded-full transition-all ${k === i ? "w-10 bg-primary" : "w-4 bg-white/15"}`} aria-label={`Story ${k + 1}`} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── cities ─────────────────────────────────────────────────── */

const CITIES = [
  { name: "Hyderabad", count: "2,400+ PGs", img: cityHyd },
  { name: "Bengaluru", count: "3,100+ PGs", img: cityBlr },
  { name: "Chennai",   count: "1,800+ PGs", img: cityChn },
  { name: "Pune",      count: "1,500+ PGs", img: cityPun },
  { name: "Mumbai",    count: "2,700+ PGs", img: cityMum },
  { name: "Delhi",     count: "2,200+ PGs", img: cityDel },
];

function Cities() {
  return (
    <section id="cities" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Cities" title="Built for India's most-moved-to cities." />
        <div className="mt-14 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
          {CITIES.map((c, i) => (
            <Reveal key={c.name} delay={(i % 6) * 0.06}>
              <div className="group relative h-64 overflow-hidden rounded-3xl shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
                <img src={c.img} alt={c.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl font-semibold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.count}</p>
                  <div className="mt-2 h-px w-0 bg-primary transition-all duration-500 group-hover:w-12" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── stats ──────────────────────────────────────────────────── */

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800; const start = performance.now(); let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref} className="tabular-nums">{v.toLocaleString()}{suffix}</span>;
}

const STATS = [
  { value: 18400, suffix: "+", label: "Verified PGs" },
  { value: 92000, suffix: "+", label: "Active Residents" },
  { value: 22,    suffix: "",  label: "Cities Covered" },
  { value: 31000, suffix: "+", label: "Relocations Done" },
];

function Stats() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="rounded-[2rem] glass-strong px-8 py-12 shadow-elegant md:px-14 md:py-16">
          <div className="grid gap-10 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1} className="text-center">
                <p className="text-5xl font-semibold tracking-tight text-gradient-primary md:text-6xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PG owner portal ────────────────────────────────────────── */

const OWNER_FEATURES = [
  { icon: TrendingUp, label: "Lead Management" },
  { icon: Building2,  label: "Occupancy Tracking" },
  { icon: BellRing,   label: "Booking Requests" },
  { icon: Wallet,     label: "Rent Collection" },
  { icon: Users,      label: "Resident Management" },
  { icon: Cog,        label: "Automation Rules" },
];

function OwnerPortal() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">For PG Owners</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              <span className="text-gradient">Run your PG like a modern hospitality brand.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Replace WhatsApp chaos and ledger books with a calm dashboard built for occupancy, collections and resident happiness.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {OWNER_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-2xl glass px-4 py-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary"><f.icon className="h-4 w-4" /></div>
                  <span className="text-sm">{f.label}</span>
                </div>
              ))}
            </div>
            <Link to="/auth"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-primary)" }}>
              List your property <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
              <div className="relative overflow-hidden rounded-3xl glass-strong p-6 shadow-elegant">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-xs text-muted-foreground">staysphere.app/owners</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                    <p className="mt-1 text-2xl font-semibold">94%</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: "94%" }} viewport={{ once: true }} transition={{ duration: 1.4 }} className="h-full" style={{ background: "var(--gradient-primary)" }} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Rent Collected</p>
                    <p className="mt-1 text-2xl font-semibold">₹4.2L</p>
                    <p className="mt-3 text-xs text-emerald-400">↑ 12% this month</p>
                  </div>
                  <div className="rounded-2xl bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">New Leads</p>
                    <p className="mt-1 text-2xl font-semibold">38</p>
                    <p className="mt-3 text-xs text-primary">7 hot</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-background/60 p-4">
                  <p className="mb-3 text-xs text-muted-foreground">Recent bookings</p>
                  <div className="space-y-2">
                    {["Aanya V. · Room 204", "Rohan I. · Room 112", "Meera K. · Room 308"].map((t, k) => (
                      <div key={t} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                        <span>{t}</span>
                        <span className="text-xs text-primary">{["Confirmed", "Visit", "Paid"][k]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── pricing ────────────────────────────────────────────────── */

const PLANS = [
  { name: "Starter",      price: "₹0",    period: "Free forever",        desc: "For students starting their search.",   features: ["AI search (10/mo)", "Verified listings", "Basic match score", "Community access"],                                   cta: "Get Started",    featured: false },
  { name: "Professional", price: "₹499",  period: "per month",            desc: "For movers who want it sorted.",        features: ["Unlimited AI search", "Priority verified PGs", "Full compatibility AI", "Concierge support", "Roommate matching"],   cta: "Start Free Trial", featured: true  },
  { name: "Enterprise",   price: "Custom",period: "for companies & HR",    desc: "Relocation-as-a-service for teams.",   features: ["Bulk relocation", "Dedicated manager", "Custom integrations", "Analytics dashboard", "SLA & invoicing"],            cta: "Talk to Sales",  featured: false },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Pricing" title="Simple plans, premium feel."
          subtitle="Start free. Upgrade when you're ready to glide into your new city." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div className={`relative flex h-full flex-col rounded-3xl p-8 transition-all ${p.featured ? "glass-strong shadow-glow ring-1 ring-primary/40" : "glass"} hover:-translate-y-1`}>
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Most Loved</span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-gradient">{p.price}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.period}</p>
                <ul className="mt-8 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{f}</span></li>
                  ))}
                </ul>
                <Link to="/auth"
                  className={`mt-8 w-full rounded-full px-5 py-3 text-center text-sm font-medium transition-all ${p.featured ? "text-primary-foreground shadow-glow" : "glass-strong hover:bg-white/10"}`}
                  style={p.featured ? { background: "var(--gradient-primary)" } : {}}>
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── footer ─────────────────────────────────────────────────── */

function Footer() {
  const cols = [
    { title: "Company",   links: ["About", "Careers", "Press", "Partners"] },
    { title: "Features",  links: ["AI Search", "Roommates", "Dashboard", "Owner Portal"] },
    { title: "Resources", links: ["Blog", "Help Center", "City Guides", "API"] },
    { title: "Contact",   links: ["hello@staysphere.app", "Support", "+91 80 5555 0000", "Bengaluru, IN"] },
  ];
  return (
    <footer className="relative mt-20 border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <Compass className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">StaySphere</span>
            </a>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">AI-powered PG & relocation platform. Move in confident — across India.</p>
            <div className="mt-6 flex gap-3">
              {["X", "in", "ig", "yt"].map((s) => (
                <a key={s} href="#" className="grid h-9 w-9 place-items-center rounded-full glass text-xs hover:bg-white/10">{s}</a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold">{c.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="transition-colors hover:text-foreground">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} StaySphere Technologies. Built with care in India.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── page ───────────────────────────────────────────────────── */

function Landing() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <LoadingScreen done={loaded} />
      <Nav />
      <main className="overflow-x-hidden">
        <Hero />
        <AISearch />
        <Compatibility />
        <FeaturedPGs />
        <VirtualTour />
        <Roommates />
        <Dashboard />
        <Community />
        <Testimonials />
        <Cities />
        <Stats />
        <OwnerPortal />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
