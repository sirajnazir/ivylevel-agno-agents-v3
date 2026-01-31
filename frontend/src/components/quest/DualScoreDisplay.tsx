'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { scoringLogger } from '@/lib/trace';
import { TrendingUp, Target, Award, Info, ChevronDown, ChevronUp } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface ScoreBreakdown {
  aptitude: number;
  passion: number;
  community: number;
  demographics: number;
}

export interface DualScoreDisplayProps {
  schoolId: string;
  schoolName: string;
  schoolColor: string;
  profileStrength: number;
  acceptanceProbability: number;
  breakdown?: ScoreBreakdown;
  baseAcceptanceRate?: number;
  rank?: number;
  totalSchools?: number;
  animateOnMount?: boolean;
  showBreakdown?: boolean;
  variant?: 'full' | 'compact' | 'card';
  className?: string;
}

// ============================================
// Score Color Utilities
// ============================================

function getStrengthColor(score: number): string {
  if (score >= 85) return 'text-success-green';
  if (score >= 70) return 'text-primary-blue';
  if (score >= 50) return 'text-warning-amber';
  return 'text-error-red';
}

function getStrengthLabel(score: number): string {
  if (score >= 90) return 'Elite';
  if (score >= 80) return 'Very Strong';
  if (score >= 70) return 'Strong';
  if (score >= 60) return 'Competitive';
  if (score >= 50) return 'Average';
  if (score >= 40) return 'Below Average';
  return 'Needs Work';
}

function getProbabilityColor(probability: number, baseRate: number): string {
  const ratio = probability / baseRate;
  if (ratio >= 2) return 'text-success-green';
  if (ratio >= 1) return 'text-primary-blue';
  if (ratio >= 0.5) return 'text-warning-amber';
  return 'text-error-red';
}

function getProbabilityLabel(probability: number): string {
  if (probability >= 40) return 'Likely';
  if (probability >= 25) return 'Good Chance';
  if (probability >= 15) return 'Competitive';
  if (probability >= 8) return 'Reach';
  if (probability >= 4) return 'Long Shot';
  return 'Dream';
}

// ============================================
// Animated Counter Hook
// ============================================

function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// ============================================
// DualScoreDisplay Component
// ============================================

export function DualScoreDisplay({
  schoolId,
  schoolName,
  schoolColor,
  profileStrength,
  acceptanceProbability,
  breakdown,
  baseAcceptanceRate = 5,
  rank,
  totalSchools,
  animateOnMount = true,
  showBreakdown = false,
  variant = 'full',
  className,
}: DualScoreDisplayProps) {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(showBreakdown);

  const animatedStrength = useAnimatedCounter(animateOnMount ? profileStrength : 0, 2000);
  const animatedProbability = useAnimatedCounter(animateOnMount ? Math.round(acceptanceProbability * 10) : 0, 2500);

  const strengthColor = useMemo(() => getStrengthColor(profileStrength), [profileStrength]);
  const strengthLabel = useMemo(() => getStrengthLabel(profileStrength), [profileStrength]);
  const probabilityColor = useMemo(
    () => getProbabilityColor(acceptanceProbability, baseAcceptanceRate),
    [acceptanceProbability, baseAcceptanceRate]
  );
  const probabilityLabel = useMemo(() => getProbabilityLabel(acceptanceProbability), [acceptanceProbability]);

  // Log score display
  useEffect(() => {
    const factors: Record<string, number> = breakdown
      ? {
          aptitude: breakdown.aptitude,
          passion: breakdown.passion,
          community: breakdown.community,
          demographics: breakdown.demographics,
        }
      : {};
    scoringLogger.logProbabilityCalculation(
      schoolId,
      profileStrength,
      baseAcceptanceRate,
      acceptanceProbability,
      factors
    );
  }, [schoolId, profileStrength, baseAcceptanceRate, acceptanceProbability, breakdown]);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-mono font-bold', strengthColor)}>
            {animateOnMount ? animatedStrength : profileStrength}
          </span>
          <span className="text-sm text-text-muted">PS</span>
        </div>
        <div className="w-px h-6 bg-border-subtle" />
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-mono font-bold', probabilityColor)}>
            {animateOnMount ? (animatedProbability / 10).toFixed(1) : acceptanceProbability.toFixed(1)}%
          </span>
          <span className="text-sm text-text-muted">MR</span>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'card-quest p-4',
          'border-l-4',
          className
        )}
        style={{ borderLeftColor: schoolColor }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: schoolColor }}
            />
            <div>
              <h3 className="font-medium text-text-primary">{schoolName}</h3>
              {rank && totalSchools && (
                <p className="text-xs text-text-muted">Rank #{rank} of {totalSchools}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={cn('text-2xl font-mono font-bold', probabilityColor)}>
              {acceptanceProbability.toFixed(1)}%
            </div>
            <div className="text-xs text-text-muted">{probabilityLabel}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Profile Strength</span>
              <span className={strengthColor}>{profileStrength}/100</span>
            </div>
            <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileStrength}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn('h-full rounded-full', {
                  'bg-success-green': profileStrength >= 85,
                  'bg-primary-blue': profileStrength >= 70 && profileStrength < 85,
                  'bg-warning-amber': profileStrength >= 50 && profileStrength < 70,
                  'bg-error-red': profileStrength < 50,
                })}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('card-quest', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border-subtle">
        <div
          className="w-12 h-12 rounded-xl"
          style={{ backgroundColor: schoolColor }}
        />
        <div>
          <h2 className="text-xl font-display font-semibold text-text-primary">
            {schoolName}
          </h2>
          <p className="text-sm text-text-secondary">
            Base acceptance rate: {(baseAcceptanceRate).toFixed(1)}%
          </p>
        </div>
        {rank && totalSchools && (
          <div className="ml-auto text-right">
            <div className="flex items-center gap-1 text-gear-gold">
              <Award className="w-5 h-5" />
              <span className="font-mono font-bold">#{rank}</span>
            </div>
            <p className="text-xs text-text-muted">of {totalSchools} schools</p>
          </div>
        )}
      </div>

      {/* Dual Score Display */}
      <div className="grid grid-cols-2 gap-6">
        {/* Profile Strength */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Profile Strength</span>
          </div>

          <motion.div
            className="relative w-32 h-32 mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="score-ring"
                strokeWidth="8"
              />
              {/* Progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                className="score-ring-fill"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - profileStrength / 100),
                  stroke: profileStrength >= 85
                    ? 'var(--success-green)'
                    : profileStrength >= 70
                      ? 'var(--primary-blue)'
                      : profileStrength >= 50
                        ? 'var(--warning-amber)'
                        : 'var(--error-red)',
                }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={animatedStrength}
                className={cn('text-3xl font-mono font-bold', strengthColor)}
              >
                {animateOnMount ? animatedStrength : profileStrength}
              </motion.span>
              <span className="text-xs text-text-muted">/ 100</span>
            </div>
          </motion.div>

          <div className={cn('mt-2 text-sm font-medium', strengthColor)}>
            {strengthLabel}
          </div>
        </div>

        {/* Market Reality */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Market Reality</span>
          </div>

          <motion.div
            className="relative w-32 h-32 mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="score-ring"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                className="score-ring-fill"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - Math.min(acceptanceProbability, 100) / 100),
                  stroke:
                    acceptanceProbability / baseAcceptanceRate >= 2
                      ? 'var(--success-green)'
                      : acceptanceProbability / baseAcceptanceRate >= 1
                        ? 'var(--primary-blue)'
                        : acceptanceProbability / baseAcceptanceRate >= 0.5
                          ? 'var(--warning-amber)'
                          : 'var(--error-red)',
                }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={animatedProbability}
                className={cn('text-3xl font-mono font-bold', probabilityColor)}
              >
                {animateOnMount ? (animatedProbability / 10).toFixed(1) : acceptanceProbability.toFixed(1)}
                <span className="text-lg">%</span>
              </motion.span>
              <span className="text-xs text-text-muted">probability</span>
            </div>
          </motion.div>

          <div className={cn('mt-2 text-sm font-medium', probabilityColor)}>
            {probabilityLabel}
          </div>
        </div>
      </div>

      {/* Breakdown Toggle */}
      {breakdown && (
        <div className="mt-6 pt-4 border-t border-border-subtle">
          <button
            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
            className="flex items-center justify-between w-full text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Score Breakdown</span>
            </div>
            {isBreakdownExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {isBreakdownExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  <BreakdownBar
                    label="Aptitude"
                    value={breakdown.aptitude}
                    color="bg-primary-blue"
                  />
                  <BreakdownBar
                    label="Passion"
                    value={breakdown.passion}
                    color="bg-success-green"
                  />
                  <BreakdownBar
                    label="Community"
                    value={breakdown.community}
                    color="bg-warning-amber"
                  />
                  <BreakdownBar
                    label="Demographics"
                    value={breakdown.demographics}
                    color="bg-gear-mythic"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Breakdown Bar Component
// ============================================

interface BreakdownBarProps {
  label: string;
  value: number;
  color: string;
}

function BreakdownBar({ label, value, color }: BreakdownBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-mono">{value.toFixed(0)}</span>
      </div>
      <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

export default DualScoreDisplay;
