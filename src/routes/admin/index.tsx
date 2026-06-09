import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2, Users, TrendingUp, Wallet, LogOut, Compass, Bell,
  Shield, Star, MapPin, Check, X, Eye, Search, ChevronDown,
  BarChart3, Settings, ListChecks, BellRing, Menu,
  Trash2, Pencil, IndianRupee, BedDouble, FileText,
} from "lucide-react";
import { isAdminAuthenticated, adminLogout } from "@/lib/adminAuth";
import { getStoredProperties, deleteStoredProperty, updateStoredProperty, type StoredProperty } from "@/lib/session";

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
  { icon: FileText, label: "Documents", id: "documents" },
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

/* ── unified PG type for state ── */
interface AnyPG {
  id: string; name: string; city: string; owner: string;
  price: number; status: string; verified: boolean; rating: number;
  type?: string; totalBeds?: number; amenities?: string[];
  rooms?: Record<string, { price: string; beds: string; ac: boolean; label?: string } | null>;
  createdAt?: string;
  isStored: boolean;
}

/* ── Edit Modal ── */
function EditModal({ pg, onSave, onClose }: {
  pg: AnyPG;
  onSave: (patch: Partial<AnyPG>) => void;
  onClose: () => void;
}) {
  const [name, setName]     = useState(pg.name);
  const [city, setCity]     = useState(pg.city);
  const [price, setPrice]   = useState(String(pg.price));
  const [status, setStatus] = useState(pg.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl glass-strong border border-white/10 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Edit Property</p>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {([
          { label: "Property Name", value: name,         set: setName,  icon: Building2,    type: "text"   },
          { label: "Location",      value: city,         set: setCity,  icon: MapPin,        type: "text"   },
          { label: "Starting Rent", value: price,        set: setPrice, icon: IndianRupee,  type: "number" },
        ] as const).map(({ label, value, set, icon: Icon, type }) => (
          <div key={label} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input type={type} value={value} onChange={(e) => (set as (v: string) => void)(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {["Active", "Pending", "Suspended"].map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                  status === s ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}>{s}</button>
            ))}
          </div>
        </div>
        <button onClick={() => { onSave({ name, city, price: Number(price), status }); onClose(); }}
          className="w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all"
          style={{ background: "var(--gradient-primary)" }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ── Manage Drawer ── */
function ManageDrawer({ pg, onClose }: { pg: AnyPG; onClose: () => void }) {
  const rooms = pg.rooms
    ? (Object.values(pg.rooms).filter(Boolean) as Array<{ price: string; beds: string; ac: boolean; label?: string }>)
    : [];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-sm overflow-y-auto rounded-l-2xl glass-strong border-l border-white/10 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-bold text-base">Manage Property</p>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 p-5 space-y-1">
          <p className="font-bold text-lg">{pg.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{pg.city}</p>
          <div className="flex items-center gap-2 mt-2">
            {pg.type && <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs text-primary font-medium">{pg.type}</span>}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              pg.status === "Active" ? "bg-emerald-500/15 text-emerald-400" :
              pg.status === "Suspended" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
            }`}>{pg.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Starting Rent", val: `₹${pg.price.toLocaleString()}`,          icon: IndianRupee },
            { label: "Total Beds",    val: pg.totalBeds ? String(pg.totalBeds) : "—", icon: BedDouble },
            { label: "Owner",         val: pg.owner,                                   icon: Users },
            { label: "Listed On",     val: pg.createdAt ?? "—",                       icon: Shield },
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-white/5 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Icon className="h-3.5 w-3.5" /><span className="text-[10px]">{label}</span></div>
              <p className="text-sm font-semibold truncate">{val}</p>
            </div>
          ))}
        </div>
        {rooms.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Types</p>
            {rooms.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{r.label ?? `Room ${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{r.beds} beds · {r.ac ? "AC" : "Non-AC"}</p>
                </div>
                <p className="text-sm font-bold text-primary">₹{Number(r.price).toLocaleString()}/mo</p>
              </div>
            ))}
          </div>
        )}
        {pg.amenities && pg.amenities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {pg.amenities.map((a) => (
                <span key={a} className="rounded-full bg-white/8 px-3 py-1 text-xs text-muted-foreground capitalize">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PGListings() {
  const [search, setSearch]         = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<AnyPG | null>(null);
  const [manageTarget, setManage]   = useState<AnyPG | null>(null);

  const initialStatic: AnyPG[] = PGS.map((p) => ({
    id: p.id, name: p.name, city: p.city, owner: p.owner,
    price: p.price, status: p.status, verified: p.verified, rating: p.rating,
    isStored: false,
  }));

  const [allPGs, setAllPGs] = useState<AnyPG[]>(() => [
    ...initialStatic,
    ...getStoredProperties().map((p): AnyPG => ({
      id: p.id, name: p.name, city: p.location, owner: p.owner,
      price: p.rent, status: p.status, verified: p.verified, rating: p.rating,
      type: p.type, totalBeds: p.totalBeds, amenities: p.amenities,
      rooms: p.rooms as AnyPG["rooms"], createdAt: p.createdAt,
      isStored: true,
    })),
  ]);

  const handleDelete = (id: string) => {
    const target = allPGs.find((p) => p.id === id);
    if (target?.isStored) deleteStoredProperty(id);
    setAllPGs((prev) => prev.filter((p) => p.id !== id));
    setConfirmDel(null);
  };

  const handleEdit = (id: string, patch: Partial<AnyPG>) => {
    setAllPGs((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
    const target = allPGs.find((p) => p.id === id);
    if (target?.isStored) {
      updateStoredProperty(id, {
        name: patch.name ?? target.name,
        location: patch.city ?? target.city,
        rent: patch.price ?? target.price,
        status: (patch.status ?? target.status) as StoredProperty["status"],
      });
    }
  };

  const filtered = allPGs.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">PG Listings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{allPGs.length} total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search PGs…"
            className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-56" />
        </div>
      </div>

      <div className="rounded-2xl glass-strong shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                {["PG", "City", "Owner", "Price", "Rating", "Verified", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pg, i) => (
                <tr key={pg.id} className={`border-b border-white/5 transition-colors hover:bg-white/4 ${i === filtered.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{pg.name}</p>
                        <p className="text-xs text-muted-foreground">{pg.id}</p>
                      </div>
                      {pg.isStored && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary font-medium">New</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3 w-3" />{pg.city}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{pg.owner}</td>
                  <td className="px-5 py-4 font-medium text-primary">₹{pg.price.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{pg.rating || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {pg.verified
                      ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><Check className="h-3.5 w-3.5" />Yes</span>
                      : <span className="flex items-center gap-1 text-muted-foreground text-xs"><X className="h-3.5 w-3.5" />No</span>}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={pg.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setManage(pg)} title="Manage"
                        className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors">
                        <Eye className="h-3.5 w-3.5" /> Manage
                      </button>
                      <button onClick={() => setEditTarget(pg)} title="Edit"
                        className="rounded-lg bg-white/8 p-1.5 text-muted-foreground hover:bg-white/15 hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setConfirmDel(pg.id)} title="Delete"
                        className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-xs rounded-2xl glass-strong border border-white/10 p-6 space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400 mx-auto"><Trash2 className="h-6 w-6" /></div>
            <div>
              <p className="font-semibold">Delete Property?</p>
              <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={() => handleDelete(confirmDel)} className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {editTarget  && <EditModal  pg={editTarget}  onClose={() => setEditTarget(null)} onSave={(p) => { handleEdit(editTarget.id, p); setEditTarget(null); }} />}
      {manageTarget && <ManageDrawer pg={manageTarget} onClose={() => setManage(null)} />}
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

/* ── mock documents ── */
const DOCUMENTS = [
  { id: "DOC-001", owner: "Ramesh Kumar",  pg: "Skyline Residency", type: "Aadhaar Card",      uploaded: "10 Jun 2025", status: "Pending" },
  { id: "DOC-002", owner: "Priya Sharma",  pg: "Aurora Co-living",  type: "PAN Card",          uploaded: "8 Jun 2025",  status: "Approved" },
  { id: "DOC-003", owner: "Sunil Rao",     pg: "The Loft House",    type: "Property Deed",     uploaded: "5 Jun 2025",  status: "Pending" },
  { id: "DOC-004", owner: "Aisha Khan",    pg: "Nest North",        type: "Electricity Bill",  uploaded: "3 Jun 2025",  status: "Approved" },
  { id: "DOC-005", owner: "Vikram Mehta",  pg: "Marine Studios",    type: "Aadhaar Card",      uploaded: "1 Jun 2025",  status: "Rejected" },
  { id: "DOC-006", owner: "Neha Joshi",    pg: "Velocity Stays",    type: "NOC Certificate",   uploaded: "28 May 2025", status: "Pending" },
  { id: "DOC-007", owner: "Karthik S.",    pg: "Urban Nest",        type: "PAN Card",          uploaded: "25 May 2025", status: "Pending" },
];

function VerificationDocuments() {
  const [docs, setDocs] = useState(DOCUMENTS);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [viewDoc, setViewDoc]       = useState<(typeof DOCUMENTS)[0] | null>(null);

  const statusColor: Record<string, string> = {
    Approved: "bg-emerald-500/15 text-emerald-400",
    Pending:  "bg-amber-500/15 text-amber-400",
    Rejected: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Verification Documents</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{docs.length} documents submitted</p>
      </div>

      <div className="rounded-2xl glass-strong shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                {["Document ID", "Owner", "PG Name", "Document Type", "Uploaded", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc.id} className={`border-b border-white/5 transition-colors hover:bg-white/4 ${i === docs.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{doc.id}</td>
                  <td className="px-5 py-4 font-medium">{doc.owner}</td>
                  <td className="px-5 py-4 text-muted-foreground">{doc.pg}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      {doc.type}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{doc.uploaded}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[doc.status]}`}>{doc.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewDoc(doc)} title="View"
                        className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button onClick={() => setConfirmDel(doc.id)} title="Delete"
                        className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-xs rounded-2xl glass-strong border border-white/10 p-6 space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400 mx-auto"><Trash2 className="h-6 w-6" /></div>
            <div>
              <p className="font-semibold">Delete Document?</p>
              <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={() => { setDocs((d) => d.filter((doc) => doc.id !== confirmDel)); setConfirmDel(null); }}
                className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewDoc(null)}>
          <div className="w-full max-w-sm rounded-2xl glass-strong border border-white/10 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">Document Details</p>
              <button onClick={() => setViewDoc(null)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {([
                ["Document ID",   viewDoc.id],
                ["Owner",         viewDoc.owner],
                ["PG Name",       viewDoc.pg],
                ["Document Type", viewDoc.type],
                ["Uploaded",      viewDoc.uploaded],
                ["Status",        viewDoc.status],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`text-sm font-medium ${
                    label === "Status" ? (statusColor[val] ?? "").replace("bg-", "").split(" ")[1] ?? "" : ""
                  }`}>{val}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white/5 flex items-center justify-center h-32 text-muted-foreground text-sm">
              <FileText className="h-8 w-8 opacity-30 mr-2" /> Document preview unavailable
            </div>
          </div>
        </div>
      )}
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
    if (active === "documents") return <VerificationDocuments />;
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
