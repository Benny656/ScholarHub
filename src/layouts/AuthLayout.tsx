import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { toggle, isDark } = useTheme();
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-surface text-on-surface transition-colors duration-300" 
      style={{ '--screen-accent': '#9d95ff' } as React.CSSProperties}
    >
      <div className="absolute top-4 right-4 z-20">
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

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft purple radial glow behind the registration card */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-30 blur-3xl pointer-events-none" 
          style={{ background: 'radial-gradient(circle, #9d95ff 0%, #9d95ff 50%, transparent 100%)' }} 
        />

        {/* Ambient glows at corners */}
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #9d95ff, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #9d95ff, transparent)' }} />

        {/* Faint floating particles (gradient mesh style) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: i % 2 === 0 ? 120 : 80,
              height: i % 2 === 0 ? 120 : 80,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(109, 93, 252, 0.15) 0%, transparent 70%)' 
                : 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
              left: `${15 + (i * 15)}%`,
              top: `${10 + (i * 13)}%`,
              filter: 'blur(16px)',
            }}
            animate={{
              x: [0, (i % 2 === 0 ? 40 : -40), (i % 2 === 0 ? -20 : 20), 0],
              y: [0, (i % 2 === 0 ? -30 : 35), (i % 2 === 0 ? 15 : -15), 0],
            }}
            transition={{
              duration: 25 + (i * 4),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Subtle animated grid background */}
        <motion.div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(var(--on-surface) 1px, transparent 1px), linear-gradient(90deg, var(--on-surface) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '45px 45px'],
          }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 18,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src="/logo-dark.png" alt="ScholarHub Logo" className="w-full h-full object-contain drop-shadow-xl hidden dark:block" />
              <img src="/logo-light.png" alt="ScholarHub Logo" className="w-full h-full object-contain drop-shadow-xl block dark:hidden" />
            </div>
            <span className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Scholar<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #9d95ff, #9d95ff)' }}>Hub</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 glass shadow-2xl border border-outline-variant/15 relative overflow-hidden backdrop-blur-xl bg-surface-container-lowest/60">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-on-surface mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-on-surface-variant font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
