import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

const API_URL = 'http://localhost:3001/api';

// Function to save token in localStorage
const saveToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Function to get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Function to remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Check if there's a saved token for automatic authentication
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Renew access token
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Include cookies for refresh token
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error renewing token');
    }

    const data = await response.json();

    // Save new token in localStorage
    saveToken(data.token);

    return data.token;
  } catch (error) {
    console.error('Error renewing token:', error);
    removeToken(); // If there's an error, remove current token
    return null;
  }
};

// Register a new user
export const register = async (userData: RegisterData): Promise<{ user: User; token: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      credentials: 'include', // To receive refresh token cookie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration error');
    }

    const data: AuthResponse = await response.json();

    // Save token in localStorage
    saveToken(data.token);

    return {
      user: data.user,
      token: data.token,
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Log in
export const login = async (
  credentials: LoginCredentials
): Promise<{ user: User; token: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // To receive refresh token cookie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login error');
    }

    const data: AuthResponse = await response.json();

    // Save token in localStorage
    saveToken(data.token);

    return {
      user: data.user,
      token: data.token,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// Log out
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // To send refresh token cookie
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    // Always remove local token
    removeToken();
  }
};

// Request password recovery
export const forgotPassword = async (
  email: string
): Promise<{ message: string; resetToken?: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error processing request');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error requesting password recovery:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (
  token: string,
  password: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error resetting password');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Verify current token and get user information
export const verifyToken = async (): Promise<User | null> => {
  try {
    const token = getToken();

    if (!token) {
      return null;
    }

    let response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // If token expired, try to renew it
    if (response.status === 401) {
      const newToken = await refreshToken();

      if (!newToken) {
        removeToken();
        return null;
      }

      // Retry with new token
      response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      removeToken(); // If token is not valid, remove it
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error verifying token:', error);
    removeToken(); // If there's any error, remove token
    return null;
  }
};
