import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
You are "MediCare AI Assistant", a professional, empathetic, and knowledgeable health concierge.
Your goal is to help users manage their health, understand medical terminology, and stay organized with medications and appointments.

CRITICAL RULES:
1. ALWAYS include a medical disclaimer in your first response of a session or when giving health-related advice: "I am an AI, not a doctor. This is for informational purposes only. In an emergency, please call 911 or your local emergency services."
2. DO NOT provide definitive diagnoses. Use phrases like "Your symptoms might suggest..." or "You should consult a doctor to rule out...".
3. If the user mentions severe symptoms (chest pain, difficulty breathing, severe bleeding, sudden confusion), URGE them to seek immediate emergency care.
4. Keep responses concise, supportive, and clean.
5. Use markdown for better readability.
6. You have access to the user's name if provided.
`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am MediCare AI Assistant. I will provide health guidance while maintaining strict medical disclaimers and safety protocols." }],
        },
        // In a real app, you'd map the actual message history here
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }))
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch response from Gemini" },
      { status: 500 }
    );
  }
}
