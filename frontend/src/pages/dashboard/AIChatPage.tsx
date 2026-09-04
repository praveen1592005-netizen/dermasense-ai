import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  CheckSquare,
  Square,
  ClipboardList,
  Cpu,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { dermaBotService, PreConsultationQuestion } from '../../services/dermaBotService';
import { ollamaService, OllamaStatus, AnalysisContext } from '../../services/ollamaService';
import { diseaseAnalysisService } from '../../services/diseaseAnalysisService';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isOllama?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init_1',
    role: 'assistant',
    content:
      'Hi! I\'m DermaSense AI Assistant, powered by your local AI engine. I can help explain your skin analysis results, prepare questions for your dermatologist, recommend gentle skincare routines, and provide supportive nutrition guidance.\n\n⚠️ I am an informational assistant and cannot provide a medical diagnosis or prescribe drugs. Always consult a qualified dermatologist for clinical decisions.',
    timestamp: new Date().toISOString(),
  },
];

const QUICK_PROMPTS = [
  'What questions should I ask my dermatologist?',
  'Explain my latest skin analysis report',
  'What skincare ingredients help strengthen the skin barrier?',
  'What anti-inflammatory foods support skin recovery?',
  'Can I treat severe redness or rash at home?',
];

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [checklist, setChecklist] = useState<PreConsultationQuestion[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [aiStatus, setAiStatus] = useState<OllamaStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [activeAnalysisContext, setActiveAnalysisContext] = useState<AnalysisContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check Local AI (Ollama + Backend) status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      setCheckingStatus(true);
      const status = await ollamaService.getStatus();
      if (isMounted) {
        setAiStatus(status);
        setCheckingStatus(false);
      }
    };
    const fetchHistory = async () => {
      if (user) {
        const history = await dermaBotService.getHistory();
        if (history.length > 0 && isMounted) {
          // Map to ChatMessage type with mock IDs and timestamps for older messages
          const mappedHistory = history.map((m: any, index: number) => ({
            id: `hist_${index}`,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: m.created_at || new Date().toISOString(),
          }));
          setMessages([...INITIAL_MESSAGES, ...mappedHistory]);
        }
      }
    };
    checkStatus();
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load latest analysis context or passed state
  useEffect(() => {
    const loadContext = async () => {
      if (location.state && (location.state as any).analysisContext) {
        setActiveAnalysisContext((location.state as any).analysisContext);
        return;
      }

      // Look up latest user analysis if available
      try {
        const analyses = await diseaseAnalysisService.getUserAnalyses(user?.id || 'usr_guest');
        if (analyses.length > 0) {
          const latest = analyses[0];
          const topPrediction = latest.modelPrediction?.condition || (latest.possibleCategories?.[0]?.categoryName ?? null);
          setActiveAnalysisContext({
            condition: topPrediction,
            confidence_percentage: latest.modelPrediction?.confidence_percentage ?? (latest.possibleCategories?.[0]?.confidencePct ?? null),
            confidence_level: latest.modelPrediction?.confidence_level ?? null,
            risk_level: latest.modelPrediction?.risk_level ?? latest.urgencyLevel,
            skin_type: user?.profile?.skinType ?? null,
            symptoms: latest.symptomProfile?.additionalSymptoms ?? [],
            duration: latest.symptomProfile?.duration ?? null,
            body_location: latest.symptomProfile?.bodyLocations?.join(', ') ?? null,
          });
        }
      } catch (e) {
        console.error('Failed to load analysis context', e);
      }
    };

    loadContext();
  }, [user, location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const list = dermaBotService.generateQuestionChecklist(
      user?.profile?.skinType || 'combination',
      activeAnalysisContext?.condition || 'general skin health'
    );
    setChecklist(list);
  }, [user, activeAnalysisContext]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    // Convert history format for API (exclude system messages & format role/content)
    const historyPayload = newHistory
      .filter((m) => m.id !== 'init_1')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const result = await dermaBotService.sendChatMessage(
        text.trim(),
        historyPayload,
        activeAnalysisContext
      );

      const botMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        isOllama: result.isOllamaResponse,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'Local AI assistant encountered an unexpected error. Please check your backend connection.',
        timestamp: new Date().toISOString(),
        isOllama: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }

    if (
      text.toLowerCase().includes('question') ||
      text.toLowerCase().includes('prepare') ||
      text.toLowerCase().includes('appointment')
    ) {
      setShowChecklist(true);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isSelected: !q.isSelected } : q))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setShowChecklist(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-16">
      <PageHeader
        title="DermaSense AI Assistant"
        subtitle="Local AI chat for condition explanations, skincare routines, and doctor consultation preparation."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={clearChat}
            >
              New Chat
            </Button>
          </div>
        }
      />

      {/* AI Architecture & Privacy Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Local AI Engine
              </span>
              {checkingStatus ? (
                <span className="text-[10px] text-slate-400 font-mono">Checking...</span>
              ) : aiStatus?.available ? (
                <Badge variant="success" size="sm" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {aiStatus.model || 'Ollama (Llama 3.1 8B)'}
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" className="gap-1">
                  <AlertCircle className="w-3 h-3" /> Standby / Offline Mode
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              100% private local execution. Zero external paid API keys required.
            </p>
          </div>
        </div>

        {activeAnalysisContext?.condition && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/40 text-[11px] text-brand-700 dark:text-brand-300">
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Active Context: <strong>{activeAnalysisContext.condition}</strong>
              {activeAnalysisContext.confidence_percentage && ` (${activeAnalysisContext.confidence_percentage}%)`}
            </span>
          </div>
        )}
      </div>

      {/* Offline Instructions Alert if Ollama is not running */}
      {!checkingStatus && !aiStatus?.available && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Local AI Service Setup</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            To enable full conversational AI with Llama 3.1 8B on your machine:
          </p>
          <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-[11px] space-y-1">
            <div>1. Start backend: <span className="text-brand-600 dark:text-brand-400">cd "Derma sense\backend" &amp;&amp; uvicorn main:app --reload</span></div>
            <div>2. Start Ollama: <span className="text-tealBrand-600 dark:text-tealBrand-400">ollama serve &amp;&amp; ollama pull llama3.1:8b</span></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 flex flex-col">
          <Card
            variant="default"
            className="flex flex-col rounded-3xl border-slate-200/80 dark:border-slate-800 overflow-hidden"
            style={{ height: '580px' }}
          >
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-darkBg-900 flex-shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-tealBrand-500 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">DermaSense Assistant</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${aiStatus?.available ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isTyping ? 'Thinking & generating...' : aiStatus?.available ? 'Local Llama 3.1 8B active' : 'Informational mode'}
                </p>
              </div>
              <Badge variant="brand" size="sm" className="ml-auto">Local AI</Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-brand-500 to-tealBrand-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'assistant'
                        ? 'bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-brand-500 text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.content}
                    <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 text-[10px] opacity-60">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && msg.isOllama && (
                        <span className="flex items-center gap-1 font-mono text-[9px] text-tealBrand-600 dark:text-tealBrand-400">
                          <Cpu className="w-2.5 h-2.5" /> Ollama Local
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-tealBrand-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px]">Generating local response...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto flex-shrink-0">
              {QUICK_PROMPTS.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => sendMessage(p)}
                  className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-slate-100 dark:bg-darkBg-800 text-slate-600 dark:text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a skincare question or request guidance... (Enter to send)"
                  rows={2}
                  className="flex-1 resize-none text-sm px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkBg-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="p-3 rounded-2xl bg-gradient-to-br from-brand-500 to-tealBrand-500 text-white disabled:opacity-40 hover:shadow-md transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pre-Consultation Checklist */}
          <Card variant="default" className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Doctor Checklist</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChecklist((v) => !v)}
                className="text-[11px] text-brand-500 hover:text-brand-600 font-semibold"
              >
                {showChecklist ? 'Collapse' : 'Expand'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Questions prepared for your dermatologist visit. Check the ones you want to ask.
            </p>

            {showChecklist && (
              <div className="space-y-2.5">
                {checklist.map((q) => (
                  <label
                    key={q.id}
                    className="flex items-start gap-2.5 cursor-pointer group"
                  >
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(q.id)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {q.isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <span className={`text-[11px] leading-relaxed ${q.isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                      {q.question}
                    </span>
                  </label>
                ))}
                <div className="pt-2 text-[10px] text-slate-400 italic">
                  {checklist.filter((q) => q.isSelected).length} of {checklist.length} questions selected
                </div>
              </div>
            )}

            {!showChecklist && (
              <button
                type="button"
                onClick={() => setShowChecklist(true)}
                className="w-full text-xs text-brand-500 font-semibold py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
              >
                View {checklist.length} questions →
              </button>
            )}
          </Card>

          {/* Capabilities */}
          <Card variant="default" className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-tealBrand-500" />
              What Local AI Can Help With
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
              {[
                'Explain your AI model prediction & confidence',
                'Generate doctor consultation question checklists',
                'Suggest gentle supportive skincare routines',
                'Provide anti-inflammatory nutrition tips',
                'Explain confidence levels and uncertainty',
                'Guide you through telehealth booking',
              ].map((cap) => (
                <li key={cap} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tealBrand-500 flex-shrink-0 mt-1.5" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-[10px] text-rose-700 dark:text-rose-300">
              ❌ Local AI cannot diagnose conditions or prescribe medications. The image model provides screening; a doctor provides diagnosis.
            </div>
          </Card>

          {/* Quick actions */}
          <Button
            variant="gradient"
            size="sm"
            className="w-full"
            onClick={() => window.open('https://maps.google.com/?q=dermatologist+near+me', '_blank')}
          >
            Find a Dermatologist
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => navigate('/dashboard/reports')}
          >
            View My Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

