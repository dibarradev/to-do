// Define the Subtask interface
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// Define the Task interface
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Subtask[];
  comment?: string;
  userId: string;
}

// Define the filter types
export type FilterType = 'all' | 'active' | 'completed';

// Define the User interface
export interface User {
  id: string;
  username: string;
  email: string;
}

// Define the Auth State interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Define login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Define register data interface
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Define auth response interface
export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  token: string;
}
