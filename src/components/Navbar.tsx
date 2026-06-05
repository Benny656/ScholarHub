import { useState, useEffect } from 'react';
import { Moon, Sun, Brain, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { usePlaceholder } from '../hooks/usePlaceholder';

const navLinks = ['Platform', 'Resources', 'Solutions', 'Pricing'];

export function Navbar() {
  const { toggle } = useTheme();
  const go = usePlaceholder();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Scroll detection ── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      // Close mobile menu on scroll
      if (mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileOpen]);

  /* ── Close mobile menu on desktop resize ── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Close mobile menu on Escape key ── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const navHeight = scrolled ? 'h-16' : 'h-20';
  const menuTop = scrolled ? '4rem' : '5rem';

  return (
    <>
      {/* ── Main nav bar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] flex items-center px-6 md:px-12 glass border-b border-outline-variant/20 transition-all duration-300 ${navHeight} ${
          scrolled ? 'bg-surface/95 shadow-lg shadow-black/10' : 'bg-surface/80'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={go}
          >
            <div
              className={`bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg group-hover:rotate-12 transition-all duration-300 ${
                scrolled ? 'w-8 h-8' : 'w-10 h-10'
              }`}
            >
              <Brain className={scrolled ? 'w-5 h-5' : 'w-6 h-6'} />
            </div>
            <span
              className={`font-bold tracking-tight text-on-surface transition-all duration-300 ${
                scrolled ? 'text-base' : 'text-lg'
              }`}
            >
              ScholarHub
            </span>
          </div>

          {/* Desktop nav links with animated underline */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link}
                onClick={go}
                className="font-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative group"
              >
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors ripple-btn"
              aria-label="Toggle theme"
            >
              <Moon className="w-5 h-5 dark:hidden" />
              <Sun className="w-5 h-5 hidden dark:block" />
            </button>

            {/* Desktop: Sign In */}
            <button
              onClick={go}
              className="hidden md:block font-body-md text-on-surface-variant hover:text-primary transition-colors px-4 py-2 ripple-btn"
            >
              Sign In
            </button>

            {/* Desktop: Get Started */}
            <button
              onClick={go}
              className="hidden md:block bg-primary text-on-primary px-6 py-2.5 rounded-full font-body-md font-semibold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 ripple-btn shimmer-btn"
            >
              Get Started
            </button>

            {/* Mobile: Hamburger toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors ripple-btn"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? 'x' : 'menu'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu panel ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] bg-background/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-down panel */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 z-[99] md:hidden glass border-b border-outline-variant/20 bg-surface/95 shadow-2xl"
              style={{ top: menuTop, transition: 'top 0.3s ease' }}
            >
              <div className="px-6 py-5 flex flex-col gap-1">
                {/* Nav links */}
                {navLinks.map((link, idx) => (
                  <motion.button
                    key={link}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.055, duration: 0.2 }}
                    onClick={() => { setMobileOpen(false); go(); }}
                    className="text-left font-body-md text-on-surface-variant hover:text-primary transition-colors py-3.5 border-b border-outline-variant/10 last:border-0"
                  >
                    {link}
                  </motion.button>
                ))}

                {/* CTA buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.055 + 0.05 }}
                  className="flex flex-col gap-3 pt-4"
                >
                  <button
                    onClick={() => { setMobileOpen(false); go(); }}
                    className="font-body-md text-on-surface-variant border border-outline-variant/40 rounded-full py-3 hover:text-primary hover:border-primary/50 transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); go(); }}
                    className="bg-primary text-on-primary py-3 rounded-full font-body-md font-semibold hover:opacity-90 transition-opacity shimmer-btn"
                  >
                    Get Started
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
