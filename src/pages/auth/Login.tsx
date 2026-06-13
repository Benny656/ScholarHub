import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, GraduationCap, ArrowRight, Moon, Sun } from 'lucide-react';
import { authService } from '../../services/auth.service';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';
import { useTheme } from '../../hooks/useTheme';

export function Login() {
  const { toggle } = useTheme();
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'Unauthorized' || location.state?.error) {
      toast.error('Unauthorized: Admin privileges required.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await authService.login({ email, password, role });
      toast.success(`Welcome back!`, { icon: '🎉' });
      const routes: Record<UserRole, string> = { student: '/student/dashboard', teacher: '/teacher/dashboard', admin: '/admin/dashboard' };
      navigate(routes[role]);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const autofill = (demoRole: UserRole) => {
    setRole(demoRole);
    setEmail(`${demoRole}@nexlearn.com`);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen relative font-sans bg-bg-surface text-on-surface transition-colors duration-300">
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggle}
          className="p-2.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10 transition-colors"
          aria-label="Toggle light/dark theme"
        >
          <Moon className="w-5 h-5 dark:hidden" />
          <Sun className="w-5 h-5 hidden dark:block" />
        </button>
      </div>

      {/* Brand Logo Link to Landing */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2.5 hover:opacity-85 active:scale-95 transition-all group"
      >
        <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          <img src="/logo-dark.png" alt="Scholar Hub Logo" className="w-full h-full object-contain hidden dark:block" />
          <img src="/logo-light.png" alt="Scholar Hub Logo" className="w-full h-full object-contain block dark:hidden" />
        </div>
        <span className="font-serif font-black text-xl text-on-surface group-hover:text-primary transition-colors">
          Scholar Hub
        </span>
      </Link>

      {/* Branding side bar (1/2 page layout on desktops) */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 relative items-center justify-center p-12 overflow-hidden border-r border-neutral-800">
        <div className="absolute inset-0 bg-neutral-950 opacity-60 z-0" />
        
        {/* Abstract decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
        
        <div className="relative z-10 max-w-md space-y-6 text-white text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto">
            <img src="/logo-dark.png" alt="Scholar Hub Logo" className="w-full h-full object-contain hidden dark:block" />
            <img src="/logo-light.png" alt="Scholar Hub Logo" className="w-full h-full object-contain block dark:hidden" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-serif font-black text-3xl tracking-tight leading-tight">
              Unified Academic Operating System
            </h2>
            <p className="text-sm text-neutral-400">
              A secure, responsive campus workplace with advanced real-time virtual teaching spaces.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-400">
            <span className="text-white/90 font-bold block mb-1">Copilot Features Active</span>
            Equipped with Gemini structural evaluation grids, customized MCQ exams generator, and plagiarism risk meters.
          </div>
        </div>
      </div>

      {/* Login control side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-surface transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md p-8 glass rounded-3xl shadow-2xl border border-outline-variant/15 relative overflow-hidden backdrop-blur-xl bg-surface-container-lowest/60"
        >
          
          {/* Branding mobile title */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 flex items-center justify-center mx-auto lg:hidden">
              <img src="/logo-dark.png" alt="Scholar Hub Logo" className="w-full h-full object-contain hidden dark:block" />
              <img src="/logo-light.png" alt="Scholar Hub Logo" className="w-full h-full object-contain block dark:hidden" />
            </div>
            <h3 className="font-serif font-bold text-2xl tracking-tight text-on-surface">
              Access Scholar Hub Gateway
            </h3>
            <p className="text-xs text-on-surface-variant font-medium">
              Unified academic credentials checkpoint
            </p>
          </div>

          {/* Main login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">
                User Email Identifier
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-on-surface-variant/80" />
                </span>
                <input
                  type="email"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-on-surface text-xs outline-none transition-all placeholder-on-surface-variant/50 bg-transparent border-outline-variant/30 focus:border-[#6D5DFC]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">
                Security Passcode Key
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-on-surface-variant/80" />
                </span>
                <input
                  type="password"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-on-surface text-xs outline-none transition-all placeholder-on-surface-variant/50 bg-transparent border-outline-variant/30 focus:border-[#6D5DFC]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role picker selection context */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">
                Target Access Role level
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border text-on-surface text-xs outline-none transition-all bg-transparent border-outline-variant/30 focus:border-[#6D5DFC]"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="student" className="bg-surface text-on-surface">Student (School/College)</option>
                <option value="teacher" className="bg-surface text-on-surface">Teacher (Faculty Lecturer)</option>
                <option value="admin" className="bg-surface text-on-surface">Institutional Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#6D5DFC] to-[#4F46E5] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Credentials & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant/30" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
              <span className="bg-surface-container-lowest/90 dark:bg-surface-container-lowest/60 px-3 transition-colors">Bypass checkpoints demo access</span>
            </div>
          </div>

          {/* Instant verification bypass tags */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => autofill('student')}
              className="p-2 border border-outline-variant/30 hover:bg-on-surface/5 rounded-xl leading-snug transition-all cursor-pointer text-left text-on-surface-variant"
            >
              Student dashboard
            </button>
            <button
              type="button"
              onClick={() => autofill('teacher')}
              className="p-2 border border-outline-variant/30 hover:bg-on-surface/5 rounded-xl leading-snug transition-all cursor-pointer text-left text-on-surface-variant"
            >
              Teacher console
            </button>
            <button
              type="button"
              onClick={() => autofill('admin')}
              className="p-2 border border-outline-variant/30 hover:bg-on-surface/5 rounded-xl leading-snug transition-all cursor-pointer text-left text-on-surface-variant col-span-2"
            >
              Dean Admin cockpit
            </button>
          </div>

          <p className="text-center text-[11px] text-on-surface-variant mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6D5DFC] hover:opacity-80 font-bold transition-opacity">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
