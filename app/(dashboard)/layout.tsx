'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { supabase } from '@/lib/supabase';

interface UserProfile { name?: string; email?: string; avatar?: string; }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout — if Firebase doesn't respond in 6s, redirect to login
    const timeout = setTimeout(() => {
      setLoading(false);
      router.push('/login');
    }, 6000);

    if (!auth) {
      clearTimeout(timeout);
      router.push('/login');
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timeout);

      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      // Set user immediately — don't block on Supabase profile fetch
      setUser({ email: firebaseUser.email ?? undefined, name: firebaseUser.displayName ?? undefined });
      setLoading(false);

      // Fetch profile in background (non-blocking)
      if (supabase) {
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', firebaseUser.uid)
          .single()
          .then(({ data }) => {
            if (data?.full_name) {
              setUser(prev => ({ ...prev, name: data.full_name }));
            }
          })
          .catch(() => {}); // Ignore profile fetch errors silently
      }
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full gradient-hero animate-pulse" />
        <p className="text-muted-foreground text-sm animate-pulse">Loading MediCare...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 ml-[240px] transition-[margin] duration-300">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
