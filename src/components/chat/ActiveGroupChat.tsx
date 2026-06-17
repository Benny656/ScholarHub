import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GlassCard, Button } from '../ui';
import { Send, Users, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import anime from 'animejs/lib/anime.es.js';

interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string; role: string };
}

export function ActiveGroupChat({ groupId, groupName }: { groupId: string; groupName: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        id, group_id, sender_id, content, created_at,
        profiles!group_messages_sender_id_fkey(full_name, role)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data as any);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Setup Realtime Subscription
    const channel = supabase
      .channel(`room:${groupId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Anime.js bounce logic based on user's orientation requirement
    if (messages.length > 0 && chatContainerRef.current) {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      
      const newBubbles = chatContainerRef.current.querySelectorAll('.chat-bubble-bounce:not(.animated)');
      if (newBubbles.length > 0) {
        newBubbles.forEach(b => b.classList.add('animated'));
        
        anime.timeline().add({
          targets: newBubbles,
          translateY: isPortrait ? [0, 0] : [-15, 0],
          translateX: isPortrait ? [-15, 0] : [0, 0],
          opacity: [0, 1],
          duration: 400,
          easing: 'easeOutElastic(1, .8)',
          delay: anime.stagger(50)
        });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        sender_id: user.id,
        content: newMessage.trim()
      } as any);

    if (error) {
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
    setLoading(false);
  };

  return (
    <GlassCard className="flex flex-col h-full border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h2 className="font-bold text-neutral-900 dark:text-white">{groupName}</h2>
            <p className="text-xs text-neutral-500">Live Peer Chat</p>
          </div>
        </div>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar min-h-[300px]"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <Users size={32} className="opacity-20 mb-2" />
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col chat-bubble-bounce opacity-0 ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-xs font-medium text-neutral-500 mb-1 ml-1">
                    {msg.profiles?.full_name || 'Anonymous'}
                  </span>
                )}
                <div 
                  className={`px-4 py-2 rounded-2xl max-w-[80%] shadow-sm ${
                    isMe 
                      ? 'bg-brand-primary text-white rounded-br-sm' 
                      : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm border border-neutral-100 dark:border-neutral-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 mx-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-neutral-900 dark:text-white pr-12"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="absolute right-1.5 p-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
