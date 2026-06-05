import { Users, Clock, Link2Off, CheckCircle, Zap, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { use3DTilt, useCursorGlow } from '../hooks/useCardEffects';

const problemCards = [
  {
    icon: Users,
    title: 'One-size-fits-all teaching',
    description: '40 students, 1 teacher, 1 pace. Personalized attention is a luxury that few can afford in current systems.',
    color: 'error',
  },
  {
    icon: Clock,
    title: 'No real-time feedback',
    description: 'Waiting days for grades prevents immediate correction of misconceptions, slowing the learning cycle.',
    color: 'error',
  },
  {
    icon: Link2Off,
    title: 'Disconnected tools',
    description: 'Fragmented ecosystems of LMS, video, and grading platforms create friction for both staff and students.',
    color: 'error',
  },
];

const solutionCards = [
  {
    icon: CheckCircle,
    title: 'Adaptive IQ Core',
    description: 'Our AI analyzes learning patterns to adjust complexity in real-time, ensuring optimal challenge levels for every student.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Instant Cognitive Insights',
    description: 'Immediate feedback on every interaction. Know exactly what you\'ve mastered and where you need focus, instantly.',
    color: 'primary',
  },
  {
    icon: Layers,
    title: 'The Unified Hub',
    description: 'Video, assignments, grading, and AI assistance in one stunning, high-performance interface. No context switching.',
    color: 'primary',
  },
];

export function ProblemSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="py-32 px-6 relative bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto text-center mb-20 reveal">
        <h2 className="font-headline-lg text-4xl md:text-6xl mb-6 text-on-surface">
          Traditional Education Is <span className="text-error">Broken</span>
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
          Modern classrooms are struggling with outdated models that stifle growth and leave students behind.
        </p>
      </div>

      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {problemCards.map((card, idx) => {
          const Icon = card.icon;
          const { ref: tiltRef, transform, handleMouseMove: handleTiltMove, handleMouseLeave: handleTiltLeave } = use3DTilt();
          const { ref: glowRef, glowPosition, handleMouseMove: handleGlowMove } = useCursorGlow();

          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              ref={tiltRef}
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
              style={{ transform }}
              className="glass p-10 rounded-[2rem] border-error/10 hover:border-error/30 transition-all group bg-surface-container-low/50 reveal stagger-1 cursor-glow-card blur-reveal"
            >
              <div
                ref={glowRef}
                onMouseMove={handleGlowMove}
                style={{
                  background: `radial-gradient(300px circle at ${glowPosition.x}px ${glowPosition.y}px, rgba(216, 188, 234, 0.15), transparent 40%)`,
                } as React.CSSProperties}
                className="absolute inset-0 pointer-events-none"
              />
              <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mb-8 text-error transition-transform duration-300 icon-bounce">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-headline-md mb-4 text-on-surface">{card.title}</h3>
              <p className="font-body-md text-on-surface-variant">{card.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export function SolutionSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto text-center mb-20 relative z-10 reveal">
        <h2 className="font-headline-lg text-4xl md:text-6xl mb-6 text-on-surface">
          ScholarHub <span className="text-primary">Changes Everything</span>
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
          We've built a unified intelligence layer that adapts to you, providing a seamless educational experience.
        </p>
      </div>

      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {solutionCards.map((card, idx) => {
          const Icon = card.icon;
          const { ref: tiltRef, transform, handleMouseMove: handleTiltMove, handleMouseLeave: handleTiltLeave } = use3DTilt();
          const { ref: glowRef, glowPosition, handleMouseMove: handleGlowMove } = useCursorGlow();

          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              ref={tiltRef}
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
              style={{ transform }}
              className="glass p-10 rounded-[2rem] glow-purple border-primary/20 group bg-surface-container-low/50 reveal stagger-1 cursor-glow-card blur-reveal"
            >
              <div
                ref={glowRef}
                onMouseMove={handleGlowMove}
                style={{
                  background: `radial-gradient(300px circle at ${glowPosition.x}px ${glowPosition.y}px, rgba(216, 188, 234, 0.15), transparent 40%)`,
                } as React.CSSProperties}
                className="absolute inset-0 pointer-events-none"
              />
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary group-hover:rotate-[360deg] transition-transform duration-700">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-headline-md mb-4 text-on-surface">{card.title}</h3>
              <p className="font-body-md text-on-surface-variant">{card.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
