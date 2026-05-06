'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Camera, Shield, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', blood_type: '',
    height_cm: '', weight_kg: '', allergies: '', medical_conditions: '',
    emergency_contact_name: '', emergency_contact_phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!supabase || !auth?.currentUser) { setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', auth.currentUser.uid).single();
      if (data) {
        setForm({
          full_name: data.full_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          blood_type: data.blood_type || '',
          height_cm: data.height_cm?.toString() || '',
          weight_kg: data.weight_kg?.toString() || '',
          allergies: data.allergies || '',
          medical_conditions: data.medical_conditions || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    if (!supabase || !auth?.currentUser) { toast.error('Not authenticated'); return; }
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: auth.currentUser.uid,
      email: auth.currentUser.email,
      ...form,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      updated_at: new Date().toISOString(),
    });
    if (error) toast.error(error.message);
    else toast.success('Profile saved successfully! ✅');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!auth) return;
    try {
      if (auth.currentUser && supabase) {
        await supabase.from('profiles').delete().eq('id', auth.currentUser.uid);
      }
      if (auth) await signOut(auth);
      localStorage.clear();
      toast.success('Account deleted');
      router.push('/login');
    } catch { toast.error('Failed to delete account'); }
  };

  const user = auth?.currentUser;
  const initials = (form.full_name || user?.email || 'U').slice(0, 2).toUpperCase();
  const bmi = form.height_cm && form.weight_kg
    ? (Number(form.weight_kg) / Math.pow(Number(form.height_cm) / 100, 2)).toFixed(1)
    : null;
  const bmiLabel = bmi ? Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Overweight' : 'Obese' : null;

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-shimmer" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Avatar & Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Camera size={13} className="text-muted-foreground" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{form.full_name || 'Your Name'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {bmi && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">BMI: {bmi}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bmiLabel === 'Normal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{bmiLabel}</span>
                {form.blood_type && <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">Blood: {form.blood_type}</span>}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-primary" /><h3 className="font-bold text-foreground">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'date_of_birth', label: 'Date of Birth', type: 'date', placeholder: '' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
            <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select gender</option>
              <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Blood Type</label>
            <select value={form.blood_type} onChange={e => setForm(p => ({ ...p, blood_type: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Height (cm)</label>
            <input type="number" value={form.height_cm} onChange={e => setForm(p => ({ ...p, height_cm: e.target.value }))} placeholder="175"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Weight (kg)</label>
            <input type="number" value={form.weight_kg} onChange={e => setForm(p => ({ ...p, weight_kg: e.target.value }))} placeholder="70"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </motion.div>

      {/* Medical Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-primary" /><h3 className="font-bold text-foreground">Medical Information</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'allergies', label: 'Allergies', placeholder: 'e.g. Penicillin, Peanuts, Latex' },
            { key: 'medical_conditions', label: 'Medical Conditions', placeholder: 'e.g. Hypertension, Type 2 Diabetes' },
            { key: 'emergency_contact_name', label: 'Emergency Contact Name', placeholder: 'e.g. Jane Doe' },
            { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', placeholder: 'e.g. +91 98765 43210' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              <input value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-3">
        <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-hero text-white font-semibold text-sm btn-glow disabled:opacity-50">
          <Save size={16} />{saving ? 'Saving...' : 'Save Profile'}
        </motion.button>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <Download size={16} /> Export Data
        </button>
        <button onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto">
          <Trash2 size={16} /> Delete Account
        </button>
      </motion.div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-foreground mb-2">Delete Account?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action is permanent. All your data will be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
