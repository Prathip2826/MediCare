"use client";

import { useState } from "react";
import { Activity, AlertTriangle, User, Calendar, Loader2, Search, Plus, X, Stethoscope, ArrowRight, ShieldAlert, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const COMMON_SYMPTOMS = [
  "Headache", "Fever", "Cough", "Sore Throat", "Fatigue", 
  "Nausea", "Vomiting", "Diarrhea", "Shortness of Breath", 
  "Chest Pain", "Muscle Ache", "Joint Pain", "Dizziness"
];

export default function SymptomsPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 || !duration) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selectedSymptoms, duration, additionalNotes }),
      });

      if (!response.ok) throw new Error("Failed to analyze symptoms");
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Symptom Error:", error);
      setResult({
        severity: "Low",
        analysis: "We encountered an error while analyzing your symptoms. Please try again or consult a doctor directly.",
        conditions: [{ name: "Unknown", probability: "Low" }],
        specialist: "General Practitioner",
        remedies: ["Contact support", "Visit a local clinic"],
        warning: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Symptom Checker</h1>
          <p className="text-muted-foreground mt-1">Select your symptoms to get a preliminary analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="shadow-sm border-primary/10">
            <CardHeader>
              <CardTitle>What are you feeling?</CardTitle>
              <CardDescription>Select all symptoms that apply or add your own.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block text-sm">Selected Symptoms</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-muted/20">
                  {selectedSymptoms.length === 0 ? (
                    <span className="text-sm text-muted-foreground italic">No symptoms selected...</span>
                  ) : (
                    selectedSymptoms.map(symptom => (
                      <Badge key={symptom} variant="secondary" className="px-3 py-1 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                        {symptom}
                        <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => removeSymptom(symptom)} />
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={addCustomSymptom} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Type a custom symptom..." 
                    className="pl-9"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>

              <div>
                <Label className="mb-3 block text-sm">Common Symptoms</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map(symptom => (
                    <Badge 
                      key={symptom} 
                      variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1 font-normal transition-colors"
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>How long have you had these symptoms?</Label>
                  <Select value={duration} onValueChange={(val) => setDuration(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Just today</SelectItem>
                      <SelectItem value="few_days">A few days</SelectItem>
                      <SelectItem value="week">About a week</SelectItem>
                      <SelectItem value="more_than_week">More than a week</SelectItem>
                      <SelectItem value="month">A month or longer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Additional Context (Optional)</Label>
                  <Textarea 
                    placeholder="E.g., I recently traveled to..." 
                    className="resize-none"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAnalyze} 
                className="w-full h-12 text-base"
                disabled={selectedSymptoms.length === 0 || !duration || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-5 w-5" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {result ? (
            <Card className="border-primary/20 shadow-md animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Analysis Result</CardTitle>
                  <Badge variant={
                    result.severity === 'Severe' ? 'destructive' : 
                    result.severity === 'Moderate' ? 'default' : 'secondary'
                  } className={`${result.severity === 'Moderate' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}>
                    {result.severity} Severity
                  </Badge>
                </div>
                <CardDescription>Based on {selectedSymptoms.length} symptoms lasting {duration.replace('_', ' ')}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.warning && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Warning</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">{result.warning}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Possible Conditions
                  </h4>
                  <div className="space-y-3">
                    {result.conditions.map((condition: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <span className="font-medium">{condition.name}</span>
                        <Badge variant="outline" className={
                          condition.probability === 'High' ? 'text-orange-500 border-orange-200' : 'text-muted-foreground'
                        }>
                          {condition.probability} Match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Recommended Action
                  </h4>
                  <p className="text-sm">You should consult a <span className="font-semibold">{result.specialist}</span>.</p>
                  <Button variant="link" className="p-0 h-auto mt-2 text-primary flex items-center gap-1">
                    Book an appointment <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>

                {result.remedies && result.remedies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Home Care Suggestions</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {result.remedies.map((remedy: string, idx: number) => (
                        <li key={idx}>{remedy}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground italic border-t pt-4">
                  *Disclaimer: This tool provides informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 border-dashed bg-muted/10 shadow-none">
              <div className="bg-primary/5 p-4 rounded-full mb-4">
                <Brain className="h-12 w-12 text-primary/40" />
              </div>
              <h3 className="text-lg font-medium mb-2">Awaiting Analysis</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Select your symptoms and hit analyze to get AI-powered insights about your health.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
