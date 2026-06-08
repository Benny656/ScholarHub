import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Building2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMagnetic } from '../hooks/useMagnetic';

const plans = [
  {
    name: 'Student',
    icon: GraduationCap,
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for individual learners getting started with AI-powered education.',
    color: 'secondary',
    textColor: 'text-secondary',
    glowColor: 'rgba(208,194,214,0.15)',
    features: [
      'Access to 50+ free courses',
      'AI Tutor (10 sessions / month)',
      'Progress tracking dashboard',
      'Community forum access',
      'Mobile app access',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    icon: Zap,
    price: { monthly: 299, annual: 239 },
    description: 'For serious learners who want the full AI-powered experience, unlocked.',
    color: 'primary',
    textColor: 'text-primary',
    glowColor: 'rgba(216,188,234,0.2)',
    features: [
      'Unlimited course access',
      'AI Tutor (unlimited)',
      'Live classroom sessions',
      'Smart assignment grading',
      'Blockchain certificates',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Institution',
    icon: Building2,
    price: { monthly: 999, annual: 799 },
    description: 'Built for schools, universities, and forward-thinking enterprises.',
    color: 'tertiary',
    textColor: 'text-tertiary',
    glowColor: 'rgba(243,182,205,0.15)',
    features: [
      'Everything in Pro',
      'Admin console & analytics',
      'SSO integration',
      'Attendance biometrics',
      'Custom branding',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
] as const;

type Billing = 'monthly' | 'annual';

/* ── Individual card — owns its magnetic hook ── */
function PricingCard({
  plan,
  billing,
  go,
  variants,
}: {
  plan: (typeof plans)[number];
  billing: Billing;
  go: () => void;
  variants: object;
}) {
  const { ref, magnetStyle, handleMouseMove, handleMouseLeave } = useMagnetic(0.28);
  const Icon = plan.icon;
  const price = plan.price[billing];

  return (
    <motion.div
      variants={variants}
      className={`relative flex flex-col glass rounded-[2rem] p-8 transition-all duration-300 reveal stagger-1 ${
        plan.popular
          ? 'ring-2 ring-primary/40 shadow-2xl shadow-primary/20 md:scale-[1.04] border-primary/30 bg-surface-container-high/60'
          : 'border-outline-variant/20 bg-surface-container-low/50 hover:scale-[1.02]'
      }`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-primary text-on-primary rounded-full text-sm font-semibold shadow-lg shadow-primary/30 whitespace-nowrap">
          ✦ Most Popular
        </div>
      )}

      {/* Icon + name */}
      <div className={`w-12 h-12 rounded-xl bg-${plan.color}/10 flex items-center justify-center ${plan.textColor} mb-5`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-headline-md text-2xl text-on-surface mb-1">{plan.name}</h3>
      <p className="font-body-md text-on-surface-variant mb-6 leading-relaxed text-sm">{plan.description}</p>

      {/* Price with animated swap */}
      <div className="mb-8 h-16 flex items-end gap-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${plan.name}-${billing}`}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.22 }}
            className="flex items-end gap-1"
          >
            <span className={`text-5xl font-bold ${plan.textColor}`}>
              {price === 0 ? 'Free' : `₹${price}`}
            </span>
            {price > 0 && (
              <span className="text-on-surface-variant font-body-md mb-1.5">/mo</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feature list */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className={`mt-0.5 w-5 h-5 rounded-full bg-${plan.color}/10 flex items-center justify-center flex-shrink-0`}>
              <Check className={`w-3 h-3 ${plan.textColor}`} />
            </div>
            <span className="font-body-md text-on-surface-variant text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Magnetic CTA button */}
      <div
        ref={ref}
        style={magnetStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={() => navigate('/register')}
          className={`w-full py-3.5 rounded-full font-body-md font-semibold transition-all hover:scale-105 active:scale-95 ripple-btn shimmer-btn ${
            plan.popular
              ? 'bg-primary text-on-primary shadow-xl shadow-primary/30'
              : 'glass border border-outline-variant/30 text-on-surface hover:border-primary/40 hover:text-primary'
          }`}
        >
          {plan.cta}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Pricing section ── */
export function PricingSection() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Billing>('monthly');
  const go = () => navigate('/register');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7 },
    },
  };

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <h2 className="font-headline-lg text-4xl md:text-6xl mb-6 text-on-surface">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto mb-10">
            No hidden fees. No lock-ins. Choose the plan that grows with you.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center glass rounded-full p-1 border border-outline-variant/20">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full font-body-md font-semibold text-sm transition-all duration-300 ${
                billing === 'monthly'
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2 rounded-full font-body-md font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Annual
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-300 ${
                billing === 'annual'
                  ? 'bg-on-primary/20 text-on-primary'
                  : 'bg-primary/15 text-primary'
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              billing={billing}
              go={go}
              variants={itemVariants}
            />
          ))}
        </motion.div>

        {/* Footer note */}
        <p className="text-center font-body-md text-on-surface-variant text-sm mt-12 opacity-60">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
