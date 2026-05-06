'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Heart, AlertTriangle, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

const EMERGENCY_NUMBERS: Record<string, { police: string; ambulance: string; fire: string; poison: string }> = {
  'IN': { police: '100', ambulance: '108', fire: '101', poison: '1800-116-117' },
  'US': { police: '911', ambulance: '911', fire: '911', poison: '1-800-222-1222' },
  'GB': { police: '999', ambulance: '999', fire: '999', poison: '0344 892 0111' },
  'AU': { police: '000', ambulance: '000', fire: '000', poison: '13 11 26' },
  'CA': { police: '911', ambulance: '911', fire: '911', poison: '1-800-268-9017' },
};

const FIRST_AID_GUIDES = [
  { title: 'CPR Guide', emoji: '❤️', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    steps: ['Call emergency services (911/108) immediately','Lay the person on a firm, flat surface','Tilt head back, lift chin to open airway','Give 2 rescue breaths (1 second each)','Perform 30 chest compressions (hard & fast — 2 inches deep)','Repeat cycle until help arrives'] },
  { title: 'Choking', emoji: '🫁', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    steps: ['Ask "Are you choking?" — if yes, act immediately','Stand behind them, lean them slightly forward','Give 5 firm back blows between shoulder blades','Give 5 abdominal thrusts (Heimlich maneuver)','Alternate back blows and abdominal thrusts','If unconscious, begin CPR and call emergency services'] },
  { title: 'Severe Bleeding', emoji: '🩸', color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    steps: ['Call emergency services immediately','Apply direct pressure with clean cloth','Elevate the injured area above heart level','Maintain steady pressure — do not remove cloth','Apply tourniquet if limb injury and bleeding severe','Monitor for shock (pale skin, rapid pulse)'] },
  { title: 'Burns', emoji: '🔥', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    steps: ['Remove from heat source immediately','Cool burn with cool (not cold) running water for 20 min','Remove jewelry/tight items near burn','Cover with sterile non-fluffy material','Do NOT apply butter, toothpaste, or ice','Seek medical attention for large or deep burns'] },
  { title: 'Stroke (FAST)', emoji: '🧠', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    steps: ['F — Face drooping? Ask to smile', 'A — Arm weakness? Ask to raise both arms', 'S — Speech difficulty? Slurred or strange?', 'T — Time to call emergency services IMMEDIATELY', 'Note the time symptoms started', 'Do NOT give food, water, or medication'] },
  { title: 'Allergic Reaction', emoji: '⚠️', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    steps: ['Call emergency services for severe reactions','Use epinephrine auto-injector (EpiPen) if available','Lay person flat, raise legs (unless breathing difficulty)','Loosen tight clothing','Be prepared to give CPR if they stop breathing','Stay with person until help arrives'] },
];

const CRISIS_LINES = [
  { name: 'Mental Health Crisis (IN)', number: 'iCall: 9152987821' },
  { name: 'Suicide Prevention (US)', number: '988' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741' },
  { name: 'International Association', number: 'findahelpline.com' },
];

export default function EmergencyPage() {
  const [country, setCountry] = useState('IN');
  const [sos, setSos] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const nums = EMERGENCY_NUMBERS[country] || EMERGENCY_NUMBERS['IN'];

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => {
      if (d.country_code && EMERGENCY_NUMBERS[d.country_code]) setCountry(d.country_code);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* SOS Button */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center justify-center gap-2">
          <AlertTriangle size={22} /> Emergency Center
        </h2>
        <p className="text-sm text-muted-foreground mb-5">In a life-threatening emergency, call your local emergency number immediately.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={sos ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(239,68,68,0.4)', '0 0 0 20px rgba(239,68,68,0)'] } : {}}
          transition={sos ? { duration: 1, repeat: Infinity } : {}}
          onClick={() => { setSos(true); window.location.href = `tel:${nums.ambulance}`; }}
          className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white font-extrabold text-lg shadow-2xl mx-auto flex flex-col items-center justify-center gap-1 animate-pulse-glow">
          <Phone size={28} />
          <span>SOS</span>
          <span className="text-xs font-normal opacity-80">{nums.ambulance}</span>
        </motion.button>
      </motion.div>

      {/* Emergency Numbers */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><MapPin size={18} className="text-primary" /><h3 className="font-bold text-foreground">Emergency Numbers</h3></div>
          <select value={country} onChange={e => setCountry(e.target.value)}
            className="text-sm px-2 py-1 rounded-lg border border-border bg-muted/50 text-foreground focus:outline-none">
            {Object.keys(EMERGENCY_NUMBERS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Police', num: nums.police, emoji: '🚔' },
            { label: 'Ambulance', num: nums.ambulance, emoji: '🚑' },
            { label: 'Fire', num: nums.fire, emoji: '🚒' },
            { label: 'Poison Control', num: nums.poison, emoji: '☠️' },
          ].map((n, i) => (
            <a key={i} href={`tel:${n.num}`}
              className="flex flex-col items-center p-4 rounded-xl bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all cursor-pointer group">
              <span className="text-2xl mb-1">{n.emoji}</span>
              <span className="text-xs text-muted-foreground">{n.label}</span>
              <span className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">{n.num}</span>
            </a>
          ))}
        </div>
      </motion.div>

      {/* First Aid Guides */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Shield size={18} className="text-primary" />First Aid Guides</h3>
        {FIRST_AID_GUIDES.map((g, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`border rounded-2xl overflow-hidden ${g.color}`}>
            <button onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.emoji}</span>
                <span className="font-semibold text-foreground">{g.title}</span>
              </div>
              <motion.span animate={{ rotate: expandedGuide === i ? 180 : 0 }} className="text-muted-foreground">▼</motion.span>
            </button>
            {expandedGuide === i && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="px-4 pb-4">
                <ol className="space-y-2">
                  {g.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="w-6 h-6 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{j + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mental Health Crisis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4"><Heart size={18} className="text-pink-500" /><h3 className="font-bold text-foreground">Mental Health Crisis Lines</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CRISIS_LINES.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-sm text-foreground">{c.name}</span>
              <span className="text-sm font-bold text-primary">{c.number}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
