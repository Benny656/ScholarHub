import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function WordmarkFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Subtle horizontal drift as page scrolls
  const x = useTransform(scrollYProgress, [0, 1], ['2vw', '-2vw']);

  return (
    <div ref={ref} className="wordmark-footer-wrap">
      <motion.div style={{ x }} className="wordmark-footer-inner">
        <span className="wordmark-text">ScholarHub</span>
      </motion.div>
    </div>
  );
}
