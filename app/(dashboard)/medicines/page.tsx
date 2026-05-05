"use client";

import { useState, useEffect } from "react";
import { Pill, Plus, Flame, Clock, CheckCircle2, AlertCircle, Sparkles, X, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  taken?: boolean; 
  last_taken?: string;
}

interface MedicineLog {
  id: string;
  medicine_id: string;
  taken_at: string;
  status: string;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // New medicine form state
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("morning");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      // Fetch medicines and today's logs in parallel
      const [medsRes, logsRes] = await Promise.all([
        fetch('/api/medicines'),
        fetch('/api/medicines/log?today=true')
      ]);

      const meds = await medsRes.json();
      const logs = await logsRes.json();

      if (medsRes.ok && logsRes.ok) {
        const loggedIds = new Set(logs.map((l: any) => l.medicine_id));
        const updatedMeds = meds.map((m: any) => ({
          ...m,
          taken: loggedIds.has(m.id)
        }));
        setMedicines(updatedMeds);
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicine = async () => {
    if (!newName || !newDosage) return;
    
    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          dosage: newDosage,
          frequency: newFrequency,
          notes: newNotes,
        }),
      });
      
      if (res.ok) {
        const savedMed = await res.json();
        setMedicines([savedMed, ...medicines]);
        setIsAddOpen(false);
        setNewName("");
        setNewDosage("");
        setNewFrequency("morning");
        setNewNotes("");
        toast.success("Medicine added successfully");
      }
    } catch (error) {
      toast.error("Failed to save medicine");
    }
  };

  const handleMarkTaken = async (id: string) => {
    try {
      const res = await fetch('/api/medicines/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: id, status: 'taken' }),
      });

      if (res.ok) {
        setMedicines(medicines.map(m => m.id === id ? { ...m, taken: true } : m));
        toast.success("Dose recorded in your health log");
      } else {
        toast.error("Failed to record dose");
      }
    } catch (error) {
      toast.error("An error occurred while logging");
    }
  };

  const checkInteractions = async () => {
    if (!med1 || !med2) return;
    setAnalyzing(true);
    setInteractionResult(null);
    
    try {
      const res = await fetch('/api/medicines/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicines: [
            { name: med1, dosage: "" },
            { name: med2, dosage: "" }
          ]
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setInteractionResult(data.analysis);
      } else {
        toast.error(data.error || "Failed to check interactions");
      }
    } catch (error) {
      toast.error("Failed to check interactions");
    } finally {
      setAnalyzing(false);
    }
  };

  const getIconStyles = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'morning': return { color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" };
      case 'afternoon': return { color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" };
      case 'night': return { color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-500/20" };
      default: return { color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicine Tracker</h1>
          <p className="text-muted-foreground mt-1">Manage your prescriptions and never miss a dose.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="h-4 w-4" /> Add Medicine
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
              <DialogDescription>
                Enter the details of your prescription or supplement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" placeholder="e.g. Aspirin" className="col-span-3" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">Dosage</Label>
                <Input id="dosage" placeholder="e.g. 50mg" className="col-span-3" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">Time</Label>
                <div className="col-span-3">
                  <Select value={newFrequency} onValueChange={(val) => val && setNewFrequency(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time of day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
                <Textarea id="notes" placeholder="Take with food..." className="col-span-3" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveMedicine} disabled={!newName || !newDosage}>Save Medicine</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="today" className="w-full">
            <TabsList>
              <TabsTrigger value="today">Today's Schedule</TabsTrigger>
              <TabsTrigger value="active">All Active</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="mt-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Loading your schedule...</p>
                </div>
              ) : medicines.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Pill className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No medicines added yet</h3>
                  <p className="text-muted-foreground mb-6">Add your first medicine to start tracking your health journey.</p>
                  <Button variant="outline" onClick={() => setIsAddOpen(true)}>Add Medicine</Button>
                </Card>
              ) : (
                medicines.map((med) => {
                  const styles = getIconStyles(med.frequency);
                  return (
                    <Card key={med.id} className={`overflow-hidden transition-all ${med.taken ? 'opacity-60 bg-muted/50' : 'border-primary/20 shadow-md'}`}>
                      <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                        <div className={`p-4 rounded-full ${styles.bg} shrink-0`}>
                          <Pill className={`h-6 w-6 ${styles.color}`} />
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className={`font-semibold text-lg ${med.taken ? 'line-through text-muted-foreground' : ''}`}>
                            {med.name} <span className="text-muted-foreground font-normal text-sm ml-1">{med.dosage}</span>
                          </h3>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="capitalize">{med.frequency}</span>
                            {med.notes && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline text-xs italic">{med.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          {med.taken ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full w-full justify-center">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-medium">Taken</span>
                            </div>
                          ) : (
                            <>
                              <Button variant="outline" className="flex-1 sm:flex-none">Skip</Button>
                              <Button className="flex-1 sm:flex-none gap-2" onClick={() => handleMarkTaken(med.id)}>
                                <CheckCircle2 className="h-4 w-4" /> Take
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>
            
            <TabsContent value="active">
              <Card>
                <CardContent className="p-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {medicines.map(med => (
                       <div key={med.id} className="p-4 border rounded-lg flex items-center justify-between">
                         <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-xs text-muted-foreground">{med.dosage} - {med.frequency}</p>
                         </div>
                         <Button variant="ghost" size="icon" onClick={async () => {
                            if(confirm("Are you sure?")) {
                              await fetch(`/api/medicines?id=${med.id}`, { method: 'DELETE' });
                              fetchMedicines();
                            }
                         }}>
                            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                         </Button>
                       </div>
                     ))}
                   </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-emerald-500" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {medicines.some(m => m.taken) ? "1 Day" : "0 Days"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Start taking your medications daily to build your streak!
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Interaction Checker
              </CardTitle>
              <CardDescription>Check for drug interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Medicine 1</Label>
                <Input placeholder="e.g. Aspirin" value={med1} onChange={(e) => setMed1(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Medicine 2</Label>
                <Input placeholder="e.g. Ibuprofen" value={med2} onChange={(e) => setMed2(e.target.value)} />
              </div>
              <Button variant="secondary" className="w-full gap-2" onClick={checkInteractions} disabled={analyzing || !med1 || !med2}>
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? "Analyzing..." : "Analyze"}
              </Button>

              {interactionResult && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg text-sm border border-primary/20 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                    <AlertCircle className="h-4 w-4" />
                    AI Analysis Result
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {interactionResult}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
