import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import type { User, UserRole } from '../types';
import { authService, getDashboardPath } from '../services/auth.service';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requireRoleSelection: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: Parameters<typeof authService.register>[0]) => Promise<User>;
  completeRoleSelection: (role: UserRole, teacherTrack?: 'college' | 'k12') => Promise<void>;
  getAuthenticatedRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REQUIRE_ROLE_SELECTION'; payload: { token: string } }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  requireRoleSelection: false,
};

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        requireRoleSelection: false,
      };
    case 'REQUIRE_ROLE_SELECTION':
      return {
        ...state,
        user: null,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        requireRoleSelection: true,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadSessionUser = useCallback(async (accessToken: string) => {
    const profile = await authService.ensureProfileForSession();
    if (!profile?.role) {
      dispatch({ type: 'REQUIRE_ROLE_SELECTION', payload: { token: accessToken } });
      return;
    }

    const user = await authService.getMe();
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: accessToken } });
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session) {
          if (mounted) dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        if (mounted) await loadSessionUser(session.access_token);
      } catch (err) {
        console.error('[auth.initialize.error]', err);
        if (mounted) dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session) {
        try {
          await loadSessionUser(session.access_token);
        } catch (err) {
          console.error('[auth.state_change.error]', err);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadSessionUser]);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { user, token } = await authService.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return user;
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const register = useCallback(async (data: Parameters<typeof authService.register>[0]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { user, token } = await authService.register(data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return user;
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await authService.logout();
  }, []);

  const completeRoleSelection = useCallback(async (role: UserRole, teacherTrack?: 'college' | 'k12') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) throw error || new Error('No active session');

      await authService.createProfile({
        id: session.user.id,
        email: session.user.email || null,
        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || null,
        avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
        role,
        grade_level: role === 'teacher' && teacherTrack === 'k12' ? 'k12' : null,
      });

      const user = await authService.getMe();
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const getAuthenticatedRedirectPath = useCallback(() => {
    if (state.requireRoleSelection) return '/onboarding/role-selection';
    return getDashboardPath(state.user);
  }, [state.requireRoleSelection, state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, completeRoleSelection, getAuthenticatedRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
