export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Session {
  user: User;
  expires: string;
}

export async function getSession(): Promise<Session | null> {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  return JSON.parse(stored);
}

export async function signIn(email: string, password: string) {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  const data = await res.json();
  localStorage.setItem('user', JSON.stringify({ user: data.user, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }));
  return data;
}

export async function signUp(email: string, password: string, name?: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }
  const data = await res.json();
  localStorage.setItem('user', JSON.stringify({ user: data.user, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }));
  return data;
}

export async function signOut() {
  localStorage.removeItem('user');
  window.location.href = "/login";
}
