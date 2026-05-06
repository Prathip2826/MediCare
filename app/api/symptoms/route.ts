import { NextResponse } from 'next/server';
import { MEDICAL_SYSTEM_PROMPT } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { symptoms, duration, severity, age, gender } = await req.json();

    const userMsg = `Patient Profile: Age ${age || 'unknown'}, Gender: ${gender || 'not specified'}
Symptoms: ${symptoms.join(', ')}
Duration: ${duration}
Severity: ${severity}

Please provide a comprehensive analysis.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: MEDICAL_SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
        max_tokens: 1500,
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Groq error: ${err}` }, { status: 500 });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
