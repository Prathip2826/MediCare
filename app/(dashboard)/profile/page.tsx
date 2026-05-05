"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Bell, 
  Moon, 
  Globe, 
  LogOut, 
  Save,
  Camera,
  Heart,
  Droplet,
  Info,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setFullName(data.full_name || "");
        setBloodGroup(data.blood_group || "");
        setAllergies(data.allergies?.join(", ") || "");
        setConditions(data.medical_conditions?.join(", ") || "");
        setEmergencyContact(data.emergency_contact || "");
      }
    } catch (error) {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          blood_group: bloodGroup,
          allergies: allergies.split(",").map(s => s.trim()).filter(s => s !== ""),
          medical_conditions: conditions.split(",").map(s => s.trim()).filter(s => s !== ""),
          emergency_contact: emergencyContact
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    // Clear cookies or redirect
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading your medical profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-center gap-6 bg-card p-8 rounded-2xl border shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
         
         <div className="relative group">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary uppercase">
                {fullName?.charAt(0) || profile?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform">
              <Camera className="h-4 w-4" />
            </button>
         </div>

         <div className="flex-1 text-center md:text-left space-y-2">
            {isEditing ? (
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="text-2xl font-bold h-12 max-w-sm"
                placeholder="Full Name"
              />
            ) : (
              <h1 className="text-3xl font-bold">{fullName || "Set your name"}</h1>
            )}
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-4 w-4" /> {profile?.email}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Patient ID: #{profile?.id?.slice(0, 8).toUpperCase()}
              </Badge>
              <Badge variant="outline">Verified Account</Badge>
            </div>
         </div>

         <div className="flex flex-col gap-2 w-full md:w-auto">
            {isEditing ? (
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                Edit Profile
              </Button>
            )}
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
         </div>
      </div>

      <Tabs defaultValue="medical" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit">
          <TabsTrigger value="medical">Medical Profile</TabsTrigger>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="medical" className="mt-6 space-y-6">
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Vital Medical Data
              </CardTitle>
              <CardDescription>This information helps MediCare AI provide better health guidance.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2 p-4 rounded-xl bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
                  <Label className="text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <Droplet className="h-4 w-4" /> Blood Group
                  </Label>
                  <Select disabled={!isEditing} value={bloodGroup} onValueChange={(val) => setBloodGroup(val || "")}>
                    <SelectTrigger className="bg-white dark:bg-background border-red-200">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30">
                  <Label className="text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Allergies
                  </Label>
                  <Input 
                    placeholder="e.g. Peanuts, Penicillin" 
                    className="bg-white dark:bg-background border-orange-200" 
                    disabled={!isEditing}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                  <p className="text-[10px] text-orange-600/70 italic">Comma separated list</p>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
                  <Label className="text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Heart className="h-4 w-4" /> Conditions
                  </Label>
                  <Input 
                    placeholder="e.g. Asthma, Diabetes" 
                    className="bg-white dark:bg-background border-blue-200" 
                    disabled={!isEditing}
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                  />
                  <p className="text-[10px] text-blue-600/70 italic">Comma separated list</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 rounded-lg bg-muted/50 border flex gap-3 text-sm">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Your medical data is used to customize AI suggestions in the Symptom Checker, Medicine Interaction Checker, and Appointment Prep.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+1 (555) 000-0000" className="pl-10" disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="country" value={profile?.country || ""} className="pl-10" disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
                <CardDescription>Someone we can contact in case of an emergency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="e-info">Contact Details</Label>
                  <Input 
                    id="e-info" 
                    placeholder="Name & Phone" 
                    disabled={!isEditing} 
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">App Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button variant="ghost" className="w-full justify-between py-6 h-auto hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">Manage alerts for medicines and appointments</p>
                  </div>
                </div>
                <Badge>Enabled</Badge>
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-between py-6 h-auto hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Appearance</p>
                    <p className="text-xs text-muted-foreground">Dark mode, light mode, or system default</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">System</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
