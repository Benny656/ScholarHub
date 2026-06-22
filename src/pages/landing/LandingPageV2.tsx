import { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, 
  Moon, 
  Sun, 
  ArrowRight,
  BookOpen,
  Check,
  Sparkles,
  BarChart2,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, animate, useInView } from "framer-motion";
import ParticleLearningSphere from "../../components/landing/ParticleLearningSphere";
import HeroSequenceReveal from "../../components/landing/HeroSequenceReveal";
import ExperienceShowcase from "../../components/landing/ExperienceShowcase";

// --- Count Up Animation Component with completion glow and bounce ---
interface CountUpProps {
  to: number;
  suffix?: string;
  duration?: number;
}

const CountUp = ({ to, suffix = "", duration = 2 }: CountUpProps) => {
  const [count, setCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, to, {
        duration,
        ease: "easeOut",
        onUpdate: (val) => setCount(Math.round(val)),
        onComplete: () => setIsDone(true)
      });
      return () => controls.stop();
    }
  }, [inView, to, duration]);

  return (
    <motion.span 
      ref={ref}
      animate={isDone ? { 
        scale: [1, 1.12, 1],
        textShadow: "0 0 15px rgba(109, 93, 252, 0.4)"
      } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 15 }}
      className={`inline-block ${isDone ? "text-primary" : ""}`}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
};

// --- Magnetic Hover Button ---
interface MagneticButtonProps extends React.ComponentProps<typeof motion.button> {
  children: React.ReactNode;
}

const MagneticButton = ({ children, className = "", onClick, ...props }: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 180, damping: 14, mass: 0.1 }}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      <span className="absolute inset-0 bg-[#FFFCE1]/10 dark:bg-[#1F150C]/5 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};

// --- Premium Heading Reveal Animation ---
interface HeadingRevealProps {
  text: string;
  variant?: "words" | "chars" | "blur";
  className?: string;
}

const HeadingReveal = ({ text, variant = "words", className = "" }: HeadingRevealProps) => {
  if (variant === "words") {
    const words = text.split(" ");
    return (
      <span className={className}>
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
  }

  if (variant === "chars") {
    const chars = Array.from(text);
    return (
      <span className={className}>
        {chars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, filter: "blur(5px)", scale: 0.8 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: i * 0.025, ease: "easeOut" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      initial={{ filter: "blur(10px)", opacity: 0, y: 12 }}
      whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.span>
  );
};

// --- Typewriter Effect for Eyebrows / Section Labels ---
interface TypewriterProps {
  text: string;
  className?: string;
}

const Typewriter = ({ text, className = "" }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [inView, text]);

  return (
    <span ref={ref} className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className="inline-block ml-0.5 font-normal text-primary"
      >
        |
      </motion.span>
    </span>
  );
};

// --- Subtle Section Divider Animation ---
const SectionDivider = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 h-px pointer-events-none relative overflow-hidden my-4">
      <motion.div
        className="h-full bg-gradient-to-r from-transparent via-primary/30 to-transparent w-full"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
};

// --- Subtle Background Floating Particles & Grid Drift ---
const BackgroundMotion = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle grid drift */}
      <motion.div
        className="absolute inset-0 opacity-[0.012] dark:opacity-[0.024] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"
        animate={{ y: [0, 40] }}
        transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
      />
      {/* Floating ambient gradients */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[130px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-secondary/3 blur-[160px]"
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
      />
    </div>
  );
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

interface LandingPageProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onGetStarted: () => void;
}

// --- Role Showcase Data ---
const roleSlides = [
  {
    id: "students",
    label: "Students",
    image: "/Student.jpg",
    headline: "Learning made personal.",
    description: "ScholarHub gives every student a focused, distraction-free learning environment with AI-powered guidance at every step.",
    points: ["Join live classes", "Submit assignments", "Track attendance", "Learn with AI Tutor"]
  },
  {
    id: "teachers",
    label: "Teachers",
    image: "/Teacher.jpg",
    headline: "Teach without the overhead.",
    description: "Automate the routine so educators can spend more time on what truly matters — inspiring and mentoring students.",
    points: ["Manage courses", "Grade assignments", "Generate AI quizzes", "Track student progress"]
  },
  {
    id: "professionals",
    label: "Professionals",
    image: "/Professional.jpg",
    headline: "Grow beyond the classroom.",
    description: "ScholarHub helps professionals upskill continuously with expert-led sessions, certifications, and curated career pathways.",
    points: ["Upskill continuously", "Access certifications", "Join expert-led sessions", "Build career pathways"]
  },
  {
    id: "institutions",
    label: "Institutions",
    image: "/Institution.jpg",
    headline: "Govern with complete clarity.",
    description: "Give administrators total ecosystem visibility — from attendance and performance data to reports and system-wide insights.",
    points: ["Manage users", "Track analytics", "Monitor attendance", "Generate reports"]
  }
];

const SLIDE_DURATION = 5000;

// --- Mega Menu Data ---
const PLATFORM_MENU = {
  core: [
    { label: "Virtual Classrooms", href: "#platform" },
    { label: "LMS", href: "#platform" },
    { label: "Assignments", href: "#platform" },
    { label: "Attendance", href: "#platform" },
    { label: "AI Tutor", href: "#platform" },
    { label: "Analytics", href: "#platform" },
  ],
  learning: [
    { label: "Courses", href: "#platform" },
    { label: "Learning Paths", href: "#platform" },
    { label: "Certificates", href: "#platform" },
  ],
  ai: [
    { label: "AI Tutor", href: "#platform" },
    { label: "AI Quiz Generator", href: "#platform" },
    { label: "AI Assignment Checker", href: "#platform" },
    { label: "AI Recommendations", href: "#platform" },
  ]
};

const ROLES_MENU = {
  students: [
    { label: "School Students", href: "#roles-showcase" },
    { label: "College Students", href: "#roles-showcase" },
    { label: "Lifelong Learners", href: "#roles-showcase" },
  ],
  educators: [
    { label: "Teachers", href: "#roles-showcase" },
    { label: "Professors", href: "#roles-showcase" },
    { label: "Mentors", href: "#roles-showcase" },
  ],
  institutions: [
    { label: "Schools", href: "#roles-showcase" },
    { label: "Colleges", href: "#roles-showcase" },
    { label: "Universities", href: "#roles-showcase" },
    { label: "Training Centers", href: "#roles-showcase" },
  ]
};

// --- Solid Mega Menu Component ---
interface MegaMenuProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  title: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const MegaMenuDropdown = ({ isOpen, onMouseEnter, onMouseLeave, title, isActive, onClick, children }: MegaMenuProps) => {
  return (
    <div 
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={onClick}
        className={`relative py-2 px-3 transition-all duration-300 rounded-md focus:outline-none cursor-pointer flex items-center gap-1 ${
          isActive || isOpen
            ? "text-primary dark:text-[#E1DCC9]" 
            : "text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/10 dark:hover:bg-outline-variant/5"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="nav-active-highlight"
            className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-md -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        )}
        {isActive && (
          <motion.div
            layoutId="nav-active-underline"
            className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        )}
        <span className="relative z-10 font-bold">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-surface dark:bg-surface-container-lowest rounded-2xl shadow-xl shadow-black/10 border border-outline-variant/30 overflow-hidden z-50 p-6 flex gap-8 cursor-default"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



export default function LandingPage({ theme, toggleTheme, onGetStarted }: LandingPageProps) {
  // Navbar states
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Parallax states for sphere and cards
  const [sphereMouse, setSphereMouse] = useState({ x: 0, y: 0 });
  const [cardTiltX, setCardTiltX] = useState<number[]>(new Array(4).fill(0));
  const [cardTiltY, setCardTiltY] = useState<number[]>(new Array(4).fill(0));
  // Scroll Spy state and mobile menu toggler
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const sectionIds = ["hero", "roles-showcase", "platform", "pricing-plans-stack", "cta"];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: "-35% 0px -50% 0px"
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navbarHeight = isScrolled ? 72 : 80;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
    setOpenDropdown(null);
  };

  // Navbar scroll logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Shrink behavior
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide / Reveal behavior
      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        setNavbarVisible(false); // scrolling down, hide navbar
      } else {
        setNavbarVisible(true); // scrolling up, show navbar
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Card hover tilt handlers
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const newTiltX = [...cardTiltX];
    const newTiltY = [...cardTiltY];
    newTiltX[index] = -y / (box.height / 3);
    newTiltY[index] = x / (box.width / 3);
    setCardTiltX(newTiltX);
    setCardTiltY(newTiltY);
  };

  const handleCardMouseLeave = (index: number) => {
    const newTiltX = [...cardTiltX];
    const newTiltY = [...cardTiltY];
    newTiltX[index] = 0;
    newTiltY[index] = 0;
    setCardTiltX(newTiltX);
    setCardTiltY(newTiltY);
  };

  // Showcase tab state
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

  // Interactive Pricing State
  const [selectedPlanId, setSelectedPlanId] = useState<"student" | "professional" | "institution">("professional");

  // Role Showcase State
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [isRoleHovered, setIsRoleHovered] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const roleResumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roleAutoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // Role autoplay
  useEffect(() => {
    if (isRoleHovered) return;
    roleAutoplayRef.current = setInterval(() => {
      setActiveRoleIndex(prev => (prev + 1) % roleSlides.length);
      setProgressKey(k => k + 1);
    }, SLIDE_DURATION);
    return () => { if (roleAutoplayRef.current) clearInterval(roleAutoplayRef.current); };
  }, [isRoleHovered, activeRoleIndex]);

  const handleRoleSelect = (index: number) => {
    if (roleAutoplayRef.current) clearInterval(roleAutoplayRef.current);
    if (roleResumeTimeout.current) clearTimeout(roleResumeTimeout.current);
    setActiveRoleIndex(index);
    setProgressKey(k => k + 1);
    setIsRoleHovered(true);
    roleResumeTimeout.current = setTimeout(() => setIsRoleHovered(false), SLIDE_DURATION);
  };

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
      <motion.nav 
        id="landing-navbar" 
        animate={{ 
          y: navbarVisible ? 0 : -80,
          height: isScrolled ? "72px" : "80px"
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full z-50 backdrop-blur-md border-b border-outline-variant/60 transition-colors duration-300 ${
          isScrolled ? "bg-surface/90 shadow-sm" : "bg-surface/70"
        }`}
      >
        <div className="flex justify-between items-center h-full px-6 max-w-7xl mx-auto">
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
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider relative">
            <MegaMenuDropdown
              isOpen={openDropdown === "platform"}
              onMouseEnter={() => setOpenDropdown("platform")}
              onMouseLeave={() => setOpenDropdown(null)}
              title="Platform"
              isActive={activeSection === "platform"}
              onClick={() => scrollToSection("platform")}
            >
              <div className="flex-1 space-y-3">
                <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-4">Core Platform</h4>
                <ul className="space-y-2">
                  {PLATFORM_MENU.core.map((item, i) => (
                    <li key={i}>
                      <button onClick={() => scrollToSection("platform")} className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm font-medium">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 space-y-3 border-l border-outline-variant/20 pl-8">
                <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-4">Learning</h4>
                <ul className="space-y-2">
                  {PLATFORM_MENU.learning.map((item, i) => (
                    <li key={i}>
                      <button onClick={() => scrollToSection("platform")} className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm font-medium">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 space-y-3 border-l border-outline-variant/20 pl-8">
                <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-4">AI Features</h4>
                <ul className="space-y-2">
                  {PLATFORM_MENU.ai.map((item, i) => (
                    <li key={i}>
                      <button onClick={() => scrollToSection("platform")} className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm font-medium">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </MegaMenuDropdown>

            <MegaMenuDropdown
              isOpen={openDropdown === "roles"}
              onMouseEnter={() => setOpenDropdown("roles")}
              onMouseLeave={() => setOpenDropdown(null)}
              title="Roles"
              isActive={activeSection === "roles-showcase"}
              onClick={() => scrollToSection("roles-showcase")}
            >
              <div className="flex-1 space-y-3">
                <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-4">Students</h4>
                <ul className="space-y-2">
                  {ROLES_MENU.students.map((item, i) => (
                    <li key={i}>
                      <button onClick={() => scrollToSection("roles-showcase")} className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm font-medium">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 space-y-3 border-l border-outline-variant/20 pl-8">
                <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-4">Educators</h4>
                <ul className="space-y-2">
                  {ROLES_MENU.educators.map((item, i) => (
                    <li key={i}>
                      <button onClick={() => scrollToSection("roles-showcase")} className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm font-medium">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 space-y-3 border-l border-outline-variant/20 pl-8">
                <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-4">Institutions</h4>
                <ul className="space-y-2">
                  {ROLES_MENU.institutions.map((item, i) => (
                    <li key={i}>
                      <button onClick={() => scrollToSection("roles-showcase")} className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm font-medium">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </MegaMenuDropdown>

            <button
              onClick={() => scrollToSection("pricing-plans-stack")}
              className={`relative py-2 px-3 transition-all duration-300 rounded-md focus:outline-none cursor-pointer flex items-center gap-1 ${
                activeSection === "pricing-plans-stack" 
                  ? "text-primary dark:text-[#E1DCC9]" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/10 dark:hover:bg-outline-variant/5"
              }`}
            >
              {activeSection === "pricing-plans-stack" && (
                <motion.div
                  layoutId="nav-active-highlight"
                  className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              {activeSection === "pricing-plans-stack" && (
                <motion.div
                  layoutId="nav-active-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 font-bold">Pricing</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-90" 
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <MagneticButton 
              onClick={onGetStarted}
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container text-sm font-bold shadow-md shadow-primary/10 transition-all duration-300"
            >
              Get Started
            </MagneticButton>

            {/* Hamburger Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-90"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden bg-surface/95 dark:bg-bg-surface/95 backdrop-blur-lg border-t border-outline-variant/40 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-3">
                {[
                  { id: "platform", label: "Platform" },
                  { id: "roles-showcase", label: "Roles" },
                  { id: "pricing-plans-stack", label: "Pricing" }
                ].map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        scrollToSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`py-3 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex justify-between items-center ${
                        isActive 
                          ? "bg-primary/8 text-primary font-black" 
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
                <div className="h-px bg-outline-variant/20 my-2" />
                <MagneticButton
                  onClick={() => {
                    onGetStarted();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-sm font-bold shadow-md shadow-primary/10 text-center"
                >
                  Get Started
                </MagneticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <motion.div style={{ opacity: contentOpacity }} className="relative z-10">
        <BackgroundMotion />

        {/* HERO SECTION */}
        <motion.section 
          id="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, duration: 0.8, ease: "easeOut" } }
          }}
          className="pt-40 pb-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="space-y-8"
              >
                <span className="inline-block text-[10px] uppercase font-bold text-primary tracking-widest bg-primary-container/10 dark:bg-primary/20 px-3.5 py-1.5 rounded-full">
                  <Typewriter text="Welcome to ScholarHub Virtual" />
                </span>
                <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-[1.1] font-bold text-on-surface">
                  <HeadingReveal text="One Platform For" variant="words" /><br/>
                  <span className="text-primary hover:opacity-90 transition-opacity">
                    <HeadingReveal text="Modern Classrooms" variant="blur" />
                  </span>
                </h1>
                <motion.p 
                  variants={{
                    hidden: { opacity: 0, filter: "blur(4px)" },
                    visible: { opacity: 1, filter: "blur(0px)" }
                  }}
                  transition={{ duration: 0.8 }}
                  className="text-xl text-on-surface-variant mb-12 max-w-xl leading-relaxed"
                >
                  A unified virtual learning environment built for precision. Experience educational excellence at scale.
                </motion.p>
                <div className="flex flex-wrap gap-5">
                  <MagneticButton 
                    onClick={onGetStarted}
                    className="px-8 py-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-lg font-bold shadow-lg shadow-primary/15 transition-all duration-300"
                  >
                    Start for Free
                  </MagneticButton>
                  <MagneticButton 
                    onClick={onGetStarted}
                    className="px-8 py-4 rounded-xl border border-outline hover:bg-surface-container-low text-lg font-bold text-on-surface transition-all duration-300"
                  >
                    Schedule Demo
                  </MagneticButton>
                </div>
              </motion.div>
              
              {/* Interactive 3D Particle Learning Sphere with floating and mouse tracking */}
              <div className="w-full flex items-center justify-center relative" style={{ minHeight: '480px' }}>
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="w-full relative group"
                >
                  <motion.div
                    onMouseMove={(e) => {
                      const box = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - box.left) / box.width - 0.5;
                      const y = (e.clientY - box.top) / box.height - 0.5;
                      setSphereMouse({ x: x * 35, y: y * 35 });
                    }}
                    onMouseLeave={() => setSphereMouse({ x: 0, y: 0 })}
                    animate={{ x: sphereMouse.x, y: sphereMouse.y }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="relative w-full rounded-full transition-shadow duration-500 group-hover:shadow-[0_0_60px_15px_rgba(109,93,252,0.14)]"
                  >
                    <ParticleLearningSphere
                      particleCount={1500}
                      className="h-[480px] w-full cursor-grab active:cursor-grabbing"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        <SectionDivider />

      {/* SECTION 1: TRUST METRICS */}
      <section className="py-12 md:py-20 relative overflow-hidden bg-bg-surface">
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
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                onMouseMove={(e) => handleCardMouseMove(e, i)}
                onMouseLeave={() => handleCardMouseLeave(i)}
                animate={{ rotateX: cardTiltX[i], rotateY: cardTiltY[i] }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  boxShadow: "0 30px 60px -15px rgba(109, 93, 252, 0.22)",
                  borderColor: "var(--color-primary, #9d95ff)"
                }}
                className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-surface/40 dark:bg-surface-container-lowest/30 backdrop-blur-md border border-outline-variant/30 hover:border-primary/55 transition-all duration-300 flex flex-col justify-center items-center text-center group cursor-pointer"
                style={{ transformStyle: "preserve-3d", perspective: 800 }}
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

      <SectionDivider />

      {/* INSTITUTIONAL CREDIBILITY TICKER */}
      <section className="py-12 relative overflow-hidden bg-bg-surface/50">
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
              <motion.div
                key={`first-${index}`}
                whileHover={{ scale: 1.06, y: -2 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className="inline-flex items-center px-6 py-3 rounded-full text-xs font-bold tracking-wide bg-surface/50 dark:bg-surface-container-lowest/40 border border-outline-variant/40 backdrop-blur-md hover:border-primary/50 hover:shadow-[0_0_20px_rgba(109,93,252,0.22)] transition-all duration-300 text-on-surface hover:text-primary cursor-default"
              >
                {inst}
              </motion.div>
            ))}
            {/* Duplicate Second Set for Seamless Looping */}
            {institutions.map((inst, index) => (
              <motion.div
                key={`second-${index}`}
                whileHover={{ scale: 1.06, y: -2 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className="inline-flex items-center px-6 py-3 rounded-full text-xs font-bold tracking-wide bg-surface/50 dark:bg-surface-container-lowest/40 border border-outline-variant/40 backdrop-blur-md hover:border-primary/50 hover:shadow-[0_0_20px_rgba(109,93,252,0.22)] transition-all duration-300 text-on-surface hover:text-primary cursor-default"
              >
                {inst}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ROLE SHOWCASE: BUILT FOR EVERYONE IN EDUCATION */}
      <section
        id="roles-showcase"
        className="py-24 md:py-32 relative overflow-hidden bg-bg-surface"
        onMouseEnter={() => setIsRoleHovered(true)}
        onMouseLeave={() => setIsRoleHovered(false)}
      >
        {/* Subtle ambient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16 space-y-4"
          >
            <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold py-1 px-3.5 bg-primary/8 rounded-full inline-block">
              <Typewriter text="Who It's For" />
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-black text-on-surface leading-tight">
              <HeadingReveal text="Built For Everyone In Education" variant="words" />
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              From school students to university administrators, ScholarHub adapts to every stage of learning.
            </p>
          </motion.div>

          {/* Main Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 items-center">

            {/* LEFT: Image Panel (60%) */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[16/10] bg-surface-container-lowest shadow-2xl shadow-black/10">
              <AnimatePresence mode="sync">
                <motion.div
                  key={roleSlides[activeRoleIndex].id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.img
                    src={roleSlides[activeRoleIndex].image}
                    alt={roleSlides[activeRoleIndex].label}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1.0 }}
                    transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                  />
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {/* Role label badge on image */}
                  <div className="absolute bottom-5 left-5">
                    <span className="inline-flex items-center gap-2 bg-[#1F150C]/40 backdrop-blur-md border border-[#E1DCC9]/15 text-[#E1DCC9] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {roleSlides[activeRoleIndex].label}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT: Navigation + Content (40%) */}
            <div className="lg:col-span-5 flex flex-col gap-0 pt-10 lg:pt-0">

              {/* Role Navigation — Vertical (desktop) / Horizontal (mobile) */}
              <nav
                className="flex flex-row lg:flex-col gap-1 mb-8 lg:mb-0 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0"
                aria-label="Role selector"
              >
                {roleSlides.map((slide, index) => {
                  const isActive = index === activeRoleIndex;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => handleRoleSelect(index)}
                      aria-selected={isActive}
                      className={`group relative flex items-center gap-4 px-4 py-4 lg:py-5 rounded-2xl text-left transition-all duration-300 shrink-0 lg:shrink cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive
                          ? "text-on-surface"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {/* Progress bar / Active indicator — vertical line on desktop */}
                      <div className="hidden lg:flex flex-col items-center self-stretch shrink-0 w-[3px]">
                        <div className="relative flex-1 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                          {isActive && (
                            <motion.div
                              key={progressKey}
                              className="absolute inset-x-0 top-0 bg-primary rounded-full"
                              initial={{ height: "0%" }}
                              animate={{ height: isRoleHovered ? "0%" : "100%" }}
                              transition={{
                                duration: isRoleHovered ? 0 : SLIDE_DURATION / 1000,
                                ease: "linear"
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Horizontal progress bar (mobile only) */}
                      <div className="lg:hidden absolute bottom-1 left-4 right-4 h-[2px] bg-outline-variant/30 rounded-full overflow-hidden">
                        {isActive && (
                          <motion.div
                            key={`h-${progressKey}`}
                            className="absolute inset-y-0 left-0 bg-primary rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: isRoleHovered ? "0%" : "100%" }}
                            transition={{
                              duration: isRoleHovered ? 0 : SLIDE_DURATION / 1000,
                              ease: "linear"
                            }}
                          />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className={`font-bold text-sm md:text-base tracking-tight transition-colors duration-200 ${
                          isActive ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"
                        }`}>
                          {slide.label}
                        </span>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] text-on-surface-variant/70 mt-0.5 hidden lg:block"
                          >
                            {slide.points[0]} · {slide.points[1]}
                          </motion.span>
                        )}
                      </div>

                      {/* Hover glow pill */}
                      {isActive && (
                        <motion.div
                          layoutId="roleActivePill"
                          className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Content Panel — slides in/out */}
              <div className="relative min-h-[260px] lg:ml-7 mt-4 lg:mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={roleSlides[activeRoleIndex].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <h3 className="font-serif text-3xl md:text-4xl font-black text-on-surface leading-snug">
                      {roleSlides[activeRoleIndex].headline}
                    </h3>
                    <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                      {roleSlides[activeRoleIndex].description}
                    </p>

                    <motion.ul
                      className="space-y-3"
                      variants={{
                        show: { transition: { staggerChildren: 0.07 } }
                      }}
                      initial="hidden"
                      animate="show"
                    >
                      {roleSlides[activeRoleIndex].points.map((point, pi) => (
                        <motion.li
                          key={pi}
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0 }
                          }}
                          className="flex items-center gap-3 text-sm font-semibold text-on-surface"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          {point}
                        </motion.li>
                      ))}
                    </motion.ul>

                    <button
                      onClick={onGetStarted}
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all duration-200 group"
                    >
                      Get started as {roleSlides[activeRoleIndex].label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />
      {/* PRODUCT SHOWCASE */}
      <ExperienceShowcase activeTab={activeTab} setActiveTab={setActiveTab} onGetStarted={onGetStarted} />
      <SectionDivider />

      {/* PRICING SECTION */}
      <section className="py-24 bg-surface-container-lowest/30 dark:bg-bg-surface text-on-surface relative overflow-hidden border-t border-b border-outline-variant/10 transition-colors duration-300" id="pricing">
        {/* Subtle background blur nodes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 relative z-10"
        >
          <div id="scale-heading" className="text-center mb-16 space-y-2">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-on-surface tracking-tight">
              <HeadingReveal text="Scale Academic Excellence" variant="words" />
            </h2>
            <p className="text-on-surface-variant/80 text-sm">Flexible licensing plans built for prep schools to global universities.</p>
          </div>

          <div id="pricing-plans-stack" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
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
                  <div className="mt-8 pt-4 border-t border-outline-variant/20 flex justify-center w-full">
                    <MagneticButton 
                      onClick={onGetStarted}
                      className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                        pricingPlans.find(p => p.id === selectedPlanId)?.popular 
                          ? "bg-primary text-on-primary hover:bg-primary-container shadow-lg shadow-primary/25" 
                          : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30"
                      }`}
                    >
                      {pricingPlans.find(p => p.id === selectedPlanId)?.ctaText}
                    </MagneticButton>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
 
          {/* Trust Message */}
          <p className="text-center font-body-md text-on-surface-variant/60 text-sm mt-16 max-w-2xl mx-auto">
            Trusted by students, educators, and institutions building the future of learning.
          </p>
        </motion.div>
      </section>

      <SectionDivider />

      {/* FINAL CTA SECTION */}
      <section 
        id="cta"
        ref={ctaSectionRef}
        onMouseMove={handleCtaMouseMove}
        className="py-32 bg-surface-container-lowest/20 dark:bg-bg-surface text-on-surface relative overflow-hidden border-b border-outline-variant/10 transition-colors duration-300"
      >
        {/* Low-opacity Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Pulsing Background Glows with premium drift */}
        <motion.div 
          animate={{ 
            x: ["-50%", "-40%", "-60%", "-50%"], 
            y: ["-50%", "-60%", "-40%", "-50%"],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/6 dark:bg-primary/12 rounded-full blur-[140px] pointer-events-none" 
        />

        {/* Soft Spotlight Following Cursor */}
        <motion.div
          className="absolute pointer-events-none rounded-full blur-[100px] bg-primary/10 dark:bg-primary/15 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 hidden md:block"
          style={{
            left: ctaMousePos.x,
            top: ctaMousePos.y
          }}
        />

        {/* Floating Educational Elements with slow floating motion */}
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
              y: [0, -18, 0],
              rotate: [0, 8, 0]
            }}
            transition={{
              duration: 7,
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
                initial={{ y: 24, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -24, opacity: 0, filter: "blur(4px)" }}
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
            <MagneticButton
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
            >
              Get Started Free
            </MagneticButton>
            <MagneticButton
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-outline-variant/60 hover:bg-surface-container-high text-base font-bold transition-all duration-300 text-on-surface"
            >
              Schedule Demo
            </MagneticButton>
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
        <div className="font-serif text-[11vw] font-extrabold text-black dark:text-[#E1DCC9] select-none leading-none mt-20 text-center tracking-wider uppercase cursor-default transition-all duration-700 hover:scale-105 hover:tracking-widest drop-shadow-[0_5px_15px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_5px_25px_rgba(255,255,255,0.2)] hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-transparent hover:bg-clip-text">
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
