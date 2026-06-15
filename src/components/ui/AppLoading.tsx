import { motion } from 'framer-motion';

export function AppLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[99999] w-screen h-screen">
      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="relative flex flex-col items-center"
      >
        <img src="/logo.png" alt="Scholar Hub" className="w-20 h-20 md:w-24 md:h-24 object-contain mb-6 drop-shadow-xl" />
        <div className="w-48 h-1 bg-outline-variant/30 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 bottom-0 bg-primary rounded-full"
            initial={{ left: "-50%", width: "50%" }}
            animate={{ left: "100%" }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
        <p className="mt-4 text-sm font-medium tracking-widest text-on-surface-variant/70 uppercase">
          Loading
        </p>
      </motion.div>
    </div>
  );
}
