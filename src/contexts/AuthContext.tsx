import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Auth } from '../modules/auth';
import type { UserSession } from '../modules/auth';

interface AuthContextType {
  userProfile: UserSession | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: Record<string, string>) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserSession | null>(Auth.getSession());
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes (handles page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in — load profile from Firestore
        const profile = await Auth.getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
          localStorage.setItem('ss_session', JSON.stringify(profile));
        } else {
          // Profile not found (edge case: auth exists but no Firestore profile)
          setUserProfile(null);
          localStorage.removeItem('ss_session');
        }
      } else {
        // User is signed out
        setUserProfile(null);
        localStorage.removeItem('ss_session');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: string) => {
    const result = await Auth.login(email, password, role);
    if (result.success && result.user) {
      setUserProfile(result.user);
    }
    return { success: result.success, message: result.message };
  };

  const register = async (userData: Record<string, string>) => {
    return Auth.register(userData);
  };

  const logout = async () => {
    await Auth.logout();
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ userProfile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
