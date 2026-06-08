import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Building, Tag, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

export function Register() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', studentId: '', institution: '', department: '', expertise: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (role === 'student' && !form.institution) e.institution = 'Institution is required';
    if (role === 'teacher' && !form.department) e.department = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    try {
      await register({ ...form, role: role as UserRole });
      toast.success('Welcome to NexLearn! 🎉');
      navigate(role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const inputClass = (field: string) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border text-white text-sm outline-none transition-all placeholder-slate-600 ${errors[field] ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/60'}`;
  const inputStyle = { background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' };

  return (
    <AuthLayout title="Create your account" subtitle="Join 12,000+ learners on NexLearn">
      {/* Role */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['student', 'teacher'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all ${role === r ? 'border-purple-500/50 bg-purple-500/15 text-purple-300' : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20'}`}
          >
            {r === 'student' ? <GraduationCap size={18} /> : <BookOpen size={18} />}
            <span className="text-sm font-semibold capitalize">{r}</span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-purple-500' : 'bg-white/10'}`} />
        ))}
        <span className="text-xs text-slate-500 ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Step {step}/2</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Alex Johnson" className={inputClass('name')} style={inputStyle} />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" className={inputClass('email')} style={inputStyle} />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" className={`${inputClass('password')} pr-11`} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="••••••••" className={inputClass('confirm')} style={inputStyle} />
              </div>
              {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm}</p>}
            </div>
            <button type="button" onClick={handleNext} className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-2" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}>
              Continue →
            </button>
          </motion.div>
        ) : (
          <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-4">
            {role === 'student' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Student ID <span className="text-slate-500">(optional)</span></label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={form.studentId} onChange={e => update('studentId', e.target.value)} placeholder="STU-2024-XXX" className={inputClass('studentId')} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Institution *</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={form.institution} onChange={e => update('institution', e.target.value)} placeholder="University / College name" className={inputClass('institution')} style={inputStyle} />
                  </div>
                  {errors.institution && <p className="text-xs text-red-400 mt-1">{errors.institution}</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Department *</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={form.department} onChange={e => update('department', e.target.value)} placeholder="e.g. Computer Science" className={inputClass('department')} style={inputStyle} />
                  </div>
                  {errors.department && <p className="text-xs text-red-400 mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Expertise <span className="text-slate-500">(optional)</span></label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={form.expertise} onChange={e => update('expertise', e.target.value)} placeholder="e.g. Machine Learning, Web Dev" className={inputClass('expertise')} style={inputStyle} />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold text-slate-300 text-sm border border-white/10 hover:bg-white/5 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                ← Back
              </button>
              <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}>
                {isLoading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>) : 'Create Account'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-slate-500 mt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Already have an account?{' '}
        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
