import { Brain, Twitter, Linkedin, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const footerLinks = {
  Product: ['Features', 'AI Core', 'Integrations', 'Enterprise'],
  Learning: ['Resources', 'Community', 'Docs', 'Academy'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact'],
};

export function Footer() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="py-20 px-6 border-t glass border-outline-variant/20 bg-surface-container-lowest reveal">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
        <motion.div className="col-span-2 space-y-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-2 cursor-pointer" onClick={go}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <Brain className="w-6 h-6" />
            </div>
            <span className="font-headline-md font-bold tracking-tight text-on-surface">ScholarHub</span>
          </motion.div>
          <motion.p variants={itemVariants} className="font-body-md text-on-surface-variant max-w-xs leading-relaxed">
            Pioneering the next frontier of human potential through artificial intelligence and adaptive pedagogy.
          </motion.p>
          <motion.div variants={itemVariants} className="flex gap-4">
            <button onClick={go} className="w-10 h-10 rounded-full glass flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low ripple-btn">
              <Twitter className="w-5 h-5" />
            </button>
            <button onClick={go} className="w-10 h-10 rounded-full glass flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low ripple-btn">
              <Linkedin className="w-5 h-5" />
            </button>
            <button onClick={go} className="w-10 h-10 rounded-full glass flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low ripple-btn">
              <Github className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>

        {Object.entries(footerLinks).map(([category, links]) => (
          <motion.div key={category} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h5 className="font-body-md font-bold mb-6 text-on-surface">{category}</h5>
            <ul className="space-y-4 font-body-md text-on-surface-variant">
              {links.map((link) => (
                <li key={link}>
                    <button onClick={() => navigate('/login')} className="text-on-surface-variant hover:text-primary transition-colors hover:translate-x-1 inline-block">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="max-w-7xl mx-auto mt-20 pt-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6 font-body-md text-on-surface-variant"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.p variants={itemVariants}>© 2024 ScholarHub Technologies Inc. All rights reserved.</motion.p>
        <motion.div variants={itemVariants} className="flex gap-8">
          <button onClick={go} className="hover:text-on-surface transition-colors">
            System Status
          </button>
          <button onClick={go} className="hover:text-on-surface transition-colors">
            Security
          </button>
        </motion.div>
      </motion.div>
    </footer>
  );
}
