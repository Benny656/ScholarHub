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
    <div className="space-y-6">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6">
        <PricingSection />
      </div>
    </div>
  );
}
