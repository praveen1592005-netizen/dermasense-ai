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
// AI chat routes are at /api/ai/* (not under /api/v1)
// We strip the /api/v1 suffix from the base URL to get the backend host
const AI_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

// Helper to get the current Supabase auth token
const _getAuthHeader = async (): Promise<Record<string, string>> => {
  try {
    const { supabase } = await import('./supabaseClient');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { 'Authorization': `Bearer ${session.access_token}` };
    }
  } catch { /* ignore */ }
  return {};
};


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
      // Use /health (unauthenticated) to check backend availability
      const response = await fetch(`${AI_BASE_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error('Backend not responding');
      const data = await response.json();
      return {
        available: data.status === 'ok',
        model: 'DermaSense Knowledge Engine',
        status: data.status === 'ok' ? 'ok' : 'backend_unavailable',
        message: data.status === 'ok' ? 'Local AI backend is running.' : 'Backend unavailable.',
      };
    } catch {
      return {
        available: false,
        model: 'DermaSense Knowledge Engine',
        status: 'backend_unavailable',
        message: 'Local AI backend is not running. Start it with: uvicorn main:app --reload (from backend/ directory)',
      };
    }
  },

  /** Fast backend availability check. */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${AI_BASE_URL}/health`, {
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
      const authHeaders = await _getAuthHeader();
      const response = await fetch(`${AI_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory,
          analysis_context: analysisContext || null,
        }),
        signal: AbortSignal.timeout(130000),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) throw new Error('auth_failure');
        if (response.status >= 500) throw new Error('service_failure');
        throw new Error('network_failure');
      }
      
      const data = await response.json();
      if (!data || !data.response) {
        throw new Error('empty_response');
      }
      return data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      const isTimeout = error instanceof Error && error.name === 'TimeoutError';
      
      let responseText = 'Unable to connect to the assistant service. Please try again.';
      
      if (isTimeout) {
        responseText = 'The AI assistant took too long to respond. Please try a shorter question.';
      } else if (msg === 'auth_failure') {
        responseText = 'Please sign in again.';
      } else if (msg === 'service_failure') {
        responseText = 'The assistant is temporarily unavailable.';
      } else if (msg === 'empty_response') {
        responseText = "I couldn't generate a response right now. Please try again.";
      }

      return {
        success: false,
        response: responseText,
        status: 'backend_unavailable',
      };
    }
  },

  /** Request a plain-language explanation of a skin analysis result. */
  async explainResult(context: AnalysisContext): Promise<{ success: boolean; explanation: string }> {
    try {
      const authHeaders = await _getAuthHeader();
      const response = await fetch(`${AI_BASE_URL}/api/ai/explain-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
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
      const authHeaders = await _getAuthHeader();
      const response = await fetch(`${AI_BASE_URL}/api/ai/chat/history`, {
        method: 'GET',
        headers: { ...authHeaders },
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
      const authHeaders = await _getAuthHeader();
      const response = await fetch(`${AI_BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
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
