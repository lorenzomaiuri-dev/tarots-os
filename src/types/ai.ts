export interface AIModelConfig {
  provider: 'openrouter' | 'openai' | 'local';
  modelId: string;       // es: "google/gemini-2.0-flash-exp"
  apiKey?: string;
  baseUrl?: string;
}

export interface AIRequestPayload {
  systemInstruction: string;
  userPrompt: string;
  config: AIModelConfig;
}

export interface AIResponse {
  text: string;
  raw?: any;
}

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}