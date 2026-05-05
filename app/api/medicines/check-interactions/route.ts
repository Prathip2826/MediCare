import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerUser } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { medicines } = await req.json();

    if (!medicines || !Array.isArray(medicines) || medicines.length < 2) {
      return NextResponse.json({ 
        error: "Please provide at least two medicines to check for interactions." 
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      As a clinical pharmacist assistant, analyze the potential drug-drug interactions between the following medications:
      ${medicines.map((m: any) => `- ${m.name} (${m.dosage})`).join("\n")}

      User Medical Context:
      - Conditions: ${user.medical_conditions?.join(", ") || "None reported"}
      - Allergies: ${user.allergies?.join(", ") || "None reported"}

      Provide a structured analysis including:
      1. Severity (High, Moderate, Low, or None)
      2. Nature of the interaction (brief explanation)
      3. Recommendation for the patient (e.g., "Take at different times", "Consult doctor immediately")
      4. A clear disclaimer that this is AI-generated and not medical advice.

      Keep the response professional, concise, and easy for a patient to understand.
      Format the response in Markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error: any) {
    console.error("Interaction check error:", error);
    return NextResponse.json({ error: "Failed to check interactions" }, { status: 500 });
  }
}
