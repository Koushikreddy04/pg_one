import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { adminLogin, ADMIN_CREDENTIALS } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = adminLogin(email, password);
      if (ok) {
        navigate({ to: "/admin" });
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 600);
  }

  function fillDemo() {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-[30rem] w-[30rem] rounded-full opacity-20 blur-3xl animate-float-slow" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute -right-40 bottom-10 h-[28rem] w-[28rem] rounded-full opacity-15 blur-3xl" style={{ background: "var(--gradient-accent)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl shadow-glow" style={{ background: "var(--gradient-primary)" }}>
            <Compass className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">StaySphere</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl glass-strong p-8 shadow-elegant">
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Sign in to continue</h2>
          </div>

          {/* Demo credentials banner */}
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Demo Credentials</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono text-foreground">{ADMIN_CREDENTIALS.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Password</span>
                <span className="font-mono text-foreground">{ADMIN_CREDENTIALS.password}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="mt-3 w-full rounded-xl bg-primary/20 py-2 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
            >
              Fill demo credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@staysphere.app"
                  required
                  className="w-full rounded-xl bg-background/50 border border-white/10 pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-background/50 border border-white/10 pl-10 pr-12 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">← Back to StaySphere</a>
        </p>
      </div>
    </div>
  );
}
