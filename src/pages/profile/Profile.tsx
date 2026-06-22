import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Building, Tag, Shield, Camera, Save, Key, Smartphone, AlertTriangle, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../services/auth.service';
import { uploadService } from '../../services/upload.service';
import { GlassCard, Button, PageHeader } from '../../components/ui/index';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (e) {
      toast.error('Failed to logout');
    }
  };

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

  const inputStyle = 'w-full px-4 py-2.5 rounded-xl border border-outline-variant/20 focus:border-[#9d95ff] focus:ring-2 focus:ring-[#9d95ff]/20 text-on-surface text-sm outline-none transition-all placeholder-on-surface-variant';
  const style = { background: 'color-mix(in srgb, var(--color-on-surface) 5%, transparent)', fontFamily: 'Inter, sans-serif' };

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your account settings" breadcrumb={[{ label: 'Profile' }]} />
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        {/* Avatar + Info */}
        <GlassCard>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#9d95ff] to-[#00bae2] flex items-center justify-center text-3xl font-black text-on-surface cursor-pointer relative overflow-hidden group"
                onClick={handleAvatarUpload}
                style={{ boxShadow: '0 8px 32px rgba(139,92,246,0.3)' }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{form.name[0]}</span>
                )}
                {/* Hover Camera Overlay */}
                <div className="absolute inset-0 bg-[#1F150C]/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-[#E1DCC9] text-[10px] font-semibold transition-opacity duration-200">
                  <Camera size={14} />
                  <span>Update</span>
                </div>
              </motion.div>
              {/* Online status indicator */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#E1DCC9] dark:border-neutral-900 bg-[#00bae2] flex items-center justify-center shadow-lg" title="Active & Online">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00bae2] animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00bae2] relative" />
              </span>
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-1 tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>{form.name}</h2>
                  <p className="text-sm text-on-surface-variant mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{form.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs font-semibold border ${
                      user?.role === 'teacher' 
                        ? 'bg-[#00bae2]/10 text-[#00bae2] border-[#00bae2]/20' 
                        : user?.role === 'admin' 
                          ? 'bg-[#9d95ff]/10 text-[#9d95ff] border-[#9d95ff]/20' 
                          : 'bg-[#00bae2]/10 text-[#00bae2] border-[#00bae2]/20'
                    }`}>
                      <Shield size={12} />
                      <span className="capitalize">{user?.role || 'student'}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs font-semibold bg-[#00bae2]/10 text-[#00bae2] border border-[#00bae2]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00bae2] animate-pulse" />
                      Active & Online
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button variant={editing ? 'secondary' : 'primary'} size="sm" icon={editing ? undefined : <User size={14} />} onClick={() => setEditing(!editing)}>
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  <Button variant="danger" size="sm" icon={<LogOut size={14} />} onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tab nav */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--color-on-surface) 4%, transparent)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none ${tab === t.id ? 'text-on-surface font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5'}`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #9d95ff, #00bae2)' } : {}}>
              <span className="scale-110">{t.icon}</span> <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${twoFAEnabled ? 'bg-[#00bae2]/20' : 'bg-on-surface/[0.08]'}`}>
                    <Smartphone size={18} className={twoFAEnabled ? 'text-[#00bae2]' : 'text-on-surface-variant'} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Authenticator App</p>
                    <p className="text-xs text-on-surface-variant">{twoFAEnabled ? 'Enabled — Using TOTP app' : 'Not enabled — Recommended'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setTwoFAEnabled(e => !e); toast.success(twoFAEnabled ? '2FA disabled' : '2FA enabled — Use any TOTP app'); }}
                  className={`relative w-12 h-6 rounded-full transition-all ${twoFAEnabled ? 'bg-[#00bae2]' : 'bg-on-surface/20'}`}
                >
                  <motion.div animate={{ x: twoFAEnabled ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-[#FFFCE1] shadow" />
                </button>
              </div>

              <div className="mt-4 flex items-start gap-3 p-3 rounded-xl border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant">Sessions from unrecognized devices require email verification. Last login: Today at 10:23 AM from Chrome/Windows</p>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-base font-bold text-on-surface mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>Danger Zone</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-red-500/15" style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <div>
                    <p className="text-sm font-semibold text-red-500">Sign out all devices</p>
                    <p className="text-xs text-on-surface-variant">Invalidate all active sessions</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => toast.success('All sessions cleared')}>Sign Out All</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-red-500/15" style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <div>
                    <p className="text-sm font-semibold text-red-500">Delete Account</p>
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

                {/* Theme Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-outline-variant/10">
                  <div>
                    <p className="text-sm font-medium text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>Appearance Theme</p>
                    <p className="text-xs text-on-surface-variant">Switch between light and dark interface mode</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                      isDark
                        ? 'bg-[#412D15] border-[#412D15] text-amber-500 hover:bg-neutral-700'
                        : 'bg-[#FFFCE1] border-[#E1DCC9]/20 text-[#7c7c6f] hover:bg-neutral-200'
                    }`}
                    aria-label="Toggle theme"
                  >
                    <motion.div
                      key={isDark ? 'dark' : 'light'}
                      initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </motion.div>
                    <span className="text-xs font-semibold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>

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
                        <motion.div animate={{ x: on ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-[#FFFCE1] shadow" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
