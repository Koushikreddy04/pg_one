import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2, Users, TrendingUp, Wallet, LogOut, Compass, Bell,
  Shield, Star, MapPin, Check, X, Eye, Search, ChevronDown,
  Home, BarChart3, Settings, ListChecks, BellRing, Menu,
} from "lucide-react";
import { isAdminAuthenticated, adminLogout } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

/* ─── mock data ─────────────────────────────────────────────── */

const STATS = [
  { label: "Total PGs", value: "18,432", change: "+124 this week", icon: Building2, color: "from-blue-500/30 to-cyan-500/30" },
  { label: "Active Users", value: "92,410", change: "+2.1k this week", icon: Users, color: "from-violet-500/30 to-purple-600/30" },
  { label: "Monthly Revenue", value: "₹24.6L", change: "+12% vs last month", icon: Wallet, color: "from-emerald-500/30 to-teal-500/30" },
  { label: "Relocations", value: "31,280", change: "+560 this week", icon: TrendingUp, color: "from-amber-500/30 to-orange-500/30" },
];

const PGS = [
  { id: "PG-001", name: "Skyline Residency", city: "Hyderabad", owner: "Ramesh Kumar", price: 9500, status: "Active", verified: true, rating: 4.8 },
  { id: "PG-002", name: "Aurora Co-living", city: "Hyderabad", owner: "Priya Sharma", price: 8800, status: "Active", verified: true, rating: 4.6 },
  { id: "PG-003", name: "The Loft House", city: "Hyderabad", owner: "Sunil Rao", price: 9900, status: "Pending", verified: false, rating: 4.2 },
  { id: "PG-004", name: "Nest North", city: "Bengaluru", owner: "Aisha Khan", price: 11200, status: "Active", verified: true, rating: 4.9 },
  { id: "PG-005", name: "Marine Studios", city: "Mumbai", owner: "Vikram Mehta", price: 13500, status: "Active", verified: true, rating: 4.7 },
  { id: "PG-006", name: "Velocity Stays", city: "Pune", owner: "Neha Joshi", price: 8200, status: "Suspended", verified: true, rating: 3.9 },
  { id: "PG-007", name: "Urban Nest", city: "Chennai", owner: "Karthik S.", price: 7800, status: "Pending", verified: false, rating: 4.1 },
];

const USERS = [
  { id: "USR-001", name: "Aanya Verma", email: "aanya@email.com", role: "Resident", city: "Hyderabad", joined: "12 May 2025", status: "Active" },
  { id: "USR-002", name: "Rohan Iyer", email: "rohan@email.com", role: "Resident", city: "Bengaluru", joined: "3 Apr 2025", status: "Active" },
  { id: "USR-003", name: "Meera Khan", email: "meera@email.com", role: "Resident", city: "Pune", joined: "20 Mar 2025", status: "Inactive" },
  { id: "USR-004", name: "Ramesh Kumar", email: "ramesh@email.com", role: "Owner", city: "Hyderabad", joined: "1 Jan 2025", status: "Active" },
  { id: "USR-005", name: "Priya Sharma", email: "priya@email.com", role: "Owner", city: "Hyderabad", joined: "15 Feb 2025", status: "Active" },
  { id: "USR-006", name: "Karan Kapoor", email: "karan@email.com", role: "Resident", city: "Delhi", joined: "8 Jun 2025", status: "Active" },
];

const RECENT_ACTIVITY = [
  { text: "New PG listing submitted", sub: "Urban Nest · Chennai", time: "2m ago", type: "listing" },
  { text: "User verified successfully", sub: "Aanya Verma", time: "14m ago", type: "verify" },
  { text: "Booking confirmed", sub: "Skyline Residency · Room 204", time: "32m ago", type: "booking" },
  { text: "Support ticket raised", sub: "Rohan Iyer · Payment issue", time: "1h ago", type: "support" },
  { text: "New owner registration", sub: "Neha Joshi · Pune", time: "2h ago", type: "owner" },
];

/* ─── helpers ──────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-400",
    Pending: "bg-amber-500/15 text-amber-400",
    Suspended: "bg-red-500/15 text-red-400",
    Inactive: "bg-white/10 text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? map.Inactive}`}>{status}</span>
  );
}

/* ─── sidebar ──────────────────────────────────────────────── */

const NAV_ITEMS = [
  { icon: BarChart3, label: "Overview", id: "overview" },
  { icon: Building2, label: "PG Listings", id: "listings" },
  { icon: Users, label: "Users", id: "users" },
  { icon: ListChecks, label: "Bookings", id: "bookings" },
  { icon: BellRing, label: "Activity", id: "activity" },
  { icon: Settings, label: "Settings", id: "settings" },
];

function Sidebar({ active, setActive, collapsed, setCollapsed }: { active: string; setActive: (s: string) => void; collapsed: boolean; setCollapsed: (b: boolean) => void }) {
  const navigate = useNavigate();
  function logout() {
    adminLogout();
    navigate({ to: "/admin/login" });
  }
  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-card/80 backdrop-blur-xl transition-all ${collapsed ? "w-16" : "w-56"}`}>
      {/* logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
          <Compass className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-sm font-semibold tracking-tight">StaySphere Admin</span>}
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-1 p-2 pt-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active === item.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* footer */}
      <div className="border-t border-white/5 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
        >
          <Menu className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ─── sections ─────────────────────────────────────────────── */

function Overview() {
  return (
    <div className="space-y-8">
      {/* stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl glass-strong p-5 shadow-soft">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} blur-2xl`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5"><s.icon className="h-4 w-4 text-primary" /></div>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-emerald-400">{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* recent activity */}
      <div className="rounded-2xl glass-strong p-6 shadow-soft">
        <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15">
                <Bell className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.text}</p>
                <p className="text-xs text-muted-foreground truncate">{a.sub}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PGListings() {
  const [search, setSearch] = useState("");
  const filtered = PGS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.owner.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">PG Listings</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PGs…"
            className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-56"
          />
        </div>
      </div>
      <div className="rounded-2xl glass-strong shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3.5 font-medium">PG</th>
                <th className="px-5 py-3.5 font-medium">City</th>
                <th className="px-5 py-3.5 font-medium">Owner</th>
                <th className="px-5 py-3.5 font-medium">Price</th>
                <th className="px-5 py-3.5 font-medium">Rating</th>
                <th className="px-5 py-3.5 font-medium">Verified</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pg, i) => (
                <tr key={pg.id} className={`border-b border-white/5 transition-colors hover:bg-white/5 ${i === filtered.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium">{pg.name}</p>
                      <p className="text-xs text-muted-foreground">{pg.id}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3" />{pg.city}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{pg.owner}</td>
                  <td className="px-5 py-4 font-medium text-primary">₹{pg.price.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{pg.rating}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {pg.verified
                      ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><Check className="h-3.5 w-3.5" />Yes</span>
                      : <span className="flex items-center gap-1 text-muted-foreground text-xs"><X className="h-3.5 w-3.5" />No</span>}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={pg.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg bg-white/5 p-1.5 hover:bg-white/10 transition-colors"><Shield className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersPanel() {
  const [search, setSearch] = useState("");
  const filtered = USERS.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-56"
          />
        </div>
      </div>
      <div className="rounded-2xl glass-strong shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3.5 font-medium">User</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">City</th>
                <th className="px-5 py-3.5 font-medium">Joined</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-white/5 transition-colors hover:bg-white/5 ${i === filtered.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.role === "Owner" ? "bg-violet-500/15 text-violet-400" : "bg-blue-500/15 text-blue-400"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{u.city}</td>
                  <td className="px-5 py-4 text-muted-foreground">{u.joined}</td>
                  <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-2xl glass-strong text-center">
      <p className="text-lg font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon — this section is under development.</p>
    </div>
  );
}

/* ─── main ─────────────────────────────────────────────────── */

function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) navigate({ to: "/admin/login" });
  }, [navigate]);

  function renderContent() {
    if (active === "overview") return <Overview />;
    if (active === "listings") return <PGListings />;
    if (active === "users") return <UsersPanel />;
    return <ComingSoon label={NAV_ITEMS.find((n) => n.id === active)?.label ?? active} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* main */}
      <div className={`transition-all ${collapsed ? "ml-16" : "ml-56"}`}>
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 px-6 backdrop-blur-xl">
          <div>
            <h1 className="text-base font-semibold capitalize">{NAV_ITEMS.find((n) => n.id === active)?.label ?? active}</h1>
            <p className="text-xs text-muted-foreground">StaySphere Admin Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/10 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2.5 rounded-xl glass px-3 py-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>A</div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium">Admin</p>
                <p className="text-[10px] text-muted-foreground">admin@staysphere.app</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* page content */}
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
