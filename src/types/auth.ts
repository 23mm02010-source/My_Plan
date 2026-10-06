export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface StoredUserAccount extends User {
  passwordHash: string; // Hash for local storage mode
}

export interface CloudDbStatus {
  isConnected: boolean;
  projectId?: string;
  provider: 'firebase' | 'local';
}
