import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { GlassCard, Button } from '../../components/ui';
import { Users, Search, Plus, Lock, Globe, ShieldAlert } from 'lucide-react';
import { ActiveGroupChat } from '../../components/chat/ActiveGroupChat';
import toast from 'react-hot-toast';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  creator_id: string;
}

export function PeerHub() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string>('');
  
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  // CRITICAL: Protection mechanism - Only University Students & Teachers/Admins can access
  const isK12Student = user?.role === 'student' && user?.gradeLevel?.toLowerCase().startsWith('k12');
  if (isK12Student) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-neutral-500 max-w-md">
          The Peer Hub is an open campus forum restricted to University students to maintain age-appropriate community boundaries.
        </p>
      </div>
    );
  }

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setGroups(data as StudyGroup[]);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase
      .from('study_groups')
      .insert({
        name: newGroupName,
        description: newGroupDesc,
        is_private: isPrivate,
        creator_id: user.id
      } as any);

    if (error) {
      toast.error('Failed to create study group');
    } else {
      toast.success('Study Group created!');
      setShowCreate(false);
      setNewGroupName('');
      setNewGroupDesc('');
      fetchGroups();
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="text-brand-primary" />
            Peer Hub
          </h1>
          <p className="text-neutral-500 mt-1">Connect, study, and collaborate with your peers.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowCreate(!showCreate)}
          icon={<Plus size={18} />}
        >
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Group List */}
        <div className="lg:col-span-1 space-y-4">
          {showCreate && (
            <GlassCard className="border-brand-primary/20 bg-brand-primary/5">
              <h3 className="font-semibold mb-4">New Study Group</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1 block">Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1 block">Description</label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is_private" 
                    checked={isPrivate} 
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="is_private" className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                    <Lock size={14} /> Private Group
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" type="submit" disabled={loading} className="w-full">
                    {loading ? 'Creating...' : 'Create'}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowCreate(false)} className="w-full">
                    Cancel
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text" 
              placeholder="Search groups..." 
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar pr-1">
            {groups.length === 0 ? (
              <p className="text-center text-neutral-500 text-sm py-8">No study groups found. Create one to get started!</p>
            ) : (
              groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveGroupId(group.id);
                    setActiveGroupName(group.name);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeGroupId === group.id 
                      ? 'bg-brand-primary/5 border-brand-primary shadow-sm' 
                      : 'bg-white/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-brand-primary/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{group.name}</h3>
                    {group.is_private ? <Lock size={14} className="text-neutral-400" /> : <Globe size={14} className="text-brand-primary" />}
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">{group.description || 'No description provided.'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content: Active Chat */}
        <div className="lg:col-span-2 h-[600px]">
          {activeGroupId ? (
            <ActiveGroupChat groupId={activeGroupId} groupName={activeGroupName} />
          ) : (
            <GlassCard className="h-full flex flex-col items-center justify-center text-center border-dashed border-2">
              <Users size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
              <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">No Group Selected</h3>
              <p className="text-sm text-neutral-500 mt-2 max-w-sm">
                Select a study group from the list or create a new one to start collaborating.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
