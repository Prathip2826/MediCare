"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, HeartPulse, Home, Activity, Pill, FileText, Calendar, Brain, MessageSquare, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Symptoms", href: "/symptoms", icon: Activity },
  { name: "Medicines", href: "/medicines", icon: Pill },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "First Aid", href: "/firstaid", icon: HeartPulse },
  { name: "Mental Health", href: "/mental-health", icon: Brain },
  { name: "Chatbot", href: "/chatbot", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex flex-col h-full bg-card">
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight text-primary">MediCare</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
