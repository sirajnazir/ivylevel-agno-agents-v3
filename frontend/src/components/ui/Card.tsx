'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'ivylevel';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  selected?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'ivylevel',
      padding = 'md',
      hoverable = false,
      selected = false,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-200 relative';

    // Ivylevel glassmorphism styles
    const ivylevelStyles = {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(100, 20, 50, 0.1)',
    };

    const variants = {
      default: 'bg-white border border-gray-200',
      elevated: 'bg-white border border-gray-200 shadow-lg',
      outlined: 'bg-transparent border-2 border-gray-300',
      glass: 'bg-white/50 backdrop-blur-xl border border-white/50',
      ivylevel: '', // Handled via inline styles
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyles = hoverable
      ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5'
      : '';

    // Ivylevel selected state
    const selectedStyles = selected
      ? variant === 'ivylevel'
        ? '' // Handled via inline styles for ivylevel
        : 'ring-2 ring-[#FF4A23] border-[#FF4A23]'
      : '';

    const ivylevelHoverStyles = hoverable && variant === 'ivylevel' ? {
      cursor: 'pointer',
    } : {};

    const ivylevelSelectedStyles = selected && variant === 'ivylevel' ? {
      border: '2px solid #FF4A23',
      background: 'linear-gradient(135deg, rgba(255, 74, 35, 0.1), rgba(255, 74, 35, 0.05))',
      boxShadow: '0 8px 32px rgba(254, 74, 34, 0.15)',
    } : {};

    const combinedStyles = variant === 'ivylevel'
      ? { ...ivylevelStyles, ...ivylevelHoverStyles, ...ivylevelSelectedStyles, ...style }
      : style;

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          hoverStyles,
          selectedStyles,
          className
        )}
        style={combinedStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Sub-components with Ivylevel styling
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, style, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold', className)}
      style={{ color: '#641432', fontFamily: 'Inter, sans-serif', ...style }}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, style, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm', className)}
      style={{ color: '#6b7280', ...style }}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
