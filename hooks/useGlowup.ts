import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import type { Glowup } from '@/types/glowup';
import { timestampToDate } from '@/types/glowup';

export function useGlowup(glowupId?: string | string[]) {
  const { user } = useAuth();
  const [glowup, setGlowup] = useState<Glowup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !glowupId || Array.isArray(glowupId)) {
      setLoading(false);
      return;
    }

    const ref = doc(db, 'users', user.uid, 'glowups', glowupId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        setGlowup(null);
        setLoading(false);
        return;
      }
      const data = snap.data();
      setGlowup({ ...data, createdAt: timestampToDate(data.createdAt) } as Glowup);
      setLoading(false);
    });

    return unsub;
  }, [glowupId, user?.uid]);

  return { glowup, loading, notFound };
}
