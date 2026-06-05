import { useThreeScene } from '../hooks/useThreeScene';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePlaceholder } from '../hooks/usePlaceholder';
import { useMagnetic } from '../hooks/useMagnetic';

export function Hero() {
  useThreeScene('three-container');
  const go = usePlaceholder();

  /* ── Parallax via Framer Motion scroll transforms ── */
  const { scrollY } = useScroll();
  // Hero content floats up and fades as user scrolls
  const contentY = useTransform(scrollY, [0, 500], [0, -90]);
  const contentOpacity = useTransform(scrollY, [0, 380], [1, 0]);
  // Three.js background moves slower (parallax depth)
  const bgY = useTransform(scrollY, [0, 600], [0, 140]);

  /* ── Magnetic buttons ── */
  const mag1 = useMagnetic(0.35);
  const mag2 = useMagnetic(0.35);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const wordVariants = {
    hidden: { y: '100%' },
    visible: {
      y: '0%',
      transition: { duration: 0.6 },
    },
  };

  const words = ['The', 'Future', 'of', 'Learning,', 'Powered', 'by', 'AI.'];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Three.js canvas — moves slower than content (parallax) */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0"
        id="three-container"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-[1] pointer-events-none" />

      {/* Hero content — floats up and fades on scroll */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 border-primary/20 animate-bounce bg-surface-container-low/50">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(216,188,234,0.5)]" />
            <span className="font-label-md uppercase tracking-widest opacity-80 text-on-surface">AI Learning 2.0 is live</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-headline-lg text-5xl md:text-8xl mb-8 hero-title-anim text-on-surface">
            <div className="overflow-hidden">
              <motion.div
                className="flex flex-wrap justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {words.map((word, idx) => (
                  <motion.span
                    key={idx}
                    variants={wordVariants}
                    className="mr-3 overflow-hidden inline-block"
                  >
                    <span className={word === 'AI.' ? 'text-gradient' : ''}>{word}</span>
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.h1>

          <motion.p variants={itemVariants} className="font-body-md text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12">
            A high-fidelity educational ecosystem designed for focused, high-performance learning. Empowering students and teachers through interactive intelligence.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Start Free Trial — magnetic */}
            <div
              ref={mag1.ref}
              style={mag1.magnetStyle}
              onMouseMove={mag1.handleMouseMove}
              onMouseLeave={mag1.handleMouseLeave}
              className="w-full sm:w-auto"
            >
              <button
                onClick={go}
                className="w-full bg-primary text-on-primary px-10 py-4 rounded-full font-body-md font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-2xl shadow-primary/30 ripple-btn shimmer-btn group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 icon-bounce" />
              </button>
            </div>

            {/* View Demo — magnetic */}
            <div
              ref={mag2.ref}
              style={mag2.magnetStyle}
              onMouseMove={mag2.handleMouseMove}
              onMouseLeave={mag2.handleMouseLeave}
              className="w-full sm:w-auto"
            >
              <button
                onClick={go}
                className="w-full glass px-10 py-4 rounded-full font-body-md font-semibold flex items-center justify-center gap-2 hover:bg-surface-variant/50 transition-all border-outline/20 text-on-surface ripple-btn group"
              >
                <PlayCircle className="w-5 h-5 icon-rotate" />
                View Demo
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50 text-on-surface"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}
