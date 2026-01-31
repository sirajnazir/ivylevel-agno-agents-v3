/**
 * Button Component
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 */

'use client';

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      transform hover:scale-[1.02] active:scale-[0.98]
    `;

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    // Get variant-specific inline styles using BRAND_COLORS
    const getVariantStyles = (): CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: BRAND_COLORS.primary,
            color: 'white',
            boxShadow: BRAND_COLORS.shadowPrimary,
          };
        case 'secondary':
          return {
            backgroundColor: BRAND_COLORS.bgPrimary,
            color: BRAND_COLORS.textPrimary,
            border: `1px solid ${BRAND_COLORS.borderLight}`,
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: BRAND_COLORS.textSecondary,
          };
        case 'danger':
          return {
            backgroundColor: BRAND_COLORS.error,
            color: 'white',
          };
        case 'success':
          return {
            backgroundColor: BRAND_COLORS.success,
            color: 'white',
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: BRAND_COLORS.primary,
            border: `2px solid ${BRAND_COLORS.primary}`,
          };
        default:
          return {};
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        style={{ ...getVariantStyles(), ...style }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
