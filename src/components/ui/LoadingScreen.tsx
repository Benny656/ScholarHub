import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({
  onComplete,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 2.5 seconds total loading time
    const totalTime = 2500;
    // Count up completes at 2.1 seconds to sit at 100% briefly
    const countDuration = 2100;
    const startTime = Date.now();

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, totalTime);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / countDuration) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 20); // Smoother increments every 20ms

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  // Using spaced name "SCHOLAR HUB"
  const letters = "SCHOLAR HUB".split("");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col justify-between bg-background p-6 md:p-12 overflow-hidden w-screen h-screen select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top spacer (hides on mobile to save space) */}
          <div className="h-12 w-full hidden md:block pointer-events-none" />

          {/* Background Glow */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 md:h-80 md:w-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Center Main Loader Content */}
          <div className="relative flex flex-col items-center justify-center my-auto w-full text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/logo.png"
                alt="Scholar Hub"
                className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-contain mb-8 md:mb-10"
              />
            </motion.div>

            {/* Wordmark (Responsive sizes) */}
            <motion.div
              className="flex flex-wrap justify-center text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl md:text-7xl font-serif max-w-sm sm:max-w-none gap-[2px] md:gap-[4px]"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.3,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 20,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.div>

            {/* Tagline (Responsive sizes) */}
            <motion.p
              className="mt-4 md:mt-6 text-sm md:text-base tracking-[0.25em] text-on-surface-variant/70 font-sans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1,
                duration: 0.4,
              }}
            >
              LEARN • TEACH • GROW
            </motion.p>

            {/* Progress Line - Dynamically tied to state progress */}
            <div className="mt-10 h-[2px] w-56 md:w-80 overflow-hidden rounded-full bg-outline-variant/20 relative">
              <div
                className="h-full bg-primary transition-all duration-75 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Bottom Bar: Metadata & Retro Counter */}
          <div className="w-full flex justify-between items-end relative z-10">
            {/* Retro Metadata Info (hidden on mobile) */}
            <div className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest hidden sm:block">
              SYSTEM_BOOT: OK // SH_V2.6
            </div>

            {/* Retro Digital Counter */}
            <div 
              className="font-mono text-5xl md:text-7xl font-extrabold tracking-tighter text-primary select-none tabular-nums ml-auto transition-all"
              style={{
                textShadow: '0 0 20px rgba(var(--primary), 0.2)'
              }}
            >
              {progress.toString().padStart(3, '0')}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
