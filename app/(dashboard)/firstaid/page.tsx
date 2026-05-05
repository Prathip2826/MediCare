"use client";

import { useState, useEffect } from "react";
import { Phone, Search, MapPin, AlertTriangle, Activity, Flame, ShieldAlert, Heart, Droplet, Skull } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const EMERGENCY_NUMBERS: Record<string, { code: string, country: string }> = {
  US: { code: "911", country: "United States" },
  UK: { code: "999", country: "United Kingdom" },
  IN: { code: "108", country: "India" },
  EU: { code: "112", country: "European Union" },
  AU: { code: "000", country: "Australia" },
};

const EMERGENCIES = [
  { id: "heart-attack", title: "Heart Attack", icon: Heart, color: "text-red-500", bg: "bg-red-500/10",
    steps: [
      "Call emergency services immediately.",
      "Have the person sit down, rest, and try to keep calm.",
      "Loosen any tight clothing.",
      "Ask if they take any chest pain medication (like nitroglycerin) and help them take it.",
      "If they are unconscious and unresponsive, begin CPR immediately."
    ]
  },
  { id: "stroke", title: "Stroke (FAST)", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10",
    steps: [
      "FACE: Ask the person to smile. Does one side of the face droop?",
      "ARMS: Ask the person to raise both arms. Does one arm drift downward?",
      "SPEECH: Ask the person to repeat a simple phrase. Is their speech slurred or strange?",
      "TIME: If you observe any of these signs, call emergency services immediately.",
      "Note the time when symptoms first started."
    ]
  },
  { id: "choking", title: "Choking", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10",
    steps: [
      "Ask 'Are you choking?'. If they cannot answer, speak, or cough, proceed.",
      "Give 5 back blows between the shoulder blades with the heel of your hand.",
      "Give 5 abdominal thrusts (Heimlich maneuver).",
      "Alternate between 5 back blows and 5 abdominal thrusts until the blockage is dislodged.",
      "If the person becomes unconscious, begin CPR."
    ]
  },
  { id: "burns", title: "Burns", icon: Flame, color: "text-orange-600", bg: "bg-orange-600/10",
    steps: [
      "Stop the burning process. Extinguish flames or remove the person from the source.",
      "Cool the burn immediately with cool (not cold) running water for at least 10-20 minutes.",
      "Remove tight items like rings or watches from the burned area before it swells.",
      "Do NOT apply ice, butter, or ointments.",
      "Cover the burn loosely with a sterile, non-fluffy dressing or cling film."
    ]
  },
  { id: "bleeding", title: "Severe Bleeding", icon: Droplet, color: "text-red-600", bg: "bg-red-600/10",
    steps: [
      "Apply direct pressure to the wound using a clean cloth, tissue, or your hand.",
      "Maintain pressure consistently for at least 5-10 minutes without peeking.",
      "Elevate the injured area above the heart if possible.",
      "If blood soaks through, do not remove the cloth. Add more layers on top.",
      "If bleeding doesn't stop, apply a tourniquet above the wound (if trained) and seek immediate medical help."
    ]
  },
  { id: "poisoning", title: "Poisoning", icon: Skull, color: "text-purple-500", bg: "bg-purple-500/10",
    steps: [
      "Call your local Poison Control Center or Emergency Services immediately.",
      "Try to identify what was taken, when, and how much.",
      "Do NOT induce vomiting unless specifically instructed by poison control.",
      "If the person is unconscious or having seizures, place them in the recovery position.",
      "Bring the container or pill bottle to the hospital if possible."
    ]
  }
];

export default function FirstAidPage() {
  const [userCountry, setUserCountry] = useState("US"); // Default to US, would be auto-detected in real app
  const [searchQuery, setSearchQuery] = useState("");
  
  const emergencyNumber = EMERGENCY_NUMBERS[userCountry]?.code || "911";

  const filteredEmergencies = EMERGENCIES.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Emergency First Aid
          </h1>
          <p className="text-muted-foreground mt-1">Quick reference guides for medical emergencies. Available offline.</p>
        </div>
        
        <Button 
          size="lg" 
          variant="destructive" 
          className="text-lg font-bold px-8 h-14 w-full sm:w-auto shadow-lg shadow-red-500/20 animate-pulse"
          render={<a href={`tel:${emergencyNumber}`} />}
        >
          <Phone className="mr-2 h-6 w-6" />
          Call {emergencyNumber} Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-red-800 dark:text-red-400">
              <ShieldAlert className="h-10 w-10 shrink-0" />
              <div>
                <h2 className="text-lg font-bold">In a severe emergency?</h2>
                <p className="text-sm mt-1 text-red-700/80 dark:text-red-400/80">
                  Do not waste time reading if someone is unresponsive, not breathing, or severely bleeding. Call emergency services immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Nearest Hospital
            </h3>
            <Button variant="outline" className="w-full" render={<a href="https://www.google.com/maps/search/hospital" target="_blank" rel="noopener noreferrer" />}>
              Open in Maps
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search emergency situations..." 
          className="pl-10 h-12 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEmergencies.map((emergency) => {
          const Icon = emergency.icon;
          return (
            <Card key={emergency.id} className="overflow-hidden border-border shadow-sm">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${emergency.bg} shrink-0`}>
                    <Icon className={`h-6 w-6 ${emergency.color}`} />
                  </div>
                  <CardTitle className="text-xl">{emergency.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ol className="space-y-4 list-decimal list-inside text-sm md:text-base">
                  {emergency.steps.map((step, idx) => (
                    <li key={idx} className="pl-2 leading-relaxed text-foreground/90">
                      <span className="-ml-2">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
        {filteredEmergencies.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No emergency guides found for "{searchQuery}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
