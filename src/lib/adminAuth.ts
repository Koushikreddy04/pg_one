export const ADMIN_CREDENTIALS = { email: "admin@staysphere.app", password: "Admin@123" };

const KEY = "ss_admin_auth";

export function adminLogin(email: string, password: string): boolean {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout() {
  localStorage.removeItem(KEY);
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(KEY) === "true";
}
