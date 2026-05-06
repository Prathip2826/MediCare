'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Moon, Wind, Heart, BookOpen, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const MOODS = ['😢','😔','😐','😊','😄'];
const SLEEP_QUALITY = ['Poor','Fair','Good','Great','Excellent'];
const BREATHING_STEPS = ['Inhale slowly for 4 seconds...','Hold your breath for 7 seconds...','Exhale completely for 8 seconds...'];
const MEDITATION_TIMES = [5, 10, 15, 20];

export default function WellnessPage() {
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [mood, setMood] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [saving, setSaving] = useState(false);

  // Meditation timer
  const [medTime, setMedTime] = useState(5);
  const [medRunning, setMedRunning] = useState(false);
  const [medSeconds, setMedSeconds] = useState(0);
  const medRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing
  const [breathStep, setBreathStep] = useState(-1);
  const breathRef = useRef<NodeJS.Timeout | null>(null);

  const startMeditation = () => {
    setMedRunning(true); setMedSeconds(medTime * 60);
    medRef.current = setInterval(() => {
      setMedSeconds(s => { if (s <= 1) { clearInterval(medRef.current!); setMedRunning(false); toast.success('Meditation complete! 🧘'); return 0; } return s - 1; });
    }, 1000);
  };
  const stopMeditation = () => { clearInterval(medRef.current!); setMedRunning(false); setMedSeconds(0); };

  const startBreathing = () => {
    let step = 0; setBreathStep(0);
    const durations = [4000, 7000, 8000];
    const cycle = () => {
      setBreathStep(step);
      breathRef.current = setTimeout(() => { step = (step + 1) % 3; cycle(); }, durations[step]);
    };
    cycle();
  };
  const stopBreathing = () => { clearTimeout(breathRef.current!); setBreathStep(-1); };
  useEffect(() => () => { clearInterval(medRef.current!); clearTimeout(breathRef.current!); }, []);

  const saveWellness = async () => {
    if (!supabase || !auth?.currentUser) { toast.error('Not authenticated'); return; }
    setSaving(true);
    const { error } = await supabase.from('wellness_logs').insert({
      user_id: auth.currentUser.uid, stress_level: stressLevel,
      sleep_hours: sleepHours ? Number(sleepHours) : null,
      sleep_quality: sleepQuality, mood, gratitude_note: gratitude,
    });
    if (error) toast.error(error.message);
    else { toast.success('Wellness log saved! 🌟'); setGratitude(''); }
    setSaving(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Daily Wellness Check */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Leaf size={18} className="text-teal-500" />
          <h3 className="font-bold text-foreground">Daily Wellness Check</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stress */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Stress Level: <span className="text-primary">{stressLevel}/10</span></label>
            <input type="range" min={1} max={10} value={stressLevel} onChange={e => setStressLevel(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Calm</span><span>Very Stressed</span></div>
          </div>
          {/* Mood */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Mood</label>
            <div className="flex gap-3">
              {MOODS.map(m => (
                <motion.button key={m} onClick={() => setMood(m)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                  className={`text-2xl p-1.5 rounded-xl transition-all ${mood === m ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'hover:bg-muted'}`}>{m}</motion.button>
              ))}
            </div>
          </div>
          {/* Sleep */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Moon size={14} /> Sleep Hours</label>
            <input type="number" step="0.5" min="0" max="24" value={sleepHours} onChange={e => setSleepHours(e.target.value)} placeholder="e.g. 7.5"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Sleep Quality</label>
            <div className="flex flex-wrap gap-2">
              {SLEEP_QUALITY.map(q => (
                <button key={q} onClick={() => setSleepQuality(q)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all ${sleepQuality === q ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          {/* Gratitude */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Star size={14} /> Gratitude Journal</label>
            <textarea value={gratitude} onChange={e => setGratitude(e.target.value)} rows={2}
              placeholder="What are you grateful for today?"
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <motion.button onClick={saveWellness} disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="mt-4 px-6 py-2.5 rounded-xl gradient-hero text-white font-semibold text-sm btn-glow disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Wellness Log'}
        </motion.button>
      </motion.div>

      {/* Meditation Timer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><Heart size={18} className="text-pink-500" /><h3 className="font-bold text-foreground">Meditation Timer</h3></div>
        <div className="flex flex-wrap gap-2 mb-5">
          {MEDITATION_TIMES.map(t => (
            <button key={t} onClick={() => { if (!medRunning) setMedTime(t); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                ${medTime === t && !medRunning ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
              {t} min
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4">
          <motion.div className="relative w-32 h-32 flex items-center justify-center"
            animate={medRunning ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 4, repeat: Infinity }}>
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              {medRunning && (
                <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#0EA5E9" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={314} strokeDashoffset={314 - (medSeconds / (medTime * 60)) * 314}
                  transition={{ duration: 1, ease: 'linear' }} />
              )}
            </svg>
            <div className="text-2xl font-extrabold gradient-text">{medRunning ? formatTime(medSeconds) : `${medTime}:00`}</div>
          </motion.div>
          <div className="flex gap-3">
            {!medRunning
              ? <motion.button onClick={startMeditation} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 rounded-xl gradient-hero text-white font-semibold text-sm btn-glow">Start Meditation</motion.button>
              : <motion.button onClick={stopMeditation} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm">Stop</motion.button>}
          </div>
        </div>
      </motion.div>

      {/* Breathing Exercise */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><Wind size={18} className="text-cyan-500" /><h3 className="font-bold text-foreground">4-7-8 Breathing Exercise</h3></div>
        <AnimatePresence mode="wait">
          {breathStep >= 0 ? (
            <motion.div key={breathStep} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6">
              <motion.div className="w-24 h-24 rounded-full gradient-hero mx-auto mb-4 flex items-center justify-center"
                animate={{ scale: breathStep === 0 ? [1, 1.4] : breathStep === 1 ? 1.4 : [1.4, 1] }}
                transition={{ duration: breathStep === 0 ? 4 : breathStep === 1 ? 7 : 8, ease: 'easeInOut' }}>
                <Wind size={28} className="text-white" />
              </motion.div>
              <p className="text-lg font-semibold text-foreground">{BREATHING_STEPS[breathStep]}</p>
              <button onClick={stopBreathing} className="mt-4 text-sm text-red-500 hover:underline">Stop</button>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">4-7-8 breathing reduces anxiety and promotes relaxation.</p>
              <motion.button onClick={startBreathing} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 transition-colors">
                Start Breathing
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
