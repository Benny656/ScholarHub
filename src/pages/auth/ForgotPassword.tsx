import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send you a secure reset link">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-on-surface text-sm outline-none transition-all placeholder-on-surface-variant/50 bg-transparent ${error ? 'border-error/50' : 'border-outline-variant/30 focus:border-[#9d95ff]'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              {error && <p className="text-xs text-error mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-[#E1DCC9] text-sm disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #9d95ff, #9d95ff)', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(109,93,252,0.25)' }}
            >
              {loading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</>) : 'Send reset link'}
            </button>
            <p className="text-center text-sm text-on-surface-variant mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Remembered it? <Link to="/login" className="text-[#9d95ff] hover:opacity-80 font-medium transition-opacity">Sign in</Link>
            </p>
          </motion.form>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-16 h-16 rounded-full bg-[#00bae2]/20 border border-[#00bae2]/30 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle size={32} className="text-[#00bae2]" />
            </motion.div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Check your email</h3>
            <p className="text-sm text-on-surface-variant mb-6">We sent a reset link to <span className="text-[#9d95ff] font-medium">{email}</span></p>
            <p className="text-xs text-on-surface-variant mb-4">Didn't receive it? Check spam or</p>
            <button onClick={() => setSubmitted(false)} className="text-sm text-[#9d95ff] hover:opacity-85 font-medium transition-colors">
              Try a different email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Minimum 8 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await authService.resetPassword('mock-token', password);
    setLoading(false);
    setDone(true);
    toast.success('Password reset successfully!');
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account">
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  className={`w-full px-4 pr-11 py-2.5 rounded-xl border text-on-surface text-sm outline-none transition-all placeholder-on-surface-variant/50 bg-transparent ${errors.password ? 'border-error/50' : 'border-outline-variant/30 focus:border-[#9d95ff]'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
              {/* Password strength */}
              {password && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= i * 2 ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-amber-500' : i <= 3 ? 'bg-[#00bae2]' : 'bg-[#00bae2]' : 'bg-on-surface/10'}`} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border text-on-surface text-sm outline-none transition-all placeholder-on-surface-variant/50 bg-transparent ${errors.confirm ? 'border-error/50' : 'border-outline-variant/30 focus:border-[#9d95ff]'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {errors.confirm && <p className="text-xs text-error mt-1">{errors.confirm}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-[#E1DCC9] text-sm disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #9d95ff, #9d95ff)', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(109,93,252,0.25)' }}>
              {loading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Updating...</>) : 'Reset Password'}
            </button>
          </motion.form>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }} className="w-16 h-16 rounded-full bg-[#00bae2]/20 border border-[#00bae2]/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#00bae2]" />
            </motion.div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Password updated!</h3>
            <p className="text-sm text-on-surface-variant mb-6">You can now sign in with your new password.</p>
            <Link to="/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl font-semibold text-[#E1DCC9] text-sm hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #9d95ff, #9d95ff)' }}>
              Sign in →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
