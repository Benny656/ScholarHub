import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface ExperienceShowcaseProps {
  activeTab: "tab1" | "tab2" | "tab3";
  setActiveTab: (tab: "tab1" | "tab2" | "tab3") => void;
  onGetStarted: () => void;
}

const roles = [
  { 
    id: "tab1", 
    label: "Student", 
    src: "/Student.mp4", 
    title: "Your Academic Command Center", 
    subtitle: "A unified workspace designed to streamline assignments, live lectures, and tracking progress." 
  },
  { 
    id: "tab2", 
    label: "Teacher", 
    src: "/Teacher.mp4", 
    title: "Teach, Manage, and Scale", 
    subtitle: "Automate grading, curate rich courses, and keep students engaged in real-time." 
  },
  { 
    id: "tab3", 
    label: "Admin", 
    src: "/Admin.mp4", 
    title: "Institution-Wide Intelligence", 
    subtitle: "Total visibility into performance metrics, security compliance, and user registries." 
  }
];

const HeadingReveal = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <span>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-2 md:mr-3 last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", filter: "blur(3px)" }}
            whileInView={{ y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export default function ExperienceShowcase({ activeTab, setActiveTab, onGetStarted }: ExperienceShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Parallax tilt states
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Refs for each video element
  const studentVideoRef = useRef<HTMLVideoElement>(null);
  const teacherVideoRef = useRef<HTMLVideoElement>(null);
  const adminVideoRef = useRef<HTMLVideoElement>(null);

  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getActiveVideo = () => {
    if (activeTab === "tab1") return studentVideoRef.current;
    if (activeTab === "tab2") return teacherVideoRef.current;
    if (activeTab === "tab3") return adminVideoRef.current;
    return null;
  };

  // Sync play/pause state and pause inactive videos
  useEffect(() => {
    const activeVideo = getActiveVideo();
    if (!activeVideo) return;

    // Ensure all other videos are paused
    if (studentVideoRef.current && activeTab !== "tab1") {
      studentVideoRef.current.pause();
    }
    if (teacherVideoRef.current && activeTab !== "tab2") {
      teacherVideoRef.current.pause();
    }
    if (adminVideoRef.current && activeTab !== "tab3") {
      adminVideoRef.current.pause();
    }

    if (isPlaying) {
      activeVideo.play().catch((err) => console.warn("Play error:", err));
    } else {
      activeVideo.pause();
    }
  }, [activeTab, isPlaying]);

  // Track active video progress smoothly at 60fps
  useEffect(() => {
    let animId: number;
    const checkProgress = () => {
      const activeVideo = getActiveVideo();
      if (activeVideo && !activeVideo.paused) {
        const pct = (activeVideo.currentTime / activeVideo.duration) * 100;
        setProgress(isNaN(pct) ? 0 : pct);
      }
      animId = requestAnimationFrame(checkProgress);
    };
    animId = requestAnimationFrame(checkProgress);
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const handleTabClick = (tabId: "tab1" | "tab2" | "tab3") => {
    setActiveTab(tabId);
    setProgress(0);
    setIsAutoRotating(false);

    // Reset autoplay timer/rotation after 10s of inactivity
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoRotating(true);
    }, 10000);
  };

  const handleEnded = () => {
    if (isAutoRotating) {
      // Rotate automatically: Student -> Teacher -> Admin -> Student
      if (activeTab === "tab1") setActiveTab("tab2");
      else if (activeTab === "tab2") setActiveTab("tab3");
      else if (activeTab === "tab3") setActiveTab("tab1");
      setProgress(0);
    } else {
      // In manual mode, loop the current active video
      const activeVideo = getActiveVideo();
      if (activeVideo) {
        activeVideo.currentTime = 0;
        activeVideo.play().catch((err) => console.warn(err));
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Parallax handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Maximum tilt of 1.5 degrees
    setRotateX(-y / (box.height / 6));
    setRotateY(x / (box.width / 6));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const activeRoleData = roles.find((r) => r.id === activeTab) || roles[0];

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Reveal motion variants (Fade Up, Blur, Slight Scale In)
  const sectionVariants = {
    hidden: { opacity: 0, y: 50, filter: "blur(12px)", scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)", 
      scale: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <motion.section 
      className="py-32 bg-surface-container-low/20 relative overflow-hidden" 
      id="platform"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      variants={sectionVariants}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center">
        
        {/* Segmented Control Navigation */}
        <div className="flex items-center gap-6 md:gap-8 border-b border-outline-variant/15 relative pb-px justify-center mb-10 w-full max-w-lg">
          {roles.map((role) => {
            const isActive = activeTab === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleTabClick(role.id as any)}
                className={`relative py-3.5 px-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none cursor-pointer ${
                  isActive 
                    ? "text-primary dark:text-white" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {/* Soft background highlight */}
                {isActive && (
                  <motion.div
                    layoutId="active-highlight"
                    className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                {/* Smooth Underline */}
                {isActive && (
                  <motion.div
                    layoutId="active-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Titles and Subtitles */}
        <div className="relative min-h-[130px] md:min-h-[110px] w-full flex items-center justify-center text-center mb-14 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)", scale: 0.98 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)", scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute px-4"
            >
              <h3 className="text-3xl md:text-5xl font-serif font-black text-on-surface mb-3 tracking-tight">
                {activeRoleData.title}
              </h3>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                {activeRoleData.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cinematic Video Container */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ rotateX, rotateY }}
          whileHover={{ 
            y: -6, 
            boxShadow: "0 40px 80px -15px rgba(109, 93, 252, 0.22)" 
          }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="relative aspect-[16/9] w-full max-w-[1400px] overflow-hidden rounded-2xl bg-black/90 cursor-pointer border border-outline-variant/10 shadow-2xl"
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          onClick={togglePlay}
        >
          {/* Video Crossfader Layer */}
          <div className="absolute inset-0 w-full h-full">
            {/* Student Video */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: activeTab === "tab1" ? 1 : 0, 
                scale: activeTab === "tab1" ? 1 : 0.98
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <video
                ref={studentVideoRef}
                src="/Student.mp4"
                muted
                playsInline
                onEnded={handleEnded}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Teacher Video */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: activeTab === "tab2" ? 1 : 0, 
                scale: activeTab === "tab2" ? 1 : 0.98
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <video
                ref={teacherVideoRef}
                src="/Teacher.mp4"
                muted
                playsInline
                onEnded={handleEnded}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Admin Video */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: activeTab === "tab3" ? 1 : 0, 
                scale: activeTab === "tab3" ? 1 : 0.98
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <video
                ref={adminVideoRef}
                src="/Admin.mp4"
                muted
                playsInline
                onEnded={handleEnded}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Floating Minimal Glass Controls */}
          <motion.div
            className="absolute bottom-6 right-6 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 shadow-xl cursor-pointer text-black dark:text-white z-20"
            whileHover={{ 
              scale: 1.08, 
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.35)",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 48 48">
              {/* Background Ring */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="currentColor"
                strokeWidth="2.5"
                fill="transparent"
                className="opacity-25"
              />
              {/* Progress Ring */}
              <motion.circle
                cx="24"
                cy="24"
                r={radius}
                stroke="var(--color-primary, #6D5DFC)"
                strokeWidth="2.5"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Pause className="w-4 h-4 fill-current" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="ml-0.5" // visually center play icon
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
