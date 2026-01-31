'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Slider Component with Ivylevel Branding
 *
 * UNIVERSAL STYLING: Uses inline styles with brand colors to ensure
 * consistency across all frames and avoid dark-mode CSS variable conflicts.
 *
 * Brand Colors:
 * - Primary: #FF4A23 (ivy-primary orange)
 * - Secondary: #641432 (ivy-secondary maroon)
 * - Text: #374151 (gray-700)
 * - Muted: #6b7280 (gray-500)
 * - Light Muted: #9ca3af (gray-400)
 * - Track: #e5e7eb (gray-200)
 */

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hint?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  formatValue?: (value: number) => string;
  marks?: { value: number; label: string }[];
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      hint,
      showValue = true,
      valuePrefix = '',
      valueSuffix = '',
      formatValue,
      marks,
      min = 0,
      max = 100,
      step = 1,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const numValue = Number(value ?? min);
    const percentage = ((numValue - Number(min)) / (Number(max) - Number(min))) * 100;

    const displayValue = formatValue
      ? formatValue(numValue)
      : `${valuePrefix}${numValue}${valueSuffix}`;

    // Ivylevel brand colors
    const COLORS = {
      primary: '#FF4A23',      // ivy-primary orange
      secondary: '#641432',    // ivy-secondary maroon
      text: '#374151',         // gray-700
      muted: '#6b7280',        // gray-500
      lightMuted: '#9ca3af',   // gray-400
      track: '#e5e7eb',        // gray-200
      trackFill: '#FF4A23',    // ivy-primary for filled portion
    };

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-3">
            {label && (
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.secondary }}
              >
                {label}
              </label>
            )}
            {showValue && (
              <span
                className="text-lg font-semibold"
                style={{ color: COLORS.secondary }}
              >
                {displayValue}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            className={cn(
              'w-full h-2 rounded-full appearance-none cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Custom slider thumb styling with Ivylevel orange
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-5',
              '[&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-[#FF4A23]',
              '[&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-white',
              '[&::-webkit-slider-thumb]:shadow-lg',
              '[&::-webkit-slider-thumb]:transition-transform',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:w-5',
              '[&::-moz-range-thumb]:h-5',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-[#FF4A23]',
              '[&::-moz-range-thumb]:border-2',
              '[&::-moz-range-thumb]:border-white',
              '[&::-moz-range-thumb]:shadow-lg',
              className
            )}
            style={{
              // Gradient track: filled portion is orange, unfilled is light gray
              background: `linear-gradient(to right, ${COLORS.trackFill} 0%, ${COLORS.trackFill} ${percentage}%, ${COLORS.track} ${percentage}%, ${COLORS.track} 100%)`,
            }}
            {...props}
          />
          {marks && marks.length > 0 && (
            <div className="relative mt-2">
              {marks.map((mark) => {
                const markPercentage = ((mark.value - Number(min)) / (Number(max) - Number(min))) * 100;
                return (
                  <span
                    key={mark.value}
                    className="absolute text-xs transform -translate-x-1/2"
                    style={{
                      left: `${markPercentage}%`,
                      color: COLORS.lightMuted,
                    }}
                  >
                    {mark.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        {hint && (
          <p
            className="mt-2 text-sm"
            style={{ color: COLORS.muted }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
