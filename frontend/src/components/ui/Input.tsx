'use client';

import { forwardRef, type InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftElement,
      rightElement,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = !!error;

    const inputStyles: React.CSSProperties = {
      width: '100%',
      padding: '12px 16px',
      paddingLeft: leftElement ? '40px' : '16px',
      paddingRight: rightElement ? '40px' : '16px',
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: hasError
        ? '2px solid #dc2626'
        : isFocused
        ? '2px solid #FF4A23'
        : '1px solid #d1d5db',
      color: '#374151',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxShadow: isFocused && !hasError
        ? '0 0 0 3px rgba(255, 74, 35, 0.15)'
        : hasError
        ? '0 0 0 3px rgba(220, 38, 38, 0.15)'
        : 'none',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#641432' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#9ca3af' }}
            >
              {leftElement}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={inputStyles}
            className={cn(
              'placeholder:text-gray-400',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#9ca3af' }}
            >
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm" style={{ color: '#dc2626' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm" style={{ color: '#9ca3af' }}>{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
