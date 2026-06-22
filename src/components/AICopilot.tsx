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
  
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch context when opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      const FALLBACK_CONTEXT = 'System Context: The user is a first-year Computer Science Engineering student focusing on Artificial Intelligence and Machine Learning.';

      // Pre-seed with fallback immediately — chat works even if Supabase is unreachable
      if (!context) setContext(FALLBACK_CONTEXT);

      // Attempt to enrich context from Supabase in the background
      const enrichContext = async () => {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          // Guard: if env vars are missing, skip and keep fallback
          if (!supabaseUrl || !supabaseKey) return;

          // Step 1: Fetch profile using initialized supabase client
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single();

          if (profileError) return; // keep fallback, don't throw

          // Step 2: Fetch enrollment rows to get course_ids
          const { data: enrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('student_id', user.id);

          if (enrollError) return; // keep fallback

          // Step 3: Fetch course titles separately using plucked ids
          let courseNames = 'no courses';
          if (enrollments && enrollments.length > 0) {
            const courseIds = enrollments.map((e: any) => e.course_id).filter(Boolean);
            if (courseIds.length > 0) {
              const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('title')
                .in('id', courseIds);

              if (!coursesError && courses) {
                courseNames = courses.map((c: any) => c.title).join(', ') || 'no courses';
              }
            }
          }

          // Upgrade context only if we actually got real data
          if (profile?.full_name || profile?.role) {
            setContext(`The user ${profile?.full_name || ''} is a ${profile?.role || 'student'} enrolled in: ${courseNames}`);
          }
        } catch (err) {
          // Silent — fallback context already set above, demo is not affected
          console.warn('[AICopilot] Context enrichment failed (non-blocking):', err);
        }
      };

      enrichContext();
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
            className="w-96 h-[500px] mb-4 bg-[#FFFCE1]/40 dark:bg-[#1F150C]/80 backdrop-blur-2xl border border-[#9d95ff]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-[#9d95ff]/20 flex justify-between items-center bg-[#9d95ff]/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#9d95ff]" />
                <h3 className="font-bold text-[#0e100f] dark:text-[#E1DCC9]">AI Copilot</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#7c7c6f] hover:text-[#0e100f] dark:hover:text-[#E1DCC9] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === 'user' ? 'bg-[#9d95ff] text-[#E1DCC9] rounded-br-none' : 'bg-[#FFFCE1]/60 dark:bg-[#412D15]/60 text-[#0e100f] dark:text-[#E1DCC9] rounded-bl-none border border-[#9d95ff]/10'}`}>
                    <p className="text-sm">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#FFFCE1]/60 dark:bg-[#412D15]/60 rounded-2xl rounded-bl-none px-4 py-2 border border-[#9d95ff]/10">
                    <Loader2 className="w-4 h-4 animate-spin text-[#9d95ff]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-[#9d95ff]/20 bg-[#FFFCE1]/20 dark:bg-[#1F150C]/20">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={handleTyping}
                  placeholder="Ask me anything..."
                  className="w-full bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 border border-[#9d95ff]/30 rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#0e100f] dark:text-[#E1DCC9] placeholder:text-[#7c7c6f] focus:outline-none focus:ring-2 focus:ring-[#9d95ff]/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 bg-[#9d95ff] text-[#E1DCC9] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#9d95ff] transition-colors"
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
        className="w-14 h-14 rounded-full bg-[#FFFCE1] dark:bg-[#1F150C] border border-[#9d95ff]/30 shadow-2xl flex items-center justify-center hover:scale-105 transition-transform overflow-hidden relative"
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
