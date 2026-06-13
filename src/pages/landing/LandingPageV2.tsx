import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Moon, 
  Sun, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  Check,
  Video,
  Sparkles,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import ParticleLearningSphere from "../../components/landing/ParticleLearningSphere";
import HeroSequenceReveal from "../../components/landing/HeroSequenceReveal";

interface LandingPageProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onGetStarted: () => void;
}

export default function LandingPage({ theme, toggleTheme, onGetStarted }: LandingPageProps) {
  // Showcase tab state
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

  // Smooth reveal logic
  const [windowHeight, setWindowHeight] = useState(800);
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollY } = useScroll();
  const sequenceHeight = windowHeight * 3.5;
  const contentOpacity = useTransform(scrollY, [sequenceHeight, sequenceHeight + windowHeight * 0.5], [0, 1]);

  return (
    <div className="bg-bg-surface text-on-surface font-sans min-h-screen transition-colors duration-300">
      
      <HeroSequenceReveal />

      {/* NAVIGATION BAR */}
      <nav 
        id="landing-navbar" 
        className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant"
      >
        <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="font-serif text-2xl font-black text-on-surface flex items-center gap-2.5 active:scale-95 transition-all group"
          >
            <div className="h-9 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img 
                src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} 
                alt="Scholar Hub Logo" 
                className="h-9 w-auto object-contain"
              />
            </div>
            <span className="group-hover:text-primary transition-colors duration-200">Scholar Hub</span>
          </button>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#platform">Platform</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#story">Roles</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#pricing">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-90" 
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container text-sm font-bold shadow-md shadow-primary/10 transition hover:scale-[1.03] active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <motion.div style={{ opacity: contentOpacity }}>
        {/* HERO SECTION */}
      <section className="pt-40 pb-24 border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary-container/10 dark:bg-primary/20 px-3.5 py-1.5 rounded-full">
                Welcome to ScholarHub Virtual
              </span>
              <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-[1.1] font-bold text-on-surface">
                One Platform For <br/>
                <span className="text-primary hover:opacity-90 transition-opacity">Modern Classrooms</span>
              </h1>
              <p className="text-xl text-on-surface-variant mb-12 max-w-xl leading-relaxed">
                A unified virtual learning environment built for precision. Experience educational excellence at scale.
              </p>
              <div className="flex flex-wrap gap-5">
                <button 
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-lg font-bold shadow-lg shadow-primary/15 transition hover:scale-[1.03] active:scale-97"
                >
                  Start for Free
                </button>
                <button 
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-xl border border-outline hover:bg-surface-container-low text-lg font-bold transition-all hover:scale-[1.03] active:scale-97"
                >
                  Schedule Demo
                </button>
              </div>
            </div>
            
            {/* Interactive 3D Particle Learning Sphere */}
            <div className="w-full flex items-center justify-center" style={{ minHeight: '480px' }}>
              <ParticleLearningSphere
                particleCount={1500}
                className="h-[480px] w-full cursor-grab active:cursor-grabbing"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ROLE-BASED NARRATIVE */}
      <section className="py-24" id="story">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Student Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-36">
            <div className="space-y-6">
              <span className="text-[10px] font-mono tracking-wider text-primary font-bold uppercase py-1 px-3.5 bg-primary/5 rounded-full">For Students</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-on-surface">
                Personalized learning paths that never stop.
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                ScholarHub provides students with a high-fidelity experience, bringing assignments, grades, and an always-on assistant to their fingertips.
              </p>
              <ul className="space-y-4 pt-2">
                <li className="flex items-center gap-3 font-semibold text-sm">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>Instant help with 24/7 AI Tutor</span>
                </li>
                <li className="flex items-center gap-3 font-semibold text-sm">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>Interactive study materials and custom tests</span>
                </li>
              </ul>
            </div>
            
            {/* Student App Mock */}
            <div className="bg-surface-container-high border border-outline-variant/30 rounded-3xl p-6 shadow-lg min-h-[300px] flex flex-col justify-between">
              <div className="flex items-center justify-between pointer-events-none">
                <strong className="text-sm font-serif">ScholarHub Chat Assistant</strong>
                <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">24/7 Online Tutor</span>
              </div>
              <div className="space-y-3 my-6 flex-1 flex flex-col justify-end">
                <div className="max-w-[80%] self-end bg-primary text-on-primary rounded-2xl rounded-tr-none p-3 text-xs leading-normal">
                  Hi AI, and can you assist me with explaining Euler&apos;s formula in mathematical terms?
                </div>
                <div className="max-w-[85%] self-start bg-surface-container-lowest border border-outline-variant/10 rounded-2xl rounded-tl-none p-3.5 text-xs text-on-surface-variant space-y-2 shadow-sm">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini Core</span>
                  </div>
                  <p className="leading-relaxed">
                    Yes! Euler&apos;s formula asserts that for any real number <code className="font-mono bg-surface p-0.5 rounded">x</code>:
                  </p>
                  <p className="font-mono bg-surface p-2 rounded text-center text-[10px] text-on-surface">
                    e^(ix) = cos(x) + i * sin(x)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" disabled placeholder="Ask anything..." className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 text-xs" />
                <button disabled className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Ask</button>
              </div>
            </div>
          </div>

          {/* Teacher Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="lg:order-2 space-y-6">
              <span className="text-[10px] font-mono tracking-wider text-primary font-bold uppercase py-1 px-3.5 bg-primary/5 rounded-full">For Instructors</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-on-surface">
                Reclaiming time for what matters.
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Automate the administrative drudgery. Generate quizzes from documents in seconds and track real-time attendance.
              </p>
              
              <div className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary space-y-3 shadow-sm">
                <p className="italic text-on-surface-variant leading-relaxed">
                  &ldquo;ScholarHub reduced my weekly grading time by 60%, allowing me to focus on real direct mentoring events.&rdquo;
                </p>
                <div className="font-bold text-sm text-on-surface">— Prof. Sarah Chen</div>
              </div>
            </div>
            
            {/* Teacher Dashboard Mock */}
            <div className="lg:order-1 bg-surface-container-high border border-outline-variant/30 rounded-3xl p-6 shadow-lg min-h-[300px] flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm">Automated Quizzes Builder</h4>
                <p className="text-[11px] text-on-surface-variant">Extract quiz parameters instantly</p>
              </div>
              
              <div className="bg-surface-container-lowest rounded-2xl p-4.5 border border-outline-variant/20 space-y-3.5 my-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant">Source syllabus doc</span>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Attached: electromagnetism.pdf</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold">Draft Question generated by Gemini:</p>
                  <p className="text-xs text-on-surface-variant italic bg-surface-container-low p-2.5 rounded border border-outline-variant/10">
                    &ldquo;Evaluate the magnetic flux density inside a solenoid composed of 300 turns...&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button disabled className="flex-1 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold">Regenerate</button>
                <button disabled className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold">Deploy to Students</button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="py-24 bg-surface-container-low" id="platform">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-on-surface">Experience the Platform</h2>
            <p className="text-on-surface-variant text-base">Core interfaces designed specifically for academic success.</p>
          </div>

          {/* Tab buttons switcher */}
          <div className="flex flex-wrap justify-center gap-3.5 mb-10">
            <button 
              onClick={() => setActiveTab("tab1")}
              className={`tab-btn px-6 py-3 rounded-full text-sm font-bold border transition-all duration-200 active:scale-95 ${
                activeTab === "tab1" 
                  ? "border-primary bg-primary text-on-primary shadow-md shadow-primary/10" 
                  : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Student View
            </button>
            <button 
              onClick={() => setActiveTab("tab2")}
              className={`tab-btn px-6 py-3 rounded-full text-sm font-bold border transition-all duration-200 active:scale-95 ${
                activeTab === "tab2" 
                  ? "border-primary bg-primary text-on-primary shadow-md shadow-primary/10" 
                  : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Teacher View
            </button>
            <button 
              onClick={() => setActiveTab("tab3")}
              className={`tab-btn px-6 py-3 rounded-full text-sm font-bold border transition-all duration-200 active:scale-95 ${
                activeTab === "tab3" 
                  ? "border-primary bg-primary text-on-primary shadow-md shadow-primary/10" 
                  : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Interactive display area with AnimatePresence */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden shadow-xl aspect-[16/10] md:max-h-[550px] relative">
            <AnimatePresence mode="wait">
              {activeTab === "tab1" && (
                <motion.div
                  key="tab1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="font-serif font-bold text-sm">ScholarHub Student Dashboard interface</span>
                    </div>
                    <span className="text-[10px] font-mono">Academic Progress: 75% Completed</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <p className="text-xl font-serif font-bold text-on-surface">Interactive Course Curriculum</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Students access homework, synchronous digital lecture halls, transcripts, and AI quiz portals with feedback loop.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                          <Check className="w-4 h-4 text-emerald-500 font-black" />
                          <span className="text-xs font-semibold">Join Stream option on active live modules</span>
                        </div>
                        <div className="flex items-center gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                          <Check className="w-4 h-4 text-emerald-500 font-black" />
                          <span className="text-xs font-semibold">Automatic class transcription and summaries</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-on-surface">Recent Lecture Recording</span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-black uppercase">REPLAY</span>
                      </div>
                      <div className="h-32 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant/10 text-on-surface-variant text-xs flex-col gap-2 relative">
                        <Video className="w-8 h-8 text-on-surface-variant" />
                        <span>CS 101: Big Data Foundations</span>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white p-1 rounded text-[9px] text-center font-mono">
                          Duration: 1 hr 20 min
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/10 flex justify-end">
                    <button onClick={onGetStarted} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                      <span>Explore Student View demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "tab2" && (
                <motion.div
                  key="tab2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <span className="font-serif font-bold text-sm">ScholarHub Teacher Syllabus console</span>
                    </div>
                    <span className="text-[10px] font-mono">Grading Queue: 4 pending rubrics</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <p className="text-xl font-serif font-bold text-on-surface">Educator Resource Controls</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Simplify course coordination. Teachers can evaluate and grade essay assignments with AI rubric checkers, build assessments, and launch virtual classrooms.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold">Gemini structural essay evaluations</span>
                        </div>
                        <div className="flex items-center gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold">Flexible course addition panel controls</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 space-y-3">
                      <strong className="text-xs font-bold block mb-1 text-on-surface">Syllabus Evaluation Meter</strong>
                      <div className="space-y-2">
                        <div className="p-2 bg-surface-container-lowest border border-outline-variant/10 rounded flex justify-between text-[11px]">
                          <span>Weekly Syllabus Match</span>
                          <span className="font-bold text-emerald-600">98% Verified</span>
                        </div>
                        <div className="p-2 bg-surface-container-lowest border border-outline-variant/10 rounded flex justify-between text-[11px]">
                          <span>Active Student engagement</span>
                          <span className="font-bold text-primary">Very high (89%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/10 flex justify-end">
                    <button onClick={onGetStarted} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                      <span>Explore Syllabus Console demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "tab3" && (
                <motion.div
                  key="tab3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-primary" />
                      <span className="font-serif font-bold text-sm">Supervisor Governance analytics cockpit</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600">All Nodes Secure</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <p className="text-xl font-serif font-bold text-on-surface">Unified Telemetry Tracking</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Ensure optimal digital workspace security, monitor user counts, track activity curves, and check server-side logs on one visual grid.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold">Audited system telemetry and logs</span>
                        </div>
                        <div className="flex items-center gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold">User registries with custom security parameters</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">System Load Meter</span>
                        <span className="text-primary font-bold">Optimal</span>
                      </div>
                      
                      {/* Simple visual SVG charts sketch */}
                      <div className="h-20 flex gap-1.5 items-end justify-between bg-surface-container-lowest p-3 border border-outline-variant/10 rounded-lg">
                        <span className="w-full bg-primary/25 h-[30%] rounded" />
                        <span className="w-full bg-primary/40 h-[45%] rounded" />
                        <span className="w-full bg-primary/60 h-[70%] rounded" />
                        <span className="w-full bg-primary h-[90%] rounded animate-pulse" />
                        <span className="w-full bg-primary/50 h-[50%] rounded" />
                        <span className="w-full bg-primary/70 h-[75%] rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/10 flex justify-end">
                    <button onClick={onGetStarted} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                      <span>Explore Dean admin cockpit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-on-surface">Scale Academic Excellence</h2>
            <p className="text-on-surface-variant text-sm">Flexible licensing plans built for prep schools to global universities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Student Card */}
            <div className="p-10 border border-outline-variant/40 bg-surface-container-lowest rounded-3xl flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold">Student</h3>
                <div className="text-4xl font-serif font-black text-on-surface">
                  Free
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Perfect for individual students and lifelong learners.
                </p>
                <ul className="space-y-4 text-xs text-on-surface-variant border-t border-outline-variant/15 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Join Courses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Submit Assignments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Track Attendance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Learning Progress Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Live Classes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Certificates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>AI Tutor (Limited)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>AI Quiz Practice (Limited)</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-3.5 mt-8 rounded-xl border border-outline hover:bg-surface-container-high text-xs font-bold transition-all text-center"
              >
                Get Started Free
              </button>
            </div>

            {/* Professional Card (Featured / Most Popular) */}
            <div className="p-10 border-2 border-primary bg-surface-container-high rounded-3xl flex flex-col justify-between relative shadow-xl shadow-primary/20 md:scale-[1.03] hover:scale-[1.04] transition-all duration-300 z-10">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md shadow-primary/25 whitespace-nowrap">
                ✦ Most Popular
              </span>
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold">Professional</h3>
                <div className="text-4xl font-serif font-black text-primary flex items-baseline gap-1">
                  ₹299
                  <span className="text-sm font-sans font-normal text-on-surface-variant">/mo</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  For learners and educators who want advanced AI-powered tools.
                </p>
                <ul className="space-y-4 text-xs border-t border-outline-variant/15 pt-6 text-on-surface">
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Unlimited AI Tutor</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Unlimited AI Quiz Generation</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>AI Assignment Feedback</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Personalized Learning Paths</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Advanced Learning Analytics</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-3.5 mt-8 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold shadow-md shadow-primary/10 transition-all text-center animate-pulse"
              >
                Start Free Trial
              </button>
            </div>

            {/* Institution Card */}
            <div className="p-10 border border-outline-variant/40 bg-surface-container-lowest rounded-3xl flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold">Institution</h3>
                <div className="text-4xl font-serif font-black text-on-surface">
                  Custom
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Built for schools, colleges, academies, and training organizations.
                </p>
                <ul className="space-y-4 text-xs text-on-surface-variant border-t border-outline-variant/15 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Everything in Professional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Teacher Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Student Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Admin Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Institution Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Attendance Insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Bulk User Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Custom Branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Dedicated Support</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-3.5 mt-8 rounded-xl border border-outline hover:bg-surface-container-high text-xs font-bold transition-all text-center"
              >
                Contact Sales
              </button>
            </div>

          </div>

          {/* Trust Message */}
          <p className="text-center font-body-md text-on-surface-variant text-sm mt-16 max-w-2xl mx-auto opacity-80">
            Trusted by students, educators, and institutions building the future of learning.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-28 pb-12 bg-surface-container-lowest border-t border-outline-variant/40 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 relative z-10 text-on-surface">
          <div className="space-y-6">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-serif text-2xl font-black text-on-surface flex items-center gap-2.5 active:scale-95 transition-all group text-left"
            >
              <div className="h-8 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} 
                  alt="Scholar Hub Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="group-hover:text-primary transition-colors duration-200">Scholar Hub</span>
            </button>
            <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
              Building the next generation of high-fidelity virtual learning environments for global education.
            </p>
          </div>
          
          <div className="flex gap-16 md:justify-end text-sm">
            <div className="space-y-4">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-on-surface">Product</h4>
              <nav className="flex flex-col gap-2.5">
                <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#platform">Platform</a>
                <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#pricing">Pricing</a>
              </nav>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-on-surface">Company</h4>
              <nav className="flex flex-col gap-2.5">
                <button onClick={onGetStarted} className="text-on-surface-variant hover:text-on-surface text-left transition-colors">About Us</button>
                <button onClick={onGetStarted} className="text-on-surface-variant hover:text-on-surface text-left transition-colors">Contact</button>
              </nav>
            </div>
          </div>
        </div>

        {/* Large Decorative Text Watermark with hover & lighting effects */}
        <div className="font-serif text-[11vw] font-extrabold text-black dark:text-white select-none leading-none mt-20 text-center tracking-wider uppercase cursor-default transition-all duration-700 hover:scale-105 hover:tracking-widest drop-shadow-[0_5px_15px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_5px_25px_rgba(255,255,255,0.2)] hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-transparent hover:bg-clip-text">
          Scholar Hub
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-outline-variant/20 text-center">
          <p className="text-[11px] text-on-surface-variant/60 uppercase tracking-widest">
            © 2026 Scholar Hub. Academic Excellence.
          </p>
        </div>
      </footer>
      </motion.div>

    </div>
  );
}
