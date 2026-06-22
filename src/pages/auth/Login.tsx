import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Moon, Sun } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { getDashboardPath } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const { toggle, isDark } = useTheme();
  const { login, getAuthenticatedRedirectPath, isAuthenticated, isLoading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(getAuthenticatedRedirectPath(), { replace: true });
    }
  }, [authLoading, getAuthenticatedRedirectPath, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back!`, { icon: '🎉' });
      navigate(getDashboardPath(user), { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await authService.loginWithOAuth(provider);
    } catch (err: any) {
      toast.error(err.message || 'OAuth login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative font-sans bg-bg-surface text-on-surface transition-colors duration-300">
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggle}
          className="p-2.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10 transition-colors overflow-hidden relative w-10 h-10 flex items-center justify-center"
          aria-label="Toggle light/dark theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="sun"
                initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Sun className="w-5 h-5 text-amber-500" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Moon className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
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
      <div className="hidden lg:flex w-1/2 bg-[#412D15] relative items-center justify-center p-12 overflow-hidden border-r border-[#412D15]">
        <div className="absolute inset-0 bg-[#1F150C] opacity-60 z-0" />
        
        {/* Abstract decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
        
        <div className="relative z-10 max-w-md space-y-6 text-[#E1DCC9] text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto">
            <img src="/logo-dark.png" alt="Scholar Hub Logo" className="w-full h-full object-contain hidden dark:block" />
            <img src="/logo-light.png" alt="Scholar Hub Logo" className="w-full h-full object-contain block dark:hidden" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-serif font-black text-3xl tracking-tight leading-tight">
              Unified Academic Operating System
            </h2>
            <p className="text-sm text-[#7c7c6f]">
              A secure, responsive campus workplace with advanced real-time virtual teaching spaces.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFCE1]/5 border border-[#E1DCC9]/10 text-xs text-[#7c7c6f]">
            <span className="text-[#E1DCC9]/90 font-bold block mb-1">Copilot Features Active</span>
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

          <div>
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
                {/* Social Auth Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleOAuth('google')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface hover:bg-on-surface/5 text-on-surface text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth('github')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface hover:bg-on-surface/5 text-on-surface text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    Continue with GitHub
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 border-t border-outline-variant/30" />
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant shrink-0">OR</span>
                  <div className="flex-1 border-t border-outline-variant/30" />
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
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-on-surface text-xs outline-none transition-all placeholder-on-surface-variant/50 bg-transparent border-outline-variant/30 focus:border-[#9d95ff]"
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
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-on-surface text-xs outline-none transition-all placeholder-on-surface-variant/50 bg-transparent border-outline-variant/30 focus:border-[#9d95ff]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#9d95ff] to-[#9d95ff] text-[#E1DCC9] rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-[#E1DCC9]/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Credentials & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <div className="flex justify-between items-center text-xs">
              <Link to="/forgot-password" className="text-[#9d95ff] hover:underline font-bold">Forgot Password?</Link>
            </div>
          </form>
          </motion.div>
          </div>

          <p className="text-center text-[11px] text-on-surface-variant mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#9d95ff] hover:opacity-80 font-bold transition-opacity">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
