import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const { reportText, fileName } = await req.json();
    
    if (!reportText) {
      return NextResponse.json({ error: "No report text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a medical report analyst. Summarize the following medical report for a patient.
    File Name: ${fileName}
    Report Content: ${reportText}

    The response MUST be a valid JSON object with the following structure:
    {
      "summary": "A high-level 2-sentence summary of the report.",
      "keyFindings": ["Finding 1", "Finding 2"],
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "concerns": ["Any abnormal values or red flags", "Otherwise null"],
      "vocabulary": [
        { "term": "Medical Term", "definition": "Simple explanation" }
      ]
    }

    Rules:
    - Use simple, non-medical language for the definitions.
    - Be clear and direct.
    - Disclaimer: "This summary is AI-generated and should be reviewed by your doctor."
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{.*\}/s);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Report Summarization API Error:", error);
    return NextResponse.json(
      { error: "Failed to summarize report" },
      { status: 500 }
    );
  }
}
