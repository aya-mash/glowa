import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import type { Glowup } from '@/types/glowup';
import { timestampToDate } from '@/types/glowup';

export function useGlowups() {
  const { user } = useAuth();
  const [glowups, setGlowups] = useState<Glowup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'glowups'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Glowup[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return { ...data, createdAt: timestampToDate(data.createdAt) } as Glowup;
      });
      setGlowups(rows);
      setLoading(false);
    });

    return unsub;
  }, [user?.uid]);

  return { glowups, loading };
}
