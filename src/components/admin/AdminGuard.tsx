import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { AppLoading } from '../ui/AppLoading';
import { ADMIN_EMAILS } from '../../services/auth.service';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState(Date.now());

  const userEmail = user?.email?.toLowerCase();
  const isAdminEmail = userEmail && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail);
  const isAdmin = user?.role === 'admin' || isAdminEmail;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/scholar-hub-admin-panel/login', { replace: true });
    } else if (!isAdmin) {
      navigate('/404', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, isAdmin]);

  // Session expiry: 2 hours of inactivity
  useEffect(() => {
    if (isLoading || !isAuthenticated || !isAdmin) return;

    const maxInactivity = 2 * 60 * 60 * 1000; // 2 hours

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Listen to user interactions
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > maxInactivity) {
        logout().then(() => {
          toast.error('Session expired due to 2 hours of inactivity.');
          navigate('/scholar-hub-admin-panel/login', { replace: true });
        });
      }
    }, 15000); // Check every 15 seconds

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, [lastActivity, isAuthenticated, user, isLoading, navigate, logout]);

  if (isLoading) {
    return <AppLoading />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
