import { useState } from 'react';
import { resetPassword } from '../services/authService';
import './Auth.scss';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate password strength
  const isStrongPassword = (password: string): boolean => {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!password) {
      setFormError('Password is required');
      return;
    }

    if (!isStrongPassword(password)) {
      setFormError('Password must be at least 6 characters long and include letters and numbers');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    // Send request
    try {
      setIsSubmitting(true);
      await resetPassword(token, password);
      onSuccess();
    } catch (err: any) {
      setFormError(err.message || 'Error resetting password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="password">New Password</label>
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

        {formError && <div className="error-message">{formError}</div>}

        <button type="submit" className="auth-button" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
