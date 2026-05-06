'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Apple, Plus, Trash2, Droplets, Brain } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

interface MealEntry { id?: string; meal_type: string; food_name: string; calories: number; protein?: number; carbs?: number; fat?: number; }

export default function NutritionPage() {
  const [logs, setLogs] = useState<MealEntry[]>([]);
  const [form, setForm] = useState({ meal_type: 'Breakfast', food_name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [saving, setSaving] = useState(false);
  const [calorieGoal] = useState(2000);
  const [aiTip, setAiTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    if (!supabase || !auth?.currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('nutrition_logs').select('*')
      .eq('user_id', auth.currentUser.uid)
      .gte('created_at', today).order('created_at', { ascending: false });
    if (data) setLogs(data);
  };

  const addMeal = async () => {
    if (!form.food_name || !form.calories) { toast.error('Food name and calories are required'); return; }
    if (!supabase || !auth?.currentUser) return;
    setSaving(true);
    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: auth.currentUser.uid,
      meal_type: form.meal_type, food_name: form.food_name,
      calories: Number(form.calories), protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0,
    });
    if (error) toast.error(error.message);
    else { toast.success('Meal logged!'); setForm({ meal_type: 'Breakfast', food_name: '', calories: '', protein: '', carbs: '', fat: '' }); fetchLogs(); }
    setSaving(false);
  };

  const deleteLog = async (id?: string) => {
    if (!id || !supabase) return;
    await supabase.from('nutrition_logs').delete().eq('id', id);
    setLogs(prev => prev.filter(l => l.id !== id));
    toast.success('Removed');
  };

  const getAiTip = async () => {
    setLoadingTip(true);
    try {
      const totalCal = logs.reduce((s, l) => s + l.calories, 0);
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `I've consumed ${totalCal} calories today with these meals: ${logs.map(l => l.food_name).join(', ')}. My goal is ${calorieGoal} calories. Give me 2-3 brief, personalized nutrition tips for the rest of the day.` }] }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.replace('data: ', '').trim(); if (data === '[DONE]') break;
          try { full += JSON.parse(data).choices?.[0]?.delta?.content || ''; } catch {}
        }
      }
      setAiTip(full);
    } catch { toast.error('Could not get AI tip'); }
    setLoadingTip(false);
  };

  const totalCal = logs.reduce((s, l) => s + l.calories, 0);
  const totalProtein = logs.reduce((s, l) => s + (l.protein || 0), 0);
  const totalCarbs = logs.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = logs.reduce((s, l) => s + (l.fat || 0), 0);
  const pieData = [
    { name: 'Protein', value: totalProtein },
    { name: 'Carbs', value: totalCarbs },
    { name: 'Fat', value: totalFat },
  ].filter(d => d.value > 0);

  const mealGroups = MEAL_TYPES.reduce((acc, mt) => {
    acc[mt] = logs.filter(l => l.meal_type === mt);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Calorie Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Apple size={18} className="text-orange-500" />
              <h3 className="font-bold text-foreground">Calorie Tracker</h3>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Goal: {calorieGoal} kcal</span>
          </div>
          <div className="text-4xl font-extrabold gradient-text mb-1">{totalCal} <span className="text-base font-normal text-muted-foreground">kcal</span></div>
          <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${totalCal > calorieGoal ? 'bg-red-500' : 'gradient-hero'}`}
              initial={{ width: 0 }} animate={{ width: `${Math.min((totalCal / calorieGoal) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{totalCal} consumed</span>
            <span>{Math.max(0, calorieGoal - totalCal)} remaining</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[['Protein', totalProtein, 'g', '#0EA5E9'], ['Carbs', totalCarbs, 'g', '#10B981'], ['Fat', totalFat, 'g', '#F59E0B']].map(([label, val, unit, color]) => (
              <div key={label as string} className="text-center bg-muted/50 rounded-xl p-2">
                <div className="text-lg font-bold" style={{ color: color as string }}>{val}{unit}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {pieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Macros Breakdown</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}g`]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Add Meal */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={18} className="text-primary" /><h3 className="font-bold text-foreground">Log a Meal</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Meal Type</label>
            <select value={form.meal_type} onChange={e => setForm(p => ({ ...p, meal_type: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
              {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Food Name *</label>
            <input value={form.food_name} onChange={e => setForm(p => ({ ...p, food_name: e.target.value }))} placeholder="e.g. Grilled Chicken Salad"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          {[['calories', 'Calories (kcal) *'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)']].map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input type="number" value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          ))}
        </div>
        <motion.button onClick={addMeal} disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="px-6 py-2.5 rounded-xl gradient-hero text-white font-semibold text-sm btn-glow disabled:opacity-50">
          {saving ? 'Saving...' : 'Add Meal'}
        </motion.button>
      </motion.div>

      {/* Meal List */}
      {MEAL_TYPES.map(mt => mealGroups[mt]?.length > 0 && (
        <motion.div key={mt} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{mt}</h3>
            <span className="text-xs text-muted-foreground">{mealGroups[mt].reduce((s, l) => s + l.calories, 0)} kcal</span>
          </div>
          <div className="space-y-2">
            {mealGroups[mt].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.food_name}</p>
                  <p className="text-xs text-muted-foreground">{m.calories} kcal{m.protein ? ` · P:${m.protein}g` : ''}{m.carbs ? ` · C:${m.carbs}g` : ''}{m.fat ? ` · F:${m.fat}g` : ''}</p>
                </div>
                <button onClick={() => deleteLog(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* AI Tip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Brain size={16} className="text-primary" /><h3 className="font-semibold text-foreground">AI Nutrition Advice</h3></div>
          <button onClick={getAiTip} disabled={loadingTip || logs.length === 0}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
            {loadingTip ? 'Analyzing...' : 'Get AI Tips'}
          </button>
        </div>
        {aiTip ? <p className="text-sm text-foreground leading-relaxed">{aiTip}</p>
          : <p className="text-sm text-muted-foreground">Log your meals and click "Get AI Tips" for personalized nutrition advice.</p>}
      </motion.div>
    </div>
  );
}
