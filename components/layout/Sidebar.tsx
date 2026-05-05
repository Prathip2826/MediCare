"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Activity, 
  Pill, 
  FileText, 
  Calendar, 
  HeartPulse, 
  Brain, 
  MessageSquare, 
  User 
} from "lucide-react";
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
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-card border-r h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <HeartPulse className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl tracking-tight text-primary">MediCare</span>
        </Link>
      </div>
      <div className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
      <div className="p-4 border-t">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <User className="h-5 w-5" />
          Profile Settings
        </Link>
      </div>
    </aside>
  );
}
