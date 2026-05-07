'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Activity, Brain, Droplets, Apple, Target, TrendingUp,
  Zap, Calendar, ChevronRight, CheckCircle
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { href: '/symptoms',  label: 'Check Symptoms',  icon: Activity,  color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
  { href: '/medicines', label: 'Medicines',        icon: Heart,     color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
  { href: '/vitals',    label: 'Log Vitals',       icon: TrendingUp,color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
  { href: '/nutrition', label: 'Nutrition',        icon: Apple,     color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
  { href: '/fitness',   label: 'Fitness',          icon: Target,    color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600' },
  { href: '/chatbot',   label: 'AI Chatbot',       icon: Brain,     color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600' },
  { href: '/wellness',  label: 'Wellness',         icon: Droplets,  color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' },
  { href: '/emergency', label: 'Emergency',        icon: Zap,       color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
];

function SkeletonCard() {
  return <div className="bg-card border border-border rounded-2xl p-5 h-36 animate-shimmer" />;
}

function HealthScoreRing({ score }: { score: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }} />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold gradient-text">{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [healthTip, setHealthTip] = useState('Stay hydrated! Drinking 8 glasses of water daily supports kidney function and maintains blood pressure.');
  const [medicines, setMedicines] = useState<{ name: string; dosage: string; taken?: boolean }[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [mood, setMood] = useState('');
  const userName = auth?.currentUser?.displayName || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      const uid = auth?.currentUser?.uid;
      if (uid) {
        try {
          const res = await fetch('/api/medicines', { headers: { 'x-user-id': uid } });
          if (res.ok) {
            const data = await res.json();
            setMedicines((data || []).slice(0, 3));
          }
        } catch (e) {
          console.error('Failed to load medicines:', e);
        }
      }
      setLoading(false);
    };
    // Wait briefly for Firebase auth to initialize
    const unsubscribe = auth?.onAuthStateChanged?.((user: any) => {
      if (user) load();
      else setLoading(false);
    });
    return () => unsubscribe?.();
  }, []);

  const toggleWater = (n: number) => setWaterGlasses(n);

  const containerVariants = {
    hidden: {}, visible: { transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">{greeting}, {userName}! 👋</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here's your health overview for today</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Top widgets row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Health Score */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5 card-hover col-span-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Health Score</h3>
                <span className="text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full font-medium">Excellent</span>
              </div>
              <div className="relative flex justify-center">
                <HealthScoreRing score={87} />
              </div>
            </motion.div>

            {/* Water Intake */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={16} className="text-cyan-500" />
                <h3 className="text-sm font-semibold text-foreground">Water Intake</h3>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {[...Array(8)].map((_, i) => (
                  <motion.button key={i} onClick={() => toggleWater(i + 1)}
                    whileTap={{ scale: 0.85 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-base transition-all
                      ${i < waterGlasses ? 'bg-cyan-500/20 border-2 border-cyan-500' : 'bg-muted border-2 border-border'}`}>
                    💧
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{waterGlasses}/8 glasses today</p>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-cyan-500 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${(waterGlasses / 8) * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>
            </motion.div>

            {/* Mood Tracker */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-foreground">Mood Today</h3>
              </div>
              <div className="flex justify-between">
                {['😢', '😔', '😐', '😊', '😄'].map((e, i) => (
                  <motion.button key={i} onClick={() => setMood(e)}
                    whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    className={`text-2xl p-1.5 rounded-xl transition-all ${mood === e ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}>
                    {e}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">{mood ? `You're feeling ${['terrible','sad','okay','happy','great'][['😢','😔','😐','😊','😄'].indexOf(mood)]} today` : 'How are you feeling today?'}</p>
            </motion.div>

            {/* Quick BMI */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-foreground">BMI</h3>
              </div>
              <div className="text-3xl font-extrabold gradient-text mb-1">22.4</div>
              <div className="text-xs text-emerald-500 font-medium mb-3">Normal weight ✓</div>
              <div className="relative h-2.5 bg-gradient-to-r from-blue-400 via-emerald-400 to-red-400 rounded-full">
                <motion.div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow"
                  initial={{ left: '0%' }} animate={{ left: '44%' }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Under</span><span>Normal</span><span>Over</span>
              </div>
            </motion.div>
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Today's Medicines */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5 card-hover">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Today's Medicines</h3>
                <Link href="/medicines" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              {medicines.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No medicines logged yet</p>
                  <Link href="/medicines" className="text-xs text-primary hover:underline mt-1 inline-block">Add medicine →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {medicines.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <motion.button whileTap={{ scale: 0.9 }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${m.taken ? 'bg-emerald-500 border-emerald-500' : 'border-border hover:border-emerald-500'}`}>
                        {m.taken && <CheckCircle size={14} className="text-white" />}
                      </motion.button>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.dosage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Tip */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5 card-hover lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl gradient-hero flex items-center justify-center">
                  <Brain size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-foreground">AI Daily Health Tip</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Powered by Groq</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{healthTip}</p>
              <div className="mt-4 flex gap-2">
                <Link href="/chatbot"
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                  Ask AI more <ChevronRight size={12} />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {QUICK_ACTIONS.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Link key={i} href={a.href}>
                    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2 cursor-pointer group">
                      <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">{a.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Upcoming placeholder */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-5 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <h3 className="font-semibold text-foreground">Upcoming</h3>
              </div>
            </div>
            <div className="text-center py-6 text-muted-foreground">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No upcoming events. Use the modules above to log your health data!</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
