import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Building2, GraduationCap, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMagnetic } from '../hooks/useMagnetic';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Student',
    icon: GraduationCap,
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for individual students and lifelong learners.',
    color: 'secondary',
    textColor: 'text-secondary',
    glowColor: 'rgba(208,194,214,0.15)',
    features: [
      'Join Courses',
      'Submit Assignments',
      'Track Attendance',
      'Learning Progress Dashboard',
      'Live Classes',
      'Certificates',
      'AI Tutor (Limited)',
      'AI Quiz Practice (Limited)',
    ],
    cta: 'Get Started Free',
    popular: false,
    disabled: false,
  },
  {
    name: 'Professional',
    icon: Zap,
    price: { monthly: 299, annual: 2388 },
    description: 'For serious learners and educators who want the full AI-powered experience.',
    color: 'primary',
    textColor: 'text-primary',
    glowColor: 'rgba(216,188,234,0.2)',
    features: [
      'Everything in Free',
      'Unlimited AI Tutor',
      'Unlimited AI Quiz Generation',
      'AI Assignment Feedback',
      'Personalized Learning Paths',
      'Advanced Learning Analytics',
      'Priority Support',
    ],
    cta: 'Start Free Trial',
    popular: true,
    disabled: false,
  },
  {
    name: 'Institution',
    icon: Building2,
    price: { monthly: 0, annual: 0 },
    description: 'Built for schools, colleges, academies, and training organizations.',
    color: 'tertiary',
    textColor: 'text-tertiary',
    glowColor: 'rgba(200,180,240,0.15)',
    features: [
      'Everything in Professional',
      'Teacher Management',
      'Student Management',
      'Admin Dashboard',
      'Institution Analytics',
      'Attendance Insights',
      'Bulk User Management',
      'Custom Branding',
      'Dedicated Support',
    ],
    cta: 'Contact Sales',
    popular: false,
    disabled: false,
    customPrice: 'Custom',
  },
] as const;

type Billing = 'monthly' | 'annual';

/* ── Individual card ── */
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
  const displayPrice = 'customPrice' in plan ? plan.customPrice : (price === 0 ? 'Free' : `₹${price}`);

  return (
    <motion.div
      variants={variants}
      className={`relative flex flex-col glass rounded-[2rem] p-8 transition-all duration-300 reveal stagger-1 ${
        plan.popular
          ? 'ring-2 ring-primary/40 shadow-2xl shadow-primary/20 md:scale-[1.06] border-primary/30 bg-surface-container-high/60'
          : 'border-outline-variant/20 bg-surface-container-low/50 hover:scale-[1.02]'
      }`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-primary text-on-primary rounded-full text-sm font-semibold shadow-lg shadow-primary/30 whitespace-nowrap">
          ✦ Featured / Most Popular
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
              {displayPrice}
            </span>
            {typeof price === 'number' && price > 0 && (
              <span className="text-on-surface-variant font-body-md mb-1.5">/mo</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Annual discount note for Professional plan */}
      {plan.name === 'Professional' && billing === 'annual' && (
        <div className="text-xs text-primary font-semibold mb-6 px-3 py-2 bg-primary/10 rounded-lg">
          Save 20% with annual billing (₹2,388/year)
        </div>
      )}

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
          onClick={go}
          className={`w-full py-3.5 rounded-full font-body-md font-semibold transition-all ripple-btn shimmer-btn ${
            plan.popular
              ? 'bg-primary text-on-primary shadow-xl shadow-primary/30 hover:scale-[1.03] active:scale-[0.98]'
              : 'glass border border-outline-variant/30 text-on-surface hover:border-primary/40 hover:text-primary hover:scale-[1.03] active:scale-[0.98]'
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

  const handleAction = (planName: string) => {
    if (planName === 'Student') {
      navigate('/signup');
    } else if (planName === 'Professional') {
      toast.success('Redirecting to free trial...');
      navigate('/signup');
    } else if (planName === 'Institution') {
      toast.success('Thank you for your interest! Our sales team will contact you shortly.');
    } else {
      navigate('/register');
    }
  };

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
    <section id="pricing" className="py-20 px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <h2 className="font-headline-lg text-4xl md:text-6xl mb-6 text-on-surface">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto mb-10">
            Choose the plan that suits your needs. Transition or upgrade anytime.
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

        {/* Pricing cards grid - 3 columns */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto mb-16"
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
              go={() => handleAction(plan.name)}
              variants={itemVariants}
            />
          ))}
        </motion.div>

        {/* Trust message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-body-md text-on-surface-variant text-sm opacity-70">
            Trusted by students, educators, and institutions building the future of learning.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
