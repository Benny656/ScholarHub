import { useState, useEffect, useRef } from "react";
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
  BarChart2,
  ChevronDown,
  Users,
  Layout,
  Shield,
  Activity,
  AlertCircle,
  Zap,
  Globe
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, animate, useInView } from "framer-motion";
import ParticleLearningSphere from "../../components/landing/ParticleLearningSphere";
import HeroSequenceReveal from "../../components/landing/HeroSequenceReveal";

// --- Count Up Animation Component ---
interface CountUpProps {
  to: number;
  suffix?: string;
  duration?: number;
}

const CountUp = ({ to, suffix = "", duration = 2 }: CountUpProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, to, {
        duration,
        ease: "easeOut",
        onUpdate: (val) => setCount(Math.round(val)),
      });
      return () => controls.stop();
    }
  }, [inView, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// --- List of Partner Institutions for Ticker ---
const institutions = [
  "Karunya Institute of Technology and Sciences",
  "SRM Institute of Science and Technology",
  "Sathyabama Institute of Science and Technology",
  "VIT University",
  "Amrita Vishwa Vidyapeetham",
  "Manipal Academy of Higher Education",
  "PSG College of Technology",
  "Anna University",
  "IIT Madras",
  "IIT Delhi",
  "IIT Bombay",
  "IIT Kanpur",
  "NIT Trichy",
  "BITS Pilani",
  "Delhi University",
  "Jadavpur University",
  "University of Hyderabad",
  "Christ University",
  "Jain University",
  "Lovely Professional University"
];

// --- Pricing Types & Data ---
interface PricingPlan {
  id: "student" | "professional" | "institution";
  name: string;
  price: string;
  priceSuffix?: string;
  tagline: string;
  ctaText: string;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "student",
    name: "Students",
    price: "Free",
    tagline: "Perfect for individual students and lifelong learners.",
    ctaText: "Get Started Free",
    features: [
      "Join Courses",
      "Submit Assignments",
      "Track Attendance",
      "Learning Progress Dashboard",
      "Live Classes",
      "Certificates",
      "AI Tutor (Limited)",
      "AI Quiz Practice (Limited)"
    ]
  },
  {
    id: "professional",
    name: "Professionals",
    price: "₹299",
    priceSuffix: "/mo",
    tagline: "For learners and educators who want advanced AI-powered tools.",
    ctaText: "Start Free Trial",
    popular: true,
    features: [
      "Everything in Free",
      "Unlimited AI Tutor",
      "Unlimited AI Quiz Generation",
      "AI Assignment Feedback",
      "Personalized Learning Paths",
      "Advanced Learning Analytics",
      "Priority Support"
    ]
  },
  {
    id: "institution",
    name: "Institutions",
    price: "Custom",
    tagline: "Built for schools, colleges, academies, and training organizations.",
    ctaText: "Contact Sales",
    features: [
      "Everything in Professional",
      "Teacher Management",
      "Student Management",
      "Admin Dashboard",
      "Institution Analytics",
      "Attendance Insights",
      "Bulk User Management",
      "Custom Branding",
      "Dedicated Support"
    ]
  }
];

// --- Mega Menu Component ---
const MegaMenuDropdown = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors py-2 font-medium">
        {title}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] z-50 cursor-default"
          >
            <div className="bg-surface/95 backdrop-blur-xl border border-outline-variant/40 rounded-3xl shadow-2xl shadow-black/10 p-6 grid grid-cols-2 gap-4 relative overflow-hidden">
               {/* Decorative background glow */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
               
               {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface LandingPageProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onGetStarted: () => void;
}

export default function LandingPage({ theme, toggleTheme, onGetStarted }: LandingPageProps) {
  // Showcase tab state
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

  // Interactive Pricing State
  const [selectedPlanId, setSelectedPlanId] = useState<"student" | "professional" | "institution">("professional");

  // Final CTA States & Logic
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const [ctaMousePos, setCtaMousePos] = useState({ x: 0, y: 0 });
  const [phraseIndex, setPhraseIndex] = useState(0);

  const rotatingPhrases = [
    "Teach Smarter. Learn Faster. Grow Better.",
    "One Platform. Every Classroom.",
    "Built For The Future Of Education."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleCtaMouseMove = (e: React.MouseEvent) => {
    if (!ctaSectionRef.current) return;
    const rect = ctaSectionRef.current.getBoundingClientRect();
    setCtaMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

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
          
          <div className="hidden md:flex items-center gap-8 text-sm">
            <MegaMenuDropdown title="Platform">
              <a href="#platform" className="p-4 rounded-2xl hover:bg-surface-container-low transition-colors group flex items-start gap-4 col-span-2 md:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Core Experience</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">High-fidelity virtual learning environments.</p>
                </div>
              </a>
              <a href="#platform" className="p-4 rounded-2xl hover:bg-surface-container-low transition-colors group flex items-start gap-4 col-span-2 md:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Analytics</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Unified telemetry and performance tracking.</p>
                </div>
              </a>
              <div className="col-span-2 h-px bg-outline-variant/30 my-1" />
              <div className="col-span-2 flex justify-between items-center px-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Learn More</span>
                <a href="#pricing" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  View full feature list <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </MegaMenuDropdown>

            <MegaMenuDropdown title="Roles">
              <a href="#story" className="p-4 rounded-2xl hover:bg-surface-container-low transition-colors group flex items-start gap-4 col-span-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">For Students</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Personalized learning paths, 24/7 AI Tutor, and interactive materials.</p>
                </div>
              </a>
              <a href="#story" className="p-4 rounded-2xl hover:bg-surface-container-low transition-colors group flex items-start gap-4 col-span-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">For Instructors</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Automated grading, instant quiz generation, and administrative ease.</p>
                </div>
              </a>
              <a href="#story" className="p-4 rounded-2xl hover:bg-surface-container-low transition-colors group flex items-start gap-4 col-span-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">For Administrators</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Total ecosystem oversight and security governance.</p>
                </div>
              </a>
            </MegaMenuDropdown>

            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-medium py-2" href="#pricing">Pricing</a>
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

      {/* SECTION 1: TRUST METRICS */}
      <section className="py-12 md:py-20 border-b border-outline-variant/30 relative overflow-hidden bg-bg-surface">
        {/* Subtle decorative background spots to fit ScholarHub aesthetics */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {[
              { to: 10000, suffix: "+", label: "Active Students" },
              { to: 500, suffix: "+", label: "Expert Teachers" },
              { to: 50, suffix: "+", label: "Partner Institutions" },
              { to: 95, suffix: "%", label: "Attendance Accuracy" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ 
                  y: -6, 
                  scale: 1.02,
                  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
                  borderColor: "var(--color-primary-rgba, rgba(109, 93, 252, 0.4))"
                }}
                className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-surface/40 dark:bg-surface-container-lowest/30 backdrop-blur-md border border-outline-variant/30 hover:border-primary/45 transition-all duration-300 flex flex-col justify-center items-center text-center group"
              >
                {/* Spotlight hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <h3 className="font-serif text-3xl md:text-5xl font-black text-on-surface mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                  <CountUp to={stat.to} suffix={stat.suffix} />
                </h3>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-on-surface-variant font-sans">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* INSTITUTIONAL CREDIBILITY TICKER */}
      <section className="py-12 border-b border-outline-variant/20 relative overflow-hidden bg-bg-surface/50">
        <style>{`
          @keyframes ticker {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-ticker {
            animation: ticker 45s linear infinite;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/80 font-sans">
            Empowering students & faculty at leading institutions
          </p>
        </div>

        {/* Ticker Container */}
        <div className="relative w-full overflow-hidden flex items-center py-3">
          {/* Gradient Fades for Premium Look */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-44 bg-gradient-to-r from-bg-surface via-bg-surface/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-44 bg-gradient-to-l from-bg-surface via-bg-surface/80 to-transparent z-10 pointer-events-none" />

          {/* Scrolling Wrapper */}
          <div className="flex animate-ticker gap-5 whitespace-nowrap select-none">
            {/* First Set */}
            {institutions.map((inst, index) => (
              <div
                key={`first-${index}`}
                className="inline-flex items-center px-6 py-3 rounded-full text-xs font-bold tracking-wide bg-surface/50 dark:bg-surface-container-lowest/40 border border-outline-variant/40 backdrop-blur-md hover:border-primary/50 hover:shadow-[0_0_20px_rgba(109,93,252,0.22)] transition-all duration-300 text-on-surface hover:text-primary cursor-default"
              >
                {inst}
              </div>
            ))}
            {/* Duplicate Second Set for Seamless Looping */}
            {institutions.map((inst, index) => (
              <div
                key={`second-${index}`}
                className="inline-flex items-center px-6 py-3 rounded-full text-xs font-bold tracking-wide bg-surface/50 dark:bg-surface-container-lowest/40 border border-outline-variant/40 backdrop-blur-md hover:border-primary/50 hover:shadow-[0_0_20px_rgba(109,93,252,0.22)] transition-all duration-300 text-on-surface hover:text-primary cursor-default"
              >
                {inst}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORYTELLING: PROBLEM -> SOLUTION */}
      <section className="py-24 relative overflow-hidden bg-surface-container-lowest" id="storytelling">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* The Problem */}
          <div className="mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <span className="text-[10px] font-mono tracking-wider text-red-500 font-bold uppercase py-1 px-3.5 bg-red-500/10 rounded-full">The Problem</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-on-surface">
                Education is fragmented.
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Institutions struggle with disconnected tools. Students juggle multiple platforms for lectures, assignments, and communication. Teachers drown in administrative overhead instead of teaching.
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: AlertCircle, title: "Tool Fatigue", desc: "Switching between video apps, LMS, and messaging platforms causes cognitive overload and lost productivity." },
                { icon: Zap, title: "Administrative Burden", desc: "Educators spend up to 40% of their time on repetitive tasks like grading, scheduling, and attendance tracking." },
                { icon: Activity, title: "Lack of Insights", desc: "Data is siloed. Deans and administrators have no unified view of student engagement or system health." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 text-center space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* The Solution */}
          <div className="relative">
             {/* Connection line */}
             <div className="absolute left-1/2 -top-32 bottom-0 w-px bg-gradient-to-b from-red-500/20 via-primary/50 to-primary/20 -translate-x-1/2 hidden md:block" />
             
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center space-y-6 relative z-10 py-8"
            >
              <span className="text-[10px] font-mono tracking-wider text-primary font-bold uppercase py-1 px-3.5 bg-primary/10 rounded-full inline-block backdrop-blur-sm shadow-sm">The Solution</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-on-surface">
                A unified ecosystem.
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                ScholarHub consolidates the entire educational lifecycle into one intelligent, high-performance platform. Empowering students, liberating educators, and providing unprecedented clarity for institutions.
              </p>
            </motion.div>
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
      <section className="py-24 bg-surface-container-lowest/30 dark:bg-bg-surface text-on-surface relative overflow-hidden border-t border-b border-outline-variant/10 transition-colors duration-300" id="pricing">
        {/* Subtle background blur nodes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-2">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-on-surface tracking-tight">Scale Academic Excellence</h2>
            <p className="text-on-surface-variant/80 text-sm">Flexible licensing plans built for prep schools to global universities.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Left-Hand Interactive Hub (The Menu Stack) */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center lg:self-center w-full">
              <div className="w-full max-w-md lg:w-64 flex flex-row lg:flex-col items-center justify-center gap-1.5 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/20 relative z-20 overflow-x-auto lg:overflow-x-visible no-scrollbar">
                {pricingPlans.map((plan) => {
                  const isActive = plan.id === selectedPlanId;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative w-full text-center lg:text-left px-5 py-3 lg:py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 select-none shrink-0 flex-1 lg:flex-none ${
                        isActive 
                          ? "text-on-surface font-extrabold" 
                          : "text-on-surface-variant/70 hover:text-on-surface font-medium"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePricingPill"
                          className="absolute inset-0 bg-surface border border-outline-variant/30 shadow-sm rounded-xl z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{plan.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right-Hand Display Panel (The Content Window) */}
            <motion.div 
              layout
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:col-span-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-outline-variant/20 pt-8 lg:pt-0 pl-0 lg:pl-12 w-full"
            >
              {/* Header inside Panel */}
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-primary">
                  {pricingPlans.find(p => p.id === selectedPlanId)?.name} Plan
                </h4>
                {pricingPlans.find(p => p.id === selectedPlanId)?.popular && (
                  <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md shadow-primary/20">
                    ✦ Most Popular
                  </span>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPlanId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex-1 flex flex-col justify-between"
                >
                  {/* Content Top */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-baseline gap-1.5 text-5xl md:text-6xl font-serif font-black text-on-surface">
                        {pricingPlans.find(p => p.id === selectedPlanId)?.price}
                        {pricingPlans.find(p => p.id === selectedPlanId)?.priceSuffix && (
                          <span className="text-sm font-sans font-normal text-on-surface-variant">
                            {pricingPlans.find(p => p.id === selectedPlanId)?.priceSuffix}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mt-2 max-w-xl">
                        {pricingPlans.find(p => p.id === selectedPlanId)?.tagline}
                      </p>
                    </div>

                    {/* Animated Staggered Feature Checklist */}
                    <motion.ul 
                      variants={{
                        animate: {
                          transition: {
                            staggerChildren: 0.04
                          }
                        }
                      }}
                      initial="initial"
                      animate="animate"
                      className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs font-semibold text-on-surface/90 border-t border-outline-variant/20 pt-6"
                    >
                      {pricingPlans.find(p => p.id === selectedPlanId)?.features.map((feature, idx) => (
                        <motion.li 
                          key={idx}
                          variants={{
                            initial: { opacity: 0, x: -12 },
                            animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } }
                          }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>

                  {/* Content Bottom CTA Button */}
                  <div className="mt-8 pt-4 border-t border-outline-variant/20">
                    <button 
                      onClick={onGetStarted}
                      className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                        pricingPlans.find(p => p.id === selectedPlanId)?.popular 
                          ? "bg-primary text-on-primary hover:bg-primary-container shadow-lg shadow-primary/25 hover:scale-[1.01]" 
                          : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30 hover:scale-[1.01]"
                      }`}
                    >
                      {pricingPlans.find(p => p.id === selectedPlanId)?.ctaText}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Trust Message */}
          <p className="text-center font-body-md text-on-surface-variant/60 text-sm mt-16 max-w-2xl mx-auto">
            Trusted by students, educators, and institutions building the future of learning.
          </p>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section 
        ref={ctaSectionRef}
        onMouseMove={handleCtaMouseMove}
        className="py-32 bg-surface-container-lowest/20 dark:bg-bg-surface text-on-surface relative overflow-hidden border-b border-outline-variant/10 transition-colors duration-300"
      >
        {/* Low-opacity Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Pulsing Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />

        {/* Soft Spotlight Following Cursor */}
        <motion.div
          className="absolute pointer-events-none rounded-full blur-[100px] bg-primary/10 dark:bg-primary/15 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 hidden md:block"
          style={{
            left: ctaMousePos.x,
            top: ctaMousePos.y
          }}
        />

        {/* Floating Educational Elements */}
        {[
          { Icon: BookOpen, top: "15%", left: "12%", delay: 0 },
          { Icon: GraduationCap, top: "68%", left: "15%", delay: 1.5 },
          { Icon: Sparkles, top: "20%", right: "12%", delay: 0.8 },
          { Icon: BarChart2, top: "65%", right: "12%", delay: 2.2 }
        ].map(({ Icon, top, left, right, delay }, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/10 dark:text-primary/20 hidden md:block pointer-events-none"
            style={{ top, left, right }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay
            }}
          >
            <Icon className="w-10 h-10" />
          </motion.div>
        ))}

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-10">
          
          {/* Rotating Headline */}
          <div className="h-24 md:h-32 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2
                key={phraseIndex}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-on-surface leading-tight tracking-tight"
              >
                {rotatingPhrases[phraseIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
          >
            ScholarHub unifies virtual classrooms, assignments, attendance, AI learning tools, analytics, and institutional management into one seamless platform.
          </motion.p>

          {/* Staggered CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-98"
            >
              Get Started Free
            </button>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-outline-variant/60 hover:bg-surface-container-high text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-98 text-on-surface"
            >
              Schedule Demo
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 pt-10 border-t border-outline-variant/20 max-w-3xl mx-auto text-xs font-bold text-on-surface-variant"
          >
            {[
              "No Credit Card Required",
              "Free Student Access",
              "Institution Ready",
              "AI-Powered Learning"
            ].map((indicator, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{indicator}</span>
              </div>
            ))}
          </motion.div>

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
