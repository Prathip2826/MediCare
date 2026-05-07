'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Activity, Pill, FileText, Apple, Dumbbell, BarChart2,
  Leaf, AlertTriangle, BookOpen, MessageSquare, User, LogOut,
  ChevronLeft, ChevronRight, Heart, Bell
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard',      label: 'Dashboard',       icon: Home,          badge: null },
  { href: '/symptoms',       label: 'Symptom Checker', icon: Activity,      badge: null },
  { href: '/medicines',      label: 'Medicine Tracker',icon: Pill,          badge: null },
  { href: '/reports',        label: 'Medical Reports', icon: FileText,      badge: null },
  { href: '/nutrition',      label: 'Nutrition',       icon: Apple,         badge: null },
  { href: '/fitness',        label: 'Fitness',         icon: Dumbbell,      badge: null },
  { href: '/vitals',         label: 'Vitals',          icon: BarChart2,     badge: null },
  { href: '/wellness',       label: 'Wellness',        icon: Leaf,          badge: null },
  { href: '/emergency',      label: 'Emergency',       icon: AlertTriangle, badge: null },
  { href: '/health-library', label: 'Health Library',  icon: BookOpen,      badge: null },
  { href: '/chatbot',        label: 'AI Chatbot',      icon: MessageSquare, badge: null },
  { href: '/profile',        label: 'Profile',         icon: User,          badge: null },
];

interface SidebarProps {
  user?: { name?: string; email?: string; avatar?: string } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      if (supabase) await supabase.auth.signOut();
      localStorage.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Error logging out');
    }
  };

  return (
    <>
      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-80 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Sign Out?</h3>
                  <p className="text-sm text-muted-foreground">You'll need to login again.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLogout(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="sidebar-transition fixed left-0 top-0 h-screen z-40
          bg-card border-r border-border flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-white" fill="white" />
                </div>
                <span className="font-extrabold text-lg gradient-text">MediCare</span>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center mx-auto">
              <Heart size={16} className="text-white" fill="white" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User info */}
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-4 py-3 border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
                      ${active
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                      />
                    )}
                    <Icon size={18} className="flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                          className="text-sm whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.badge && !collapsed && (
                      <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-border p-2 space-y-1">
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <ThemeToggle />
            {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
          </div>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setShowLogout(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
              text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 
              transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
