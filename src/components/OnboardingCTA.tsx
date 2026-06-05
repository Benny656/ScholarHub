import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePlaceholder } from '../hooks/usePlaceholder';
import { useMagnetic } from '../hooks/useMagnetic';

const steps = [
  { number: 1, title: 'Sign Up Free', description: 'SSO integration gets your whole class live in seconds.' },
  { number: 2, title: 'Join/Create', description: 'Import curriculum from anywhere with AI parsers.' },
  { number: 3, title: 'Learn Live', description: 'Engage with AI assistance through interactive modules.' },
  { number: 4, title: 'Get Certified', description: 'Verified credentials issued directly to your wallet.' },
];

const stepColors = ['primary', 'secondary', 'tertiary', 'primary'];

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="py-32 px-6 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto text-center mb-24 reveal">
        <h2 className="font-headline-lg text-4xl md:text-6xl mb-6 text-on-surface">Get Started in Minutes</h2>
        <p className="font-body-md text-on-surface-variant">Our onboarding is as intelligent as our platform.</p>
      </div>

      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {steps.map((step, idx) => {
          const color = stepColors[idx];
          return (
            <motion.div key={idx} variants={itemVariants} className="text-center group reveal stagger-1">
              <div className={`relative z-10 w-20 h-20 bg-${color} rounded-full mx-auto flex items-center justify-center text-on-primary font-headline-md text-2xl shadow-xl shadow-${color}/30 group-hover:scale-110 transition-transform step-line border-4 border-surface icon-bounce`}>
                {step.number}
              </div>
              <h4 className="mt-8 font-headline-md text-on-surface">{step.title}</h4>
              <p className="mt-4 font-body-md text-on-surface-variant">{step.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export function CTASection() {
  const go = usePlaceholder();
  const { ref, magnetStyle, handleMouseMove, handleMouseLeave } = useMagnetic(0.3);
  const variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="py-32 px-6">
      <motion.div
        className="max-w-5xl mx-auto rounded-[3rem] glass overflow-hidden relative group bg-surface-container-low/50 reveal card-lift"
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 group-hover:opacity-60 transition-opacity"></div>
        <div className="relative z-10 p-12 md:p-24 text-center">
          <h2 className="font-headline-lg text-4xl md:text-7xl mb-10 text-on-surface">Ready to transform education?</h2>
          <p className="font-body-md text-on-surface-variant mb-12 max-w-2xl mx-auto">
            Join thousands of forward-thinking institutions building the future of learning on ScholarHub.
          </p>
          <div ref={ref} style={magnetStyle} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="inline-block">
            <button onClick={go} className="bg-primary text-on-primary px-12 py-5 rounded-full font-body-md font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center gap-3 mx-auto ripple-btn shimmer-btn">
              Get Started Today
              <Sparkles className="w-6 h-6 icon-bounce" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
