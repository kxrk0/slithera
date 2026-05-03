import { useEffect, useState, useCallback } from "react";

export type AuthUser = {
  id: string;
  name: string;
  avatar: string; // emoji or initial
  email: string;
  signedInAt: number;
};

const STORAGE_KEY = "slithera-auth";

export function loadAuthUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent("slithera-auth-change"));
  } catch { /* ignore */ }
}

/**
 * Mock Google sign-in. In production this would open the OAuth popup.
 * Here we just create a fake user. Returns a promise that resolves after a brief delay.
 */
export function signInWithGoogle(name?: string): Promise<AuthUser> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const safeName = (name && name.trim()) || "Player";
      const user: AuthUser = {
        id: "google_" + Math.random().toString(36).slice(2, 10),
        name: safeName,
        avatar: pickAvatarFor(safeName),
        email: `${safeName.toLowerCase().replace(/\s+/g, ".")}@gmail.example`,
        signedInAt: Date.now()
      };
      saveAuthUser(user);
      resolve(user);
    }, 600);
  });
}

export function signOut(): void {
  saveAuthUser(null);
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthUser());

  useEffect(() => {
    const handler = () => setUser(loadAuthUser());
    window.addEventListener("slithera-auth-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("slithera-auth-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const signIn = useCallback((name?: string) => signInWithGoogle(name), []);

  return {
    user,
    isSignedIn: user !== null,
    signIn,
    signOut: () => { signOut(); setUser(null); }
  };
}

function pickAvatarFor(name: string): string {
  const emojis = ["🦊", "🐉", "🐍", "🦋", "🐺", "🦁", "🐯", "🐻", "🦅", "🐢"];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return emojis[hash % emojis.length];
}
