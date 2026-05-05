"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, Droplets, Flame, Calendar as CalendarIcon, 
  ChevronRight, Brain, Info, Plus, Pill, Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { toast } from "sonner";

const quickActions = [
  { name: "Check Symptoms", href: "/symptoms", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Log Medicine", href: "/medicines", icon: Plus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Book Doctor", href: "/appointments", icon: CalendarIcon, color: "text-orange-500", bg: "bg-orange-500/10" },
  { name: "Ask AI", href: "/chatbot", icon: Brain, color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const waterGoal = 8;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, medsRes, apptsRes, moodRes, waterRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/medicines'),
        fetch('/api/appointments'),
        fetch('/api/mental-health'),
        fetch('/api/health-metrics?type=water')
      ]);

      if (profileRes.ok) setProfile(await profileRes.json());
      
      const [meds, logs, appts, mood] = await Promise.all([
        medsRes.json(),
        fetch('/api/medicines/log?today=true').then(r => r.json()),
        apptsRes.json(),
        moodRes.json()
      ]);

      if (medsRes.ok) {
        const loggedIds = new Set(logs.map((l: any) => l.medicine_id));
        setMedicines(meds.map((m: any) => ({ ...m, taken: loggedIds.has(m.id) })));
      }
      
      if (apptsRes.ok) setAppointments(appts);
      if (moodRes.ok) setMoodLogs(mood);
      
      if (waterRes.ok) {
        const waterData = await waterRes.json();
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayWater = waterData.filter((w: any) => format(new Date(w.recorded_at), 'yyyy-MM-dd') === today);
        const total = todayWater.reduce((acc: number, curr: any) => acc + Number(curr.value), 0);
        setWaterGlasses(total);
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (count: number) => {
    try {
      const res = await fetch('/api/health-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric_type: 'water', value: 1, unit: 'glass' }),
      });
      if (res.ok) {
        setWaterGlasses(prev => prev + 1);
        toast.success("Stay hydrated! 💧");
      }
    } catch (error) {
      toast.error("Failed to log water");
    }
  };

  const handleQuickTake = async (id: string) => {
    try {
      const res = await fetch('/api/medicines/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: id, status: 'taken' }),
      });
      if (res.ok) {
        setMedicines(prev => prev.map(m => m.id === id ? { ...m, taken: true } : m));
        toast.success("Dose recorded! ✨");
      }
    } catch (error) {
      toast.error("Failed to record dose");
    }
  };

  const calculateBMI = () => {
    if (!profile?.height_cm || !profile?.weight_kg) return null;
    const heightInM = profile.height_cm / 100;
    return (profile.weight_kg / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-orange-500", bg: "bg-orange-50 border-orange-200" };
    if (bmi < 25) return { label: "Normal", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-500", bg: "bg-orange-50 border-orange-200" };
    return { label: "Obese", color: "text-red-500", bg: "bg-red-50 border-red-200" };
  };

  const moodChartData = moodLogs
    .slice(0, 7)
    .reverse()
    .map(log => ({
      day: format(new Date(log.logged_at), 'EEE'),
      score: log.mood_score
    }));

  const bmi = calculateBMI();
  const bmiVal = bmi ? parseFloat(bmi) : null;
  const bmiCat = bmiVal ? getBMICategory(bmiVal) : null;

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Assembling your health dashboard...</p>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "User";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Good {format(new Date(), 'a') === 'AM' ? 'Morning' : 'Day'}, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">Here is your health summary for today, {format(new Date(), 'MMMM do, yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Completion</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length > 0 ? "InProgress" : "0/0"}</div>
            <Progress value={40} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">Finish your daily routine</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <Flame className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moodLogs.length} Total</div>
            <p className="text-xs text-muted-foreground mt-2">Consistent tracking leads to health.</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplets className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waterGlasses} / {waterGoal}</div>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: waterGoal }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-6 flex-1 rounded-sm ${i < waterGlasses ? 'bg-cyan-500' : 'bg-secondary'}`}
                  onClick={() => i === waterGlasses && handleAddWater(1)}
                  style={{ cursor: i === waterGlasses ? 'pointer' : 'default' }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Health Tip</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium leading-snug">
              {waterGlasses < 4 
                ? "You're a bit behind on water. Try to drink two glasses in the next hour!"
                : "Great job staying hydrated. This helps maintain energy levels throughout the day."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <Card className="hover:bg-muted/50 transition-colors border shadow-sm cursor-pointer h-full">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                      <div className={`p-3 rounded-full ${action.bg}`}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <span className="text-sm font-medium">{action.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Mood History</CardTitle>
              <CardDescription>Your mental wellbeing over the last 7 entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                {moodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[1, 5]} 
                        ticks={[1, 2, 3, 4, 5]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic">
                    Log your mood in the Mental Health section to see trends.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Today's Medicines</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/medicines" className="text-xs text-primary" />}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {medicines.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">No medicines scheduled.</p>
              ) : medicines.slice(0, 3).map((med, i) => (
                <div key={med.id} className={`flex items-center justify-between ${i !== medicines.slice(0, 3).length - 1 ? 'border-b pb-4' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{med.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {med.taken ? (
                      <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
                        <Activity className="h-4 w-4" />
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => handleQuickTake(med.id)}>
                        Take
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" render={<Link href="/medicines" />}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Appointments</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/appointments" className="text-xs text-primary" />}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {appointments.filter(a => a.status === 'upcoming').length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">No upcoming appointments.</p>
              ) : appointments.filter(a => a.status === 'upcoming').slice(0, 2).map((appt) => (
                <div key={appt.id} className="flex items-start gap-4">
                  <div className="bg-muted rounded-lg p-2 text-center min-w-14">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">{format(new Date(appt.appointment_date), 'MMM')}</p>
                    <p className="text-xl font-bold text-primary">{format(new Date(appt.appointment_date), 'd')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{appt.doctor_name}</p>
                    <p className="text-xs text-muted-foreground">{appt.specialization}</p>
                    <p className="text-xs font-medium mt-1">{format(new Date(appt.appointment_date), 'p')}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your BMI</p>
                  <div className="text-3xl font-bold mt-1">{bmi || "—"}</div>
                  {bmiCat && (
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-2 ${bmiCat.bg} ${bmiCat.color}`}>
                      {bmiCat.label}
                    </div>
                  )}
                  {!bmi && (
                    <Link href="/profile" className="text-xs text-primary hover:underline mt-2 block">
                      Update height/weight in profile
                    </Link>
                  )}
                </div>
                <div className={`h-16 w-16 rounded-full border-4 ${bmiCat ? 'border-emerald-500' : 'border-muted'} flex items-center justify-center`}>
                  <Activity className={`h-6 w-6 ${bmiCat ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
