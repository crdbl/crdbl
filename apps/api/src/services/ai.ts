import {
  AI_ENDPOINT,
  AI_MODEL,
  AI_TEMPERATURE,
  OPENAI_API_KEY,
} from '../config.js';

const SYSTEM = `
You are a contradiction detector.

Output rules
1 → The Statement does not contradict the Context (it may be unrelated or add new, non-conflicting facts).
0 → The Statement contradicts, misstates, or is logically incompatible with any part of the Context.
3 → It is impossible to tell from the Context whether the Statement contradicts it (information missing or ambiguous).

Respond ONLY with the single digit 1, 0, or 3 — no other text.
`;

async function evaluateContent(
  claim: string,
  context: string[]
): Promise<0 | 1 | 3> {
  const prompt = `
## Context (authoritative)
${context.join('\n')}

## Statement
${claim}
`;

  console.log('AI prompt', prompt);

  const { choices } = await chat([
    { role: 'system', content: SYSTEM },
    { role: 'user', content: prompt },
  ]);

  return Number(choices[0].message.content.trim()) as 0 | 1 | 3;
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatChoice {
  index: number;
  message: { role: 'assistant'; content: string };
  finish_reason: string | null;
}

export interface ChatCompletionResponse {
  choices: ChatChoice[];
  // TODO: add `usage` etc. later if needed
}

async function chat(messages: any[]) {
  const payload = {
    model: AI_MODEL,
    temperature: AI_TEMPERATURE,
    messages,
  };

  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`AI ${res.status} ${await res.text()}`);
  return (await res.json()) as ChatCompletionResponse;
}

export default {
  evaluateContent,
};
