import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconRight, className, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={clsx('form-input', error && 'error', className)}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {!isPassword && iconRight && (
            <span className="input-icon-right">{iconRight}</span>
          )}
        </div>
        {hint && !error && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hint}</p>
        )}
        {error && (
          <p className="form-error">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
