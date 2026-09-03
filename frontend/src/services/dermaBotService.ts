import { ollamaService, ChatMessage, AnalysisContext } from './ollamaService';

export interface PreConsultationQuestion {
  id: string;
  category: 'Symptoms' | 'Duration & Progression' | 'Current Products' | 'Treatment & Next Steps';
  question: string;
  isSelected: boolean;
}

export interface DermaBotChatResult {
  success: boolean;
  response: string;
  status: string;
  isOllamaResponse: boolean;
}

export const dermaBotService = {
  /**
   * Generates a pre-consultation question checklist based on clinical best practices.
   * This is a static helper — not AI generated — always works offline.
   */
  generateQuestionChecklist(_skinType?: string, _concern?: string): PreConsultationQuestion[] {
    return [
      {
        id: 'q_1',
        category: 'Symptoms',
        question: 'Could my current redness or discomfort be an allergic contact reaction to any recent cosmetic or detergent exposure?',
        isSelected: true,
      },
      {
        id: 'q_2',
        category: 'Symptoms',
        question: 'What specific physical signs indicate that my skin barrier is recovering versus deteriorating?',
        isSelected: true,
      },
      {
        id: 'q_3',
        category: 'Duration & Progression',
        question: 'Given that this has been present for a few weeks, do I need any specialized patch testing or clinical lab screening?',
        isSelected: true,
      },
      {
        id: 'q_4',
        category: 'Current Products',
        question: 'Which active ingredients in my current routine (e.g. Niacinamide, Salicylic Acid, Retinoids) should I pause during flare-ups?',
        isSelected: true,
      },
      {
        id: 'q_5',
        category: 'Treatment & Next Steps',
        question: 'What is the recommended prescription or therapeutic protocol, and what timeline should I expect for visible recovery?',
        isSelected: true,
      },
      {
        id: 'q_6',
        category: 'Treatment & Next Steps',
        question: 'Are there specific dietary triggers or environmental lifestyle factors I should monitor in my follow-up diary?',
        isSelected: false,
      },
    ];
  },

  /**
   * Send a chat message to the local Ollama LLM via the FastAPI backend.
   * Falls back gracefully if Ollama or the backend is unavailable.
   */
  async sendChatMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    analysisContext?: AnalysisContext | null
  ): Promise<DermaBotChatResult> {
    const result = await ollamaService.chat(message, conversationHistory, analysisContext);
    return {
      success: result.success,
      response: result.response,
      status: result.status,
      isOllamaResponse: result.success,
    };
  },

  async getHistory(): Promise<ChatMessage[]> {
    const res = await ollamaService.getHistory();
    if (res.success && res.history) {
      return res.history;
    }
    return [];
  },

  /**
   * @deprecated Use sendChatMessage() for real Ollama LLM responses.
   */
  getAssistantResponse(_userPrompt: string): string {
    return 'Local AI assistant is connecting. Please use the updated chat interface.';
  },
};
