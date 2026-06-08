import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0b1326' }}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #4edea3, transparent)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
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
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <BookMarked size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Nex<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>Learn</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 border border-white/10 shadow-2xl"
          style={{ background: 'rgba(13,20,45,0.85)', backdropFilter: 'blur(20px)' }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
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
