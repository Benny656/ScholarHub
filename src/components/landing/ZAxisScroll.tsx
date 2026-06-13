import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { Check, Zap, Building2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ── Scramble helper (pure JS, no extra dep) ─────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
function scrambleText(el: HTMLElement, final: string, duration = 1200) {
  let frame = 0;
  const totalFrames = Math.round(duration / 30);
  const handle = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    const revealedCount = Math.floor(progress * final.length);
    let result = '';
    for (let i = 0; i < final.length; i++) {
      if (final[i] === ' ') { result += ' '; continue; }
      if (i < revealedCount) { result += final[i]; }
      else { result += CHARS[Math.floor(Math.random() * CHARS.length)]; }
    }
    el.textContent = result;
    if (frame >= totalFrames) {
      clearInterval(handle);
      el.textContent = final;
    }
  }, 30);
}

// ─── Problem ─────────────────────────────────────────────────────────────────
// Animation: Line draws → items fade-up with stagger

function ProblemPanel() {
  const problems = [
    { title: 'One-size-fits-all', desc: '40 students, 1 teacher, 1 pace. Personalized attention is a luxury few can afford.' },
    { title: 'No real-time feedback', desc: 'Waiting days for grades prevents immediate correction of misconceptions.' },
    { title: 'Disconnected tools', desc: 'Fragmented LMS, video, and grading platforms create friction for everyone.' },
  ];
  return (
    <section className="reveal-section" data-anim="problem">
      <div className="reveal-panel">
        <div className="reveal-panel-inner">
          <span className="reveal-line-draw" />
          <div className="zs-eyebrow fade-up-item">The Problem</div>
          <h2 className="zs-title fade-up-item">
            Traditional Education<br />Is <span className="zs-highlight-red">Broken</span>
          </h2>
          <p className="zs-subtitle fade-up-item">
            Modern classrooms are struggling with outdated models that stifle growth.
          </p>
          <div className="zs-problem-list">
            {problems.map((p, i) => (
              <div key={i} className="zs-problem-item fade-up-item">
                <div className="zs-problem-num">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div className="zs-problem-title">{p.title}</div>
                  <div className="zs-problem-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal-illustration fade-up-item">
          <img src="/Broken.svg" alt="Traditional education is broken" className="reveal-illustration-img" />
        </div>
      </div>
    </section>
  );
}

// ─── Solution ─────────────────────────────────────────────────────────────────
// Animation: Mask clip-path reveal (bottom → top) + glitch subtitle

function SolutionPanel() {
  const solutions = [
    { title: 'Adaptive IQ Core', desc: 'AI analyzes learning patterns to adjust complexity in real-time.' },
    { title: 'Instant Cognitive Insights', desc: 'Know exactly what you\'ve mastered and where to focus, instantly.' },
    { title: 'The Unified Hub', desc: 'Video, assignments, grading, and AI in one stunning interface.' },
  ];
  return (
    <section className="reveal-section" data-anim="solution">
      <div className="reveal-panel reveal-panel--reverse">
        <div className="reveal-illustration mask-clip-item">
          <img src="/Change.svg" alt="ScholarHub changes everything" className="reveal-illustration-img" />
        </div>
        <div className="reveal-panel-inner">
          <div className="zs-eyebrow mask-clip-item">The Solution</div>
          <h2 className="zs-title mask-clip-item">
            ScholarHub<br /><span className="zs-highlight-primary">Changes Everything</span>
          </h2>
          <p className="zs-subtitle mask-clip-item glitch-blur-item">
            We've built a unified intelligence layer that adapts to every student.
          </p>
          <div className="zs-solution-list">
            {solutions.map((s, i) => (
              <div key={i} className="zs-solution-item mask-clip-item">
                <div className="zs-solution-dot" />
                <div>
                  <div className="zs-solution-title">{s.title}</div>
                  <div className="zs-solution-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
// Animation: Title scrambles, cards slide in from left with stagger

function DashboardPanel() {
  const portals = [
    { label: 'Student Portal', color: '#d8bcea', desc: 'Track progress, submit assignments, attend live classes.' },
    { label: 'Educator Hub', color: '#f3b6cd', desc: 'Manage courses, grade smartly, host live sessions.' },
    { label: 'Admin Console', color: '#d0c2d6', desc: 'Full analytics, SSO, and institutional controls.' },
  ];
  return (
    <section className="reveal-section" data-anim="dashboard">
      <div className="reveal-panel">
        <div className="reveal-panel-inner">
          <div className="zs-eyebrow fade-up-item">The Platform</div>
          <h2 className="zs-title scramble-target" data-scramble="A Unified Platform For Everyone">
            A Unified Platform For Everyone
          </h2>
          <p className="zs-subtitle fade-up-item">Tailored experiences for every stakeholder in the learning ecosystem.</p>
          <div className="zs-portals">
            {portals.map((p, i) => (
              <div key={i} className="zs-portal-card slide-in-left">
                <div className="zs-portal-bar" style={{ background: p.color }} />
                <div className="zs-portal-label" style={{ color: p.color }}>{p.label}</div>
                <div className="zs-portal-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal-illustration fade-up-item">
          <img src="/unified.svg" alt="A unified platform" className="reveal-illustration-img" />
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
// Animation: Eyebrow + title type-in (typing only here), cards scale-in

type Billing = 'monthly' | 'annual';

const plans = [
  {
    name: 'Student',
    icon: GraduationCap,
    price: { monthly: 0, annual: 0 },
    color: '#d0c2d6',
    features: ['Join Courses', 'Submit Assignments', 'Track Attendance', 'Learning Progress Dashboard', 'Live Classes', 'Certificates', 'AI Tutor (Limited)', 'AI Quiz Practice (Limited)'],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Professional',
    icon: Zap,
    price: { monthly: 299, annual: 239 },
    color: '#d8bcea',
    features: ['Everything in Free', 'Unlimited AI Tutor', 'Unlimited AI Quiz Generation', 'AI Assignment Feedback', 'Personalized Learning Paths', 'Advanced Learning Analytics', 'Priority Support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Institution',
    icon: Building2,
    price: { monthly: 'Custom', annual: 'Custom' },
    color: '#f3b6cd',
    features: ['Everything in Professional', 'Teacher Management', 'Student Management', 'Admin Dashboard', 'Institution Analytics', 'Attendance Insights', 'Bulk User Management', 'Custom Branding', 'Dedicated Support'],
    cta: 'Contact Sales',
    popular: false,
  },
] as const;

function PricingPanel() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Billing>('monthly');

  return (
    <section className="reveal-section" data-anim="pricing">
      <div className="reveal-panel">
        <div className="reveal-panel-inner reveal-panel-inner--wide">
          <div className="zs-eyebrow fade-up-item">Pricing</div>
          <h2 className="zs-title type-target" data-text="Simple, Transparent Pricing">&nbsp;</h2>
          <div className="zs-billing-toggle fade-up-item">
            <button
              id="pricing-monthly-btn"
              className={`zs-billing-btn ${billing === 'monthly' ? 'zs-billing-btn--active' : ''}`}
              onClick={() => setBilling('monthly')}
            >Monthly</button>
            <button
              id="pricing-annual-btn"
              className={`zs-billing-btn ${billing === 'annual' ? 'zs-billing-btn--active' : ''}`}
              onClick={() => setBilling('annual')}
            >
              Annual <span className="zs-save-badge">Save 20%</span>
            </button>
          </div>
          <div className="zs-pricing-grid">
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              const price = plan.price[billing];
              return (
                <div
                  key={plan.name}
                  className={`zs-pricing-card scale-in-item ${plan.popular ? 'zs-pricing-card--popular' : ''}`}
                  style={{ '--plan-color': plan.color, '--delay': `${idx * 0.12}s` } as React.CSSProperties}
                >
                  {plan.popular && <div className="zs-popular-badge">✦ Most Popular</div>}
                  <Icon className="w-6 h-6 mb-3" style={{ color: plan.color }} />
                  <div className="zs-plan-name">{plan.name}</div>
                  <div className="zs-plan-price" style={{ color: plan.color }}>
                    {price === 0 ? 'Free' : typeof price === 'number' ? `₹${price}` : price}
                    {typeof price === 'number' && price > 0 && <span className="zs-plan-period">/mo</span>}
                  </div>
                  <ul className="zs-plan-features">
                    {plan.features.map((f) => (
                      <li key={f} className="zs-plan-feature">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/register')}
                    className={`zs-plan-cta ${plan.popular ? 'zs-plan-cta--popular' : ''}`}
                    style={plan.popular ? { background: plan.color } : { borderColor: `${plan.color}44`, color: plan.color }}
                    id={`pricing-${plan.name.toLowerCase()}-btn`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
// Animation: Glow pulse expands, title scales in from center

function CTAPanel() {
  const navigate = useNavigate();
  return (
    <section className="reveal-section reveal-section--cta" data-anim="cta">
      <div className="reveal-panel">
        <div className="reveal-panel-inner zs-cta-panel">
          <div className="zs-cta-glow cta-glow-anim" />
          <h2 className="zs-cta-title scale-in-item">
            Ready to transform<br />education?
          </h2>
          <p className="zs-cta-sub fade-up-item">
            Join thousands of forward-thinking institutions building the future of learning on ScholarHub.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="zs-cta-btn fade-up-item"
            id="cta-transform-btn"
          >
            Get Started Today
          </button>
          <p className="zs-cta-note fade-up-item">14-day free trial · No credit card required</p>
        </div>
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ZAxisScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {

      // ── PROBLEM: Line draw + fade-up stagger ──────────────────────────────
      const problemSection = containerRef.current!.querySelector('[data-anim="problem"]');
      if (problemSection) {
        const line = problemSection.querySelector('.reveal-line-draw');
        const fadeItems = problemSection.querySelectorAll('.fade-up-item');

        gsap.set(fadeItems, { opacity: 0, y: 50 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: problemSection, start: 'top 75%' }
        });
        if (line) {
          tl.to(line, { width: '80px', duration: 0.6, ease: 'power2.out' });
        }
        tl.to(fadeItems, {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out'
        }, '-=0.3');
      }

      // ── SOLUTION: Mask clip-path reveal + glitch blur ──────────────────────
      const solutionSection = containerRef.current!.querySelector('[data-anim="solution"]');
      if (solutionSection) {
        const clipItems = solutionSection.querySelectorAll('.mask-clip-item');
        const glitchItem = solutionSection.querySelector('.glitch-blur-item');

        gsap.set(clipItems, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', y: 30 });
        if (glitchItem) gsap.set(glitchItem, { filter: 'blur(8px) contrast(2)', opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: solutionSection, start: 'top 75%' }
        });
        tl.to(clipItems, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out'
        });
        if (glitchItem) {
          tl.to(glitchItem, {
            filter: 'blur(0px) contrast(1)',
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out'
          }, '-=0.4');
        }
      }

      // ── DASHBOARD: Scramble title + slide-in cards ────────────────────────
      const dashSection = containerRef.current!.querySelector('[data-anim="dashboard"]');
      if (dashSection) {
        const scrambleEl = dashSection.querySelector('.scramble-target') as HTMLElement | null;
        const slideItems = dashSection.querySelectorAll('.slide-in-left');
        const fadeItems = dashSection.querySelectorAll('.fade-up-item');

        gsap.set(slideItems, { opacity: 0, x: -60 });
        gsap.set(fadeItems, { opacity: 0, y: 30 });

        ScrollTrigger.create({
          trigger: dashSection,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            if (scrambleEl) {
              const finalText = scrambleEl.getAttribute('data-scramble') || '';
              scrambleText(scrambleEl, finalText, 1000);
            }
            gsap.to(fadeItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 });
            gsap.to(slideItems, {
              opacity: 1, x: 0, duration: 0.7, stagger: 0.13, ease: 'power3.out', delay: 0.4
            });
          }
        });
      }

      // ── PRICING: Typing title + scale-in cards ────────────────────────────
      const pricingSection = containerRef.current!.querySelector('[data-anim="pricing"]');
      if (pricingSection) {
        const typeEl = pricingSection.querySelector('.type-target') as HTMLElement | null;
        const scaleItems = pricingSection.querySelectorAll('.scale-in-item');
        const fadeItems = pricingSection.querySelectorAll('.fade-up-item');

        gsap.set(scaleItems, { opacity: 0, scale: 0.88, y: 20 });
        gsap.set(fadeItems, { opacity: 0, y: 30 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: pricingSection, start: 'top 75%' }
        });

        tl.to(fadeItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });

        if (typeEl) {
          const text = typeEl.getAttribute('data-text') || '';
          tl.to(typeEl, {
            text: { value: text, delimiter: '' },
            duration: text.length * 0.04,
            ease: 'none'
          }, 0.1);
        }

        tl.to(scaleItems, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: 'back.out(1.4)'
        }, '-=0.3');
      }

      // ── CTA: Glow expand + scale-in title + fade-up ───────────────────────
      const ctaSection = containerRef.current!.querySelector('[data-anim="cta"]');
      if (ctaSection) {
        const glowEl = ctaSection.querySelector('.cta-glow-anim');
        const scaleItems = ctaSection.querySelectorAll('.scale-in-item');
        const fadeItems = ctaSection.querySelectorAll('.fade-up-item');

        gsap.set(scaleItems, { opacity: 0, scale: 0.8 });
        gsap.set(fadeItems, { opacity: 0, y: 30 });
        if (glowEl) gsap.set(glowEl, { scale: 0.3, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: ctaSection, start: 'top 75%' }
        });

        if (glowEl) {
          tl.to(glowEl, { scale: 1.2, opacity: 1, duration: 1.2, ease: 'power2.out' });
        }
        tl.to(scaleItems, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.8');
        tl.to(fadeItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, '-=0.5');
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} aria-label="Scroll reveal content sections">
      <ProblemPanel />
      <SolutionPanel />
      <DashboardPanel />
      <PricingPanel />
      <CTAPanel />
    </div>
  );
}
