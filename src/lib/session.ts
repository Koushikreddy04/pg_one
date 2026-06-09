export type UserRole = "user" | "owner";

const KEY = "ss_session";

interface Session {
  role: UserRole;
  name: string;
  email: string;
}

/* demo credentials — any email with these passwords routes to the right dashboard */
export const DEMO = {
  user:  { email: "user@staysphere.app",  password: "User@123",  name: "Aanya Verma" },
  owner: { email: "owner@staysphere.app", password: "Owner@123", name: "Ramesh Kumar" },
};

export function login(email: string, password: string): Session | null {
  if (email === DEMO.user.email && password === DEMO.user.password) {
    const s: Session = { role: "user", name: DEMO.user.name, email };
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  if (email === DEMO.owner.email && password === DEMO.owner.password) {
    const s: Session = { role: "owner", name: DEMO.owner.name, email };
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  return null;
}

export function registerUser(name: string, email: string): Session {
  const s: Session = { role: "user", name, email };
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function registerOwner(name: string, email: string): Session {
  const s: Session = { role: "owner", name, email };
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function dashboardFor(role: UserRole) {
  return role === "owner" ? "/owner" : "/user";
}

/* ─── property store ─────────────────────────────────────── */

export interface StoredProperty {
  id: string;
  name: string;
  location: string;
  type: string;
  rent: number;
  totalBeds: number;
  amenities: string[];
  rooms: Record<string, { price: string; beds: string; ac: boolean; label?: string; sharing?: string } | null>;
  owner: string;
  status: "Active";
  verified: false;
  rating: 0;
  createdAt: string;
}

const PROP_KEY = "ss_properties";

export function getStoredProperties(): StoredProperty[] {
  try {
    const raw = localStorage.getItem(PROP_KEY);
    return raw ? (JSON.parse(raw) as StoredProperty[]) : [];
  } catch {
    return [];
  }
}

export function addStoredProperty(p: Omit<StoredProperty, "id" | "createdAt">): StoredProperty {
  const props = getStoredProperties();
  const newProp: StoredProperty = {
    ...p,
    id: `PG-${Date.now()}`,
    createdAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  };
  localStorage.setItem(PROP_KEY, JSON.stringify([...props, newProp]));
  return newProp;
}

export function deleteStoredProperty(id: string): void {
  localStorage.setItem(PROP_KEY, JSON.stringify(getStoredProperties().filter((p) => p.id !== id)));
}

export function updateStoredProperty(id: string, patch: Partial<StoredProperty>): void {
  localStorage.setItem(PROP_KEY, JSON.stringify(getStoredProperties().map((p) => p.id === id ? { ...p, ...patch } : p)));
}

export interface StoredRoom {
  id: string;
  propertyId: string;
  propertyName: string;
  name: string;
  totalBeds: number;
  availBeds: number;
  rent: number;
  ac: boolean;
  bath: boolean;
  furnishing: string;
  amenities: string[];
  notes: string;
}

const ROOM_KEY = "ss_rooms";

export function getStoredRooms(): StoredRoom[] {
  try { const r = localStorage.getItem(ROOM_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export function addStoredRoom(r: Omit<StoredRoom, "id">): StoredRoom {
  const rooms = getStoredRooms();
  const newRoom = { ...r, id: `RM-${Date.now()}` };
  localStorage.setItem(ROOM_KEY, JSON.stringify([...rooms, newRoom]));
  return newRoom;
}
export function updateStoredRoom(id: string, patch: Partial<StoredRoom>): void {
  localStorage.setItem(ROOM_KEY, JSON.stringify(getStoredRooms().map((r) => r.id === id ? { ...r, ...patch } : r)));
}
export function deleteStoredRoom(id: string): void {
  localStorage.setItem(ROOM_KEY, JSON.stringify(getStoredRooms().filter((r) => r.id !== id)));
}

/* ─── resident store ─────────────────────────────────────── */

export interface StoredResident {
  id: string;
  name: string;
  room: string;
  property: string;
  moveIn: string;
  rent: number;
  status: "Paid" | "Pending" | "Overdue";
  food: "Veg" | "Non-veg" | "Vegan";
  phone: string;
  email: string;
  idProofName: string;
  rentType?: "Monthly" | "Day-wise";
  startDate?: string;
  endDate?: string;
  advanceStatus?: "Paid" | "Not Paid";
  advanceAmount?: number;
}

const RES_KEY = "ss_residents";

export function getStoredResidents(): StoredResident[] {
  if (typeof window === "undefined") return [];
  try {
    const r = localStorage.getItem(RES_KEY);
    if (r) return JSON.parse(r) as StoredResident[];
  } catch {}

  const initialMocks: StoredResident[] = [
    { id: "RS1", name: "Aanya Verma",   room: "R102", property: "Skyline", moveIn: "1 Apr 2025", rent: 9500,  status: "Paid",    food: "Veg",    phone: "98765 43210", email: "aanya@email.com", idProofName: "Aadhaar_Aanya.pdf", rentType: "Monthly" },
    { id: "RS2", name: "Rohan Iyer",    room: "R101", property: "Skyline", moveIn: "15 Mar 2025", rent: 12000, status: "Pending", food: "Non-veg", phone: "91234 56789", email: "rohan@email.com", idProofName: "Passport_Rohan.pdf", rentType: "Monthly" },
    { id: "RS3", name: "Meera Khan",    room: "R103", property: "Skyline", moveIn: "10 Feb 2025", rent: 7800,  status: "Overdue", food: "Vegan",   phone: "99887 76655", email: "meera@email.com", idProofName: "", rentType: "Monthly" },
    { id: "RS4", name: "Karan Kapoor",  room: "R201", property: "Aurora",  moveIn: "1 May 2025",  rent: 10000, status: "Paid",    food: "Veg",    phone: "87654 32109", email: "karan@email.com", idProofName: "DL_Karan.jpg", rentType: "Monthly" },
    { id: "RS5", name: "Sneha Reddy",   room: "R301", property: "Nest",    moveIn: "20 Apr 2025", rent: 8000,  status: "Paid",    food: "Veg",    phone: "76543 21098", email: "sneha@email.com", idProofName: "Aadhaar_Sneha.pdf", rentType: "Monthly" },
    { id: "RS6", name: "Arjun Mehta",   room: "R202", property: "Aurora",  moveIn: "5 Jan 2025",  rent: 8500,  status: "Pending", food: "Non-veg", phone: "65432 10987", email: "arjun@email.com", idProofName: "", rentType: "Day-wise" },
  ];

  try {
    localStorage.setItem(RES_KEY, JSON.stringify(initialMocks));
  } catch {}
  return initialMocks;
}
export function addStoredResident(r: Omit<StoredResident, "id">): StoredResident {
  const nr = { ...r, id: `RS-${Date.now()}` };
  localStorage.setItem(RES_KEY, JSON.stringify([...getStoredResidents(), nr]));
  return nr;
}
export function updateStoredResident(id: string, patch: Partial<StoredResident>): void {
  localStorage.setItem(RES_KEY, JSON.stringify(getStoredResidents().map((r) => r.id === id ? { ...r, ...patch } : r)));
}
export function deleteStoredResident(id: string): void {
  localStorage.setItem(RES_KEY, JSON.stringify(getStoredResidents().filter((r) => r.id !== id)));
}

