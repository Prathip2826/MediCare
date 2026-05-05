import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { symptoms, duration, additionalNotes } = await req.json();
    
    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze the following medical symptoms and provide a JSON response.
    Symptoms: ${symptoms.join(", ")}
    Duration: ${duration}
    Notes: ${additionalNotes}

    The response MUST be a valid JSON object with the following structure:
    {
      "severity": "Mild" | "Moderate" | "Severe",
      "conditions": [
        { "name": "Condition Name", "probability": "High" | "Medium" | "Low" }
      ],
      "specialist": "Type of doctor (e.g. Cardiologist)",
      "remedies": ["Suggestion 1", "Suggestion 2"],
      "warning": "Urgent warning if applicable, otherwise null"
    }

    Rules:
    - If symptoms include chest pain or severe breathing issues, set severity to "Severe" and include a strong warning to seek emergency care.
    - Always maintain a clinical yet cautious tone.
    - Include a disclaimer that this is not a diagnosis.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON extraction
    const jsonMatch = text.match(/\{.*\}/s);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Symptom Analysis API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms" },
      { status: 500 }
    );
  }
}
