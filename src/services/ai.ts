import { AIModelConfig } from '../types/ai';
import { AI_CONFIG } from "../constants";

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export const generateInterpretation = async (
  messages: ChatMessage[],
  config: AIModelConfig
): Promise<string> => {
  
  if (!config.apiKey) {
    throw new Error('Missing API key in settings');
  }

  try {
    const response = await fetch(`${AI_CONFIG.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': AI_CONFIG.SITE_URL,
        'X-Title': AI_CONFIG.APP_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.modelId,
        messages: messages,
        temperature: AI_CONFIG.TEMPERATURE,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // OpenRouter / OpenAI standard response structure
    return data.choices?.[0]?.message?.content || '';
    
  } catch (error) {
    console.error('AI Generation Failed:', error);
    throw error;
  }
};