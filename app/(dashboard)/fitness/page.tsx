'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Trash2, Flame, Target, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const EXERCISE_TYPES = ['Running','Walking','Cycling','Swimming','Weight Training','Yoga','HIIT','Stretching','Other'];

interface FitnessLog { id?: string; exercise_type: string; duration_minutes: number; calories_burned: number; notes?: string; created_at?: string; }

export default function FitnessPage() {
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [form, setForm] = useState({ exercise_type: 'Running', duration_minutes: '', calories_burned: '', notes: '' });
  const [steps, setSteps] = useState('');
  const [stepGoal] = useState(10000);
  const [saving, setSaving] = useState(false);
  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) { setUserId(user.uid); fetchLogs(user.uid); }
    });
    return () => unsub();
  }, []);

  const fetchLogs = async (uid: string) => {
    try {
      const res = await fetch('/api/fitness', { headers: { 'x-user-id': uid } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLogs(data);
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const weekly = days.map(day => ({ day, calories: 0 }));
      data.slice(0, 7).forEach((log: FitnessLog, i: number) => { if (i < 7) weekly[i].calories = log.calories_burned || 0; });
      setWeeklyData(weekly);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load fitness logs');
    }
  };

  const addLog = async () => {
    if (!form.duration_minutes) { toast.error('Duration is required'); return; }
    if (!userId) { toast.error('Not authenticated'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          exercise_type: form.exercise_type,
          duration_minutes: Number(form.duration_minutes),
          calories_burned: Number(form.calories_burned) || 0,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Exercise logged! 🔥');
      setForm({ exercise_type: 'Running', duration_minutes: '', calories_burned: '', notes: '' });
      fetchLogs(userId);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save log');
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/fitness?id=${id}`, { method: 'DELETE', headers: { 'x-user-id': userId } });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Log removed');
      fetchLogs(userId);
    } catch {
      toast.error('Could not delete log');
    }
  };

  const todayLogs = logs.filter(l => l.created_at?.startsWith(new Date().toISOString().split('T')[0]));
  const totalCalToday = todayLogs.reduce((s, l) => s + l.calories_burned, 0);
  const totalMinToday = todayLogs.reduce((s, l) => s + l.duration_minutes, 0);
  const streak = Math.min(logs.length, 7);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: "Calories Burned", value: `${totalCalToday}`, unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { icon: Dumbbell, label: "Active Time", value: `${totalMinToday}`, unit: 'min', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Target, label: "Steps", value: steps || '—', unit: `/ ${stepGoal.toLocaleString()}`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: Trophy, label: "Streak", value: `${streak}`, unit: 'days', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 card-hover">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                <Icon size={18} className={s.color} />
              </div>
              <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.unit}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Steps input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-3">Today's Steps</h3>
        <div className="flex gap-3 items-center">
          <input type="number" value={steps} onChange={e => setSteps(e.target.value)} placeholder="Enter step count"
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={() => toast.success('Steps logged!')}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Log Steps
          </button>
        </div>
        <div className="mt-3 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full gradient-hero rounded-full"
            initial={{ width: 0 }} animate={{ width: `${Math.min((Number(steps) / stepGoal) * 100, 100)}%` }}
            transition={{ duration: 0.6 }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{steps ? `${Math.round((Number(steps)/stepGoal)*100)}% of daily goal` : '0% of daily goal'}</p>
      </motion.div>

      {/* Log Exercise */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4"><Plus size={18} className="text-primary" /><h3 className="font-bold text-foreground">Log Exercise</h3></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Exercise Type</label>
            <select value={form.exercise_type} onChange={e => setForm(p => ({ ...p, exercise_type: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
              {EXERCISE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Duration (min) *</label>
            <input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Calories Burned</label>
            <input type="number" value={form.calories_burned} onChange={e => setForm(p => ({ ...p, calories_burned: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="How was your workout?"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <motion.button onClick={addLog} disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="px-6 py-2.5 rounded-xl gradient-hero text-white font-semibold text-sm btn-glow disabled:opacity-50">
          {saving ? 'Saving...' : 'Log Exercise'}
        </motion.button>
      </motion.div>

      {/* Weekly Chart */}
      {weeklyData.some(d => d.calories > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Weekly Activity (Calories Burned)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v} kcal`, 'Calories']} />
              <Bar dataKey="calories" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Logs */}
      {logs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Workouts</h3>
          <div className="space-y-2">
            {logs.slice(0, 8).map((l, i) => (
              <div key={l.id ?? i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Dumbbell size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.exercise_type}</p>
                    <p className="text-xs text-muted-foreground">{l.duration_minutes} min · {l.calories_burned} kcal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{l.created_at ? new Date(l.created_at).toLocaleDateString() : ''}</span>
                  {l.id && (
                    <button onClick={() => deleteLog(l.id!)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
