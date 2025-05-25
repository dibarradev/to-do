import { useState } from 'react';
import type { RegisterData } from '../types';

interface RegisterFormProps {
  onRegister: (userData: RegisterData) => Promise<{ user: any; token: string }>;
  onSwitchToLogin: () => void;
  error: string | null;
}

function RegisterForm({ onRegister, onSwitchToLogin, error }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validators
  const isValidEmail = (email: string): boolean => {
    // Updated regex to support plus addressing (user+tag@domain.com)
    const emailRegex = /^[^\s@]+(\+[^\s@]*)?@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password: string): boolean => {
    // At least 6 characters, with at least one letter and one number
    return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  };

  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Username is required';
    }

    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters long';
    }

    if (!email.trim()) {
      return 'Email is required';
    }

    if (!isValidEmail(email.trim())) {
      return 'Email format is not valid';
    }

    if (!password) {
      return 'Password is required';
    }

    if (!isStrongPassword(password)) {
      return 'Password must be at least 6 characters long and include letters and numbers';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    // Send data to parent component
    try {
      setIsSubmitting(true);
      await onRegister({
        username: username.trim(),
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
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              setFormError(null);
            }}
            placeholder="Username (minimum 3 characters)"
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setFormError(null);
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
              setFormError(null);
            }}
            placeholder="Password (minimum 6 characters with letters and numbers)"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value);
              setFormError(null);
            }}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </div>

        {(formError || error) && <div className="error-message">{formError || error}</div>}

        <button type="submit" className="auth-button" disabled={isSubmitting}>
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="switch-button">
          Sign In
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
