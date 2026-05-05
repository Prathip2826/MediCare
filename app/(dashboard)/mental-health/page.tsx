"use client";

import { useState, useEffect } from "react";
import { 
  Smile, 
  Frown, 
  Meh, 
  CloudRain, 
  Sun, 
  Brain, 
  Sparkles, 
  Clock, 
  BookOpen, 
  LineChart, 
  Calendar as CalendarIcon,
  Play,
  Pause,
  RotateCcw,
  Activity,
  HeartPulse,
  Plus,
  Loader2,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";

const MOODS = [
  { label: "Great", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-500/10", value: 5 },
  { label: "Good", icon: Smile, color: "text-green-500", bg: "bg-green-500/10", value: 4 },
  { label: "Okay", icon: Meh, color: "text-blue-500", bg: "bg-blue-500/10", value: 3 },
  { label: "Bad", icon: Frown, color: "text-orange-500", bg: "bg-orange-500/10", value: 2 },
  { label: "Awful", icon: CloudRain, color: "text-red-500", bg: "bg-red-500/10", value: 1 },
];

const AFFIRMATIONS = [
  "I am capable of handling whatever this day brings.",
  "I choose to focus on what I can control.",
  "My mental health is a priority.",
  "I am deserving of rest and relaxation.",
  "Every small step counts towards my well-being.",
];

export default function MentalHealthPage() {
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [affirmation, setAffirmation] = useState("");
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [journalNote, setJournalNote] = useState("");
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [analyzingJournal, setAnalyzingJournal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [toolkitContent, setToolkitContent] = useState<{ title: string, content: React.ReactNode } | null>(null);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);

  useEffect(() => {
    fetchMoodLogs();
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, []);

  const fetchMoodLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mental-health');
      const data = await res.json();
      if (res.ok) {
        setMoodLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch mood logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (moodValue: number, moodLabel: string) => {
    setSelectedMood(moodValue);
    try {
      const res = await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_score: moodValue, mood_label: moodLabel }),
      });
      if (res.ok) {
        toast.success("Mood logged successfully");
        fetchMoodLogs();
      }
    } catch (error) {
      toast.error("Failed to log mood");
    }
  };

  const handleSaveJournal = async () => {
    if (!journalNote) return;
    try {
      const res = await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood_score: selectedMood || 3, 
          mood_label: "Journal Entry", 
          notes: journalNote 
        }),
      });
      if (res.ok) {
        toast.success("Journal entry saved");
        setJournalNote("");
        setIsJournalOpen(false);
        fetchMoodLogs();
      }
    } catch (error) {
      toast.error("Failed to save journal entry");
    }
  };

  const handleAiAnalysis = async (note: string) => {
    setAnalyzingJournal(true);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Please analyze this journal entry and provide emotional support and insights: "${note}"` 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiAnalysis(data.response);
      }
    } catch (error) {
      toast.error("AI analysis failed");
    } finally {
      setAnalyzingJournal(false);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && meditationTime > 0) {
      interval = setInterval(() => {
        setMeditationTime((time) => time - 1);
      }, 1000);
    } else if (meditationTime === 0) {
      setIsActive(false);
      clearInterval(interval);
      toast.success("Meditation session completed! Well done.");
    }
    return () => clearInterval(interval);
  }, [isActive, meditationTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMeditationTime(300);
  };

  const chartData = moodLogs
    .slice(0, 7)
    .reverse()
    .map(log => ({
      day: format(new Date(log.logged_at), 'EEE'),
      score: log.mood_score
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Mental Well-being
          </h1>
          <p className="text-muted-foreground mt-1">Nurture your mind, track your mood, and find your calm.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-sm bg-primary/5 border-primary/20 text-primary">
          {moodLogs.length > 0 ? `${moodLogs.length} Wellness Check-ins ✨` : "Start your journey today"}
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-none shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-24 w-24" />
        </div>
        <CardContent className="p-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Daily Affirmation</span>
            <h2 className="text-2xl md:text-3xl font-serif italic mt-2 text-foreground/90">
              "{affirmation}"
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 text-primary p-0 hover:bg-transparent hover:underline"
              onClick={() => setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])}
            >
              Get a new one
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" /> How are you feeling today?
            </CardTitle>
            <CardDescription>Logging your mood daily helps track emotional patterns.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex justify-between items-center gap-2 md:gap-4">
              {MOODS.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.value;
                return (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodSelect(mood.value, mood.label)}
                    className={`flex flex-col items-center gap-2 flex-1 p-4 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? `${mood.bg} ring-2 ring-primary shadow-sm scale-105` 
                        : "hover:bg-muted/50 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Icon className={`h-8 w-8 md:h-10 md:w-10 ${mood.color}`} />
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-10 h-[250px] w-full">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" /> Mood Trends (Last 7 Entries)
              </h3>
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis hide domain={[0, 6]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">
                  No mood data yet. Start logging to see trends.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/50 bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Mindful Breathing
              </CardTitle>
              <CardDescription>Take a 5-minute break to center yourself.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="text-5xl font-mono font-bold text-primary mb-6">
                {formatTime(meditationTime)}
              </div>
              <div className="flex justify-center gap-3">
                <Button 
                  size="lg" 
                  className="rounded-full h-12 w-12 p-0"
                  onClick={toggleTimer}
                >
                  {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full h-12 w-12 p-0"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 py-4 px-6 border-t border-primary/10">
              <p className="text-xs text-primary/70 text-center w-full">
                "Breathe in for 4, hold for 4, breathe out for 4."
              </p>
            </CardFooter>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Mental Health Toolkit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  setToolkitContent({
                    title: "Stress Management Guide",
                    content: (
                      <div className="space-y-4">
                        <p>Stress is a natural physical and mental reaction to life experiences. Here are some quick techniques:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                          <li><strong>4-7-8 Breathing:</strong> Inhale for 4s, hold for 7s, exhale for 8s.</li>
                          <li><strong>Grounding:</strong> Identify 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.</li>
                          <li><strong>Progressive Muscle Relaxation:</strong> Tense and then release each muscle group.</li>
                        </ul>
                        <p className="text-xs text-muted-foreground italic">Note: If stress feels overwhelming, please consider speaking with a professional.</p>
                      </div>
                    )
                  });
                  setIsToolkitOpen(true);
                }}
              >
                <Activity className="h-4 w-4 mr-3" /> Stress Management Guide
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  setToolkitContent({
                    title: "Better Sleep Hygiene",
                    content: (
                      <div className="space-y-4">
                        <p>Quality sleep is the foundation of mental health. Try these tips:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                          <li><strong>Consistency:</strong> Go to bed and wake up at the same time every day.</li>
                          <li><strong>Digital Detox:</strong> Avoid screens at least 30-60 minutes before bed.</li>
                          <li><strong>Environment:</strong> Keep your bedroom cool, dark, and quiet.</li>
                          <li><strong>No Caffeine:</strong> Limit caffeine intake in the afternoon and evening.</li>
                        </ul>
                      </div>
                    )
                  });
                  setIsToolkitOpen(true);
                }}
              >
                <HeartPulse className="h-4 w-4 mr-3" /> Better Sleep Hygiene
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  setToolkitContent({
                    title: "Cognitive Reframing",
                    content: (
                      <div className="space-y-4">
                        <p>Cognitive reframing helps you identify and change negative thought patterns:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                          <li><strong>Identify:</strong> Notice when you're having a negative or distorted thought.</li>
                          <li><strong>Challenge:</strong> Ask yourself "Is there evidence for this? Am I jumping to conclusions?"</li>
                          <li><strong>Replace:</strong> Try to find a more balanced, realistic perspective.</li>
                        </ul>
                      </div>
                    )
                  });
                  setIsToolkitOpen(true);
                }}
              >
                <Brain className="h-4 w-4 mr-3" /> Cognitive Reframing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="journal">Personal Journal</TabsTrigger>
          <TabsTrigger value="articles">Resources</TabsTrigger>
        </TabsList>
        <TabsContent value="journal" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Reflection Space</h3>
            <Dialog open={isJournalOpen} onOpenChange={setIsJournalOpen}>
              <DialogTrigger>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Journal Entry</DialogTitle>
                  <DialogDescription>
                    Express your thoughts. Your journal is a safe, private space.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea 
                    placeholder="How was your day? What's on your mind?" 
                    className="min-h-[200px] resize-none" 
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsJournalOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveJournal} disabled={!journalNote}>Save Entry</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moodLogs.filter(log => log.notes).length === 0 ? (
              <Card className="md:col-span-2 border-dashed border-2 bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-background mb-4 shadow-sm">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No journal entries yet</h3>
                  <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                    Start writing your thoughts and reflections. Your journal is private and secure.
                  </p>
                  <Button onClick={() => setIsJournalOpen(true)}>Start Your First Entry</Button>
                </CardContent>
              </Card>
            ) : (
              moodLogs.filter(log => log.notes).map((log) => (
                <Card key={log.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {format(new Date(log.logged_at), 'MMMM d, yyyy • h:mm a')}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {log.mood_label}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleAiAnalysis(log.notes)}
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground/80 line-clamp-4">
                      {log.notes}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex flex-col items-start gap-4">
                    {aiAnalysis && (
                       <div className="w-full p-3 bg-primary/5 rounded-md text-xs border border-primary/10 animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center gap-2 mb-1 font-semibold text-primary">
                             <Sparkles className="h-3 w-3" /> AI Insight
                          </div>
                          <p className="italic">{aiAnalysis}</p>
                       </div>
                    )}
                    <Button variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => handleAiAnalysis(log.notes)}>
                      {analyzingJournal ? (
                        <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</span>
                      ) : "Get AI Insights"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="articles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Understanding the Mind-Body Connection", desc: "How physical activity impacts your emotional state.", category: "Activity" },
              { title: "The Science of Sleep and Mood", desc: "Why your rest is critical for mental resilience.", category: "Health" },
              { title: "Cognitive Reframing Techniques", desc: "Change your patterns of thinking to feel better.", category: "Therapy" }
            ].map((art, i) => (
              <Card key={i} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-40 bg-muted relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/20 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                      <Brain className="h-12 w-12 text-white/50" />
                   </div>
                   <Badge className="absolute top-3 left-3 bg-white/90 text-black border-none">{art.category}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-base">{art.title}</CardTitle>
                  <CardDescription>{art.desc}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                   <Button variant="ghost" size="sm" className="p-0 text-primary group-hover:gap-2 transition-all">
                      Read more <ChevronRight className="h-4 w-4" />
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isToolkitOpen} onOpenChange={setIsToolkitOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {toolkitContent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {toolkitContent?.content}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsToolkitOpen(false)}>Close Guide</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
