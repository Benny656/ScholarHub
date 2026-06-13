import React, { useState, useEffect } from 'react';
import { Mic, X, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService } from '../../services/advanced-features.service';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceAssistantModal({ isOpen, onClose }: VoiceAssistantModalProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (isOpen) {
      handleStart();
    } else {
      handleStop();
    }
  }, [isOpen]);

  const handleStart = async () => {
    setListening(true);
    setTranscript('Listening...');
    await voiceService.startSession();
    
    // Mock progression
    setTimeout(() => setTranscript('Open assignments...'), 1500);
    setTimeout(async () => {
      setListening(false);
      setTranscript('Processing...');
      const result = await voiceService.processCommand(new Blob());
      setTranscript(`Navigating to ${result.target}...`);
      setTimeout(onClose, 1000);
    }, 3000);
  };

  const handleStop = async () => {
    setListening(false);
    await voiceService.stopSession();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              <X size={20} />
            </button>
            
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                {listening && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-brand-primary rounded-full blur-xl"
                  />
                )}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${listening ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/40' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                  {listening ? <Waves size={32} /> : <Mic size={32} />}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">Voice Assistant</h3>
              <p className="text-sm text-brand-primary font-medium h-6">{transcript}</p>
              
              {!listening && transcript === '' && (
                <div className="mt-6 space-y-2 w-full text-left">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center mb-3">Try saying</p>
                  {['"Open my assignments"', '"Join my next class"', '"Generate a practice quiz"'].map((cmd, i) => (
                    <div key={i} className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 text-center border border-neutral-100 dark:border-neutral-800">
                      {cmd}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
