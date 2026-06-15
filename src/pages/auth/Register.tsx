import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Building, Tag } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { authService } from '../../services/auth.service';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export function Register() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    studentId: '',
    institution: '',
    gradeLevel: '',
    department: '',
    expertise: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
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

  const validateFinalStep = () => {
    const e: Record<string, string> = {};
    if (role === 'student') {
      if (!form.institution.trim()) e.institution = 'Institution is required';
    } else if (role === 'teacher') {
      if (!form.department.trim()) e.department = 'Department is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFinalStep()) return;
    setIsLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        role: role as UserRole,
        institution: role === 'student' ? form.institution : undefined,
        studentId: role === 'student' ? form.studentId : undefined,
        gradeLevel: role === 'student' ? form.gradeLevel : undefined,
        department: role === 'teacher' ? form.department : undefined,
        expertise: role === 'teacher' ? form.expertise : undefined,
      });
      toast.success('Welcome to ScholarHub! 🎉');
      navigate(role === 'student' ? '/unistudents/dashboard' : '/teacher/dashboard');
    } catch (err: any) {
      toast.error(authService.getRateLimitMessage(err) || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border text-on-surface text-sm outline-none transition-all placeholder-on-surface-variant/50 bg-transparent ${errors[field] ? 'border-error/50' : 'border-outline-variant/30 focus:border-[#6D5DFC]'}`;
  const inputStyle = { fontFamily: 'Inter, sans-serif' };

  const totalSteps = 2;

  return (
    <AuthLayout title="Create your account" subtitle="Join 12,000+ learners on ScholarHub">
      {/* Role selection only on step 1 */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['student', 'teacher'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all ${role === r ? 'border-[#6D5DFC]/50 bg-[#6D5DFC]/10 text-[#6D5DFC]' : 'border-outline-variant/30 bg-surface text-on-surface-variant hover:border-[#6D5DFC]/30'}`}
            >
              {r === 'student' ? <GraduationCap size={18} /> : <BookOpen size={18} />}
              <span className="text-sm font-semibold capitalize">{r}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const s = i + 1;
            return (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-[#6D5DFC] to-[#4F46E5]' : 'bg-on-surface/10'}`} />
            );
          })}
        <span className="text-xs text-on-surface-variant ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Step {step}/{totalSteps}</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
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
            <button type="button" onClick={handleNext} className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-2 bg-gradient-to-r from-[#6D5DFC] to-[#4F46E5] hover:opacity-90 transition-opacity" style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(109,93,252,0.25)' }}>
              Continue →
            </button>
          </motion.div>
        )}

        {step === 2 && role === 'student' && (
          <motion.form key="step2-student" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Student ID <span className="text-on-surface-variant">(optional)</span></label>
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="text" value={form.studentId} onChange={e => update('studentId', e.target.value)} placeholder="STU-2024-XXX" className={inputClass('studentId')} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Grade Level <span className="text-on-surface-variant">(optional)</span></label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="text" value={form.gradeLevel} onChange={e => update('gradeLevel', e.target.value)} placeholder="e.g. Grade 12, Undergraduate" className={inputClass('gradeLevel')} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Institution *</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="text" value={form.institution} onChange={e => update('institution', e.target.value)} placeholder="School / University / College name" className={inputClass('institution')} style={inputStyle} />
              </div>
              {errors.institution && <p className="text-xs text-error mt-1">{errors.institution}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="flex-1 py-3 rounded-xl font-semibold text-on-surface text-sm border border-outline-variant/30 hover:bg-on-surface/5 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                ← Back
              </button>
              <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6D5DFC] to-[#4F46E5] hover:opacity-90 transition-opacity" style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(109,93,252,0.25)' }}>
                {isLoading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>) : 'Create Account'}
              </button>
            </div>
          </motion.form>
        )}

        {step === 2 && role === 'teacher' && (
          <motion.form key="step-final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-4">
            {role === 'teacher' && (
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
              <button type="button" onClick={handleBack} className="flex-1 py-3 rounded-xl font-semibold text-on-surface text-sm border border-outline-variant/30 hover:bg-on-surface/5 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                ← Back
              </button>
              <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6D5DFC] to-[#4F46E5] hover:opacity-90 transition-opacity" style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(109,93,252,0.25)' }}>
                {isLoading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>) : 'Create Account'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-on-surface-variant mt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        Already have an account?{' '}
        <Link to="/login" className="text-[#6D5DFC] hover:opacity-80 font-medium transition-opacity">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
