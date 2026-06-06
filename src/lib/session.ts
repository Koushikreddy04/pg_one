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
