import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Moon, Sun, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { getDashboardPath } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { useTheme } from '../../hooks/useTheme';

export function RoleSelection() {
  const { toggle, isDark } = useTheme();
  const { completeRoleSelection, requireRoleSelection, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && !requireRoleSelection) {
      navigate(getDashboardPath(user), { replace: true });
    }
  }, [isAuthenticated, user, requireRoleSelection, navigate]);

  const handleRoleSelection = async (selectedRole: UserRole, trackOrLevel?: 'college' | 'k12') => {
    setIsLoading(true);
    try {
      await completeRoleSelection(selectedRole, trackOrLevel);
      toast.success(`Welcome! Profile completed.`, { icon: '🎉' });
      navigate(getDashboardPath({ role: selectedRole, gradeLevel: trackOrLevel, teacherTrack: trackOrLevel }));
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete profile');
      setIsLoading(false);
    }
  };

  if (!requireRoleSelection && (!isAuthenticated || user)) return null;

  return (
    <div className="flex min-h-screen relative font-sans bg-bg-surface text-on-surface transition-colors duration-300">
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggle}
          className="p-2.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10 transition-colors overflow-hidden relative w-10 h-10 flex items-center justify-center"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="absolute">
                <Sun className="w-5 h-5 text-amber-500" />
              </motion.span>
            ) : (
              <motion.span key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="absolute">
                <Moon className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl p-8 glass rounded-3xl shadow-2xl border border-outline-variant/15 relative overflow-hidden backdrop-blur-xl bg-surface-container-lowest/60"
        >
          <div className="text-center space-y-2 mb-8">
            <h3 className="font-serif font-bold text-3xl tracking-tight text-on-surface">
              Complete Your Profile
            </h3>
            <p className="text-sm text-on-surface-variant">
              Choose your role to personalize your ScholarHub experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleRoleSelection('student', 'k12')}
              disabled={isLoading}
              className="p-6 rounded-2xl border border-outline-variant/30 hover:border-[#9d95ff] bg-surface hover:bg-[#9d95ff]/5 transition-all text-center group cursor-pointer disabled:opacity-50"
            >
              <div className="w-16 h-16 mx-auto bg-[#9d95ff]/10 text-[#9d95ff] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="font-bold text-lg text-on-surface">School Student</div>
              <div className="text-xs text-on-surface-variant mt-2">K-12 Student</div>
            </button>
            
            <button
              onClick={() => handleRoleSelection('student', 'college')}
              disabled={isLoading}
              className="p-6 rounded-2xl border border-outline-variant/30 hover:border-[#9d95ff] bg-surface hover:bg-[#9d95ff]/5 transition-all text-center group cursor-pointer disabled:opacity-50"
            >
              <div className="w-16 h-16 mx-auto bg-[#9d95ff]/10 text-[#9d95ff] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="font-bold text-lg text-on-surface">University Student</div>
              <div className="text-xs text-on-surface-variant mt-2">College or Higher Ed Student</div>
            </button>

            <button
              onClick={() => handleRoleSelection('teacher', 'k12')}
              disabled={isLoading}
              className="p-6 rounded-2xl border border-outline-variant/30 hover:border-[#9d95ff] bg-surface hover:bg-[#9d95ff]/5 transition-all text-center group cursor-pointer disabled:opacity-50"
            >
              <div className="w-16 h-16 mx-auto bg-[#9d95ff]/10 text-[#9d95ff] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div className="font-bold text-lg text-on-surface">K-12 Teacher</div>
              <div className="text-xs text-on-surface-variant mt-2">Primary / Secondary Educator</div>
            </button>

            <button
              onClick={() => handleRoleSelection('teacher', 'college')}
              disabled={isLoading}
              className="p-6 rounded-2xl border border-outline-variant/30 hover:border-[#9d95ff] bg-surface hover:bg-[#9d95ff]/5 transition-all text-center group cursor-pointer disabled:opacity-50"
            >
              <div className="w-16 h-16 mx-auto bg-[#9d95ff]/10 text-[#9d95ff] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="font-bold text-lg text-on-surface">College Teacher</div>
              <div className="text-xs text-on-surface-variant mt-2">University / Higher Ed Faculty</div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
