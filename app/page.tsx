'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Brain, Shield, Apple, Dumbbell, BookOpen,
  MessageSquare, ArrowRight, Star, ChevronLeft, ChevronRight,
  Pill, BarChart2, Leaf, AlertTriangle, CheckCircle, Zap, Globe
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start = 0; const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => { start += step; if (start >= target) { setCount(target); clearInterval(t); } else setCount(start); }, 16);
    return () => clearInterval(t);
  }, [started, target, duration]);
  return { count, ref };
}

const FEATURES = [
  { icon: Activity, title: 'Symptom Checker', desc: 'AI-powered analysis of your symptoms with condition probabilities', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Brain,    title: 'AI Health Chatbot', desc: 'Chat with our medical AI for instant health guidance 24/7', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: Pill,     title: 'Medicine Tracker', desc: 'Never miss a dose with smart reminders and refill alerts', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { icon: BarChart2,title: 'Vitals Monitor', desc: 'Track blood pressure, glucose, heart rate and more', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Apple,    title: 'Nutrition Tracker', desc: 'Log meals, count calories, get personalized diet plans', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { icon: Dumbbell, title: 'Fitness Tracker', desc: 'Log workouts, track streaks, get AI exercise plans', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  { icon: Leaf,     title: 'Wellness Hub', desc: 'Meditation, sleep tracking, stress management tools', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { icon: AlertTriangle, title: 'Emergency Center', desc: 'SOS alerts, CPR guides, local emergency numbers instantly', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
];

const STEPS = [
  { step: '01', title: 'Create Account', desc: 'Sign up free with Google or email in under 30 seconds.', icon: Shield },
  { step: '02', title: 'Add Health Data', desc: 'Enter your vitals, symptoms, medications and health history.', icon: Activity },
  { step: '03', title: 'Get AI Insights', desc: 'Receive personalized health insights and recommendations.', icon: Brain },
];

const CATEGORIES = [
  'Preventive Care', 'Mental Wellness', 'Chronic Disease', 'Emergency Prep',
  'Nutrition & Lifestyle', "Women's Health", 'Senior Care', 'Child Health',
];

const TESTIMONIALS = [
  { name: 'Sarah M.', country: 'United States', rating: 5, text: 'MediCare helped me identify my symptoms accurately. The AI chatbot is incredibly helpful and reassuring!', avatar: 'SM' },
  { name: 'Raj K.', country: 'India', rating: 5, text: 'The medicine tracker is a lifesaver. I never forget my medications now and the reminders work perfectly.', avatar: 'RK' },
  { name: 'Emma L.', country: 'United Kingdom', rating: 5, text: 'Best health app I\'ve used. The vitals tracking and AI analysis are top-notch. Highly recommended!', avatar: 'EL' },
  { name: 'Carlos R.', country: 'Brazil', rating: 5, text: 'The emergency center feature saved my life. Had CPR instructions ready when my father needed help.', avatar: 'CR' },
  { name: 'Aisha B.', country: 'Nigeria', rating: 5, text: 'Accessible, beautiful, and packed with features. Finally a health app designed for everyone globally!', avatar: 'AB' },
  { name: 'Yuki T.', country: 'Japan', rating: 5, text: 'The wellness hub is amazing. Sleep tracking and meditation features have improved my life quality.', avatar: 'YT' },
];

function StatCard({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-extrabold gradient-text">{count.toLocaleString()}{suffix}</div>
      <div className="text-muted-foreground text-sm mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setTestimonialIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Heart size={16} className="text-white" fill="white" />
            </div>
            <span className="font-extrabold text-xl gradient-text">MediCare</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all btn-glow">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <Heart size={60} className="text-primary" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delay opacity-20">
          <Activity size={50} className="text-secondary" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float-slow opacity-20">
          <Pill size={45} className="text-accent" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float opacity-20">
          <Brain size={55} className="text-primary" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap size={14} /> AI-Powered Health Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Your Health,<br /><span className="gradient-text">Everywhere.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              AI-powered personal health management for everyone, everywhere.
              Track symptoms, medications, vitals, and get instant AI health insights.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/login" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all btn-glow">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <a href="#how" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors">
                See How It Works
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <StatCard target={10000} suffix="+" label="Active Users" />
              <StatCard target={50000} suffix="+" label="Symptoms Checked" />
              <StatCard target={99} suffix=".9%" label="Uptime" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block">
            <div className="glass-light rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-sm text-muted-foreground font-medium">MediCare Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Health Score', value: '92', color: 'bg-emerald-500', icon: '❤️' },
                  { label: 'Steps Today', value: '7,842', color: 'bg-blue-500', icon: '👟' },
                  { label: 'Water Intake', value: '6/8 glasses', color: 'bg-cyan-500', icon: '💧' },
                  { label: 'Medicines', value: '2 today', color: 'bg-purple-500', icon: '💊' },
                ].map((w, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-card rounded-xl p-3 border border-border">
                    <div className="text-xl mb-1">{w.icon}</div>
                    <div className="text-xs text-muted-foreground">{w.label}</div>
                    <div className="text-base font-bold text-foreground mt-0.5">{w.value}</div>
                    <div className={`mt-2 h-1.5 rounded-full ${w.color} opacity-60`} style={{ width: '70%' }} />
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">AI Health Tip</span>
                </div>
                <p className="text-xs text-muted-foreground">Stay hydrated! Drinking water helps maintain blood pressure and supports kidney function.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Everything You Need for <span className="gradient-text">Better Health</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">8 powerful modules to help you manage every aspect of your health</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(14,165,233,0.15)' }}
                  className="bg-card rounded-2xl p-5 border border-border cursor-pointer transition-all">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                    <Icon size={20} className={f.color} />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-muted-foreground">Get started in minutes</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center relative">
                  <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-1 tracking-widest">STEP {s.step}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-3">Health <span className="gradient-text">Categories</span></h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2.5 rounded-full glass-light border border-primary/20 text-sm font-medium text-foreground cursor-pointer hover:border-primary/50 transition-all">
                {c}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-4xl font-extrabold mb-3">Loved by <span className="gradient-text">Users Worldwide</span></h2>
          </motion.div>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}
                className="bg-card rounded-3xl p-8 border border-border text-center shadow-lg">
                <div className="flex justify-center mb-4">
                  {[...Array(TESTIMONIALS[testimonialIdx].rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-foreground mb-6 max-w-2xl mx-auto italic">"{TESTIMONIALS[testimonialIdx].text}"</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{TESTIMONIALS[testimonialIdx].avatar}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground">{TESTIMONIALS[testimonialIdx].name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1"><Globe size={12} />{TESTIMONIALS[testimonialIdx].country}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center items-center gap-4 mt-6">
              <button onClick={prev} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft size={16} /></button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setTestimonialIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-primary w-6' : 'bg-border'}`} />
                ))}
              </div>
              <button onClick={next} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard target={195} suffix="+" label="Countries Supported" />
            <StatCard target={10000} suffix="+" label="Active Users" />
            <StatCard target={50000} suffix="+" label="Symptoms Analyzed" />
            <StatCard target={1000} suffix="+" label="Health Articles" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="gradient-hero rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold mb-4">Start Your Health Journey Today</h2>
              <p className="text-lg opacity-90 mb-8">Join 10,000+ users managing their health smarter with AI</p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl">
                Get Started Free <ArrowRight size={20} />
              </Link>
              <p className="text-sm opacity-70 mt-4">No credit card required • Free forever plan</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
                <Heart size={14} className="text-white" fill="white" />
              </div>
              <span className="font-extrabold text-lg gradient-text">MediCare</span>
              <span className="text-xs text-muted-foreground ml-2">Your Health, Everywhere.</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 MediCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
