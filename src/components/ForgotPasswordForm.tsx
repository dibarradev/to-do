import { useState } from 'react';
import { forgotPassword } from '../services/authService';
import './Auth.scss';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onResetPassword: (token: string) => void;
}

function ForgotPasswordForm({ onSwitchToLogin, onResetPassword }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setFormError('Email format is not valid');
      return;
    }

    // Send request
    try {
      setIsSubmitting(true);
      const response = await forgotPassword(email.trim());

      // If a token is returned, go directly to the reset page
      if (response.resetToken) {
        onResetPassword(response.resetToken);
      } else {
        // Show message indicating that the token has been generated
        setIsSuccess(true);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error processing request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Recover Password</h2>

      {isSuccess ? (
        <div className="success-message">
          <p>
            A reset token has been generated for your account. Please contact the system
            administrator to obtain the token and reset your password.
          </p>
          <button type="button" onClick={onSwitchToLogin} className="auth-button">
            Back to Sign In
          </button>
        </div>
      ) : (
        <>
          <p className="form-info">
            Enter your email address to generate a new password if the account exists.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
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

            {formError && <div className="error-message">{formError}</div>}

            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Generating new password...' : 'Generate new password'}
            </button>
          </form>

          <div className="auth-switch">
            <button type="button" onClick={onSwitchToLogin} className="switch-button">
              Back to Sign In
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ForgotPasswordForm;
