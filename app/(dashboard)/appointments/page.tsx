"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Plus, 
  Brain, FileDown, CheckCircle2, XCircle, Loader2, Video
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";

interface Appointment {
  id: string;
  doctor_name: string;
  specialization: string;
  hospital: string;
  appointment_date: string;
  notes: string;
  status: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prepResult, setPrepResult] = useState<string | null>(null);
  const [isPrepLoading, setIsPrepLoading] = useState(false);

  // Form state
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const unsub = auth?.onAuthStateChanged?.((user: any) => {
      if (user) fetchAppointments();
      else setLoading(false);
    });
    return () => unsub?.();
  }, []);

  const getUid = () => auth?.currentUser?.uid || '';

  const fetchAppointments = async () => {
    const uid = getUid();
    if (!uid) return;
    try {
      setLoading(true);
      const res = await fetch('/api/appointments', { headers: { 'x-user-id': uid } });
      const data = await res.json();
      if (res.ok) setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppointment = async () => {
    if (!doctorName || !date || !time) return;
    const uid = getUid();
    if (!uid) { toast.error('Not authenticated'); return; }
    try {
      const dateTime = new Date(`${date}T${time}`).toISOString();
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ doctor_name: doctorName, specialization, hospital, appointment_date: dateTime, notes }),
      });
      if (res.ok) {
        const savedAppt = await res.json();
        setAppointments([...appointments, savedAppt]);
        setIsAddOpen(false);
        resetForm();
        toast.success('Appointment booked successfully');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to book appointment');
      }
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  const resetForm = () => {
    setDoctorName("");
    setSpecialization("");
    setHospital("");
    setDate("");
    setTime("");
    setNotes("");
  };

  const handleStatusChange = async (id: string, status: string) => {
    const uid = getUid();
    if (!uid) return;
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
        toast.success(`Appointment marked as ${status}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleGeneratePrep = async (appt: Appointment) => {
    setIsPrepLoading(true);
    setPrepResult(null);
    try {
      const res = await fetch('/api/appointments/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: appt.doctor_name,
          specialization: appt.specialization,
          notes: appt.notes
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPrepResult(data.prep);
      } else {
        setPrepResult("Failed to generate preparation questions.");
      }
    } catch (error) {
      setPrepResult("Error connecting to AI service.");
    } finally {
      setIsPrepLoading(false);
    }
  };

  const upcoming = appointments.filter(a => a.status === "upcoming").sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  const past = appointments.filter(a => a.status !== "upcoming").sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your doctor visits and schedule new ones.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" /> Export PDF
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="gap-2" />}>
              <Plus className="h-4 w-4" /> Book Appointment
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  Enter the details for your upcoming doctor's visit.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor Name</Label>
                  <Input id="doctor" placeholder="e.g. Dr. Smith" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialization</Label>
                    <Input id="specialty" placeholder="e.g. Dentist" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital/Clinic</Label>
                    <Input id="hospital" placeholder="e.g. City Med" value={hospital} onChange={(e) => setHospital(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Reason for visit..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveAppointment}>Save Appointment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Fetching your appointments...</p>
            </div>
          ) : upcoming.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <CalendarIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No upcoming appointments</h3>
              <p className="text-muted-foreground mb-6">Stay on top of your health by scheduling your next checkup.</p>
              <Button variant="outline" onClick={() => setIsAddOpen(true)}>Book Now</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcoming.map((appt) => (
                <Card key={appt.id} className="overflow-hidden border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex border-b bg-muted/30">
                    <div className="p-4 bg-primary/5 border-r min-w-24 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-semibold text-primary uppercase">{format(new Date(appt.appointment_date), 'MMM')}</span>
                      <span className="text-3xl font-bold">{format(new Date(appt.appointment_date), 'dd')}</span>
                      <span className="text-xs text-muted-foreground mt-1">{format(new Date(appt.appointment_date), 'EEEE')}</span>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{appt.doctor_name}</h3>
                          <p className="text-sm text-primary font-medium">{appt.specialization}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
                          Upcoming
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" /> {format(new Date(appt.appointment_date), 'hh:mm a')}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> {appt.hospital}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-background">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={() => handleStatusChange(appt.id, 'completed')}>
                        <CheckCircle2 className="h-4 w-4" /> Mark Complete
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleStatusChange(appt.id, 'cancelled')}>
                        <XCircle className="h-4 w-4" /> Cancel
                      </Button>
                      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <Video className="h-4 w-4" />
                      </DialogTrigger>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger render={<Button variant="secondary" className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary" onClick={() => handleGeneratePrep(appt)} />}>
                        <Brain className="h-4 w-4" /> AI Appointment Prep
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            Preparation for {appt.doctor_name}
                          </DialogTitle>
                          <DialogDescription>
                            AI-generated questions to ask your {appt.specialization.toLowerCase()} based on your health profile.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 bg-muted rounded-md min-h-24 whitespace-pre-wrap text-sm">
                          {isPrepLoading ? (
                            <div className="flex items-center justify-center py-4 gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating questions...
                            </div>
                          ) : prepResult || "No preparation generated."}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {past.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No past appointments found.</div>
                ) : (
                  past.map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="bg-muted p-3 rounded-lg text-center hidden sm:block">
                          <CalendarIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                          <span className="text-xs font-medium">{format(new Date(appt.appointment_date), 'MMM dd')}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{appt.doctor_name}</h3>
                          <p className="text-sm text-muted-foreground">{appt.specialization} • {appt.hospital}</p>
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(appt.appointment_date), 'MMM dd, yyyy')} at {format(new Date(appt.appointment_date), 'hh:mm a')}</p>
                        </div>
                      </div>
                      <div>
                        <Badge variant={appt.status === 'completed' ? 'default' : 'destructive'} 
                               className={appt.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                          {appt.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
