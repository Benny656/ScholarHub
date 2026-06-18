import { useState, useRef, useEffect } from 'react';
import { aiService, AIMessage } from '../../services/ai.service';
import { GlassCard, Button } from '../ui/index';
import { Sparkles, Send, Bot, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseAITutorProps {
  courseId: string;
  courseTitle: string;
}

export function CourseAITutor({ courseId, courseTitle }: CourseAITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'assistant', content: `Hi! I'm your AI Tutor for **${courseTitle}**. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: AIMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendTutorMessage(newMessages, `Course context: ${courseTitle} (ID: ${courseId})`);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! I encountered an error. Please check your AI connection or API key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-xl shadow-purple-500/20 flex items-center justify-center z-40 text-white"
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-48px)] z-50 flex flex-col"
          >
            <GlassCard tint="purple" className="flex flex-col h-[500px] shadow-2xl shadow-purple-500/10 p-0 overflow-hidden border-purple-500/30">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-purple-500/10">
                <div className="flex items-center gap-2 text-white">
                  <Bot size={20} className="text-purple-400" />
                  <span className="font-bold">AI Course Tutor</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-purple-300 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-purple-500/20 text-purple-300'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-500 text-white rounded-tr-sm' 
                        : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={14} className="text-purple-300 animate-pulse" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white rounded-tl-sm">
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-purple-500/20 bg-black/20">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the lesson..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-purple-500/50"
                  />
                  <Button variant="primary" type="submit" disabled={!input.trim() || loading} className="!p-2.5 rounded-xl">
                    <Send size={16} />
                  </Button>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
