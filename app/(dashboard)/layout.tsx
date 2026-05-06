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
    if (!auth) { router.push('/login'); return; }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { router.push('/login'); return; }
      let profile: UserProfile = { email: firebaseUser.email ?? undefined, name: firebaseUser.displayName ?? undefined };
      if (supabase) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', firebaseUser.uid).single();
        if (data) profile.name = data.full_name || profile.name;
      }
      setUser(profile);
      setLoading(false);
    });
    return () => unsub();
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
