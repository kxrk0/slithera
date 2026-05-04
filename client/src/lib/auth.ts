import { useEffect, useState, useCallback } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

export type AuthUser = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  signedInAt: number;
};

const STORAGE_KEY = "slithera-auth";

function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    name: user.displayName ?? user.email?.split("@")[0] ?? "Player",
    avatar: user.photoURL ?? pickAvatarFor(user.displayName ?? ""),
    email: user.email ?? "",
    signedInAt: Date.now()
  };
}

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

export function signInWithGoogle(): Promise<AuthUser> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider).then((result) => {
    const user = toAuthUser(result.user);
    saveAuthUser(user);
    return user;
  });
}

export function signOut(): void {
  void firebaseSignOut(auth);
  saveAuthUser(null);
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = toAuthUser(firebaseUser);
        saveAuthUser(u);
        setUser(u);
      } else {
        saveAuthUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(() => signInWithGoogle(), []);

  return {
    user,
    isSignedIn: user !== null,
    loading,
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
