// src/userData.ts
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getHealthHistory(uid: string): Promise<any[]> {
  const col = collection(db, "users", uid, "healthHistory");
  const snap = await getDocs(col);

  const out: any[] = [];
  snap.forEach((doc) => {
    const d = doc.data();
    const createdAt =
      (d?.createdAt?.toDate ? d.createdAt.toDate() : d?.createdAt) ?? null;
    out.push({ id: doc.id, ...d, createdAt });
  });
  return out;
}

// ALSO export default, so default *and* named imports both work
export default getHealthHistory;
