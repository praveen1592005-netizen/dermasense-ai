/**
 * DermaSense AI — Ollama Frontend Service
 * =========================================
 * Communicates with the local FastAPI backend which proxies to Ollama.
 * All calls go: Frontend -> FastAPI Backend -> Ollama -> LLaMA 3.1 8B
 *
 * No API keys required. All AI runs locally.
 * Gracefully handles unavailable backend or Ollama.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';


export interface OllamaStatus {
  available: boolean;
  model: string;
  status: string;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnalysisContext {
  condition?: string | null;
  confidence_percentage?: number | null;
  confidence_level?: string | null;
  risk_level?: string | null;
  skin_type?: string | null;
  symptoms?: string[];
  duration?: string | null;
  body_location?: string | null;
}

export const ollamaService = {
  /** Check if Ollama and the backend are available. */
  async getStatus(): Promise<OllamaStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/status`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error('Backend not responding');
      return await response.json();
    } catch {
      return {
        available: false,
        model: 'llama3.1:8b',
        status: 'backend_unavailable',
        message: 'Local AI backend is not running. Start it with: uvicorn main:app --reload (from backend/ directory)',
      };
    }
  },

  /** Fast backend availability check. */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Send a chat message to the local LLM via backend proxy.
   */
  async chat(
    message: string,
    conversationHistory: ChatMessage[] = [],
    analysisContext?: AnalysisContext | null
  ): Promise<{ success: boolean; response: string; status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory,
          analysis_context: analysisContext || null,
        }),
        signal: AbortSignal.timeout(130000),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      return await response.json();
    } catch (error: unknown) {
      const isTimeout = error instanceof Error && error.name === 'TimeoutError';
      return {
        success: false,
        response: isTimeout
          ? 'The AI assistant took too long to respond. Please try a shorter question.'
          : 'Local AI assistant is currently unavailable. Please ensure the backend is running (cd backend && uvicorn main:app --reload).',
        status: 'backend_unavailable',
      };
    }
  },

  /** Request a plain-language explanation of a skin analysis result. */
  async explainResult(context: AnalysisContext): Promise<{ success: boolean; explanation: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/explain-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
        signal: AbortSignal.timeout(130000),
      });
      if (!response.ok) throw new Error('Backend error');
      const data = await response.json();
      return { success: data.success, explanation: data.explanation || '' };
    } catch {
      return { success: false, explanation: '' };
    }
  },

  /** Fetch chat history for the authenticated user. */
  async getHistory(): Promise<{ success: boolean; history: ChatMessage[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat/history`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Backend error');
      const data = await response.json();
      if (data.success && data.history) {
        const mapped = data.history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
        return { success: true, history: mapped };
      }
      return { success: false, history: [] };
    } catch {
      return { success: false, history: [] };
    }
  },

  /** Request lifestyle and food recommendations based on detected condition. */
  async getRecommendations(context: AnalysisContext): Promise<{ success: boolean; recommendations: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
        signal: AbortSignal.timeout(130000),
      });
      if (!response.ok) throw new Error('Backend error');
      const data = await response.json();
      return { success: data.success, recommendations: data.recommendations || '' };
    } catch {
      return { success: false, recommendations: '' };
    }
  },
};
