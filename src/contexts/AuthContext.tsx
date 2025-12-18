import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Update localStorage for backward compatibility
        if (currentSession?.user) {
          localStorage.setItem('hasAccount', 'true');
          if (currentSession.user.email) {
            localStorage.setItem('userEmail', currentSession.user.email);
          }
          if (currentSession.user.user_metadata?.full_name) {
            localStorage.setItem('userName', currentSession.user.user_metadata.full_name);
          }
        }
      } catch (error) {
        logger.error('Error getting auth session', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update localStorage
      if (session?.user) {
        localStorage.setItem('hasAccount', 'true');
        if (session.user.email) {
          localStorage.setItem('userEmail', session.user.email);
        }
        if (session.user.user_metadata?.full_name) {
          localStorage.setItem('userName', session.user.user_metadata.full_name);
        }
      } else {
        // Clear user data on sign out (but keep hasAccount for skip functionality)
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      // Keep hasAccount to prevent splash/signup from showing again
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
