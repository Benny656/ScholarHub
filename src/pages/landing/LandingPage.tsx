import { useNavigate } from 'react-router-dom';
import LandingPageV2 from './LandingPageV2';
import { useTheme } from '../../hooks/useTheme';

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <LandingPageV2 
      theme={theme}
      toggleTheme={toggleTheme}
      onGetStarted={() => navigate('/login')}
    />
  );
}
