// Groq AI integration — replaces all Gemini calls
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function groqChat(
  messages: GroqMessage[],
  stream = false,
  maxTokens = 1024,
): Promise<Response> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      stream,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  return response;
}

export async function groqComplete(messages: GroqMessage[], maxTokens = 1024): Promise<string> {
  const res = await groqChat(messages, false, maxTokens);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export const MEDICAL_SYSTEM_PROMPT = `You are MediCare AI, a world-class medical assistant. 
Analyze symptoms and provide:
1. Possible conditions (top 3, with probability %)
2. Severity assessment
3. Recommended specialist type
4. Home remedies if mild
5. Red flag symptoms to watch for
6. When to seek emergency care

Always end with: 'This is not a medical diagnosis. Please consult a qualified healthcare professional.'
Be empathetic, clear, and evidence-based.`;

export const CHAT_SYSTEM_PROMPT = `You are MediCare AI, a compassionate and knowledgeable health assistant. 
You help users understand health topics, symptoms, medications, and wellness. 
You provide evidence-based information in a clear, friendly manner.
Always recommend consulting a doctor for diagnosis and treatment.
Format responses with markdown for readability.`;
