import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, KeyRound, Mail, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockRemaining, setLockRemaining] = useState<number | null>(null);
  const navigate = useNavigate();

  // Check locking state on load and updates countdown if locked
  useEffect(() => {
    const checkLock = () => {
      const now = Date.now();
      const lockUntilStr = localStorage.getItem('scholarhub_admin_lock_until');
      if (lockUntilStr) {
        const lockUntil = Number(lockUntilStr);
        if (now < lockUntil) {
          setLockRemaining(Math.ceil((lockUntil - now) / 1000));
        } else {
          localStorage.removeItem('scholarhub_admin_lock_until');
          localStorage.setItem('scholarhub_admin_failed_attempts', '0');
          setLockRemaining(null);
        }
      }
    };

    checkLock();
    const timer = setInterval(checkLock, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkSecurityRules = () => {
    const now = Date.now();

    // Check account lock
    const lockUntilStr = localStorage.getItem('scholarhub_admin_lock_until');
    if (lockUntilStr) {
      const lockUntil = Number(lockUntilStr);
      if (now < lockUntil) {
        const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
        throw new Error(`Account locked due to consecutive failures. Try again in ${remainingMinutes} minute(s).`);
      }
    }

    // Check hourly rate limit
    const attemptsLogStr = localStorage.getItem('scholarhub_admin_attempts_log');
    let attemptsLog: number[] = attemptsLogStr ? JSON.parse(attemptsLogStr) : [];
    const oneHourAgo = now - 60 * 60 * 1000;
    attemptsLog = attemptsLog.filter((time) => time > oneHourAgo);

    if (attemptsLog.length >= 10) {
      throw new Error('Too many login attempts. Maximum is 10 attempts per hour. Please wait before retrying.');
    }
  };

  const registerFailedAttempt = () => {
    const now = Date.now();

    // Increment failed count
    const failedStr = localStorage.getItem('scholarhub_admin_failed_attempts') || '0';
    const failed = Number(failedStr) + 1;
    localStorage.setItem('scholarhub_admin_failed_attempts', failed.toString());

    if (failed >= 5) {
      const lockDuration = 15 * 60 * 1000; // 15 mins lock
      localStorage.setItem('scholarhub_admin_lock_until', (now + lockDuration).toString());
      setLockRemaining(15 * 60);
      toast.error('Account locked for 15 minutes due to 5 failed attempts.');
    }

    // Add attempt to log
    const attemptsLogStr = localStorage.getItem('scholarhub_admin_attempts_log');
    let attemptsLog: number[] = attemptsLogStr ? JSON.parse(attemptsLogStr) : [];
    attemptsLog.push(now);
    localStorage.setItem('scholarhub_admin_attempts_log', JSON.stringify(attemptsLog));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      checkSecurityRules();

      if (!/^\d{6}$/.test(mfaCode)) {
        throw new Error('MFA verification requires a valid 6-digit code.');
      }

      setLoading(true);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        registerFailedAttempt();
        throw new Error(authError.message);
      }

      if (data?.user) {
        // Confirm user role is admin
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          await supabase.auth.signOut();
          registerFailedAttempt();
          toast.error('Unauthorized Access: Admin role required.');
          navigate('/login?error=Unauthorized', { replace: true });
          return;
        }

        // Reset failed attempts count on success
        localStorage.setItem('scholarhub_admin_failed_attempts', '0');
        toast.success('Welcome back, Admin.');
        navigate('/scholar-hub-admin-panel/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#151315] relative overflow-hidden select-none">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] font-black text-[22vw] select-none text-[#EF4444] z-0">
        ADMIN
      </div>

      {/* Red ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 rounded-full bg-[#EF4444]/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 rounded-full bg-[#EF4444]/5 blur-[80px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-[2rem] border border-[#EF4444]/15 bg-surface-container-low/40 backdrop-blur-xl shadow-2xl relative z-10 mx-4">
        {/* Shield Icon & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] border border-[#EF4444]/25 mb-4 shadow-lg shadow-[#EF4444]/10 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold font-display text-[#E1DCC9] tracking-wide">Scholar Hub</h2>
          <p className="text-xs uppercase font-semibold text-[#EF4444] tracking-widest mt-1">Admin Console</p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-4 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#E1DCC9] uppercase tracking-wider">Authorized Personnel Only</h4>
            <p className="text-[11px] text-[#E1DCC9]/60 leading-normal mt-0.5">
              Access to this console is restricted. Logins and actions are audited. Unapproved attempts are logged.
            </p>
          </div>
        </div>

        {lockRemaining !== null ? (
          <div className="text-center py-6 text-sm text-[#EF4444] font-semibold border border-[#EF4444]/20 bg-[#EF4444]/5 rounded-xl">
            🔒 Account Locked. Try again in {Math.floor(lockRemaining / 60)}m {lockRemaining % 60}s.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs font-medium text-[#EF4444] border border-[#EF4444]/20 bg-[#EF4444]/5 rounded-xl">
                {error}
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wider text-[#E1DCC9]/50 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1DCC9]/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FFFCE1]/5 border border-[#E1DCC9]/10 rounded-xl py-3 pl-11 pr-4 text-sm text-[#E1DCC9] placeholder-white/20 focus:border-[#EF4444]/40 focus:ring-1 focus:ring-[#EF4444]/40 outline-none transition-all"
                  placeholder="admin@scholarhub.io"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wider text-[#E1DCC9]/50 uppercase">Secure Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1DCC9]/30" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FFFCE1]/5 border border-[#E1DCC9]/10 rounded-xl py-3 pl-11 pr-4 text-sm text-[#E1DCC9] placeholder-white/20 focus:border-[#EF4444]/40 focus:ring-1 focus:ring-[#EF4444]/40 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* 6-digit MFA Code */}
            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wider text-[#E1DCC9]/50 uppercase">6-Digit 2FA Code</label>
              <input
                type="text"
                required
                maxLength={6}
                pattern="\d{6}"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#FFFCE1]/5 border border-[#E1DCC9]/10 rounded-xl py-3 px-4 text-sm text-center text-[#E1DCC9] placeholder-white/20 focus:border-[#EF4444]/40 focus:ring-1 focus:ring-[#EF4444]/40 tracking-[0.6em] text-[1.2rem] font-bold outline-none transition-all font-mono"
                placeholder="000000"
              />
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#EF4444] text-[#E1DCC9] font-bold hover:bg-[#EF4444]/90 active:scale-[0.98] transition-all shadow-xl shadow-[#EF4444]/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-[#E1DCC9]/20 border-t-white" />
                  Verifying Credentials...
                </>
              ) : (
                'Secure Authentication'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
