'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useSessionStore, useStudentStore, useTwinStore, useAllTwins } from '@/lib/store';
import { MiniTimeline, FRAME_NODES } from './Timeline';
import {
  Zap,
  Users,
  Target,
  Trophy,
  TrendingUp,
  Settings,
  HelpCircle,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export interface HUDProps {
  variant?: 'full' | 'compact' | 'minimal';
  showXP?: boolean;
  showTwins?: boolean;
  showTimeline?: boolean;
  showSettings?: boolean;
  className?: string;
}

// ============================================
// Edge Points Level Calculation
// ============================================

const EDGE_PER_LEVEL = 100;
const MAX_LEVEL = 50;

function calculateLevel(edge: number): { level: number; currentEdge: number; nextLevelEdge: number; progress: number } {
  const level = Math.min(Math.floor(edge / EDGE_PER_LEVEL) + 1, MAX_LEVEL);
  const currentEdge = edge % EDGE_PER_LEVEL;
  const nextLevelEdge = EDGE_PER_LEVEL;
  const progress = (currentEdge / nextLevelEdge) * 100;

  return { level, currentEdge, nextLevelEdge, progress };
}

// ============================================
// HUD Component
// ============================================

export function HUD({
  variant = 'full',
  showXP = true,
  showTwins = true,
  showTimeline = true,
  showSettings = false,
  className,
}: HUDProps) {
  const xp = useSessionStore((s) => s.total_xp);
  const currentFrame = useSessionStore((s) => s.current_frame);
  const frameProgress = useSessionStore((s) => s.frame_progress);
  const currentFrameProgress = frameProgress[currentFrame as 1 | 2 | 3 | 4 | 5 | 6];
  const cardsCompletedInFrame = currentFrameProgress?.cards_completed || 0;
  const totalCardsInFrame = currentFrameProgress?.total_cards || 4;
  const achievements: string[] = []; // Placeholder - achievements not in session store yet
  const studentName = useStudentStore((s) => s.profile.identity.name);
  const allTwins = useAllTwins();

  const levelInfo = useMemo(() => calculateLevel(xp), [xp]);
  const frameConfig = useMemo(() => FRAME_NODES.find((f) => f.id === currentFrame), [currentFrame]);

  // Calculate average score across twins
  const avgScore = useMemo(() => {
    if (allTwins.length === 0) return 0;
    const total = allTwins.reduce((sum, twin) => sum + twin.profileStrength, 0);
    return Math.round(total / allTwins.length);
  }, [allTwins]);

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <EdgeBadge edge={xp} level={levelInfo.level} size="sm" />
        <MiniTimeline currentFrame={currentFrame} />
      </div>
    );
  }

  if (variant === 'compact') {
    const IconComponent = frameConfig?.iconComponent;
    return (
      <div className={cn('hud-panel px-4 py-2', className)}>
        <div className="flex items-center justify-between gap-4">
          {/* Left: Frame Info */}
          <div className="flex items-center gap-3">
            {IconComponent && <IconComponent size={18} color={frameConfig?.color} />}
            <div>
              <div className="hud-text text-primary-blue">{frameConfig?.name}</div>
              <div className="text-xs text-text-muted">
                Card {cardsCompletedInFrame + 1}/{totalCardsInFrame}
              </div>
            </div>
          </div>

          {/* Center: Timeline */}
          {showTimeline && <MiniTimeline currentFrame={currentFrame} />}

          {/* Right: Edge */}
          {showXP && <EdgeBadge edge={xp} level={levelInfo.level} size="sm" />}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('hud-panel p-4', className)}>
      <div className="flex items-center justify-between">
        {/* Left Section: Player Info */}
        <div className="flex items-center gap-4">
          {/* Avatar/Level Badge */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-primary-blue/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-blue">{studentName?.charAt(0) || '?'}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gear-gold flex items-center justify-center text-xs font-bold text-background-primary">
              {levelInfo.level}
            </div>
          </div>

          {/* Player Stats */}
          <div>
            <div className="font-medium text-text-primary">
              {studentName || 'Explorer'}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {showXP && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-gear-gold" />
                  <span className="text-sm text-text-secondary font-mono">{xp} Edge</span>
                </div>
              )}
              {achievements.length > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-warning-amber" />
                  <span className="text-sm text-text-secondary">{achievements.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section: Frame Progress */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            {frameConfig?.iconComponent && <frameConfig.iconComponent size={20} color={frameConfig?.color} />}
            <span className="hud-text text-text-primary">{frameConfig?.name}</span>
          </div>
          {showTimeline && <MiniTimeline currentFrame={currentFrame} />}
        </div>

        {/* Right Section: Twin Fleet */}
        {showTwins && (
          <div className="flex items-center gap-4">
            {/* Twin Count */}
            <div className="text-right">
              <div className="hud-text text-text-muted">TWIN FLEET</div>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-primary-blue" />
                <span className="text-xl font-mono text-text-primary">{allTwins.length}</span>
              </div>
            </div>

            {/* Average Score */}
            {avgScore > 0 && (
              <div className="text-right">
                <div className="hud-text text-text-muted">AVG SCORE</div>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-4 h-4 text-success-green" />
                  <span className="text-xl font-mono text-text-primary">{avgScore}</span>
                </div>
              </div>
            )}

            {/* XP Bar */}
            {showXP && (
              <div className="w-32">
                <div className="hud-text text-text-muted mb-1">LEVEL {levelInfo.level}</div>
                <div className="xp-bar">
                  <motion.div
                    className="xp-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                  />
                </div>
                <div className="text-xs text-text-muted mt-0.5 text-right font-mono">
                  {levelInfo.currentEdge}/{levelInfo.nextLevelEdge}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Button */}
        {showSettings && (
          <button className="p-2 rounded-lg hover:bg-background-hover text-text-muted transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Edge Badge Component (formerly XP Badge)
// ============================================

interface EdgeBadgeProps {
  edge: number;
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

// Alias for backwards compatibility
export type XPBadgeProps = EdgeBadgeProps;

export function EdgeBadge({
  edge,
  level,
  size = 'md',
  showProgress = true,
  className,
}: EdgeBadgeProps) {
  const levelInfo = useMemo(() => calculateLevel(edge), [edge]);

  const sizes = {
    sm: {
      badge: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      badge: 'px-4 py-2',
      text: 'text-base',
      icon: 'w-5 h-5',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={cn(
          'flex items-center gap-1.5 rounded-full bg-gear-gold/20 border border-gear-gold/30',
          sizeConfig.badge
        )}
        whileHover={{ scale: 1.05 }}
      >
        <Zap className={cn('text-gear-gold', sizeConfig.icon)} />
        <span className={cn('font-mono font-medium text-gear-gold', sizeConfig.text)}>
          Lv.{level}
        </span>
      </motion.div>

      {showProgress && (
        <div className="flex items-center gap-1">
          <span className={cn('font-mono text-text-muted', sizeConfig.text)}>{edge}</span>
          <span className={cn('text-text-disabled', sizeConfig.text)}>Edge</span>
        </div>
      )}
    </div>
  );
}

// Backwards compatibility alias for XPBadge
export const XPBadge = EdgeBadge;

// ============================================
// Score Display Component
// ============================================

interface ScoreDisplayProps {
  label: string;
  value: number;
  maxValue?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  className?: string;
}

export function ScoreDisplay({
  label,
  value,
  maxValue = 100,
  icon,
  color = 'blue',
  size = 'md',
  showBar = false,
  className,
}: ScoreDisplayProps) {
  const percentage = (value / maxValue) * 100;

  const colors = {
    blue: { text: 'text-primary-blue', bg: 'bg-primary-blue', glow: 'shadow-glow-blue' },
    green: { text: 'text-success-green', bg: 'bg-success-green', glow: 'shadow-glow-green' },
    amber: { text: 'text-warning-amber', bg: 'bg-warning-amber', glow: 'shadow-glow-amber' },
    red: { text: 'text-error-red', bg: 'bg-error-red', glow: 'shadow-glow-red' },
  };

  const colorConfig = colors[color];

  const sizes = {
    sm: { label: 'text-xs', value: 'text-lg' },
    md: { label: 'text-sm', value: 'text-2xl' },
    lg: { label: 'text-base', value: 'text-3xl' },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn('text-center', className)}>
      <div className={cn('hud-text text-text-muted mb-1', sizeConfig.label)}>{label}</div>
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span className={cn('font-mono font-bold', colorConfig.text, sizeConfig.value)}>
          {value}
        </span>
      </div>
      {showBar && (
        <div className="mt-2 h-1.5 bg-background-elevated rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', colorConfig.bg)}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}

export default HUD;
