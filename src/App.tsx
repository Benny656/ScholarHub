import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeTicker } from './components/MarqueeTicker';
import { ProblemSection, SolutionSection } from './components/ProblemSolution';
import { DashboardPreview, FeaturesSection } from './components/Dashboard';
import { StatsSection } from './components/Stats';
import { TestimonialsSection } from './components/Testimonials';
import { PricingSection } from './components/Pricing';
import { HowItWorks, CTASection } from './components/OnboardingCTA';
import { Footer } from './components/Footer';
import { NotFound } from './components/NotFound';
import { CustomCursor } from './components/CustomCursor';
import { useScrollReveal } from './hooks/useAnimations';

function HomePage() {
  useScrollReveal();

  useEffect(() => {
    // Initialize ripple effect on all .ripple-btn elements
    const createRipple = (event: MouseEvent) => {
      const button = event.currentTarget as HTMLElement;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      circle.classList.add('ripple');

      const ripple = button.querySelector('.ripple');
      if (ripple) ripple.remove();
      button.appendChild(circle);
    };

    const buttons = document.querySelectorAll('.ripple-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', createRipple as EventListener);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener('click', createRipple as EventListener);
      });
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-on-surface transition-colors duration-500"
    >
      <Navbar />
      <Hero />
      <MarqueeTicker />
      <ProblemSection />
      <SolutionSection />
      <DashboardPreview />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      {/* Pricing between social proof and onboarding — classic startup flow */}
      <PricingSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </motion.div>
  );
}

/* ── AppRoutes needs useLocation which must be inside BrowserRouter ── */
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Custom cursor — rendered at root so it's always on top */}
      <CustomCursor />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
