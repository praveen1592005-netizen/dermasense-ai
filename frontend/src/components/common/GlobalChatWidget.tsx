import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Cpu,
  Minimize2,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import { dermaBotService } from '../../services/dermaBotService';
import { ollamaService, OllamaStatus, AnalysisContext } from '../../services/ollamaService';
import { diseaseAnalysisService } from '../../services/diseaseAnalysisService';
import { useAuth } from '../../context/AuthContext';

interface WidgetMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isOllama?: boolean;
}

const INITIAL_GREETING: WidgetMessage = {
  id: 'w_init',
  role: 'assistant',
  content:
    'Hi! I\'m your DermaSense AI Assistant. Ask me anything about your skin screening, barrier care, or questions for your doctor.',
  timestamp: new Date().toISOString(),
};

export const GlobalChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState<OllamaStatus | null>(null);
  const [context, setContext] = useState<AnalysisContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check Ollama status when widget is opened
  useEffect(() => {
    if (isOpen) {
      ollamaService.getStatus().then(setAiStatus);
      // Fetch latest analysis context
      diseaseAnalysisService
        .getUserAnalyses(user?.id || 'usr_guest')
        .then((analyses) => {
          if (analyses.length > 0) {
            const latest = analyses[0];
            setContext({
              condition: latest.modelPrediction?.condition || latest.possibleCategories?.[0]?.categoryName,
              confidence_percentage: latest.modelPrediction?.confidence_percentage,
              risk_level: latest.modelPrediction?.risk_level || latest.urgencyLevel,
              symptoms: latest.symptomProfile?.additionalSymptoms || [],
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: WidgetMessage = {
      id: `w_msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    const historyPayload = newHistory
      .filter((m) => m.id !== 'w_init')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const result = await dermaBotService.sendChatMessage(text.trim(), historyPayload, context);
      const botMsg: WidgetMessage = {
        id: `w_msg_${Date.now() + 1}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        isOllama: result.isOllamaResponse,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `w_msg_${Date.now() + 1}`,
          role: 'assistant',
          content: 'Local AI assistant encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          isOllama: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-brand-500 to-tealBrand-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
          aria-label="Open DermaSense AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1">Ask AI</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-darkBg-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden ${
            isExpanded
              ? 'bottom-4 right-4 left-4 sm:left-auto sm:w-[540px] top-4 sm:top-auto sm:h-[650px]'
              : 'bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-[380px] h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-500 to-tealBrand-500 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold flex items-center gap-1.5">
                  DermaSense AI Assistant
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </h4>
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      aiStatus?.available ? 'bg-emerald-300' : 'bg-amber-300'
                    }`}
                  />
                  {aiStatus?.available ? 'Local Llama 3.1 Active' : 'Local AI Standby'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 transition-colors hidden sm:inline-flex"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context pill if active analysis */}
          {context?.condition && (
            <div className="px-4 py-1.5 bg-brand-50 dark:bg-brand-950/40 border-b border-brand-100 dark:border-brand-900/30 text-[10px] text-brand-700 dark:text-brand-300 flex items-center justify-between">
              <span>Context: <strong>{context.condition}</strong></span>
              {context.confidence_percentage && (
                <span className="font-mono">{context.confidence_percentage}% confidence</span>
              )}
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-brand-500 to-tealBrand-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'assistant'
                      ? 'bg-slate-100 dark:bg-darkBg-850 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-800'
                      : 'bg-brand-500 text-white rounded-tr-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-tealBrand-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-darkBg-850 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto flex-shrink-0">
            {['Doctor questions?', 'Barrier tips', 'Explain my result'].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-darkBg-800 text-slate-600 dark:text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 transition-colors border border-slate-200 dark:border-slate-700"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-darkBg-950">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about skin health..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkBg-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-tealBrand-500 text-white disabled:opacity-40 hover:shadow-sm transition-all"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
