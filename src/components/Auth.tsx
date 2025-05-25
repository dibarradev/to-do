import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import type { LoginCredentials, RegisterData, User } from '../types';
import './Auth.scss';

interface AuthProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ user: User; token: string }>;
  onRegister: (userData: RegisterData) => Promise<{ user: User; token: string }>;
}

type AuthModeType = 'login' | 'register' | 'forgot-password' | 'reset-password';

function Auth({ onLogin, onRegister }: AuthProps) {
  const [mode, setMode] = useState<AuthModeType>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Handle user login
  const handleLogin = async (
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> => {
    setError(null);
    setLoading(true);

    try {
      const result = await onLogin(credentials);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error signing in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle user registration
  const handleRegister = async (userData: RegisterData): Promise<{ user: User; token: string }> => {
    setError(null);
    setLoading(true);

    try {
      const result = await onRegister(userData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error registering');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Switch to login mode
  const switchToLogin = () => {
    setMode('login');
    setError(null);
    setResetToken(null);
  };

  // Switch to register mode
  const switchToRegister = () => {
    setMode('register');
    setError(null);
  };

  // Switch to forgot password mode
  const switchToForgotPassword = () => {
    setMode('forgot-password');
    setError(null);
  };

  // Switch to reset password mode with the token
  const switchToResetPassword = (token: string) => {
    setResetToken(token);
    setMode('reset-password');
    setError(null);
  };

  // Handle successful password reset
  const handleResetSuccess = () => {
    switchToLogin();
  };

  return (
    <div className="auth-container">
      {loading && <div className="auth-loading">Loading...</div>}

      {mode === 'login' && (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={switchToRegister}
          onForgotPassword={switchToForgotPassword}
          error={error}
        />
      )}

      {mode === 'register' && (
        <RegisterForm onRegister={handleRegister} onSwitchToLogin={switchToLogin} error={error} />
      )}

      {mode === 'forgot-password' && (
        <ForgotPasswordForm
          onSwitchToLogin={switchToLogin}
          onResetPassword={switchToResetPassword}
        />
      )}

      {mode === 'reset-password' && resetToken && (
        <ResetPasswordForm token={resetToken} onSuccess={handleResetSuccess} />
      )}
    </div>
  );
}

export default Auth;
