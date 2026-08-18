import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { User as AppUser } from '../types';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AppUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<AppUser, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(uid: string): Promise<Partial<AppUser>> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Partial<AppUser>) : {};
}

async function upsertUserProfile(uid: string, data: Partial<AppUser>) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { ...data, id: uid }, { merge: true });
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setReady(true);
        return;
      }

      // Default from Auth (fallback if Firestore read is blocked)
      const fallback: AppUser = {
        id: fbUser.uid,
        email: fbUser.email ?? '',
        name: fbUser.displayName ?? '',
      };

      try {
        const profile = await fetchUserProfile(fbUser.uid);
        const merged: AppUser = {
          ...fallback,
          ...(profile as AppUser),
          id: fbUser.uid,
          email: (profile as any)?.email ?? fallback.email,
          name: (profile as any)?.name ?? fallback.name,
        };
        setUser(merged);
      } catch (e: any) {
        console.warn('Firestore profile read failed (continuing with auth fallback):', e?.code || e);
        // Try to create the profile once if read failed but we are authed
        try {
          await upsertUserProfile(fbUser.uid, { email: fallback.email, name: fallback.name });
        } catch (e2) {
          console.warn('Firestore profile upsert also failed:', e2);
        }
        setUser(fallback);
      } finally {
        setReady(true);
      }
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (e) {
      console.error('Login failed:', e);
      return false;
    }
  };

  const signup = async (userData: Omit<AppUser, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const { password, ...profile } = userData;
      const cred = await createUserWithEmailAndPassword(auth, String(profile.email), password);
      if (profile.name) {
        try { await updateProfile(cred.user, { displayName: String(profile.name) }); } catch {}
      }
      await upsertUserProfile(cred.user.uid, profile);
      return true;
    } catch (e) {
      console.error('Signup failed:', e);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await upsertUserProfile(res.user.uid, {
        email: res.user.email ?? '',
        name: res.user.displayName ?? '',
      });
      return true;
    } catch (e) {
      console.error('Google sign-in failed:', e);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated: !!user,
    user,
    login,
    signup,
    logout,
    loginWithGoogle,
  }), [user]);

  if (!ready) return null; // avoid rendering app before auth checked

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
