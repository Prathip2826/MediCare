'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/symptoms': 'Symptom Checker',
  '/medicines': 'Medicine Tracker',
  '/reports': 'Medical Reports',
  '/nutrition': 'Nutrition',
  '/fitness': 'Fitness',
  '/vitals': 'Vitals',
  '/wellness': 'Wellness',
  '/emergency': 'Emergency',
  '/health-library': 'Health Library',
  '/chatbot': 'AI Chatbot',
  '/profile': 'Profile',
};

const NOTIFICATIONS = [
  { id: 1, title: 'Medicine Reminder', body: 'Time to take Metformin 500mg', time: '5m ago', read: false },
  { id: 2, title: 'Health Tip', body: 'Drink at least 8 glasses of water today', time: '1h ago', read: false },
  { id: 3, title: 'Weekly Report Ready', body: 'Your weekly health summary is available', time: '3h ago', read: true },
];

interface NavbarProps {
  user?: { name?: string; email?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const title = PAGE_TITLES[pathname] ?? 'MediCare';
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowNotifs(false); setShowSearch(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center px-6 gap-4">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
      </div>

      {/* Search */}
      <AnimatePresence>
        {showSearch ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="relative overflow-hidden"
          >
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search features... (Esc to close)"
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-xl border border-border 
                focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            />
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setShowSearch(true)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-muted-foreground 
              hover:text-foreground text-sm transition-colors"
          >
            <Search size={16} />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline text-xs bg-border px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-muted hover:bg-primary/10 transition-colors"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold 
              rounded-full flex items-center justify-center">{unread}</span>
          )}
        </motion.button>

        <AnimatePresence>
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifs(false)}>
                    <X size={16} className="text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        {!n.read && <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />}
                        {n.read && <div className="w-2 h-2 mt-1.5 flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-xs text-primary hover:underline w-full text-center">
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center flex-shrink-0 cursor-pointer">
        <span className="text-white text-sm font-bold">
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </span>
      </div>
    </header>
  );
}
