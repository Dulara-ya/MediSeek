// contexts/UserDataContext.tsx

// --- Updated Imports ---
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { HealthPrediction, ChatMessage } from "@/types"; // Make sure ChatMessage is exported from types

// --- Original Imports ---
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHealthHistory } from "@/userData"; // Make sure this path is correct

// --- Updated Context Type to include all functions ---
type CtxType = {
  // Health History
  history: any[];
  loading: boolean;
  error: string | null;
  addHealthPrediction: (prediction: HealthPrediction) => Promise<void>;

  // Chat History
  getChatHistory: () => Promise<ChatMessage[]>;
  saveChatHistory: (messages: ChatMessage[]) => Promise<void>;
  clearChatHistory: () => Promise<void>;
};

const Ctx = createContext<CtxType | null>(null);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This is your original, unchanged function to fetch health history
  useEffect(() => {
    let alive = true;
    (async () => {
      const uid = (user as any)?.id ?? (user as any)?.uid ?? null;
      if (!uid) {
        if (alive) setHistory([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const items = await getHealthHistory(uid);
        const arr = Array.isArray(items) ? items : [];
        arr.sort((a, b) => {
          const ta = new Date(a?.date ?? a?.createdAt ?? 0).getTime();
          const tb = new Date(b?.date ?? b?.createdAt ?? 0).getTime();
          return tb - ta;
        });
        if (alive) setHistory(arr);
      } catch (e: any) {
        if (alive) {
          setError(e?.message || "Failed to load history");
          setHistory([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  // This is your original, unchanged function to add a health prediction
  const addHealthPrediction = async (prediction: HealthPrediction) => {
    const uid = (user as any)?.id ?? (user as any)?.uid ?? null;
    if (!uid) {
      const errMessage = "You must be logged in to save your history.";
      setError(errMessage);
      throw new Error(errMessage);
    }
    setLoading(true);
    try {
      const payload = { ...prediction, createdAt: serverTimestamp() };
      const historyCollectionRef = collection(db, 'users', uid, 'healthHistory');
      const docRef = await addDoc(historyCollectionRef, payload);
      const newHistoryItem = { ...payload, id: docRef.id, createdAt: new Date().toISOString() };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
    } catch (e: any) {
      const errMessage = e?.message || "Failed to save the new health record.";
      setError(errMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // --- FIX: Add the missing Chat functions ---

  const getChatHistory = async (): Promise<ChatMessage[]> => {
    const uid = (user as any)?.uid;
    if (!uid) return []; // No user, no history

    const chatDocRef = doc(db, "users", uid, "chat", "history");
    const docSnap = await getDoc(chatDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Firestore Timestamps need to be converted back to JS Date objects
      return data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp),
      }));
    }
    return []; // No document found, return empty array
  };

  const saveChatHistory = async (messages: ChatMessage[]) => {
    const uid = (user as any)?.uid;
    if (!uid) throw new Error("User is not authenticated. Cannot save chat.");

    const chatDocRef = doc(db, "users", uid, "chat", "history");
    // We save the entire message array to a single document
    await setDoc(chatDocRef, { messages, lastUpdated: serverTimestamp() });
  };

  const clearChatHistory = async () => {
    const uid = (user as any)?.uid;
    if (!uid) throw new Error("User is not authenticated. Cannot clear chat.");

    const chatDocRef = doc(db, "users", uid, "chat", "history");
    await deleteDoc(chatDocRef);
  };

  // --- FIX: Add the new functions to the context value ---
  const value = useMemo(
    () => ({
      history,
      loading,
      error,
      addHealthPrediction,
      getChatHistory,
      saveChatHistory,
      clearChatHistory,
    }),
    [history, loading, error, user] // `user` is needed for the chat functions
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useUserData() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useUserData must be used within <UserDataProvider>");
  return c;
}