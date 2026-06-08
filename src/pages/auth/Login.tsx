import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Shield, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

const ROLES: { value: UserRole; label: string; icon: React.ReactNode; desc: string; hint: string }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap size={18} />, desc: 'Access courses & assignments', hint: 'student@nexlearn.com' },
  { value: 'teacher', label: 'Teacher', icon: <BookOpen size={18} />, desc: 'Manage classes & grade work', hint: 'teacher@nexlearn.com' },
  { value: 'admin', label: 'Admin', icon: <Shield size={18} />, desc: 'Platform management & analytics', hint: 'admin@nexlearn.com' },
];

export function Login() {
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password, role);
      toast.success(`Welcome back!`, { icon: '🎉' });
      const routes: Record<UserRole, string> = { student: '/student/dashboard', teacher: '/teacher/dashboard', admin: '/admin/dashboard' };
      navigate(routes[role]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg);
      setErrors({ form: msg });
    }
  };

  const selectedRole = ROLES.find(r => r.value === role)!;

  const autofill = () => {
    setEmail(selectedRole.hint);
    setPassword('password123');
  };

  return (
    <AuthLayout title="Sign in to NexLearn" subtitle="Your AI-powered learning journey awaits">
      {/* Role selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {ROLES.map((r) => (
          <motion.button
            key={r.value}
            type="button"
            onClick={() => { setRole(r.value); setErrors({}); }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
              role === r.value
                ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20 hover:text-slate-300'
            }`}
          >
            <span className={role === r.value ? 'text-purple-400' : ''}>{r.icon}</span>
            <span className="text-xs font-semibold">{r.label}</span>
            {role === r.value && (
              <motion.div layoutId="roleActive" className="absolute inset-0 rounded-xl ring-1 ring-purple-500/50" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Demo hint */}
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-center gap-2 p-3 rounded-xl mb-5 cursor-pointer hover:bg-white/5 transition-colors"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
          onClick={autofill}
        >
          <div className="text-purple-400">{selectedRole.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-purple-300">{selectedRole.label} demo</p>
            <p className="text-xs text-slate-500 truncate">{selectedRole.hint} / any password</p>
          </div>
          <span className="text-xs text-purple-400 font-medium flex-shrink-0">Autofill →</span>
        </motion.div>
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            {errors.form}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-white text-sm outline-none transition-all placeholder-slate-600 ${errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/60'}`}
              style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-300" style={{ fontFamily: 'Inter, sans-serif' }}>Password</label>
            <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-white text-sm outline-none transition-all placeholder-slate-600 ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/60'}`}
              style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Signing in...
            </>
          ) : `Sign in as ${selectedRole.label}`}
        </motion.button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Don't have an account?{' '}
        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Create one free</Link>
      </p>
    </AuthLayout>
  );
}
