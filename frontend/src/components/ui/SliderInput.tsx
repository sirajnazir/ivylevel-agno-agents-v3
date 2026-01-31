'use client';

import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { inputLogger } from '@/lib/trace';

// ============================================
// Types
// ============================================

export interface SliderMark {
  value: number;
  label: string;
}

export interface SliderInputProps {
  id: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: SliderMark[];
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  showMinMax?: boolean;
  variant?: 'default' | 'gpa' | 'score' | 'hours' | 'percentage';
  colorScale?: 'neutral' | 'green-to-red' | 'red-to-green' | 'blue-gradient';
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  frameId?: number;
  trackHeight?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

// ============================================
// Preset Configurations
// ============================================

const VARIANT_CONFIGS: Record<
  string,
  {
    min: number;
    max: number;
    step: number;
    marks?: SliderMark[];
    valueFormat: (v: number) => string;
    colorScale: SliderInputProps['colorScale'];
  }
> = {
  gpa: {
    min: 0,
    max: 4.0,
    step: 0.1,
    marks: [
      { value: 0, label: '0.0' },
      { value: 2.0, label: '2.0' },
      { value: 3.0, label: '3.0' },
      { value: 3.5, label: '3.5' },
      { value: 4.0, label: '4.0' },
    ],
    valueFormat: (v) => v.toFixed(2),
    colorScale: 'red-to-green',
  },
  score: {
    min: 400,
    max: 1600,
    step: 10,
    marks: [
      { value: 400, label: '400' },
      { value: 800, label: '800' },
      { value: 1200, label: '1200' },
      { value: 1400, label: '1400' },
      { value: 1600, label: '1600' },
    ],
    valueFormat: (v) => v.toString(),
    colorScale: 'red-to-green',
  },
  hours: {
    min: 0,
    max: 40,
    step: 1,
    marks: [
      { value: 0, label: '0h' },
      { value: 10, label: '10h' },
      { value: 20, label: '20h' },
      { value: 30, label: '30h' },
      { value: 40, label: '40h' },
    ],
    valueFormat: (v) => `${v}h`,
    colorScale: 'blue-gradient',
  },
  percentage: {
    min: 0,
    max: 100,
    step: 1,
    valueFormat: (v) => `${v}%`,
    colorScale: 'blue-gradient',
  },
  default: {
    min: 0,
    max: 100,
    step: 1,
    valueFormat: (v) => v.toString(),
    colorScale: 'neutral',
  },
};

// ============================================
// Color Utilities
// ============================================

function getTrackGradient(colorScale: SliderInputProps['colorScale'], percentage: number): string {
  switch (colorScale) {
    case 'green-to-red':
      return `linear-gradient(90deg,
        var(--success-green) 0%,
        var(--warning-amber) 50%,
        var(--error-red) 100%)`;
    case 'red-to-green':
      return `linear-gradient(90deg,
        var(--error-red) 0%,
        var(--warning-amber) 50%,
        var(--success-green) 100%)`;
    case 'blue-gradient':
      return `linear-gradient(90deg,
        var(--primary-blue) 0%,
        var(--info-cyan) 100%)`;
    default:
      return 'var(--primary-blue)';
  }
}

function getThumbColor(colorScale: SliderInputProps['colorScale'], percentage: number): string {
  switch (colorScale) {
    case 'green-to-red':
      if (percentage > 66) return 'var(--error-red)';
      if (percentage > 33) return 'var(--warning-amber)';
      return 'var(--success-green)';
    case 'red-to-green':
      if (percentage > 66) return 'var(--success-green)';
      if (percentage > 33) return 'var(--warning-amber)';
      return 'var(--error-red)';
    case 'blue-gradient':
      return percentage > 50 ? 'var(--info-cyan)' : 'var(--primary-blue)';
    default:
      return 'var(--primary-blue)';
  }
}

// ============================================
// SliderInput Component
// ============================================

export function SliderInput({
  id,
  label,
  value,
  onChange,
  min: propMin,
  max: propMax,
  step: propStep,
  marks: propMarks,
  showValue = true,
  valueFormat: propValueFormat,
  showMinMax = true,
  variant = 'default',
  colorScale: propColorScale,
  hint,
  error,
  disabled = false,
  className,
  frameId,
  trackHeight = 'md',
  showTooltip = true,
}: SliderInputProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltipValue, setShowTooltipValue] = useState(false);
  const previousValueRef = useRef(value);

  // Get config from variant or props
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.default;
  const min = propMin ?? config.min;
  const max = propMax ?? config.max;
  const step = propStep ?? config.step;
  const marks = propMarks ?? config.marks;
  const valueFormat = propValueFormat ?? config.valueFormat;
  const colorScale = propColorScale ?? config.colorScale;

  // Calculate percentage
  const percentage = useMemo(() => {
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  // Track heights
  const trackHeightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  // Handle value change with snapping
  const handleChange = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const rawPercent = x / rect.width;
      const rawValue = min + rawPercent * (max - min);

      // Snap to step
      const snappedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, snappedValue));

      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    },
    [disabled, min, max, step, value, onChange]
  );

  // Mouse/Touch handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      setShowTooltipValue(true);
      handleChange(e.clientX);
    },
    [disabled, handleChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      handleChange(e.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setShowTooltipValue(false);

      // Log the change
      if (previousValueRef.current !== value) {
        inputLogger.logSliderChange(id, previousValueRef.current, value, min, max);
        previousValueRef.current = value;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handleChange, id, value, min, max]);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      let newValue = value;
      const largeStep = step * 10;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(max, value + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(min, value - step);
          break;
        case 'PageUp':
          newValue = Math.min(max, value + largeStep);
          break;
        case 'PageDown':
          newValue = Math.max(min, value - largeStep);
          break;
        case 'Home':
          newValue = min;
          break;
        case 'End':
          newValue = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      if (newValue !== value) {
        onChange(newValue);
        inputLogger.logSliderChange(id, value, newValue, min, max);
      }
    },
    [disabled, value, step, min, max, onChange, id]
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Value */}
      <div className="flex items-center justify-between mb-3">
        {label && (
          <label className="text-sm font-medium text-text-secondary">{label}</label>
        )}
        {showValue && (
          <motion.span
            key={value}
            initial={{ scale: 1 }}
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className={cn(
              'text-lg font-mono font-semibold',
              error ? 'text-error-red' : 'text-text-primary'
            )}
          >
            {valueFormat(value)}
          </motion.span>
        )}
      </div>

      {/* Slider Track */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative w-full rounded-full cursor-pointer select-none',
          trackHeightClasses[trackHeight],
          'bg-background-elevated',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue'
        )}
      >
        {/* Filled Track */}
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-75')}
          style={{
            width: `${percentage}%`,
            background: getTrackGradient(colorScale, percentage),
          }}
        />

        {/* Marks */}
        {marks && (
          <div className="absolute inset-0">
            {marks.map((mark) => {
              const markPercent = ((mark.value - min) / (max - min)) * 100;
              return (
                <div
                  key={mark.value}
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-text-muted/30 rounded-full"
                  style={{ left: `${markPercent}%` }}
                />
              );
            })}
          </div>
        )}

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-6 h-6 rounded-full shadow-md',
            'border-3 border-background-primary',
            'transition-shadow duration-150',
            isDragging && 'shadow-lg',
            !disabled && 'hover:scale-110'
          )}
          style={{
            left: `${percentage}%`,
            backgroundColor: getThumbColor(colorScale, percentage),
          }}
          animate={{
            scale: isDragging ? 1.15 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Tooltip */}
          {showTooltip && showTooltipValue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background-elevated border border-border-subtle rounded-lg text-xs font-mono text-text-primary whitespace-nowrap shadow-lg"
            >
              {valueFormat(value)}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Marks Labels */}
      {marks && (
        <div className="relative mt-1 h-5">
          {marks.map((mark) => {
            const markPercent = ((mark.value - min) / (max - min)) * 100;
            return (
              <span
                key={mark.value}
                className={cn(
                  'absolute text-xs text-text-muted transform -translate-x-1/2',
                  mark.value === value && 'text-primary-blue font-medium'
                )}
                style={{ left: `${markPercent}%` }}
              >
                {mark.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Min/Max Labels (when no marks) */}
      {showMinMax && !marks && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-muted">{valueFormat(min)}</span>
          <span className="text-xs text-text-muted">{valueFormat(max)}</span>
        </div>
      )}

      {/* Error/Hint */}
      {error && <p className="mt-2 text-sm text-error-red">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-text-muted">{hint}</p>}
    </div>
  );
}

// ============================================
// Preset Slider Components
// ============================================

export function GPASlider(props: Omit<SliderInputProps, 'variant'>) {
  return <SliderInput {...props} variant="gpa" />;
}

export function SATSlider(props: Omit<SliderInputProps, 'variant' | 'min' | 'max'>) {
  return <SliderInput {...props} variant="score" min={400} max={1600} />;
}

export function ACTSlider(props: Omit<SliderInputProps, 'variant' | 'min' | 'max' | 'step'>) {
  return (
    <SliderInput
      {...props}
      min={1}
      max={36}
      step={1}
      marks={[
        { value: 1, label: '1' },
        { value: 18, label: '18' },
        { value: 25, label: '25' },
        { value: 30, label: '30' },
        { value: 36, label: '36' },
      ]}
      colorScale="red-to-green"
    />
  );
}

export function HoursSlider(props: Omit<SliderInputProps, 'variant'>) {
  return <SliderInput {...props} variant="hours" />;
}

export default SliderInput;
