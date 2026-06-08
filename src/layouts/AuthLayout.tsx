import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { toggle } = useTheme();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background transition-colors" style={{ '--screen-accent': '#3B82F6' } as React.CSSProperties}>
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggle}
          className="p-2.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10 transition-colors"
          aria-label="Toggle light/dark theme"
        >
          <Moon className="w-5 h-5 dark:hidden" />
          <Sun className="w-5 h-5 hidden dark:block" />
        </button>
      </div>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, var(--screen-accent), transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-secondary), transparent)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(var(--color-on-surface) 1px, transparent 1px), linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
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
            <div className="w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/logo-dark.png" alt="ScholarHub Logo" className="w-full h-full object-contain drop-shadow-xl hidden dark:block" />
              <img src="/logo-light.png" alt="ScholarHub Logo" className="w-full h-full object-contain drop-shadow-xl block dark:hidden" />
            </div>
            <span className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Scholar<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--screen-accent), var(--color-primary))' }}>Hub</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 glass shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-on-surface mb-1" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-on-surface-variant" style={{ fontFamily: 'Inter, sans-serif' }}>
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
