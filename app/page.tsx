"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  HeartPulse, 
  Activity, 
  Pill, 
  FileText, 
  Calendar, 
  Brain, 
  MessageSquare,
  ShieldCheck,
  Globe,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Symptom Checker",
    description: "AI-powered analysis of your symptoms for quick guidance.",
    icon: Activity,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Medicine Tracker",
    description: "Never miss a dose with smart reminders and streaks.",
    icon: Pill,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Medical Reports",
    description: "Upload and let AI summarize your medical reports easily.",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Smart Appointments",
    description: "Book doctors and prepare questions automatically.",
    icon: Calendar,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Mental Health",
    description: "Track your mood, journal, and practice breathing.",
    icon: Brain,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "First Aid Guide",
    description: "Offline-capable emergency instructions and local numbers.",
    icon: HeartPulse,
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "AI Health Chatbot",
    description: "Your 24/7 personalized medical assistant.",
    icon: MessageSquare,
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    title: "Secure Data",
    description: "Your health records are encrypted and private.",
    icon: ShieldCheck,
    color: "bg-indigo-500/10 text-indigo-500",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl tracking-tight text-primary">MediCare</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it works</Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Testimonials</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground">
                Your Health, <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Everywhere.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                The all-in-one personal health management platform. Track medicines, check symptoms, upload reports, and get AI-driven insights—all in one secure place.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base shadow-lg shadow-primary/25">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-base">
                    Explore Features
                  </Button>
                </Link>
              </div>
              
              <div className="pt-12 flex items-center justify-center gap-8 text-muted-foreground text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>Available Globally</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Bank-grade Security</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need for your health</h2>
              <p className="text-muted-foreground text-lg">
                Powerful tools designed to give you complete control over your medical journey.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl font-bold">Ready to take control?</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users managing their health seamlessly with MediCare. No credit card required.
              </p>
              <Link href="/login" className="inline-block">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg">
                  Join MediCare Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">MediCare</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MediCare. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
