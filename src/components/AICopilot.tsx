import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, X, Bot, Loader2 } from 'lucide-react';
import Lottie from 'react-lottie-player';
import botAnimation from '../assets/bot.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AICopilot() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am the ScholarHub AI Copilot. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('');
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch context when opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      const fetchContext = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single();

          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('courses(title)')
            .eq('student_id', user.id);

          const courseNames = enrollments?.map((e: any) => e.courses?.title).join(', ') || 'no courses';
          
          setContext(`The user ${profile?.full_name || ''} is a ${profile?.role || 'student'} enrolled/teaching: ${courseNames}`);
        } catch (err) {
          console.error('Failed to fetch AI context', err);
          // Failsafe for the demo if Supabase fails
          setContext('System Context: The user is a first-year Computer Science Engineering student focusing on Artificial Intelligence and Machine Learning.');
        }
      };
      fetchContext();
    }
  }, [isOpen, isAuthenticated, user]);

  // Auto-close logic
  const resetTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 10000);
  };

  useEffect(() => {
    if (isOpen) {
      resetTimer();
    } else {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    }
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isOpen]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    resetTimer();
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    resetTimer();

    const newMessages = [...messages, { role: 'user', content: input } as Message];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://scholarhub-backend-bcij.onrender.com';
      const res = await fetch(`${BACKEND_URL}/api/public-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages,
          context
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops, something went wrong. Try again.' }]);
    } finally {
      setIsLoading(false);
      resetTimer();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-96 h-[500px] mb-4 bg-white/40 dark:bg-[#161224]/80 backdrop-blur-2xl border border-violet-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-violet-500/20 flex justify-between items-center bg-violet-500/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-500" />
                <h3 className="font-bold text-neutral-900 dark:text-white">AI Copilot</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100 rounded-bl-none border border-violet-500/10'}`}>
                    <p className="text-sm">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/60 dark:bg-neutral-800/60 rounded-2xl rounded-bl-none px-4 py-2 border border-violet-500/10">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-violet-500/20 bg-white/20 dark:bg-black/20">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={handleTyping}
                  placeholder="Ask me anything..."
                  className="w-full bg-white/50 dark:bg-neutral-900/50 border border-violet-500/30 rounded-xl pl-4 pr-10 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 bg-violet-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-white dark:bg-[#161224] border border-violet-500/30 shadow-2xl flex items-center justify-center hover:scale-105 transition-transform overflow-hidden relative"
      >
        <Lottie
          loop
          animationData={botAnimation}
          play
          style={{ width: '150%', height: '150%', position: 'absolute' }}
        />
      </button>
    </div>
  );
}
