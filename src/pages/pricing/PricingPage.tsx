import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PricingSection } from '../../components/Pricing';

export function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.user_type === 'school') {
      navigate(`/${user.role || 'student'}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  if (user?.user_type === 'school') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-surface text-on-surface transition-colors duration-300 flex flex-col justify-center py-12 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <PricingSection />
      </div>
    </div>
  );
}
