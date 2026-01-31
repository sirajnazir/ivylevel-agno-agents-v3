'use client';

/**
 * Wave Fill Icon - Animated SVG icon with wave fill animation
 *
 * Visual enhancement for pillar progress showing completion with animated waves
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WaveFillIconProps {
  /** Completion percentage (0-100) */
  completion: number;
  /** Pillar color (hex) */
  color: string;
  /** Icon size in pixels */
  size?: number;
  /** Icon type - determines the SVG path */
  iconType: 'fingerprint' | 'star' | 'heart' | 'users';
}

export function WaveFillIcon({
  completion,
  color,
  size = 64,
  iconType,
}: WaveFillIconProps) {
  const [animate, setAnimate] = useState(false);

  // Trigger animation when completion changes
  useEffect(() => {
    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timeout);
  }, [completion]);

  // Calculate fill height (0 = top, 100 = bottom)
  const fillHeight = size - (size * completion) / 100;

  // Icon paths (centered, scaled to fit in viewBox)
  const iconPaths = {
    fingerprint: (
      // Fingerprint icon (simplified)
      <>
        <path
          d="M32 16c-8.837 0-16 7.163-16 16v16c0 8.837 7.163 16 16 16s16-7.163 16-16V32c0-8.837-7.163-16-16-16z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />
        <path
          d="M32 24c-4.418 0-8 3.582-8 8v8c0 4.418 3.582 8 8 8s8-3.582 8-8v-8c0-4.418-3.582-8-8-8z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />
        <circle cx="32" cy="32" r="4" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
      </>
    ),
    star: (
      // Star icon
      <path
        d="M32 12l4.472 13.764h14.472l-11.708 8.508 4.472 13.764L32 39.528l-11.708 8.508 4.472-13.764L13.056 25.764h14.472z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
    ),
    heart: (
      // Heart icon
      <path
        d="M32 52c-1.2 0-2.4-0.4-3.2-1.2C16 38.8 8 30.8 8 22c0-6.4 4.8-12 11.2-12 3.6 0 7.2 1.6 9.6 4.4 0.8 0.8 2.4 0.8 3.2 0 2.4-2.8 6-4.4 9.6-4.4C48 10 52.8 15.6 52.8 22c0 8.8-8 16.8-20.8 28.8-0.8 0.8-2 1.2-3.2 1.2z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
    ),
    users: (
      // Users icon (two circles for heads, simplified)
      <>
        <circle cx="24" cy="24" r="6" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
        <circle cx="40" cy="24" r="6" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
        <path
          d="M14 44c0-5.523 4.477-10 10-10s10 4.477 10 10"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />
        <path
          d="M30 44c0-5.523 4.477-10 10-10s10 4.477 10 10"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />
      </>
    ),
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background icon outline */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {iconPaths[iconType]}
      </svg>

      {/* Animated wave fill */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          overflow: 'hidden',
        }}
        initial={{ y: size }}
        animate={{ y: fillHeight }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
        }}
      >
        <svg
          width={size}
          height={size * 2}
          viewBox="0 0 64 128"
          style={{
            position: 'absolute',
            top: -size,
            left: 0,
          }}
        >
          {/* Wave pattern */}
          <defs>
            <linearGradient id={`gradient-${iconType}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
            <clipPath id={`clip-${iconType}`}>
              {iconPaths[iconType]}
            </clipPath>
          </defs>

          {/* Animated wave layers - Using native SVG SMIL animations */}
          <g clipPath={`url(#clip-${iconType})`}>
            {/* Base fill */}
            <rect width="64" height="128" fill={`url(#gradient-${iconType})`} />

            {/* Wave 1 - Native SVG animate element */}
            <path
              fill={color}
              opacity="0.4"
            >
              <animate
                attributeName="d"
                dur="2s"
                repeatCount="indefinite"
                values="M0 80 Q16 75, 32 80 T64 80 V128 H0 Z;M0 80 Q16 85, 32 80 T64 80 V128 H0 Z;M0 80 Q16 75, 32 80 T64 80 V128 H0 Z"
              />
            </path>

            {/* Wave 2 (offset) - Native SVG animate element */}
            <path
              fill={color}
              opacity="0.3"
            >
              <animate
                attributeName="d"
                dur="2.5s"
                repeatCount="indefinite"
                begin="0.3s"
                values="M0 85 Q16 80, 32 85 T64 85 V128 H0 Z;M0 85 Q16 90, 32 85 T64 85 V128 H0 Z;M0 85 Q16 80, 32 85 T64 85 V128 H0 Z"
              />
            </path>
          </g>
        </svg>
      </motion.div>

      {/* Completion percentage overlay */}
      {completion > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size * 0.25,
            fontWeight: 'bold',
            color: completion > 50 ? '#ffffff' : color,
            textShadow: completion > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
            pointerEvents: 'none',
          }}
        >
          {completion}%
        </motion.div>
      )}
    </div>
  );
}
