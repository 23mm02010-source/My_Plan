import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, StoredUserAccount } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  allUsers: User[];
  quickLoginAsDefault: () => void;
}

const USERS_DB_KEY = 'planly_registered_accounts_v1';
const ACTIVE_SESSION_KEY = 'planly_current_session_uid_v1';

// Simple fast hash for client authentication
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hp_' + Math.abs(hash).toString(36) + '_' + btoa(password.slice(0, 3));
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const [allUsersList, setAllUsersList] = useState<User[]>([]);

  // Load registered users and active session on mount
  useEffect(() => {
    try {
      let accounts: StoredUserAccount[] = [];
      const storedDb = localStorage.getItem(USERS_DB_KEY);

      if (storedDb) {
        accounts = JSON.parse(storedDb);
      } else {
        // Seed default account for Shaik Roshan
        const defaultUser: StoredUserAccount = {
          id: 'user_shaik_001',
          name: 'Shaik Roshan',
          email: '23mm02010@iitbbs.ac.in',
          passwordHash: hashPassword('password123'),
          createdAt: new Date().toISOString()
        };
        accounts = [defaultUser];
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
      }

      setAllUsersList(accounts.map(({ passwordHash, ...u }) => u));

      // Check active session
      const activeUid = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (activeUid) {
        const found = accounts.find(a => a.id === activeUid);
        if (found) {
          const { passwordHash, ...userObj } = found;
          setAuthState({
            user: userObj,
            isAuthenticated: true,
            isLoading: false
          });
          return;
        }
      }
    } catch (e) {
      console.error('Failed to initialize auth system', e);
    }

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const storedDb = localStorage.getItem(USERS_DB_KEY);
      const accounts: StoredUserAccount[] = storedDb ? JSON.parse(storedDb) : [];

      const target = accounts.find(a => a.email.toLowerCase() === cleanEmail);
      if (!target) {
        return { success: false, error: 'No account found with this email. Please register first.' };
      }

      if (target.passwordHash !== hashPassword(password)) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      const { passwordHash, ...userObj } = target;
      localStorage.setItem(ACTIVE_SESSION_KEY, userObj.id);
      setAuthState({
        user: userObj,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (!cleanName) {
        return { success: false, error: 'Please enter your name.' };
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const storedDb = localStorage.getItem(USERS_DB_KEY);
      const accounts: StoredUserAccount[] = storedDb ? JSON.parse(storedDb) : [];

      if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const newUser: StoredUserAccount = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        email: cleanEmail,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };

      accounts.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
      setAllUsersList(accounts.map(({ passwordHash, ...u }) => u));

      // Auto login newly registered user
      const { passwordHash, ...userObj } = newUser;
      localStorage.setItem(ACTIVE_SESSION_KEY, userObj.id);
      setAuthState({
        user: userObj,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  const quickLoginAsDefault = useCallback(() => {
    login('23mm02010@iitbbs.ac.in', 'password123');
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        login,
        register,
        logout,
        allUsers: allUsersList,
        quickLoginAsDefault
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
