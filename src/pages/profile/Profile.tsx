import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Tag, Shield, Camera, Save, Key, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { uploadService } from '../../services/upload.service';
import { GlassCard, Badge, Button, Input, PageHeader } from '../../components/ui/index';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex@example.com',
    institution: 'Stanford University',
    department: 'Computer Science',
    bio: 'Passionate software developer exploring the intersection of AI and web technologies.',
    github: 'github.com/alexjohnson',
    linkedin: 'linkedin.com/in/alexjohnson',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSave = async () => {
    setSaving(true);
    await authService.updateProfile(form);
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated!');
  };

  const handleAvatarUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await uploadService.uploadAvatar(file, user?.id || 'anon');
      toast.success('Avatar updated!');
    };
    input.click();
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.new.length < 8) { toast.error('Minimum 8 characters'); return; }
    await authService.changePassword(passwords.current, passwords.new);
    setPasswords({ current: '', new: '', confirm: '' });
    toast.success('Password changed!');
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'security', label: 'Security', icon: <Shield size={15} /> },
    { id: 'preferences', label: 'Preferences', icon: <Tag size={15} /> },
  ];

  const inputStyle = 'w-full px-4 py-2.5 rounded-xl border border-outline-variant/20 focus:border-[#64748B]/60 text-on-surface text-sm outline-none transition-all placeholder-on-surface-variant';
  const style = { background: 'color-mix(in srgb, var(--color-on-surface) 5%, transparent)', fontFamily: 'Inter, sans-serif' };

  return (
    <AppLayout>
      <PageHeader title="My Profile" subtitle="Manage your account settings" breadcrumb={[{ label: 'Profile' }]} />
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        {/* Avatar + Info */}
        <GlassCard>
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-black text-on-surface cursor-pointer"
                onClick={handleAvatarUpload}
                style={{ boxShadow: '0 8px 32px rgba(139,92,246,0.3)' }}
              >
                {form.name[0]}
              </motion.div>
              <button
                onClick={handleAvatarUpload}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center text-on-surface transition-all"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
              >
                <Camera size={13} />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-on-surface mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>{form.name}</h2>
                  <p className="text-sm text-on-surface-variant mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{form.email}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={user?.role === 'teacher' ? 'blue' : user?.role === 'admin' ? 'purple' : 'slate'} size="md">
                      {user?.role || 'student'}
                    </Badge>
                    <Badge variant="emerald" size="md">Active</Badge>
                  </div>
                </div>
                <Button variant={editing ? 'secondary' : 'primary'} size="sm" icon={editing ? undefined : <User size={14} />} onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tab nav */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--color-on-surface) 4%, transparent)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' } : {}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} disabled={!editing}
                        className={`${inputStyle} pl-9 disabled:opacity-60 disabled:cursor-not-allowed`} style={style} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} disabled={!editing}
                        className={`${inputStyle} pl-9 disabled:opacity-60 disabled:cursor-not-allowed`} style={style} />
                    </div>
                  </div>
                </div>

                {/* Role-specific */}
                {user?.role === 'student' ? (
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Institution</label>
                    <div className="relative">
                      <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} disabled={!editing}
                        className={`${inputStyle} pl-9 disabled:opacity-60 disabled:cursor-not-allowed`} style={style} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Department</label>
                    <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} disabled={!editing}
                      className={`${inputStyle} disabled:opacity-60`} style={style} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} disabled={!editing} rows={3}
                    className={`${inputStyle} disabled:opacity-60 resize-none`} style={style} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">GitHub</label>
                    <input value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} disabled={!editing}
                      className={`${inputStyle} disabled:opacity-60`} style={style} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">LinkedIn</label>
                    <input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} disabled={!editing}
                      className={`${inputStyle} disabled:opacity-60`} style={style} />
                  </div>
                </div>

                {editing && (
                  <Button variant="primary" icon={<Save size={15} />} onClick={handleSave} loading={saving}>
                    Save Changes
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <GlassCard>
              <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>Change Password</h2>
              <div className="space-y-3">
                {[
                  { label: 'Current Password', field: 'current' as const },
                  { label: 'New Password', field: 'new' as const },
                  { label: 'Confirm New Password', field: 'confirm' as const },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{label}</label>
                    <div className="relative">
                      <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input type="password" value={passwords[field]} onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                        className={`${inputStyle} pl-9`} style={style} placeholder="••••••••" />
                    </div>
                  </div>
                ))}
                <Button variant="primary" icon={<Key size={15} />} onClick={handlePasswordChange}>Update Password</Button>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>Two-Factor Authentication</h2>
              <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/15" style={{ background: 'color-mix(in srgb, var(--color-on-surface) 4%, transparent)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${twoFAEnabled ? 'bg-emerald-500/20' : 'bg-on-surface/[0.08]'}`}>
                    <Smartphone size={18} className={twoFAEnabled ? 'text-emerald-400' : 'text-on-surface-variant'} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Authenticator App</p>
                    <p className="text-xs text-on-surface-variant">{twoFAEnabled ? 'Enabled — Using TOTP app' : 'Not enabled — Recommended'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setTwoFAEnabled(e => !e); toast.success(twoFAEnabled ? '2FA disabled' : '2FA enabled — Use any TOTP app'); }}
                  className={`relative w-12 h-6 rounded-full transition-all ${twoFAEnabled ? 'bg-emerald-500' : 'bg-on-surface/20'}`}
                >
                  <motion.div animate={{ x: twoFAEnabled ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
                </button>
              </div>

              <div className="mt-4 flex items-start gap-3 p-3 rounded-xl border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant">Sessions from unrecognized devices require email verification. Last login: Today at 10:23 AM from Chrome/Windows</p>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>Danger Zone</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-red-500/15" style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <div>
                    <p className="text-sm font-semibold text-red-300">Sign out all devices</p>
                    <p className="text-xs text-on-surface-variant">Invalidate all active sessions</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => toast.success('All sessions cleared')}>Sign Out All</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-red-500/15" style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <div>
                    <p className="text-sm font-semibold text-red-300">Delete Account</p>
                    <p className="text-xs text-on-surface-variant">Permanently remove all your data</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => toast.error('Contact support to delete your account')}>Delete</Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {tab === 'preferences' && (
          <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>App Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Assignment deadlines, grades, announcements', enabled: true },
                  { label: 'Push Notifications', desc: 'Browser notifications for live classes', enabled: false },
                  { label: 'Class Reminders', desc: '15 minutes before class starts', enabled: true },
                  { label: 'AI Course Suggestions', desc: 'Personalized recommendations in dashboard', enabled: true },
                  { label: 'Auto-play Next Lesson', desc: 'Continue to next lesson automatically', enabled: false },
                ].map((pref, i) => {
                  const [on, setOn] = useState(pref.enabled);
                  return (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>{pref.label}</p>
                        <p className="text-xs text-on-surface-variant">{pref.desc}</p>
                      </div>
                      <button onClick={() => setOn(!on)} className={`relative w-12 h-6 rounded-full transition-all ${on ? 'bg-[#64748B]' : 'bg-on-surface/20'}`}>
                        <motion.div animate={{ x: on ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
