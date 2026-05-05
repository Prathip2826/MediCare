"use client";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "./MobileNav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <MobileNav />
        <span className="font-bold text-xl text-primary">MediCare</span>
      </div>
      
      <div className="hidden lg:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-muted/50 rounded-full pl-9 pr-4 py-2 text-sm outline-none border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
        </Button>
        <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src="" alt="User" />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
