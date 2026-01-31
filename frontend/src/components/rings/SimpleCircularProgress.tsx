/**
 * SimpleCircularProgress - Single ring progress indicator
 * Used for individual category scores in Frame5.
 * @version 10.0
 */

'use client';

import { motion } from 'framer-motion';

interface SimpleCircularProgressProps {
  /** Current value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size in pixels (default: 80) */
  size?: number;
  /** Stroke width in pixels (default: 6) */
  strokeWidth?: number;
  /** Ring color */
  color: string;
  /** Whether to animate the progress */
  animated?: boolean;
  /** Label to show in center */
  label?: string;
}

export function SimpleCircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color,
  animated = true,
  label,
}: SimpleCircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const progress = (normalizedValue / max) * 100;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={animated ? { duration: 1.2, ease: 'easeOut' } : { duration: 0 }}
        />
      </svg>

      {/* Center label/value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-lg font-bold"
          style={{ color }}
          initial={animated ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animated ? 0.5 : 0 }}
        >
          {Math.round(normalizedValue)}
        </motion.span>
        {label && (
          <span className="text-[10px] text-gray-500 uppercase">{label}</span>
        )}
      </div>
    </div>
  );
}

export default SimpleCircularProgress;
