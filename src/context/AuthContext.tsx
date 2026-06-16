import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
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
  completeRoleSelection: (role: UserRole, trackOrLevel?: 'college' | 'k12') => Promise<void>;
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

  // Guard: when login() or register() are in progress, suppress the concurrent
  // onAuthStateChange SIGNED_IN event so we don't double-dispatch.
  const isHandlingExplicitAuth = useRef(false);

  const loadSessionUser = useCallback(async (accessToken: string) => {
    console.log('[auth] loadSessionUser → fetching profile for session token');
    const profile = await authService.ensureProfileForSession();
    console.log('[auth] ensureProfileForSession →', profile ? `role=${profile.role}` : 'null profile');

    if (!profile?.role) {
      console.log('[auth] No role on profile → dispatching REQUIRE_ROLE_SELECTION');
      dispatch({ type: 'REQUIRE_ROLE_SELECTION', payload: { token: accessToken } });
      return;
    }

    const user = await authService.getMe();
    console.log('[auth] getMe →', { id: user.id, role: user.role, name: user.name });
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: accessToken } });
  }, []);

  useEffect(() => {
    let mounted = true;

    // ─── ONLY use onAuthStateChange for session restoration ──────────────────
    // Do NOT call getSession() separately — Supabase v2 fires INITIAL_SESSION
    // on mount which covers the persisted-session-restore case.  Calling both
    // causes a race where loadSessionUser() runs twice in parallel.
    // ─────────────────────────────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[auth] onAuthStateChange →', event, session ? `user=${session.user.id}` : 'no session');

      if (!mounted) {
        console.log('[auth] Component unmounted — ignoring event:', event);
        return;
      }

      // ── INITIAL_SESSION: fires on every page load / app boot ──────────────
      if (event === 'INITIAL_SESSION') {
        if (!session) {
          // No persisted session — user is logged out. Stop loading.
          console.log('[auth] INITIAL_SESSION → no session → user is logged out');
          dispatch({ type: 'SET_LOADING', payload: false });
        } else {
          // Restore session from storage (page refresh / browser reopen)
          console.log('[auth] INITIAL_SESSION → restoring session');
          try {
            await loadSessionUser(session.access_token);
          } catch (err) {
            console.error('[auth] INITIAL_SESSION restore error:', err);
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
        return;
      }

      // ── SIGNED_OUT ────────────────────────────────────────────────────────
      if (event === 'SIGNED_OUT') {
        console.log('[auth] SIGNED_OUT → dispatching LOGOUT');
        dispatch({ type: 'LOGOUT' });
        return;
      }

      // ── SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED ────────────────────────
      // Skip if an explicit login() / register() call is already handling this.
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (isHandlingExplicitAuth.current) {
          console.log('[auth]', event, '→ suppressed (explicit auth in progress)');
          return;
        }

        if (session) {
          console.log('[auth]', event, '→ loading session user');
          try {
            await loadSessionUser(session.access_token);
          } catch (err) {
            console.error('[auth]', event, 'error:', err);
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
        return;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadSessionUser]);

  const login = useCallback(async (email: string, password: string) => {
    console.log('[auth] login → starting for', email);
    dispatch({ type: 'SET_LOADING', payload: true });
    isHandlingExplicitAuth.current = true;
    try {
      const { user, token } = await authService.login({ email, password });
      console.log('[auth] login → success, user:', { id: user.id, role: user.role });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return user;
    } catch (err) {
      console.error('[auth] login → error:', err);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    } finally {
      // Release guard after a short tick so the concurrent SIGNED_IN event
      // (which fires synchronously from Supabase's signInWithPassword) is
      // already past the isHandlingExplicitAuth check before we clear it.
      setTimeout(() => {
        isHandlingExplicitAuth.current = false;
      }, 0);
    }
  }, []);

  const register = useCallback(async (data: Parameters<typeof authService.register>[0]) => {
    console.log('[auth] register → starting for', data.email);
    dispatch({ type: 'SET_LOADING', payload: true });
    isHandlingExplicitAuth.current = true;
    try {
      const { user, token } = await authService.register(data);
      console.log('[auth] register → success, user:', { id: user.id, role: user.role });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return user;
    } catch (err: any) {
      // Email confirmation required — not a real error, reset loading gently
      if (err?.code === 'EMAIL_CONFIRMATION_REQUIRED') {
        console.log('[auth] register → email confirmation required, resetting loading');
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        console.error('[auth] register → error:', err);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      throw err;
    } finally {
      setTimeout(() => {
        isHandlingExplicitAuth.current = false;
      }, 0);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('[auth] logout → signing out');
    dispatch({ type: 'SET_LOADING', payload: true });
    await authService.logout();
    // SIGNED_OUT event will fire from onAuthStateChange and dispatch LOGOUT
  }, []);

  const completeRoleSelection = useCallback(async (role: UserRole, trackOrLevel?: 'college' | 'k12') => {
    console.log('[auth] completeRoleSelection → role:', role, 'track:', trackOrLevel);
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
        grade_level: trackOrLevel === 'k12' ? 'k12' : trackOrLevel === 'college' ? 'college' : null,
      });

      const user = await authService.getMe();
      console.log('[auth] completeRoleSelection → profile created, user:', { id: user.id, role: user.role });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
    } catch (err) {
      console.error('[auth] completeRoleSelection → error:', err);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, []);

  const getAuthenticatedRedirectPath = useCallback(() => {
    if (state.requireRoleSelection) return '/onboarding/role-selection';
    const path = getDashboardPath(state.user);
    console.log('[auth] getAuthenticatedRedirectPath →', path);
    return path;
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
