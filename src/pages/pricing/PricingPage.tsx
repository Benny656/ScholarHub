import { PricingSection } from '../../components/Pricing';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-surface text-on-surface transition-colors duration-300 flex flex-col justify-center py-12 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <PricingSection />
      </div>
    </div>
  );
}
