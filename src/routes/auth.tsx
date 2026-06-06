import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Compass, Eye, EyeOff, Mail, Lock, User, Phone, Building2,
  Users, ArrowLeft, ShieldCheck, ChevronRight, Sparkles, MapPin, Check,
} from "lucide-react";
import { login, registerUser, registerOwner, dashboardFor, DEMO } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

/* ─── types ─────────────────────────────────────────────────── */
type Mode = "login" | "pick" | "user-register" | "pg-register";

/* ─── reusable field ────────────────────────────────────────── */
function Field({
  label, type = "text", value, onChange, placeholder, icon: Icon, rightSlot,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon: React.ElementType; rightSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all"
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
    </div>
  );
}

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label} type={show ? "text" : "password"} value={value}
      onChange={onChange} placeholder="••••••••" icon={Lock}
      rightSlot={
        <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

/* ─── login form ─────────────────────────────────────────────── */
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const session = login(email, pw);
      if (session) {
        navigate({ to: dashboardFor(session.role) });
      } else {
        setErr("Invalid credentials. Use the demo credentials below.");
      }
      setLoading(false);
    }, 700);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* demo credentials hint */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Demo credentials</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { label: "Resident", email: DEMO.user.email,  pw: DEMO.user.password,  color: "text-primary" },
            { label: "PG Owner", email: DEMO.owner.email, pw: DEMO.owner.password, color: "text-violet-400" },
          ] as const).map((d) => (
            <button key={d.label} type="button"
              onClick={() => { setEmail(d.email); setPw(d.pw); setErr(""); }}
              className="rounded-xl bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition-colors">
              <p className={`text-xs font-semibold ${d.color}`}>{d.label}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{d.email}</p>
            </button>
          ))}
        </div>
      </div>
      <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@email.com" icon={Mail} />
      <PwField label="Password" value={pw} onChange={setPw} />
      {err && <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">{err}</p>}
      <button type="submit" disabled={loading}
        className="mt-1 w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--gradient-primary)" }}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        No account?{" "}
        <button type="button" onClick={onSwitch} className="text-primary hover:underline font-medium">Create one</button>
      </p>
    </form>
  );
}

/* ─── role picker ────────────────────────────────────────────── */
function RolePicker({ onPick }: { onPick: (role: "user" | "pg") => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">What best describes you?</p>
      <div className="grid grid-cols-2 gap-4">
        {/* User card */}
        <button type="button" onClick={() => onPick("user")}
          className="group flex flex-col items-center gap-3 rounded-2xl glass-strong p-6 text-center transition-all hover:-translate-y-1 hover:shadow-glow hover:border-primary/40">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-sm">I'm a Resident</p>
            <p className="mt-1 text-xs text-muted-foreground">Looking for a PG or roommate</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Continue <ChevronRight className="h-3 w-3" />
          </div>
        </button>

        {/* PG Owner card */}
        <button type="button" onClick={() => onPick("pg")}
          className="group flex flex-col items-center gap-3 rounded-2xl glass-strong p-6 text-center transition-all hover:-translate-y-1 hover:shadow-glow hover:border-primary/40">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/15 text-violet-400 transition-colors group-hover:bg-violet-500/25">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-sm">I'm a PG Owner</p>
            <p className="mt-1 text-xs text-muted-foreground">I want to list my property</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Continue <ChevronRight className="h-3 w-3" />
          </div>
        </button>
      </div>
    </div>
  );
}

/* ─── user registration ──────────────────────────────────────── */
function UserRegister({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", phone: "", pw: "", cpw: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (form.pw !== form.cpw) { setErr("Passwords do not match."); return; }
    if (form.pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (!/^\d{10}$/.test(form.phone)) { setErr("Enter a valid 10-digit phone number."); return; }
    setLoading(true);
    setTimeout(() => {
      registerUser(form.username, form.email);
      navigate({ to: "/user" });
    }, 800);
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <Field label="Username" value={form.username} onChange={set("username")} placeholder="john_doe" icon={User} />
      <Field label="Email address" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" icon={Mail} />
      <Field label="Phone number" type="tel" value={form.phone} onChange={set("phone")} placeholder="9876543210" icon={Phone} />
      <PwField label="Password" value={form.pw} onChange={set("pw")} />
      <PwField label="Confirm password" value={form.cpw} onChange={set("cpw")} />
      {err && <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">{err}</p>}
      <button type="submit" disabled={loading}
        className="mt-1 w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--gradient-primary)" }}>
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onLogin} className="text-primary hover:underline font-medium">Sign in</button>
      </p>
    </form>
  );
}

/* ─── typewriter hook ────────────────────────────────────────── */
function useTypewriter(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const prev = useRef("");

  useEffect(() => {
    if (prev.current === text) return;
    prev.current = text;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, done };
}

/* ─── step progress bar ──────────────────────────────────────── */
function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        {/* step 1 */}
        <div className={`flex items-center gap-2 ${ step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold border transition-all ${
            step > 1
              ? "bg-primary border-primary text-primary-foreground"
              : step === 1
              ? "border-primary text-primary bg-primary/10"
              : "border-white/20 text-muted-foreground"
          }`}>
            {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
          </div>
          <span className="text-xs font-medium">List your PG</span>
        </div>

        {/* connector */}
        <div className="flex-1 h-px relative overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            initial={{ width: "0%" }}
            animate={{ width: step > 1 ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* step 2 */}
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold border transition-all ${
            step === 2
              ? "border-primary text-primary bg-primary/10"
              : "border-white/20 text-muted-foreground"
          }`}>
            2
          </div>
          <span className="text-xs font-medium">Contact</span>
        </div>
      </div>
    </div>
  );
}

/* ─── slide variants ─────────────────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
};

/* ─── PG registration ────────────────────────────────────────── */
function PGRegister({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({
    pgName: "", ownerName: "", city: "", address: "",
    email: "", phone: "", pw: "", cpw: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const step1Title = "List your PG";
  const step2Title = "Contact & login";
  const { displayed: heading, done: headingDone } = useTypewriter(
    step === 1 ? step1Title : step2Title
  );

  function goNext(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!form.pgName.trim() || !form.ownerName.trim() || !form.city.trim() || !form.address.trim()) {
      setErr("Please fill in all PG details."); return;
    }
    setDir(1);
    setStep(2);
  }

  function goBack() {
    setErr("");
    setDir(-1);
    setStep(1);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (form.pw !== form.cpw) { setErr("Passwords do not match."); return; }
    if (form.pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (!/^\d{10}$/.test(form.phone)) { setErr("Enter a valid 10-digit phone number."); return; }
    setLoading(true);
    setTimeout(() => {
      registerOwner(form.ownerName, form.email);
      navigate({ to: "/owner" });
    }, 900);
  }

  return (
    <div className="space-y-4">
      {/* step progress */}
      <StepBar step={step} />

      {/* animated step heading */}
      <div className="min-h-[2rem]">
        <h2 className="text-base font-semibold text-foreground">
          {heading}
          {!headingDone && (
            <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse rounded-sm bg-primary" />
          )}
        </h2>
      </div>

      {/* animated step panels */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          {step === 1 && (
            <motion.form
              key="step1"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={goNext}
              className="space-y-3.5"
            >
              <Field
                label="PG Name"
                value={form.pgName}
                onChange={set("pgName")}
                placeholder="Skyline Residency"
                icon={Building2}
              />
              <Field
                label="Owner Name"
                value={form.ownerName}
                onChange={set("ownerName")}
                placeholder="Ramesh Kumar"
                icon={User}
              />
              <Field
                label="City"
                value={form.city}
                onChange={set("city")}
                placeholder="Hyderabad"
                icon={MapPin}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Full Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  placeholder="Plot 12, Hitech City, Madhapur…"
                  rows={2}
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                />
              </div>

              {err && (
                <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">{err}</p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                Next — Contact details <ChevronRight className="h-4 w-4" />
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={onLogin} className="text-primary hover:underline font-medium">Sign in</button>
              </p>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={submit}
              className="space-y-3.5"
            >
              <Field
                label="Contact Email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="owner@email.com"
                icon={Mail}
              />
              <Field
                label="Contact Phone"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="9876543210"
                icon={Phone}
              />
              <PwField label="Password" value={form.pw} onChange={set("pw")} />
              <PwField label="Confirm password" value={form.cpw} onChange={set("cpw")} />

              {err && (
                <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">{err}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? "Submitting listing…" : "Register My PG"}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground glass transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to PG details
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={onLogin} className="text-primary hover:underline font-medium">Sign in</button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── page shell ─────────────────────────────────────────────── */
function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  const titles: Record<Mode, { title: string; sub: string }> = {
    login:         { title: "Welcome back",       sub: "Sign in to your StaySphere account"     },
    pick:          { title: "Create account",      sub: "Tell us who you are to get started"     },
    "user-register": { title: "Resident sign-up",  sub: "Find your perfect PG in minutes"        },
    "pg-register": { title: "List your PG",        sub: "Reach thousands of verified residents"  },
  };

  const showBack = mode !== "login";

  function goBack() {
    if (mode === "user-register" || mode === "pg-register") setMode("pick");
    else setMode("login");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── left panel (decorative, hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-10 overflow-hidden">
        {/* background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.18 0.03 255), oklch(0.22 0.05 258))" }} />
        <div className="absolute -left-24 top-10 h-[32rem] w-[32rem] rounded-full opacity-25 blur-3xl animate-float-slow" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute -right-16 bottom-10 h-[24rem] w-[24rem] rounded-full opacity-15 blur-3xl" style={{ background: "var(--gradient-accent)" }} />

        {/* logo */}
        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl shadow-glow" style={{ background: "var(--gradient-primary)" }}>
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">StaySphere</span>
        </div>

        {/* centre copy */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight">
              Your next home<br />
              <span className="text-gradient-primary">starts here.</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered matching, verified listings, zero brokerage — everything you need to relocate with confidence.
            </p>
          </div>

          {/* feature pills */}
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: "Verified listings across 22 cities" },
              { icon: Sparkles,    text: "AI match score for every PG" },
              { icon: Users,       text: "92,000+ residents trust StaySphere" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl glass px-4 py-3 w-fit">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* bottom quote */}
        <div className="relative rounded-2xl glass p-5">
          <div className="flex gap-1 text-primary mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
          </div>
          <p className="text-sm leading-relaxed">"Booked my PG in Hyderabad from Bangalore in one evening. The AI suggestions were uncannily accurate."</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>PS</div>
            <div>
              <p className="text-xs font-medium">Priya Shah</p>
              <p className="text-[10px] text-muted-foreground">Software Engineer · Microsoft</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 overflow-y-auto">
        {/* mobile logo */}
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">StaySphere</span>
        </div>

        <div className="w-full max-w-md">
          {/* back button */}
          {showBack && (
            <button type="button" onClick={goBack}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          {/* card */}
          <div className="rounded-3xl glass-strong p-7 shadow-elegant">
            {/* header */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold">{titles[mode].title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{titles[mode].sub}</p>
            </div>

            {/* tab switcher (login only) */}
            {mode === "login" && (
              <div className="mb-6 flex rounded-xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex-1 rounded-lg py-2 text-sm font-medium transition-all bg-white/10 text-foreground">
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("pick")}
                  className="flex-1 rounded-lg py-2 text-sm font-medium transition-all text-muted-foreground hover:text-foreground">
                  Register
                </button>
              </div>
            )}

            {/* forms */}
            {mode === "login" && (
              <LoginForm onSwitch={() => setMode("pick")} />
            )}
            {mode === "pick" && (
              <>
                {/* tab switcher */}
                <div className="mb-6 flex rounded-xl bg-white/5 p-1">
                  <button type="button" onClick={() => setMode("login")}
                    className="flex-1 rounded-lg py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                    Sign In
                  </button>
                  <button type="button"
                    className="flex-1 rounded-lg py-2 text-sm font-medium bg-white/10 text-foreground transition-all">
                    Register
                  </button>
                </div>
                <RolePicker onPick={(r) => setMode(r === "user" ? "user-register" : "pg-register")} />
              </>
            )}
            {mode === "user-register" && (
              <UserRegister onBack={() => setMode("pick")} onLogin={() => setMode("login")} />
            )}
            {mode === "pg-register" && (
              <PGRegister onBack={() => setMode("pick")} onLogin={() => setMode("login")} />
            )}
          </div>

          {/* footer links */}
          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">← Back to StaySphere</Link>
            <p>By continuing, you agree to our <a href="#" className="hover:text-foreground">Terms</a> & <a href="#" className="hover:text-foreground">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
