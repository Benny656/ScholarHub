import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { GlassCard, Button } from '../ui/index';
import { Send, Megaphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminAnnouncementSender() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('broadcast_announcement' as any, {
        announce_title: title.trim(),
        announce_message: message.trim()
      } as any);

      if (error) throw error;

      toast.success('Announcement broadcasted to all users!');
      setTitle('');
      setMessage('');
    } catch (err: any) {
      console.error('Broadcast Error:', err);
      toast.error(err.message || 'Failed to send announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-0 overflow-hidden border-neutral-200 dark:border-neutral-800">
      <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 flex items-center gap-2">
        <Megaphone className="text-brand-primary" size={18} />
        <h3 className="font-bold text-neutral-900 dark:text-white">Global Announcement</h3>
      </div>
      <form onSubmit={handleBroadcast} className="p-5 space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Announcement Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Platform Maintenance Notice"
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-neutral-900 dark:text-white"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            rows={4}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-neutral-900 dark:text-white resize-none"
            disabled={loading}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          >
            {loading ? 'Broadcasting...' : 'Broadcast to All Users'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
