import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bot, Video, ClipboardCheck, UserCheck, BarChart3, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Page content data ───────────────────────────────────────────────────────

const PAGE_COUNT = 4;

// ─── 3D Scene ────────────────────────────────────────────────────────────────

interface BookProps {
  currentPage: number;
  flippingPage: number | null;
  flipProgress: number; // 0-1
  onPageFlipStart: (page: number) => void;
  isMobile: boolean;
}

function BookPage({
  pageIndex,
  isFlipping,
  flipProgress,
  color,
  accentColor,
}: {
  pageIndex: number;
  isFlipping: boolean;
  flipProgress: number;
  color: string;
  accentColor: string;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    if (isFlipping) {
      // Rotate page around Y axis (book spine) during flip
      const angle = -Math.PI * flipProgress;
      meshRef.current.rotation.y = angle;
    }
  });

  const w = 1.8;
  const h = 2.4;
  const depth = 0.012;
  const zOffset = pageIndex * -0.013;

  return (
    <group ref={meshRef} position={[0, 0, zOffset]}>
      {/* Page body */}
      <mesh castShadow>
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial
          color={color}
          roughness={0.55}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Spine line */}
      <mesh position={[-w / 2 + 0.04, 0, depth / 2 + 0.001]}>
        <boxGeometry args={[0.018, h, 0.001]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
      {/* Decorative lines (text lines illusion) */}
      {[0.6, 0.3, 0, -0.3, -0.6].map((y, i) => (
        <mesh key={i} position={[0.15, y, depth / 2 + 0.002]}>
          <boxGeometry args={[w * 0.65 - i * 0.05, 0.02, 0.001]} />
          <meshStandardMaterial color={accentColor} opacity={0.3} transparent />
        </mesh>
      ))}
    </group>
  );
}

function BookScene({ currentPage, flippingPage, flipProgress, onPageFlipStart, isMobile }: BookProps) {
  const { pointer } = useThree();
  const bookRef = useRef<THREE.Group>(null);
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const paused = useRef(false);

  // Visibility pause
  useEffect(() => {
    const onVisChange = () => { paused.current = document.hidden; };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  useFrame((_state, delta) => {
    if (!bookRef.current || paused.current) return;

    // Parallax tilt following mouse
    targetTilt.current.x = -pointer.y * 0.18;
    targetTilt.current.y = pointer.x * 0.22;

    currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * Math.min(delta * 4, 1);
    currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * Math.min(delta * 4, 1);

    bookRef.current.rotation.x = currentTilt.current.x;
    bookRef.current.rotation.y = currentTilt.current.y;

    // Gentle float
    bookRef.current.position.y = Math.sin(_state.clock.elapsedTime * 0.6) * 0.05;
  });

  const pageColors = [
    { color: '#2a1f2e', accent: '#d8bcea' },
    { color: '#1e1e2e', accent: '#f3b6cd' },
    { color: '#241826', accent: '#d0c2d6' },
    { color: '#1a1820', accent: '#d8bcea' },
  ];

  const scale = isMobile ? 0.65 : 1;

  return (
    <group ref={bookRef} scale={scale}>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} castShadow />
      <pointLight position={[-2, 1, 3]} color="#d8bcea" intensity={2.5} />
      <pointLight position={[2, -1, 2]} color="#f3b6cd" intensity={1.5} />

      {/* Book cover (back) */}
      <mesh position={[0, 0, -PAGE_COUNT * 0.013 - 0.015]} castShadow>
        <boxGeometry args={[1.84, 2.44, 0.025]} />
        <meshStandardMaterial color="#1a0e1f" roughness={0.7} />
      </mesh>

      {/* Book spine */}
      <mesh position={[-0.93, 0, -PAGE_COUNT * 0.006]} castShadow>
        <boxGeometry args={[0.06, 2.44, PAGE_COUNT * 0.013 + 0.05]} />
        <meshStandardMaterial color="#0f0a14" roughness={0.8} />
      </mesh>

      {/* Pages */}
      {pageColors.map((pc, i) => (
        <BookPage
          key={i}
          pageIndex={i}
          isFlipping={flippingPage === i}
          flipProgress={flipProgress}
          color={pc.color}
          accentColor={pc.accent}
        />
      ))}

      {/* Page flip shadow plane */}
      {flippingPage !== null && (
        <mesh position={[0, 0, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 0.3]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15 * (1 - Math.abs(flipProgress - 0.5) * 2)} />
        </mesh>
      )}

      {/* Click target plane (invisible, for interaction) */}
      <mesh
        position={[0.5, 0, 0.02]}
        onClick={() => onPageFlipStart(currentPage)}
      >
        <planeGeometry args={[0.9, 2.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Ground reflection */}
      <mesh position={[0, -1.35, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 48]} />
        <meshBasicMaterial color="#d8bcea" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function BookFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-40 h-56 rounded-lg border border-primary/30 bg-surface-container flex items-center justify-center">
        <span className="text-primary/50 font-serif text-4xl">📖</span>
      </div>
    </div>
  );
}

// ─── Page Content Panels ─────────────────────────────────────────────────────

function HeroContent({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="sh-hero-content">
      <div className="sh-badge">
        <span className="sh-badge-dot" />
        <span>AI Learning 2.0 is live</span>
      </div>
      <h1 className="sh-hero-title">
        The Future of Learning,<br />
        <span className="sh-text-gradient">Powered by AI.</span>
      </h1>
      <p className="sh-hero-sub">
        A high-fidelity educational ecosystem designed for focused,
        high-performance learning. Empowering students and teachers
        through interactive intelligence.
      </p>
      <div className="sh-hero-btns">
        <button
          onClick={() => navigate('/register')}
          className="sh-btn-primary"
          id="hero-start-trial-btn"
        >
          Start Free Trial <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="sh-btn-ghost"
          id="hero-view-demo-btn"
        >
          View Demo
        </button>
      </div>
      <div className="sh-flip-hint">
        <span>Click the right edge of the book to explore →</span>
      </div>
    </div>
  );
}

const features = [
  { icon: Bot, title: 'AI Tutor 24/7', color: '#d8bcea', desc: 'Personalized Socratic guidance' },
  { icon: Video, title: 'Live Classroom', color: '#f3b6cd', desc: 'HD video with whiteboards' },
  { icon: ClipboardCheck, title: 'Smart Assignments', color: '#d0c2d6', desc: 'AI-graded with feedback' },
  { icon: UserCheck, title: 'Attendance', color: '#d8bcea', desc: 'Biometric-ready tracking' },
  { icon: BarChart3, title: 'Analytics', color: '#f3b6cd', desc: 'Deep engagement metrics' },
  { icon: Award, title: 'Certificates', color: '#d0c2d6', desc: 'Blockchain-verified creds' },
];

function FeaturesContent() {
  return (
    <div className="sh-features-content">
      <h2 className="sh-section-title">Everything You Need</h2>
      <p className="sh-section-sub">A comprehensive suite of AI-powered tools.</p>
      <div className="sh-features-grid">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="sh-feature-item">
              <div className="sh-feature-icon" style={{ color: f.color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="sh-feature-name">{f.title}</div>
                <div className="sh-feature-desc">{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote: "The AI tutor is like having a private professor 24/7. My grades jumped from C to A+ in one semester.",
    author: 'Jordan Davis',
    role: 'CS Student, Stanford',
    initials: 'JD',
    color: '#d8bcea',
  },
  {
    quote: "ScholarHub automated 80% of my admin workload. I finally focus on what matters: mentoring.",
    author: 'Sarah Lin',
    role: 'Dept. Head, MIT',
    initials: 'SL',
    color: '#f3b6cd',
  },
  {
    quote: "The platform identified at-risk students 3 weeks earlier than our previous system.",
    author: 'Michael Reed',
    role: 'Superintendent, District 12',
    initials: 'MR',
    color: '#d0c2d6',
  },
];

function TestimonialsContent() {
  return (
    <div className="sh-testimonials-content">
      <h2 className="sh-section-title">Loved by Educators</h2>
      <div className="sh-testimonials-list">
        {testimonials.map((t, i) => (
          <div key={i} className="sh-testimonial">
            <div className="sh-testimonial-avatar" style={{ background: `${t.color}22`, borderColor: `${t.color}44` }}>
              <span style={{ color: t.color }}>{t.initials}</span>
            </div>
            <div className="sh-testimonial-body">
              <p className="sh-testimonial-quote">"{t.quote}"</p>
              <div className="sh-testimonial-author">
                <strong>{t.author}</strong> — {t.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  { n: 1, title: 'Sign Up Free', desc: 'SSO gets your whole class live in seconds.' },
  { n: 2, title: 'Join or Create', desc: 'Import curriculum with AI parsers.' },
  { n: 3, title: 'Learn Live', desc: 'Engage with AI through interactive modules.' },
  { n: 4, title: 'Get Certified', desc: 'Verified credentials issued instantly.' },
];

function HowItWorksContent({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="sh-howitworks-content">
      <h2 className="sh-section-title">Get Started in Minutes</h2>
      <p className="sh-section-sub">Our onboarding is as intelligent as our platform.</p>
      <div className="sh-steps">
        {steps.map((s, i) => (
          <div key={i} className="sh-step">
            <div className="sh-step-num">{s.n}</div>
            <div>
              <div className="sh-step-title">{s.title}</div>
              <div className="sh-step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/register')}
        className="sh-btn-primary sh-final-cta"
        id="howitworks-get-started-btn"
      >
        Get Started Today <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SplitHero() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [flippingPage, setFlippingPage] = useState<number | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const flipAnimRef = useRef<number | null>(null);
  const flipStartTime = useRef<number>(0);
  const FLIP_DURATION = 480; // ms

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const startFlip = useCallback((fromPage: number) => {
    if (flippingPage !== null) return;
    const nextPage = (fromPage + 1) % PAGE_COUNT;
    setFlippingPage(fromPage);
    flipStartTime.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - flipStartTime.current;
      const t = Math.min(elapsed / FLIP_DURATION, 1);
      // Ease in-out
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setFlipProgress(eased);
      if (t < 1) {
        flipAnimRef.current = requestAnimationFrame(animate);
      } else {
        setFlippingPage(null);
        setFlipProgress(0);
        setCurrentPage(nextPage);
      }
    };
    flipAnimRef.current = requestAnimationFrame(animate);
  }, [flippingPage]);

  useEffect(() => {
    return () => {
      if (flipAnimRef.current) cancelAnimationFrame(flipAnimRef.current);
    };
  }, []);

  const pageLabels = ['Hero', 'Features', 'Testimonials', 'How It Works'];

  const contentMap = [
    <HeroContent key="hero" navigate={navigate} />,
    <FeaturesContent key="features" />,
    <TestimonialsContent key="testimonials" />,
    <HowItWorksContent key="howitworks" navigate={navigate} />,
  ];

  return (
    <section className="sh-split-hero" aria-label="Split screen hero section">
      {/* ── LEFT: 3D Book ── */}
      <div className={`sh-book-panel ${isMobile ? 'sh-book-panel--mobile' : ''}`}>
        <Suspense fallback={<BookFallback />}>
          <Canvas
            shadows
            camera={{ position: [0, 0, 4.5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            className="sh-book-canvas"
          >
            <BookScene
              currentPage={currentPage}
              flippingPage={flippingPage}
              flipProgress={flipProgress}
              onPageFlipStart={startFlip}
              isMobile={isMobile}
            />
          </Canvas>
        </Suspense>

        {/* Page indicator dots */}
        <div className="sh-page-dots">
          {pageLabels.map((label, i) => (
            <button
              key={i}
              className={`sh-page-dot ${i === currentPage ? 'sh-page-dot--active' : ''}`}
              onClick={() => {
                if (i > currentPage) startFlip(currentPage);
                else setCurrentPage(i);
              }}
              aria-label={`Go to ${label} page`}
              title={label}
            />
          ))}
        </div>

        {/* Page label */}
        <div className="sh-page-label">
          {pageLabels[currentPage]}
        </div>
      </div>

      {/* ── RIGHT: Content Panel ── */}
      <div className="sh-content-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="sh-content-inner"
          >
            {contentMap[currentPage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
