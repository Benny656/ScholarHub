import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GlassCard, Button } from '../ui';
import { Megaphone, Send, Clock, Globe, Users } from 'lucide-react';
import { sendNotification } from '../../services/notification.service';
import toast from 'react-hot-toast';

interface Announcement {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  target_role: string;
  profiles?: { full_name: string };
}

export function AnnouncementsWidget({ theme = 'sleek' }: { theme?: 'sleek' | 'funky' }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'global' | 'class'>('global');
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  const fetchAnnouncements = useCallback(async () => {
    // Basic filter logic: 'all' is global, otherwise it's class-specific
    let query = supabase
      .from('announcements')
      .select(`
        id, content, created_at, author_id, target_role,
        profiles!announcements_author_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (filterMode === 'global') {
      query = query.eq('target_role', 'all');
    } else {
      query = query.neq('target_role', 'all');
    }

    const { data, error } = await query;

    if (!error && data) {
      setAnnouncements(data as any);
    }
  }, [filterMode]);

  useEffect(() => {
    fetchAnnouncements();
    
    // Listen for new announcements
    const channel = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncements();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [fetchAnnouncements]);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setLoading(true);

    const targetRole = filterMode === 'global' ? 'all' : 'class_specific';
    
    // 1. Insert announcement
    const { error } = await supabase
      .from('announcements')
      .insert({
        author_id: user.id,
        content: newPost,
        target_role: targetRole
      } as any);

    if (error) {
      toast.error('Failed to post announcement');
      setLoading(false);
      return;
    }

    setNewPost('');
    toast.success('Announcement posted!');

    // 2. Alert students via notification
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');

    if (students) {
      const promises = students.map(s => 
        sendNotification(
          s.id,
          'announcements',
          filterMode === 'global' ? 'Global Campus Update' : 'Class Announcement',
          newPost.length > 50 ? newPost.substring(0, 50) + '...' : newPost
        )
      );
      await Promise.allSettled(promises);
    }

    setLoading(false);
  };

  const isFunky = theme === 'funky';

  return (
    <GlassCard className={`flex flex-col h-full ${isFunky ? 'border-amber-200 dark:border-amber-900/50' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isFunky ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20' : 'bg-brand-primary/10 text-brand-primary'}`}>
            <Megaphone size={20} />
          </div>
          <h2 className={`font-bold ${isFunky ? 'text-xl tracking-tight' : 'text-lg'} text-neutral-900 dark:text-white`}>
            Announcements
          </h2>
        </div>

        {/* Global vs Class Toggle */}
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilterMode('global')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterMode === 'global' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Globe size={14} />
            Campus
          </button>
          <button
            onClick={() => setFilterMode('class')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterMode === 'class' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Users size={14} />
            My Class
          </button>
        </div>
      </div>

      {isTeacherOrAdmin && (
        <div className="mb-6 relative">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`Post a new ${filterMode === 'global' ? 'campus-wide' : 'class'} announcement...`}
            className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none
              ${isFunky ? 'border-amber-200 focus:ring-amber-400 dark:bg-neutral-800 dark:border-neutral-700' 
                        : 'border-neutral-200 focus:ring-brand-primary dark:bg-neutral-800 dark:border-neutral-700'} 
              dark:text-white bg-white/50 backdrop-blur-sm transition-all`}
            rows={2}
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant={isFunky ? 'secondary' : 'primary'}
              size="sm"
              onClick={handlePost}
              disabled={loading || !newPost.trim()}
              icon={<Send size={14} />}
            >
              Post
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4 overflow-y-auto flex-1 min-h-[150px] custom-scrollbar pr-2">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-6">
            <Megaphone size={32} className="opacity-20 mb-2" />
            <p className="text-sm">No {filterMode === 'global' ? 'campus' : 'class'} announcements</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="relative pl-4 border-l-2 border-neutral-200 dark:border-neutral-700 group">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full transition-transform group-hover:scale-125 ${isFunky ? 'bg-amber-400' : 'bg-brand-primary'}`} />
              <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {a.content}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500">
                <span className="font-medium text-neutral-700 dark:text-neutral-400">{a.profiles?.full_name || 'Teacher'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] ${filterMode === 'global' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                  {filterMode === 'global' ? 'Global' : 'Class'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
