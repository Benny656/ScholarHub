import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, AlertTriangle, ShieldCheck, Mail, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getSystemSettings, saveSystemSettings } from '../../services/admin.service';

export function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await getSystemSettings();
      // Ensure emailSettings exists as a fallback
      const smtpHost = res.platformConfig?.smtpHost || res.emailSettings?.smtpHost || 'smtp.scholarhub.io';
      const senderEmail = res.platformConfig?.senderEmail || res.emailSettings?.senderEmail || 'noreply@scholarhub.io';
      
      setSettings({
        ...res,
        platformConfig: { smtpHost, senderEmail },
        emailSettings: { smtpHost, senderEmail }
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system settings configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingsSave = async () => {
    if (!currentUser) return;
    try {
      await saveSystemSettings(currentUser.id, settings);
      toast.success('System configurations updated successfully.');
      loadSettings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to persist settings.');
    }
  };

  const updateFlag = (flagId: string, checked: boolean) => {
    setSettings({
      ...settings,
      featureFlags: {
        ...(settings.featureFlags || {}),
        [flagId]: checked
      }
    });
  };

  const updateSMTP = (key: 'smtpHost' | 'senderEmail', val: string) => {
    setSettings({
      ...settings,
      platformConfig: {
        ...(settings.platformConfig || {}),
        [key]: val
      },
      emailSettings: {
        ...(settings.emailSettings || {}),
        [key]: val
      }
    });
  };

  return (
    <div className="max-w-[900px] mx-auto pb-12 font-sans space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#0e100f] dark:text-[#E1DCC9] tracking-tight mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-brand-primary" /> System Configurations
        </h1>
        <p className="text-sm text-[#7c7c6f] dark:text-[#7c7c6f]">
          Control platform-wide parameters, banner announcements, functional feature flags, and email gateway credentials.
        </p>
      </div>

      {loading || !settings ? (
        <div className="bg-[#FFFCE1] dark:bg-[#412D15] rounded-2xl border border-[#E1DCC9]/20 dark:border-[#412D15] p-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#7c7c6f]">Querying platform settings database...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/60 dark:border-[#412D15] rounded-2xl overflow-hidden shadow-sm p-6 md:p-8 space-y-8"
        >
          {/* Announcement Banner setting */}
          <div className="space-y-2.5">
            <label className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] uppercase font-extrabold tracking-wider flex items-center gap-1">
              <AlertTriangle size={13} className="text-amber-500" /> Platform Announcement Banner
            </label>
            <input
              type="text"
              value={settings.announcement || ''}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              placeholder="e.g. System maintenance scheduled for Sunday at 02:00 AM UTC."
              className="w-full bg-[#FFFCE1] dark:bg-neutral-850 border border-neutral-250 dark:border-[#412D15] rounded-xl py-3 px-4 text-sm text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
            />
            <p className="text-[10px] text-[#7c7c6f] mt-1">
              This message appears globally at the top of landing and dashboard layouts for all active student and teacher sessions.
            </p>
          </div>

          {/* Maintenance mode toggle */}
          <div className="flex items-center justify-between p-5 rounded-2xl border border-red-500/25 bg-red-500/5 hover:bg-red-500/8 transition-all gap-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-[#EF4444]" /> Platform Maintenance Mode
              </h4>
              <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] max-w-lg">
                Activate maintenance mode to lock down client accesses to virtual classrooms and LMS video course players.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.maintenanceMode || false}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-250 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/30 dark:bg-[#412D15] peer-checked:after:translate-x-full peer-checked:after:border-[#E1DCC9] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#FFFCE1] after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-red-500"></div>
            </label>
          </div>

          {/* Feature flags section */}
          <div className="space-y-4 pt-4 border-t border-[#E1DCC9]/20 dark:border-[#412D15]">
            <h4 className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] uppercase font-extrabold tracking-wider flex items-center gap-1.5">
              <Sliders size={13} /> Feature Flag Toggles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'aiTutor', label: 'AI Study Tutor Widget', desc: 'Activates GPT-4/Claude tutor overlay.' },
                { id: 'blockchainCertificates', label: 'Blockchain Certificates', desc: 'Allows minting NFT credentials.' },
                { id: 'liveClassrooms', label: 'Live Video Classrooms', desc: 'Integrates active Jitsi virtual sessions.' },
              ].map((f) => {
                const isActive = settings.featureFlags?.[f.id] || false;
                return (
                  <div key={f.id} className="p-4 bg-[#FFFCE1] dark:bg-neutral-850 border border-[#E1DCC9]/20 dark:border-[#412D15]/80 rounded-2xl flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#0e100f] dark:text-[#E1DCC9]">{f.label}</span>
                      <p className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] mt-1 leading-snug">{f.desc}</p>
                    </div>
                    <div className="flex justify-end">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => updateFlag(f.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary/30 dark:bg-[#412D15] peer-checked:after:translate-x-full peer-checked:after:border-[#E1DCC9] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#FFFCE1] after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-brand-primary"></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SMTP Credentials setting */}
          <div className="space-y-4 pt-4 border-t border-[#E1DCC9]/20 dark:border-[#412D15]">
            <h4 className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] uppercase font-extrabold tracking-wider flex items-center gap-1.5">
              <Mail size={13} /> SMTP E-Mail Gateway Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] font-semibold">SMTP HOST ADDRESS</label>
                <input
                  type="text"
                  value={settings.platformConfig?.smtpHost || ''}
                  onChange={(e) => updateSMTP('smtpHost', e.target.value)}
                  placeholder="e.g. smtp.gmail.com"
                  className="w-full bg-[#FFFCE1] dark:bg-neutral-850 border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 px-3 text-xs text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] font-semibold">SENDER EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={settings.platformConfig?.senderEmail || ''}
                  onChange={(e) => updateSMTP('senderEmail', e.target.value)}
                  placeholder="e.g. noreply@scholarhub.io"
                  className="w-full bg-[#FFFCE1] dark:bg-neutral-850 border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl py-2.5 px-3 text-xs text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-6 border-t border-[#E1DCC9]/20 dark:border-[#412D15] flex justify-between items-center">
            <span className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] font-medium flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#00bae2]" /> Settings sync automatically to local storage as fallback.
            </span>
            <button
              onClick={handleSettingsSave}
              className="px-6 py-3 rounded-xl bg-brand-primary text-[#0e100f] dark:text-[#E1DCC9] font-bold hover:bg-brand-primary/95 transition-all shadow-md shadow-brand-primary/20 flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} /> Save Configurations
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
