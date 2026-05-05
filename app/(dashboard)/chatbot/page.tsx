"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Plus, 
  MessageSquare, 
  Sparkles,
  AlertCircle,
  Stethoscope,
  Pill,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  { text: "Check my symptoms", icon: Stethoscope },
  { text: "Explain my medical report", icon: FileText },
  { text: "Remind me about medicines", icon: Pill },
  { text: "How to reduce stress?", icon: Sparkles },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your MediCare AI assistant. How can I help you today? Please remember, I'm an AI and not a substitute for professional medical advice.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Real AI Response
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) 
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to the medical intelligence server. Please check your internet connection or try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 flex flex-col min-h-0 bg-card rounded-2xl border shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold">MediCare Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Always available</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMessages([messages[0]])}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4 md:p-6" viewportRef={scrollRef}>
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted border"
                )}>
                  {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "flex flex-col gap-1 max-w-[80%]",
                  message.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    message.role === "assistant" 
                      ? "bg-muted text-foreground rounded-tl-none shadow-sm" 
                      : "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/10"
                  )}>
                    {message.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        {messages.length < 3 && (
          <div className="px-4 pb-4 md:px-6">
            <div className="flex flex-wrap gap-2 max-w-3xl mx-auto">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors text-xs font-medium"
                >
                  <prompt.icon className="h-3 w-3 text-primary" />
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="max-w-3xl mx-auto space-y-4">
            <form 
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input 
                placeholder="Ask anything about your health..." 
                className="flex-1 h-12 bg-muted/30 border-none focus-visible:ring-primary focus-visible:ring-offset-0"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button size="icon" className="h-12 w-12 rounded-xl" disabled={!input.trim() || isLoading}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              <AlertCircle className="h-3 w-3" />
              AI Assistant can make mistakes. Always consult a doctor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
