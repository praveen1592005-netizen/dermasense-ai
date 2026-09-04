import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  RefreshCw,

  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckSquare,
  Square,
  ClipboardList,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { dermaBotService, PreConsultationQuestion } from '../../services/dermaBotService';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init_1',
    role: 'assistant',
    content:
      'Hi! I\'m DermaBot, your DermaSense AI assistant. I can help you understand your analysis reports, prepare questions for your doctor, explain skincare terms, and guide you through appointment preparation.\n\n⚠️ I am not a doctor and cannot diagnose conditions or prescribe medication. For any medical concern, please consult a qualified dermatologist.',
    timestamp: new Date().toISOString(),
  },
];

const QUICK_PROMPTS = [
  'How do I prepare for my doctor appointment?',
  'Explain my skincare analysis report',
  'What is my skin type?',
  'What are common ingredients for oily skin?',
  'How does DermaSense AI work?',
];

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [checklist, setChecklist] = useState<PreConsultationQuestion[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const list = dermaBotService.generateQuestionChecklist(
      user?.profile?.skinType || 'combination',
      'general skin health'
    );
    setChecklist(list);
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate DermaBot processing
    await new Promise((res) => setTimeout(res, 800 + Math.random() * 600));

    const responseText = dermaBotService.getAssistantResponse(text);

    const botMsg: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);

    // If user asks about questions/appointment, auto-show checklist
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
        title="DermaBot AI Assistant"
        subtitle="Ask questions about your analysis, prepare for doctor appointments, or learn about skincare."
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
              Clear Chat
            </Button>
          </div>
        }
      />

      {/* Medical Safety Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong>DermaBot is an informational AI assistant.</strong> It does not diagnose conditions,
          prescribe treatments, or replace professional medical consultation. Always consult a
          qualified dermatologist for clinical decisions.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 flex flex-col">
          <Card
            variant="default"
            className="flex flex-col rounded-3xl border-slate-200/80 dark:border-slate-800 overflow-hidden"
            style={{ height: '560px' }}
          >
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-darkBg-900 flex-shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-tealBrand-500 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">DermaBot</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {isTyping ? 'Typing...' : 'Ready to assist'}
                </p>
              </div>
              <Badge variant="brand" size="sm" className="ml-auto">AI</Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant'
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
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant'
                      ? 'bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                      : 'bg-brand-500 text-white rounded-tr-sm'
                      }`}
                  >
                    {msg.content}
                    <p className="text-[10px] mt-1.5 opacity-50">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-tealBrand-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
                  placeholder="Ask DermaBot a question... (Enter to send)"
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
              Questions AI has prepared for your next dermatologist visit. Tick the ones you want to ask.
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
                  {checklist.filter(q => q.isSelected).length} of {checklist.length} questions selected
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
              What DermaBot can help with
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
              {[
                'Explain your analysis report',
                'Prepare doctor consultation questions',
                'Describe skincare ingredient effects',
                'Explain appointment & booking process',
                'General skin health information',
                'Understand confidence & risk levels',
              ].map((cap) => (
                <li key={cap} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tealBrand-500 flex-shrink-0 mt-1.5" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-[10px] text-rose-700 dark:text-rose-300">
              ❌ DermaBot cannot diagnose diseases, prescribe medication, or replace a licensed physician.
            </div>
          </Card>

          {/* Quick actions */}
          <Button
            variant="gradient"
            size="sm"
            className="w-full"
            onClick={() => navigate('/dashboard/doctors')}
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
