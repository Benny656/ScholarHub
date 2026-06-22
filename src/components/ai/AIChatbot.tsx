import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Minimize2, Sparkles } from 'lucide-react';
import { aiService, type AIMessage } from '../../services/ai.service';

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm NexAI, your personal learning assistant 🎓 Ask me anything about your courses, assignments, or concepts you're studying!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: AIMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setStreamingText('');

    try {
      const response = await aiService.sendTutorMessage([...messages, userMsg]);
      // Stream the response
      setLoading(false);
      let accumulated = '';
      const words = response.content.split(' ');
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 60));
        accumulated += word + ' ';
        setStreamingText(accumulated);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: accumulated.trim() }]);
      setStreamingText('');
    } catch {
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again!' }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const QUICK_PROMPTS = ['Explain React hooks', 'Help with ML concepts', 'Algorithm tips'];

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => { setOpen(true); setMinimized(false); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-2xl z-50 flex items-center justify-center transition-all ai-tutor-btn-pulse ${open && !minimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ background: 'linear-gradient(135deg, var(--color-primary), #9d95ff)' }}
      >
        <Sparkles size={22} className="text-[#3c284c] animate-pulse" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00bae2] rounded-full border-2 border-slate-900 animate-pulse" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatbot"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={minimized ? { opacity: 1, scale: 1, y: 0, height: 64 } : { opacity: 1, scale: 1, y: 0, height: 520 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[360px] rounded-3xl border border-[#E1DCC9]/10 shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{ background: 'rgba(13,20,45,0.97)', backdropFilter: 'blur(20px)', transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer"
              onClick={() => setMinimized(!minimized)}
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9d95ff] to-[#00bae2] flex items-center justify-center">
                  <Sparkles size={14} className="text-[#E1DCC9]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#E1DCC9]" style={{ fontFamily: 'Geist, sans-serif' }}>NexAI Tutor</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00bae2] animate-pulse" />
                    <p className="text-xs text-[#00bae2]">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={e => { e.stopPropagation(); setMinimized(!minimized); }} className="p-1.5 rounded-lg hover:bg-[#FFFCE1]/10 text-[#7c7c6f] hover:text-[#E1DCC9] transition-colors">
                  <Minimize2 size={14} />
                </button>
                <button onClick={e => { e.stopPropagation(); setOpen(false); }} className="p-1.5 rounded-lg hover:bg-[#FFFCE1]/10 text-[#7c7c6f] hover:text-[#E1DCC9] transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-gradient-to-br from-[#9d95ff] to-[#00bae2]' : 'bg-slate-700'}`}>
                        {msg.role === 'assistant' ? <Bot size={14} className="text-[#E1DCC9]" /> : <User size={14} className="text-slate-300" />}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#9d95ff]/20 text-[#E1DCC9] rounded-tr-sm'
                            : 'text-slate-200 rounded-tl-sm'
                        }`}
                        style={msg.role === 'assistant' ? { background: 'rgba(255,255,255,0.07)', fontFamily: 'Inter, sans-serif' } : { fontFamily: 'Inter, sans-serif' }}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {/* Streaming text */}
                  {streamingText && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-[#9d95ff] to-[#00bae2] flex items-center justify-center">
                        <Bot size={14} className="text-[#E1DCC9]" />
                      </div>
                      <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-slate-200" style={{ background: 'rgba(255,255,255,0.07)', fontFamily: 'Inter, sans-serif' }}>
                        {streamingText}
                        <span className="inline-block w-1 h-4 bg-[#9d95ff] ml-0.5 animate-pulse rounded-sm" />
                      </div>
                    </motion.div>
                  )}

                  {/* Loading */}
                  {loading && !streamingText && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-[#9d95ff] to-[#00bae2] flex items-center justify-center">
                        <Bot size={14} className="text-[#E1DCC9]" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-[#9d95ff]"
                              animate={{ y: [-3, 0, -3] }}
                              transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        className="text-xs px-3 py-1.5 rounded-full border border-[#9d95ff]/30 text-[#9d95ff] hover:border-[#9d95ff]/60 hover:bg-[#9d95ff]/10 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-[#E1DCC9]/5">
                  <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask NexAI anything..."
                      className="flex-1 bg-transparent text-sm text-[#E1DCC9] placeholder-slate-500 outline-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                      style={{ background: input.trim() ? 'linear-gradient(135deg, #9d95ff, #00bae2)' : 'rgba(255,255,255,0.1)' }}
                    >
                      <Send size={13} className="text-[#E1DCC9]" />
                    </button>
                  </div>
                  <p className="text-center text-xs text-slate-600 mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Powered by NexAI • Beta</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
