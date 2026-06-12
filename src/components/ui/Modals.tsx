import React, { useState } from "react";
import { 
  X, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Send, 
  ScreenShare, 
  Users, 
  Settings, 
  PhoneOff,
  GraduationCap
} from "lucide-react";
import { Course } from "../../lib/mockData";
import { motion, AnimatePresence } from "framer-motion";

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export function ClassroomModal({ isOpen, onClose, course }: ClassroomModalProps) {
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [messages, setMessages] = useState<string[]>([
    "Welcome to the high-fidelity live classroom stream!",
    "Prof: Please open your worksheets to Chapter 4 core models.",
    "Student: I am reviewing the eigenvalues formula."
  ]);
  const [chatInput, setChatInput] = useState("");

  if (!isOpen || !course) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, `Me: ${chatInput}`]);
    setChatInput("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[550px] shadow-2xl"
        >
          
          {/* Main stream visualization body (2/3 size) */}
          <div className="flex-1 p-6 flex flex-col justify-between relative bg-neutral-950">
            
            {/* Top Indicator info */}
            <div className="flex items-center justify-between z-10">
              <span className="flex items-center gap-1.5 bg-red-650 h-7 px-3 bg-red-600 rounded-full text-[10px] uppercase font-bold tracking-widest text-white shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Live Classroom
              </span>
              <div className="text-right">
                <h4 className="font-serif font-bold text-sm leading-tight text-neutral-50">{course.title}</h4>
                <p className="text-[10px] text-neutral-400 font-mono">{course.code} • {course.instructor}</p>
              </div>
            </div>

            {/* Video center screen */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              {cameraActive ? (
                <div className="text-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-brand-primary/10 border border-brand-primary/40 flex items-center justify-center mx-auto text-brand-primary">
                    <GraduationCap className="w-12 h-12" />
                  </div>
                  <span className="text-xs text-neutral-500 font-mono tracking-wider">[ 1080p Stream Connected ]</span>
                </div>
              ) : (
                <div className="text-center text-neutral-600 space-y-1.5">
                  <VideoOff className="w-10 h-10 mx-auto" />
                  <p className="text-xs">Camera Feed Terminated</p>
                </div>
              )}
            </div>

            {/* Subtitle Telemetry Overlay */}
            <div className="bg-black/60 backdrop-blur border border-white/5 p-4 rounded-xl max-w-lg mx-auto z-10 mb-4 text-center">
              <p className="text-xs text-brand-tertiary-light font-mono leading-relaxed">
                Prof: &quot;Let us review backpropagation algorithms. Observe how weight transformations offset localized loss functions...&quot;
              </p>
            </div>

            {/* Bottom Stream Action controllers */}
            <div className="flex justify-between items-center z-130 pt-4 border-t border-white/5 z-10">
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMicActive(!micActive)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    micActive ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-red-950 text-red-400"
                  }`}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    cameraActive ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-red-950 text-red-400"
                  }`}
                >
                  {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              </div>

              {/* End Connection Call button */}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-red-650 hover:bg-red-700 bg-red-600 text-white rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Lecture</span>
              </button>

            </div>

          </div>

          {/* Right sidebar Discussion panel (1/3 size) */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-between h-full">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-serif font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-secondary" />
                  <span>Interactive Chat</span>
                </h5>
                <span className="text-[10px] text-neutral-400 font-mono">14 Active Lecturers</span>
              </div>
              
              <div className="h-[340px] overflow-y-auto space-y-2.5 custom-scrollbar pr-1 text-xs">
                {messages.map((m, id) => (
                  <div key={id} className="p-2.5 bg-neutral-950 rounded-lg text-[11px] leading-relaxed border border-white/5">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Form messaging input block */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-4 border-t border-neutral-800">
              <input
                type="text"
                placeholder="Ask lecture question..."
                className="flex-1 px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-white focus:outline-none"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="p-2.5 bg-brand-primary rounded-lg text-white hover:bg-brand-primary-dark transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
