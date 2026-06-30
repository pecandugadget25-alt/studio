'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '../provider';

export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  peran: 'siswa' | 'guru' | 'admin' | 'peneliti';
  level: number;
  poin: number;
  scanCount?: number;
  completedModules?: string[];
  completedComics?: string[];
  completedVideos?: string[];
  badges?: string[];
  comicProgress?: Record<string, unknown>;
  tanggalDaftar?: any;
}

export function useUser() {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const calculatedLevel = Math.floor((data.poin || 0) / 100) + 1;
            setProfile({ ...data, level: calculatedLevel });
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  return { user, profile, loading };
}