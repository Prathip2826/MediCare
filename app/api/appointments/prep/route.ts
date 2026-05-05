import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerUser } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctor_name, specialization, notes } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a medical assistant helping a patient prepare for an upcoming doctor's appointment.
      
      Patient Profile:
      - Medical Conditions: ${user.medical_conditions?.join(', ') || 'None reported'}
      - Allergies: ${user.allergies?.join(', ') || 'None reported'}
      
      Appointment Details:
      - Doctor: ${doctor_name}
      - Specialization: ${specialization}
      - Patient Notes: ${notes || 'No specific notes provided'}
      
      Task:
      Generate 3-5 specific, high-quality questions the patient should ask this doctor.
      The questions should be relevant to the doctor's specialty and the patient's profile.
      Keep the tone professional, helpful, and concise.
      Format the output as a clean bulleted list.
      
      Important: Add a small disclaimer at the end stating that these are AI-suggested questions and the patient should follow their doctor's actual advice.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ prep: text });
  } catch (error: any) {
    console.error("AI Prep Error:", error);
    return NextResponse.json({ error: "Failed to generate AI preparation" }, { status: 500 });
  }
}
