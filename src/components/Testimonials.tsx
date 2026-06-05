import { motion } from 'framer-motion';
import { use3DTilt, useCursorGlow } from '../hooks/useCardEffects';

const testimonials = [
  {
    quote: "The AI tutor is like having a private professor by my side 24/7. My grades in Data Structures jumped from a C to an A+ in just one semester.",
    author: 'Jordan Davis',
    role: 'CS Student, Stanford',
    initials: 'JD',
    color: 'from-primary to-secondary',
  },
  {
    quote: "ScholarHub automated 80% of my administrative workload. I finally have time to focus on what matters: mentoring my students.",
    author: 'Sarah Lin',
    role: 'Dept. Head, MIT',
    initials: 'SL',
    color: 'from-secondary to-tertiary',
  },
  {
    quote: "The insights provided by the educator hub allowed us to identify at-risk students 3 weeks earlier than our previous system.",
    author: 'Michael Reed',
    role: 'Superintendent, District 12',
    initials: 'MR',
    color: 'from-tertiary to-primary',
  },
];

export function TestimonialsSection() {
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto text-center mb-20 reveal">
        <h2 className="font-headline-lg text-4xl md:text-6xl mb-6 text-on-surface">Loved by Students and Teachers</h2>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
          Real stories from the people transforming their futures with ScholarHub.
        </p>
      </div>

      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {testimonials.map((testimonial, idx) => {
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
              className="glass p-10 rounded-[2.5rem] flex flex-col justify-between hover:translate-y-[-8px] transition-all duration-300 bg-surface-container-low/50 reveal stagger-1 cursor-glow-card blur-reveal"
            >
              <div
                ref={glowRef}
                onMouseMove={handleGlowMove}
                style={{
                  background: `radial-gradient(300px circle at ${glowPosition.x}px ${glowPosition.y}px, rgba(216, 188, 234, 0.15), transparent 40%)`,
                } as React.CSSProperties}
                className="absolute inset-0 pointer-events-none"
              />
              <p className="font-body-md leading-relaxed mb-10 text-on-surface italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.color} p-[2px]`}>
                  <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-on-surface">
                    {testimonial.initials}
                  </div>
                </div>
                <div>
                  <div className="font-body-md font-bold text-on-surface">{testimonial.author}</div>
                  <div className="font-body-md text-on-surface-variant">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
