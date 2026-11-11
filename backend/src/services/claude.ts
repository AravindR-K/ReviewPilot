import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

export async function callClaude(prompt: string, model: 'haiku' | 'sonnet' = 'haiku'): Promise<string> {
  const modelId = model === 'haiku' ? 'claude-3-5-haiku-20241022' : 'claude-sonnet-4-20250514';

  const response = await client.messages.create({
    model: modelId,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock?.text || '';
}

export async function callClaudeJSON<T>(prompt: string, model: 'haiku' | 'sonnet' = 'haiku'): Promise<T> {
  const response = await callClaude(prompt, model);
  // Extract JSON from response (may be wrapped in markdown code blocks)
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
  const jsonStr = jsonMatch[1]?.trim() || response.trim();
  return JSON.parse(jsonStr) as T;
}
