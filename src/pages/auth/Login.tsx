import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import { authService } from '../../services/auth.service';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

export function Login() {
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
    <div className="flex min-h-screen relative font-sans bg-neutral-50 dark:bg-neutral-950">
      {/* Brand Logo Link to Landing */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2.5 hover:opacity-85 active:scale-95 transition-all group"
      >
        <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          <img src="/logo-dark.png" alt="Scholar Hub Logo" className="w-full h-full object-contain hidden dark:block" />
          <img src="/logo-light.png" alt="Scholar Hub Logo" className="w-full h-full object-contain block dark:hidden" />
        </div>
        <span className="font-serif font-black text-xl text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors">
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
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md p-8 bg-white border border-neutral-200/80 rounded-2xl shadow-xl dark:bg-neutral-900 dark:border-neutral-800"
        >
          
          {/* Branding mobile title */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 flex items-center justify-center mx-auto lg:hidden">
              <img src="/logo-dark.png" alt="Scholar Hub Logo" className="w-full h-full object-contain hidden dark:block" />
              <img src="/logo-light.png" alt="Scholar Hub Logo" className="w-full h-full object-contain block dark:hidden" />
            </div>
            <h3 className="font-serif font-bold text-2xl tracking-tight text-neutral-950 dark:text-neutral-50">
              Access Scholar Hub Gateway
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Unified academic credentials checkpoint
            </p>
          </div>

          {/* Main login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                User Email Identifier
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-400" />
                </span>
                <input
                  type="email"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 dark:bg-neutral-800 dark:border-neutral-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                Security Passcode Key
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </span>
                <input
                  type="password"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 dark:bg-neutral-800 dark:border-neutral-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role picker selection context */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                Target Access Role level
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 dark:bg-neutral-800 dark:border-neutral-700 text-xs focus:outline-none dark:text-white"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="student">Student (School/College)</option>
                <option value="teacher">Teacher (Faculty Lecturer)</option>
                <option value="admin">Institutional Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary-dark transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
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
              <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              <span className="bg-white dark:bg-neutral-900 px-3">Bypass checkpoints demo access</span>
            </div>
          </div>

          {/* Instant verification bypass tags */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => autofill('student')}
              className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl leading-snug dark:border-neutral-800 dark:hover:bg-neutral-850 cursor-pointer text-left text-neutral-700 dark:text-neutral-300"
            >
              Student dashboard
            </button>
            <button
              type="button"
              onClick={() => autofill('teacher')}
              className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl leading-snug dark:border-neutral-800 dark:hover:bg-neutral-850 cursor-pointer text-left text-neutral-700 dark:text-neutral-300"
            >
              Teacher console
            </button>
            <button
              type="button"
              onClick={() => autofill('admin')}
              className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl leading-snug dark:border-neutral-800 dark:hover:bg-neutral-850 cursor-pointer text-left text-neutral-700 dark:text-neutral-300 col-span-2"
            >
              Dean Admin cockpit
            </button>
          </div>

          <p className="text-center text-[11px] text-neutral-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary hover:underline font-bold transition-opacity">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
