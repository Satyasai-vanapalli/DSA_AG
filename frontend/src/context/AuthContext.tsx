import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { usersApi } from '../api/users';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  adminCategories?: string[];
  profilePictureUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (_newToken: string, newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    if (user) {
      try {
        await usersApi.logout();
      } catch (e) {
        console.error('Logout ping failed', e);
      }
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    // document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // The backend handles clearing the cookie ideally, but for now we just redirect
    window.location.href = '/login';
  };

  useEffect(() => {
    if (!user) return;

    const TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

    const checkActivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const timeSinceActive = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceActive > TIMEOUT_MS) {
          logout();
        } else if (timeSinceActive < 65000) {
          // If active in the last ~minute, ping backend
          usersApi.ping().catch(console.error);
        }
      }
    };

    // Check immediately on load
    checkActivity();
    
    // Set initial activity
    if (!localStorage.getItem('lastActivity')) {
      localStorage.setItem('lastActivity', Date.now().toString());
    }

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const throttledUpdate = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          updateActivity();
          timeoutId = null;
        }, 5000); // Throttle updates to every 5 seconds
      }
    };

    const intervalId = setInterval(checkActivity, 60000); // Check every minute

    window.addEventListener('mousemove', throttledUpdate);
    window.addEventListener('keydown', throttledUpdate);
    window.addEventListener('click', throttledUpdate);
    window.addEventListener('scroll', throttledUpdate);
    window.addEventListener('auth-error', logout);

    return () => {
      window.removeEventListener('mousemove', throttledUpdate);
      window.removeEventListener('keydown', throttledUpdate);
      window.removeEventListener('click', throttledUpdate);
      window.removeEventListener('scroll', throttledUpdate);
      window.removeEventListener('auth-error', logout);
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
