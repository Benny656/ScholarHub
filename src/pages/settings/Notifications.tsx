import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GlassCard, Button } from '../../components/ui';
import { Bell, Shield, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function NotificationsSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    assignments: true,
    announcements: true,
    system: true,
    messages: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();
      
      if (!error && data?.notification_preferences) {
        setPreferences({
          ...preferences,
          ...data.notification_preferences
        });
      }
      setLoading(false);
    }
    loadPrefs();
  }, [user]);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: preferences })
      .eq('id', user.id);
      
    setSaving(false);
    if (error) {
      toast.error('Failed to save preferences');
    } else {
      toast.success('Notification preferences updated!');
    }
  };

  if (loading) return <div className="p-8 text-neutral-500">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Notification Settings</h1>
      
      <GlassCard className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Assignments & Coursework</h3>
              <p className="text-sm text-neutral-500">Get notified when a new assignment is posted or graded.</p>
            </div>
          </div>
          <Toggle active={preferences.assignments} onClick={() => handleToggle('assignments')} />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Announcements</h3>
              <p className="text-sm text-neutral-500">Important updates from your teachers or administrators.</p>
            </div>
          </div>
          <Toggle active={preferences.announcements} onClick={() => handleToggle('announcements')} />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">System Alerts</h3>
              <p className="text-sm text-neutral-500">Security alerts, billing updates, and platform maintenance.</p>
            </div>
          </div>
          <Toggle active={preferences.system} onClick={() => handleToggle('system')} />
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="primary" onClick={savePreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${active ? 'bg-brand-primary' : 'bg-neutral-300 dark:bg-neutral-700'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}
