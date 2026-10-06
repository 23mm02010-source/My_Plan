import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, StoredUserAccount, CloudDbStatus } from '../types/auth';
import {
  initFirebase,
  isFirebaseConfigured,
  getActiveFirebaseConfig,
  saveCustomConfig,
  clearCustomConfig,
  FirebaseConfigParams
} from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCloudConnected: boolean;
  cloudStatus: CloudDbStatus;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  allUsers: User[];
  quickLoginAsDefault?: () => void;
  saveCloudConfig: (config: FirebaseConfigParams) => Promise<{ success: boolean; error?: string }>;
  resetCloudConfig: () => void;
}

const USERS_DB_KEY = 'planly_registered_accounts_v1';
const ACTIVE_SESSION_KEY = 'planly_current_session_uid_v1';

// Fast local hash for offline accounts
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
  const [cloudStatus, setCloudStatus] = useState<CloudDbStatus>({
    isConnected: false,
    provider: 'local'
  });

  // Track Firebase instances
  const [fbInstance, setFbInstance] = useState(() => initFirebase());

  // Determine cloud connection status
  useEffect(() => {
    const configured = isFirebaseConfigured();
    const activeCfg = getActiveFirebaseConfig();
    setCloudStatus({
      isConnected: configured && Boolean(fbInstance.auth),
      projectId: activeCfg?.projectId,
      provider: configured && fbInstance.auth ? 'firebase' : 'local'
    });
  }, [fbInstance]);

  // Handle Firebase auth listener or Local Auth fallback
  useEffect(() => {
    if (cloudStatus.isConnected && fbInstance.auth) {
      // Firebase Cloud Auth is active
      const unsubscribe = onAuthStateChanged(fbInstance.auth, async (fbUser) => {
        if (fbUser) {
          let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';

          // Try fetching extra user metadata from Firestore
          if (fbInstance.db) {
            try {
              const userDocRef = doc(fbInstance.db, 'users', fbUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                const data = userSnap.data();
                if (data.name) displayName = data.name;
              }
            } catch (err) {
              console.warn('Could not read user profile from Firestore:', err);
            }
          }

          const userObj: User = {
            id: fbUser.uid,
            name: displayName,
            email: fbUser.email || '',
            createdAt: fbUser.metadata.creationTime || new Date().toISOString()
          };

          setAuthState({
            user: userObj,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      });

      return () => unsubscribe();
    } else {
      // Local Storage Fallback Mode
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
        console.error('Failed to initialize local auth system', e);
      }

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, [cloudStatus.isConnected, fbInstance]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    if (cloudStatus.isConnected && fbInstance.auth) {
      try {
        const cred = await signInWithEmailAndPassword(fbInstance.auth, cleanEmail, password);
        const fbUser = cred.user;
        const userObj: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || cleanEmail,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString()
        };

        setAuthState({
          user: userObj,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } catch (err: any) {
        console.error('Firebase login error:', err);
        let msg = 'Failed to sign in. Please verify your credentials.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = 'Incorrect email or password. Please try again.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Invalid email address format.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Too many failed attempts. Please try again in a few minutes.';
        }
        return { success: false, error: msg };
      }
    }

    // Local Auth Mode
    try {
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
  }, [cloudStatus.isConnected, fbInstance]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (cloudStatus.isConnected && fbInstance.auth) {
      try {
        const cred = await createUserWithEmailAndPassword(fbInstance.auth, cleanEmail, password);
        const fbUser = cred.user;

        // Set display name in Firebase Auth
        await updateProfile(fbUser, { displayName: cleanName });

        // Save user record to Cloud Firestore
        if (fbInstance.db) {
          try {
            await setDoc(doc(fbInstance.db, 'users', fbUser.uid), {
              uid: fbUser.uid,
              name: cleanName,
              email: cleanEmail,
              createdAt: new Date().toISOString()
            });
          } catch (docErr) {
            console.warn('Could not write user record to Firestore:', docErr);
          }
        }

        const userObj: User = {
          id: fbUser.uid,
          name: cleanName,
          email: cleanEmail,
          createdAt: new Date().toISOString()
        };

        setAuthState({
          user: userObj,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true };
      } catch (err: any) {
        console.error('Firebase registration error:', err);
        let msg = 'Registration failed.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'An account with this email already exists. Please log in.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password is too weak. Please use at least 6 characters.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Invalid email address.';
        }
        return { success: false, error: msg };
      }
    }

    // Local Auth Mode
    try {
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
  }, [cloudStatus.isConnected, fbInstance]);

  const logout = useCallback(async () => {
    if (cloudStatus.isConnected && fbInstance.auth) {
      try {
        await signOut(fbInstance.auth);
      } catch (err) {
        console.error('Sign out error:', err);
      }
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, [cloudStatus.isConnected, fbInstance]);

  const quickLoginAsDefault = useCallback(() => {
    login('23mm02010@iitbbs.ac.in', 'password123');
  }, [login]);

  const saveCloudConfig = useCallback(async (config: FirebaseConfigParams): Promise<{ success: boolean; error?: string }> => {
    try {
      saveCustomConfig(config);
      const newFb = initFirebase();
      setFbInstance(newFb);
      if (newFb.auth && newFb.db) {
        setCloudStatus({
          isConnected: true,
          projectId: config.projectId,
          provider: 'firebase'
        });
        return { success: true };
      } else {
        return { success: false, error: 'Firebase initialization returned empty. Please verify your keys.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to initialize Firebase with these credentials.' };
    }
  }, []);

  const resetCloudConfig = useCallback(() => {
    clearCustomConfig();
    const fallbackFb = initFirebase();
    setFbInstance(fallbackFb);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        isCloudConnected: cloudStatus.isConnected,
        cloudStatus,
        login,
        register,
        logout,
        allUsers: allUsersList,
        quickLoginAsDefault,
        saveCloudConfig,
        resetCloudConfig
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
