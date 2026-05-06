'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const VITALS_CONFIG = [
  { key: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', normal: [90, 120], color: '#0EA5E9' },
  { key: 'blood_pressure_diastolic', label: 'BP (Diastolic)', unit: 'mmHg', normal: [60, 80], color: '#06B6D4' },
  { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', normal: [60, 100], color: '#EF4444' },
  { key: 'blood_glucose', label: 'Blood Glucose', unit: 'mg/dL', normal: [70, 100], color: '#F59E0B' },
  { key: 'temperature', label: 'Temperature', unit: '°F', normal: [97, 99], color: '#10B981' },
  { key: 'spo2', label: 'SpO2', unit: '%', normal: [95, 100], color: '#8B5CF6' },
  { key: 'weight', label: 'Weight', unit: 'kg', normal: [50, 90], color: '#EC4899' },
];

interface VitalEntry { [key: string]: number | string; created_at: string; }

export default function VitalsPage() {
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVitals(); }, []);

  const fetchVitals = async () => {
    if (!supabase || !auth?.currentUser) return;
    setLoading(true);
    const { data } = await supabase.from('vital_signs').select('*')
      .eq('user_id', auth.currentUser.uid).order('created_at', { ascending: false }).limit(20);
    if (data) setEntries(data);
    setLoading(false);
  };

  const saveVitals = async () => {
    if (!supabase || !auth?.currentUser) { toast.error('Not authenticated'); return; }
    setSaving(true);
    const payload: Record<string, number | string> = { user_id: auth.currentUser.uid };
    Object.entries(form).forEach(([k, v]) => { if (v) payload[k] = parseFloat(v); });
    const { error } = await supabase.from('vital_signs').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success('Vitals saved!'); setForm({}); fetchVitals(); }
    setSaving(false);
  };

  const getStatus = (key: string, val: number) => {
    const cfg = VITALS_CONFIG.find(v => v.key === key);
    if (!cfg) return 'normal';
    if (val < cfg.normal[0]) return 'low';
    if (val > cfg.normal[1]) return 'high';
    return 'normal';
  };

  const latestEntry = entries[0] || {};

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Current values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {VITALS_CONFIG.map(v => {
          const val = Number(latestEntry[v.key]);
          const status = val ? getStatus(v.key, val) : null;
          return (
            <motion.div key={v.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{v.label}</span>
                {status === 'high' && <TrendingUp size={14} className="text-red-500" />}
                {status === 'low'  && <TrendingDown size={14} className="text-amber-500" />}
                {status === 'normal' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              {val ? (
                <>
                  <div className="text-2xl font-extrabold" style={{ color: v.color }}>{val}</div>
                  <div className="text-xs text-muted-foreground">{v.unit}</div>
                  {status !== 'normal' && (
                    <div className={`text-[10px] mt-1 font-medium ${status === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                      {status === 'high' ? 'Above normal' : 'Below normal'}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">No data</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Log form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Plus size={18} className="text-primary" />
          <h3 className="font-bold text-foreground">Log Today's Vitals</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
          {VITALS_CONFIG.map(v => (
            <div key={v.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{v.label} ({v.unit})</label>
              <input type="number" value={form[v.key] || ''}
                onChange={e => setForm(prev => ({ ...prev, [v.key]: e.target.value }))}
                placeholder={`${v.normal[0]}-${v.normal[1]}`}
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          ))}
        </div>
        <motion.button onClick={saveVitals} disabled={saving}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="px-6 py-3 rounded-xl gradient-hero text-white font-semibold text-sm disabled:opacity-50 btn-glow">
          {saving ? 'Saving...' : 'Save Vitals'}
        </motion.button>
      </motion.div>

      {/* Chart */}
      {entries.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-primary" />
            <h3 className="font-bold text-foreground">Heart Rate Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[...entries].reverse()}>
              <XAxis dataKey="created_at" tickFormatter={v => new Date(v).toLocaleDateString()} tick={{ fontSize: 11 }} />
              <YAxis domain={[40, 160]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} bpm`, 'Heart Rate']} />
              <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'High', fontSize: 10 }} />
              <ReferenceLine y={60}  stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Low', fontSize: 10 }} />
              <Line type="monotone" dataKey="heart_rate" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Normal ranges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Normal Ranges Reference</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VITALS_CONFIG.map(v => (
            <div key={v.key} className="text-xs bg-muted/50 rounded-xl px-3 py-2">
              <span className="font-medium text-foreground">{v.label}:</span>
              <span className="text-muted-foreground ml-1">{v.normal[0]}–{v.normal[1]} {v.unit}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
