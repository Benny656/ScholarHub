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
      toast.success('Welcome to ScholarHub! 🎉');
      navigate(role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const inputClass = (field: string) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border text-on-surface text-sm outline-none transition-all placeholder-on-surface-variant/50 bg-transparent ${errors[field] ? 'border-error/50' : 'border-outline-variant/30 focus:border-[#3B82F6]'}`;
  const inputStyle = { fontFamily: 'Inter, sans-serif' };

  return (
    <AuthLayout title="Create your account" subtitle="Join 12,000+ learners on ScholarHub">
      {/* Role */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['student', 'teacher'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all ${role === r ? 'border-[#3B82F6]/50 bg-[#3B82F6]/15 text-[#3B82F6]' : 'border-outline-variant/30 bg-surface text-on-surface-variant hover:border-[#3B82F6]/30'}`}
          >
            {r === 'student' ? <GraduationCap size={18} /> : <BookOpen size={18} />}
            <span className="text-sm font-semibold capitalize">{r}</span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#3B82F6]' : 'bg-on-surface/10'}`} />
        ))}
        <span className="text-xs text-on-surface-variant ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Step {step}/2</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Alex Johnson" className={inputClass('name')} style={inputStyle} />
              </div>
              {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" className={inputClass('email')} style={inputStyle} />
              </div>
              {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" className={`${inputClass('password')} pr-11`} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="••••••••" className={inputClass('confirm')} style={inputStyle} />
              </div>
              {errors.confirm && <p className="text-xs text-error mt-1">{errors.confirm}</p>}
            </div>
            <button type="button" onClick={handleNext} className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-2 bg-[#3B82F6]" style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px color-mix(in srgb, #3B82F6 30%, transparent)' }}>
              Continue →
            </button>
          </motion.div>
        ) : (
          <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-4">
            {role === 'student' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Student ID <span className="text-on-surface-variant">(optional)</span></label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type="text" value={form.studentId} onChange={e => update('studentId', e.target.value)} placeholder="STU-2024-XXX" className={inputClass('studentId')} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Institution *</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type="text" value={form.institution} onChange={e => update('institution', e.target.value)} placeholder="University / College name" className={inputClass('institution')} style={inputStyle} />
                  </div>
                  {errors.institution && <p className="text-xs text-error mt-1">{errors.institution}</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Department *</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type="text" value={form.department} onChange={e => update('department', e.target.value)} placeholder="e.g. Computer Science" className={inputClass('department')} style={inputStyle} />
                  </div>
                  {errors.department && <p className="text-xs text-error mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Expertise <span className="text-on-surface-variant">(optional)</span></label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type="text" value={form.expertise} onChange={e => update('expertise', e.target.value)} placeholder="e.g. Machine Learning, Web Dev" className={inputClass('expertise')} style={inputStyle} />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold text-on-surface text-sm border border-outline-variant/30 hover:bg-on-surface/5 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                ← Back
              </button>
              <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60 flex items-center justify-center gap-2 bg-[#3B82F6]" style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px color-mix(in srgb, #3B82F6 30%, transparent)' }}>
                {isLoading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>) : 'Create Account'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-on-surface-variant mt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Already have an account?{' '}
        <Link to="/login" className="text-[#3B82F6] hover:opacity-80 font-medium transition-opacity">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
