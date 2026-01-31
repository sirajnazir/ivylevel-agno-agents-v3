'use client';

/**
 * Founder Glow - Special effect for "Created from Nothing" achievements
 *
 * Adds animated glow and emphasis when student indicates they founded/created something
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface FounderGlowProps {
  /** Child component to wrap with glow */
  children: ReactNode;
  /** Whether to show the glow effect */
  active: boolean;
  /** Glow color (default: gold) */
  glowColor?: string;
}

export function FounderGlow({
  children,
  active,
  glowColor = '#FFD700',
}: FounderGlowProps) {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Animated glow background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '16px',
          background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
          filter: 'blur(8px)',
          zIndex: -1,
        }}
      />

      {/* Sparkle particles */}
      <motion.div
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
        }}
        initial={{ scale: 0, rotate: 0 }}
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Sparkles size={16} color={glowColor} />
      </motion.div>

      {/* Content with border glow */}
      <motion.div
        initial={{ borderColor: 'transparent' }}
        animate={{
          borderColor: [glowColor + '00', glowColor + '80', glowColor + '00'],
          boxShadow: [
            `0 0 0px ${glowColor}00`,
            `0 0 20px ${glowColor}60`,
            `0 0 0px ${glowColor}00`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          border: '2px solid transparent',
          borderRadius: '12px',
          position: 'relative',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Founder Badge - Small badge to display near "Created" options
 */
interface FounderBadgeProps {
  visible: boolean;
}

export function FounderBadge({ visible }: FounderBadgeProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        fontSize: '11px',
        fontWeight: 600,
        color: '#D4AF37',
        marginTop: 8,
      }}
    >
      <Sparkles size={12} color="#D4AF37" />
      <span>Founder Initiative</span>
    </motion.div>
  );
}

/**
 * Founder Message - Encouraging message for creators
 */
interface FounderMessageProps {
  visible: boolean;
}

export function FounderMessage({ visible }: FounderMessageProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <Sparkles size={16} color="#D4AF37" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: BRAND_COLORS.textHeading,
              marginBottom: 4,
            }}
          >
            ✨ Founder Recognition
          </p>
          <p
            style={{
              fontSize: '12px',
              color: BRAND_COLORS.textSecondary,
              lineHeight: 1.5,
            }}
          >
            Creating something from nothing is the ultimate "spike." Top schools look for builders and pioneers.
            Make sure your application emphasizes your founder status and the initiative it took.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
