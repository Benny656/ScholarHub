import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie-player';
import { useTheme } from '../hooks/useTheme';
import { Home, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotFound() {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setAnimationData(null);

    const loader = isDark
      ? import('../../animations/Scene-2.json')
      : import('../../animations/Scene-1.json');

    loader.then((mod) => {
      setAnimationData(mod.default ?? mod);
      setLoading(false);
    });
  }, [isDark]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background transition-colors duration-500 overflow-hidden"
    >

      {/* ── Full-viewport Lottie (pointer-events: none so header/button stay clickable) ── */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      >
        {loading ? (
          <div
            className="w-full h-full animate-pulse"
            style={{
              background: isDark
                ? 'rgba(216,188,234,0.04)'
                : 'rgba(25,120,229,0.03)',
            }}
          />
        ) : (
          <Lottie
            animationData={animationData}
            play
            loop
            style={{ width: '100%', height: '100%' }}
            rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
          />
        )}
      </div>

      {/* ── Platform logo (top-left) ── */}
      <div className="absolute top-4 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105 cursor-pointer"
          aria-label="ScholarHub Logo"
        >
          <img
            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
            alt="Scholar Hub Logo"
            className="h-10 w-auto object-contain"
          />
        </button>
      </div>

      {/* ── Floating theme toggle (top-right) ── */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggle}
          className="p-2.5 rounded-full text-on-surface-variant hover:bg-surface-variant/50 glass transition-colors ripple-btn"
          aria-label="Toggle light/dark theme"
        >
          <Moon className="w-5 h-5 dark:hidden" />
          <Sun className="w-5 h-5 hidden dark:block" />
        </button>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-24 flex items-center justify-center">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ripple-btn shimmer-btn relative overflow-hidden"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #d8bcea 0%, #f3b6cd 50%, #d0c2d6 100%)'
              : 'linear-gradient(135deg, #00bae2 0%, #6e5676 100%)',
            color: isDark ? '#3c284c' : '#ffffff',
            boxShadow: isDark
              ? '0 8px 32px rgba(216,188,234,0.45), 0 2px 8px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(25,120,229,0.45), 0 2px 8px rgba(0,0,0,0.1)',
          }}
          aria-label="Return to ScholarHub home page"
        >
          <Home className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          <span>Return to ScholarHub</span>
        </button>
      </div>
    </motion.div>
  );
}
