import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantViewProps {
  isRtl: boolean;
}

export default function AIAssistantView({ isRtl }: AIAssistantViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isRtl
        ? 'مرحباً! أنا المساعد الذكي GCC HR AI. يمكنني مساعدتك في تحليل بيانات الموظفين، تكاليف الرواتب، صيانة المعدات، ومتابعة المشاريع. ماذا يمكنني أن أقدم لك اليوم؟'
        : 'Welcome! I am the GCC HR AI assistant. I can help you analyze employee records, calculate payroll costs, check heavy machinery maintenance, or look up project progress. What can I do for you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = isRtl
    ? [
        { label: 'عرض الإقامات المنتهية قريباً', query: 'Show me all expiring residency permits (Iqamas)' },
        { label: 'حساب مجموع الرواتب الأساسية', query: 'What is the total basic payroll cost for all active employees?' },
        { label: 'حالة صيانة حفار كاتربيلر', query: 'What is the maintenance status of Caterpillar 320D Excavator?' },
        { label: 'نسب إنجاز المشاريع الحالية', query: 'List all active projects and their budget vs cost to date.' }
      ]
    : [
        { label: 'View Expiring Iqamas', query: 'Show me all expiring residency permits (Iqamas)' },
        { label: 'Calculate Total Payroll', query: 'What is the total basic payroll cost for all active employees?' },
        { label: 'Equipment Health Check', query: 'What is the maintenance status of Caterpillar 320D Excavator?' },
        { label: 'Project Budget & Progress', query: 'List all active projects and their budget vs cost to date.' }
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Map existing messages to backend API payload structure
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with AI model.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai_assistant_view" className="flex flex-col h-[calc(100vh-140px)] bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              GCC HR AI
              <span className="text-[10px] bg-blue-400/30 px-2 py-0.5 rounded border border-blue-300/30 font-mono">
                GEMINI 3.5
              </span>
            </h2>
            <p className="text-xs text-blue-100">
              {isRtl ? 'مستشار الذكاء الاصطناعي للمؤسسة' : 'Enterprise Artificial Intelligence Advisory'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs bg-white/15 px-3 py-1.5 rounded-full border border-white/10 text-blue-50">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          {isRtl ? 'قاعدة بيانات حية' : 'Live Data Connected'}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.role === 'user' ? (isRtl ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row-reverse') : ''
            }`}
          >
            <div
              className={`p-2.5 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-600" />}
            </div>
            <div
              className={`p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap select-text markdown-body">
                {msg.content}
              </div>
              <span
                className={`text-[10px] block mt-1.5 ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`flex items-start gap-3 max-w-[85%] ${isRtl ? 'mr-0' : 'ml-0'}`}>
            <div className="p-2.5 rounded-lg bg-white border border-gray-200 shadow-sm">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-tl-none flex items-center gap-2">
              <span className="text-xs text-gray-500">{isRtl ? 'جاري التفكير وتحليل البيانات الحية...' : 'Analyzing live corporate metrics...'}</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{isRtl ? 'خطأ في الاتصال بالمساعد' : 'AI Assistant Connection Issue'}</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="p-3 bg-white border-t border-gray-100 flex flex-wrap gap-2">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug.query)}
            disabled={isLoading}
            className="text-xs bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <MessageSquare className="w-3 h-3 shrink-0 text-blue-500" />
            {sug.label}
          </button>
        ))}
      </div>

      {/* Input Tray */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-white border-t border-gray-200 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={
            isRtl
              ? 'اسأل المساعد عن الموظفين، صيانة الرافعات، تكاليف الرواتب...'
              : 'Ask the assistant about employee details, crane maintenance, payroll costs...'
          }
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-800"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </form>
    </div>
  );
}
