import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import type { User, AuthState, UserRole } from '../types';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabase';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: Parameters<typeof authService.register>[0]) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
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
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize and listen to auth state changes
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const user = await authService.getMe();
          if (mounted) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
          }
        } else {
          if (mounted) {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } catch (err) {
        console.error('Error getting initial session', err);
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const user = await authService.getMe();
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
        } catch (err) {
          console.error('Error fetching user profile after sign in', err);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // supabase.auth.onAuthStateChange will catch the successful login
      await authService.login({ email, password, role });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const register = useCallback(async (data: Parameters<typeof authService.register>[0]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.register(data);
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
