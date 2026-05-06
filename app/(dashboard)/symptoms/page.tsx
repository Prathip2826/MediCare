'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, X, Send, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const dynamic = 'force-dynamic';

const COMMON_SYMPTOMS = [
  'Headache','Fever','Cough','Fatigue','Nausea','Dizziness',
  'Chest pain','Shortness of breath','Back pain','Sore throat',
  'Runny nose','Stomach ache','Joint pain','Muscle aches',
];

const DURATIONS = ['Today','2-3 days','1 week','2 weeks','1 month+'];
const SEVERITIES = [
  { label: 'Mild', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
  { label: 'Moderate', color: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  { label: 'Severe', color: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
];

export default function SymptomsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom]     = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [age, setAge]           = useState('');
  const [gender, setGender]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState('');
  const [streaming, setStreaming] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const addSymptom = (s: string) => {
    if (!selected.includes(s) && selected.length < 10) setSelected(prev => [...prev, s]);
  };
  const removeSymptom = (s: string) => setSelected(prev => prev.filter(x => x !== s));
  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim())) {
      addSymptom(custom.trim()); setCustom('');
    }
  };

  const analyze = async () => {
    if (selected.length === 0) return;
    setLoading(true); setResult(''); setStreaming('');
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);

    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selected, duration, severity, age, gender }),
      });

      if (!res.body) throw new Error('No response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || '';
            full += delta;
            setStreaming(full);
          } catch {}
        }
      }
      setResult(full);
      setStreaming('');
    } catch {
      setResult('Unable to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Symptom selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Activity size={16} className="text-blue-500" />
          </div>
          <h2 className="font-bold text-foreground">Select Your Symptoms</h2>
          <span className="ml-auto text-xs text-muted-foreground">{selected.length}/10</span>
        </div>

        {/* Selected tags */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
            {selected.map(s => (
              <motion.span key={s} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {s}
                <button onClick={() => removeSymptom(s)}>
                  <X size={12} className="hover:text-red-500 transition-colors" />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {/* Common symptoms */}
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_SYMPTOMS.map(s => (
            <button key={s} onClick={() => addSymptom(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all
                ${selected.includes(s)
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex gap-2">
          <input value={custom} onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Add custom symptom..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-foreground
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <button onClick={addCustom}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
            <Plus size={16} /> Add
          </button>
        </div>
      </motion.div>

      {/* Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Duration */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Clock size={14} /> Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all
                  ${duration === d ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle size={14} /> Severity
          </label>
          <div className="flex gap-2">
            {SEVERITIES.map(s => (
              <button key={s.label} onClick={() => setSeverity(s.label)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all
                  ${severity === s.label ? s.color : 'border-border text-muted-foreground hover:border-border/80'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age & Gender */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Age</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28"
            className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm text-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="">Select gender</option>
            <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
          </select>
        </div>
      </motion.div>

      {/* Analyze button */}
      <motion.button onClick={analyze} disabled={loading || selected.length === 0}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full py-4 rounded-xl gradient-hero text-white font-bold text-base
          disabled:opacity-50 disabled:cursor-not-allowed shadow-lg btn-glow flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={20} className="animate-spin" /> Analyzing with AI...</> : <><Send size={18} /> Analyze Symptoms</>}
      </motion.button>

      {/* Result */}
      <AnimatePresence>
        {(streaming || result) && (
          <motion.div ref={resultRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl gradient-hero flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <h3 className="font-bold text-foreground">AI Analysis</h3>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Powered by Groq</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-foreground">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-foreground">{children}</ol>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-r-xl my-3 text-amber-800 dark:text-amber-200">
                      {children}
                    </blockquote>
                  ),
                }}>
                {streaming || result}
              </ReactMarkdown>
              {loading && streaming && (
                <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
              )}
            </div>
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                This is not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation and treatment.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
