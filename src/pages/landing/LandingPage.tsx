import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPageV2 from './LandingPageV2';

export function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("scholarhub-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("scholarhub-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <LandingPageV2 
      theme={theme}
      toggleTheme={toggleTheme}
      onGetStarted={() => navigate('/login')}
    />
  );
}
