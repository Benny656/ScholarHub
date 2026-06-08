import { useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { MarqueeTicker } from '../../components/MarqueeTicker';
import { StatsSection } from '../../components/Stats';
import { Footer } from '../../components/Footer';
import { SplitHero } from '../../components/landing/SplitHero';
import { ZAxisScroll } from '../../components/landing/ZAxisScroll';
import { WordmarkFooter } from '../../components/landing/WordmarkFooter';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useCountUp } from '../../hooks/useAnimations';

export function LandingPage() {
  useScrollReveal();
  useCountUp(10);

  // Ripple effect for buttons
  useEffect(() => {
    const createRipple = (event: MouseEvent) => {
      const button = event.currentTarget as HTMLElement;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      circle.classList.add('ripple');
      const existing = button.querySelector('.ripple');
      if (existing) existing.remove();
      button.appendChild(circle);
    };
    const buttons = document.querySelectorAll('.ripple-btn');
    buttons.forEach((btn) => btn.addEventListener('click', createRipple as EventListener));
    return () => buttons.forEach((btn) => btn.removeEventListener('click', createRipple as EventListener));
  }, []);

  return (
    <div className="landing-page min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Fixed navbar */}
      <Navbar />

      {/* Main content starts below nav */}
      <main>
        {/* Split Screen: 3D Book (left) + Content (right) */}
        <SplitHero />

        {/* Marquee ticker */}
        <MarqueeTicker />

        {/* Stats bar */}
        <StatsSection />

        {/* New Scroll Animations: typing, glitch, mask reveal */}
        <ZAxisScroll />
      </main>

      {/* Standard footer */}
      <Footer />

      {/* Giant wordmark — sits at the absolute bottom of the page */}
      <WordmarkFooter />
    </div>
  );
}
