'use client';

import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'ivylevel';
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const Progress = ({
  value,
  max = 100,
  size = 'md',
  variant = 'ivylevel',
  showValue = false,
  label,
  animated = true,
  className,
}: ProgressProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Get fill style based on variant
  const getFillStyle = () => {
    if (variant === 'ivylevel') {
      return {
        background: 'linear-gradient(135deg, #FE4A22, #FF6B47)',
      };
    }
    return {};
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-[#16a34a]';
      case 'warning':
        return 'bg-[#d97706]';
      case 'danger':
        return 'bg-[#dc2626]';
      case 'ivylevel':
        return '';
      default:
        return 'bg-[#FF4A23]';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-semibold" style={{ color: '#641432' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          sizes[size]
        )}
        style={{ backgroundColor: '#FFE5DF' }}
      >
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full transition-all',
            getVariantClass()
          )}
          style={getFillStyle()}
        />
      </div>
    </div>
  );
};

// Frame progress variant with Ivylevel styling
export interface FrameProgressProps {
  currentFrame: number;
  totalFrames?: number;
  frameLabels?: string[];
  className?: string;
}

const FrameProgress = ({
  currentFrame,
  totalFrames = 6,
  frameLabels = ['Warmup', 'Snapshot', 'Building', 'Operating', 'Reveal', 'Power-Ups'],
  className,
}: FrameProgressProps) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          Frame {currentFrame} of {totalFrames}
        </span>
        <span className="text-sm font-semibold" style={{ color: '#641432' }}>
          {frameLabels[currentFrame - 1]}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalFrames }).map((_, i) => {
          const isCompleted = i < currentFrame;
          const isCurrent = i === currentFrame - 1;

          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex-1 h-2 rounded-full origin-left"
              style={{
                background: isCompleted
                  ? 'linear-gradient(135deg, #FE4A22, #FF6B47)'
                  : '#e5e7eb',
                animation: isCurrent ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export { Progress, FrameProgress };
