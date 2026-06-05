import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useAnimations';

const stats = [
  { value: 10, unit: 'k+', label: 'Active Students', color: 'primary' },
  { value: 500, unit: '+', label: 'Institutions', color: 'secondary' },
  { value: 99, unit: '%', label: 'Satisfaction', color: 'tertiary' },
  { value: 50, unit: 'M+', label: 'AI Interactions', color: 'primary' },
];

export function StatsSection() {
  useCountUp(10);

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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 border-y glass border-outline-variant/20 bg-surface-container-lowest/50 reveal">
      <motion.div
        className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="text-center space-y-2 reveal stagger-1">
            <div className={`font-headline-lg text-4xl md:text-6xl text-${stat.color}`}>
              <span className="counter" data-target={stat.value}>
                0
              </span>
              {stat.unit}
            </div>
            <div className="font-label-md uppercase tracking-[0.2em] text-on-surface-variant">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
