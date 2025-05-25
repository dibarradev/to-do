import { useState } from 'react';
import type { LoginCredentials } from '../types';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ user: any; token: string }>;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  error: string | null;
}

function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Enhanced validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setFormError('Email format is not valid');
      return;
    }

    if (!password) {
      setFormError('Password is required');
      return;
    }

    // Send data to parent component
    try {
      setIsSubmitting(true);
      await onLogin({
        email: email.trim(),
        password,
      });
    } catch (err) {
      // Error will be handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setFormError(null); // Clear error when modifying
            }}
            placeholder="Email"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setFormError(null); // Clear error when modifying
            }}
            placeholder="Password"
            autoComplete="current-password"
          />
        </div>

        {(formError || error) && <div className="error-message">{formError || error}</div>}

        <button type="submit" className="auth-button" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="forgot-password">
          <button type="button" onClick={onForgotPassword} className="forgot-password-button">
            Forgot your password?
          </button>
        </div>
      </form>

      <div className="auth-switch">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="switch-button">
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
