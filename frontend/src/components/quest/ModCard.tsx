'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { scoringLogger } from '@/lib/trace';
import {
  Zap,
  TrendingUp,
  Clock,
  Target,
  Star,
  Lock,
  Check,
  ChevronRight,
  Info,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export type ModCategory =
  | 'academic'
  | 'extracurricular'
  | 'essay'
  | 'interview'
  | 'testing'
  | 'research'
  | 'leadership'
  | 'special';

export type ModDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type ModTimeframe = 'immediate' | 'short' | 'medium' | 'long';

export interface Mod {
  id: string;
  name: string;
  description: string;
  category: ModCategory;
  difficulty: ModDifficulty;
  timeframe: ModTimeframe;
  impactMin: number;
  impactMax: number;
  requirements?: string[];
  affectedSchools?: string[];
  isLocked?: boolean;
  lockReason?: string;
  isApplied?: boolean;
  appliedAt?: number;
}

export interface ModCardProps {
  mod: Mod;
  onApply?: (modId: string) => void;
  onInfo?: (modId: string) => void;
  variant?: 'default' | 'compact' | 'preview';
  showImpact?: boolean;
  showRequirements?: boolean;
  className?: string;
}

// ============================================
// Configuration
// ============================================

const CATEGORY_CONFIG: Record<ModCategory, { icon: typeof Zap; color: string; label: string }> = {
  academic: { icon: TrendingUp, color: 'primary-blue', label: 'Academic' },
  extracurricular: { icon: Star, color: 'success-green', label: 'Extracurricular' },
  essay: { icon: Sparkles, color: 'gear-gold', label: 'Essay' },
  interview: { icon: Target, color: 'warning-amber', label: 'Interview' },
  testing: { icon: TrendingUp, color: 'info-cyan', label: 'Testing' },
  research: { icon: Zap, color: 'gear-mythic', label: 'Research' },
  leadership: { icon: Star, color: 'gear-legendary', label: 'Leadership' },
  special: { icon: Sparkles, color: 'gear-diamond', label: 'Special' },
};

const DIFFICULTY_CONFIG: Record<ModDifficulty, { label: string; color: string; bgColor: string }> = {
  easy: { label: 'Easy', color: 'text-success-green', bgColor: 'bg-success-green/10' },
  medium: { label: 'Medium', color: 'text-warning-amber', bgColor: 'bg-warning-amber/10' },
  hard: { label: 'Hard', color: 'text-error-red', bgColor: 'bg-error-red/10' },
  extreme: { label: 'Extreme', color: 'text-gear-mythic', bgColor: 'bg-gear-mythic/10' },
};

const TIMEFRAME_CONFIG: Record<ModTimeframe, { label: string; weeks: string }> = {
  immediate: { label: 'Immediate', weeks: '1-2 weeks' },
  short: { label: 'Short-term', weeks: '1-2 months' },
  medium: { label: 'Medium-term', weeks: '3-6 months' },
  long: { label: 'Long-term', weeks: '6+ months' },
};

// ============================================
// ModCard Component
// ============================================

export function ModCard({
  mod,
  onApply,
  onInfo,
  variant = 'default',
  showImpact = true,
  showRequirements = true,
  className,
}: ModCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[mod.category];
  const difficultyConfig = DIFFICULTY_CONFIG[mod.difficulty];
  const timeframeConfig = TIMEFRAME_CONFIG[mod.timeframe];
  const CategoryIcon = categoryConfig.icon;

  const averageImpact = useMemo(() => {
    return (mod.impactMin + mod.impactMax) / 2;
  }, [mod.impactMin, mod.impactMax]);

  const handleApply = useCallback(() => {
    if (!mod.isLocked && !mod.isApplied && onApply) {
      onApply(mod.id);
      scoringLogger.logBoosterApplied(mod.name, 0, averageImpact, averageImpact);
    }
  }, [mod, onApply, averageImpact]);

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          'bg-background-card border border-border-subtle',
          'hover:border-primary-blue transition-all cursor-pointer',
          mod.isLocked && 'opacity-60',
          mod.isApplied && 'border-success-green bg-success-green/5',
          className
        )}
        onClick={() => !mod.isLocked && onInfo?.(mod.id)}
      >
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            `bg-${categoryConfig.color}/20`
          )}
        >
          {mod.isLocked ? (
            <Lock className="w-5 h-5 text-text-muted" />
          ) : mod.isApplied ? (
            <Check className="w-5 h-5 text-success-green" />
          ) : (
            <CategoryIcon className={cn('w-5 h-5', `text-${categoryConfig.color}`)} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary truncate">{mod.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-xs', difficultyConfig.color)}>{difficultyConfig.label}</span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs text-text-muted">{timeframeConfig.weeks}</span>
          </div>
        </div>

        {showImpact && (
          <div className="text-right">
            <span className="text-lg font-mono font-bold text-success-green">
              +{averageImpact.toFixed(0)}%
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  if (variant === 'preview') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-4 rounded-xl',
          'bg-background-elevated border border-border-subtle',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              `bg-${categoryConfig.color}/20`
            )}
          >
            <CategoryIcon className={cn('w-6 h-6', `text-${categoryConfig.color}`)} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary">{mod.name}</h4>
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{mod.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn('text-sm font-medium', difficultyConfig.color)}>
                {difficultyConfig.label}
              </span>
              <span className="text-sm text-success-green font-mono">
                +{mod.impactMin}-{mod.impactMax}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant - Full card
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card-quest relative overflow-hidden',
        mod.isLocked && 'opacity-70',
        mod.isApplied && 'border-success-green',
        className
      )}
    >
      {/* Applied Badge */}
      {mod.isApplied && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-success-green text-white text-xs font-medium rounded-bl-xl">
          Applied
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center transition-all',
            `bg-${categoryConfig.color}/20`,
            isHovered && !mod.isLocked && `bg-${categoryConfig.color}/30 shadow-lg`
          )}
        >
          {mod.isLocked ? (
            <Lock className="w-7 h-7 text-text-muted" />
          ) : (
            <CategoryIcon className={cn('w-7 h-7', `text-${categoryConfig.color}`)} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', difficultyConfig.bgColor, difficultyConfig.color)}>
              {difficultyConfig.label}
            </span>
            <span className="text-xs text-text-muted">{categoryConfig.label}</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{mod.name}</h3>
        </div>

        {/* Impact Badge */}
        {showImpact && (
          <div className="text-right">
            <div className="px-3 py-1.5 rounded-lg bg-success-green/10 border border-success-green/30">
              <div className="text-xs text-success-green font-medium">Impact</div>
              <div className="text-xl font-mono font-bold text-success-green">
                +{mod.impactMin}-{mod.impactMax}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-4 text-text-secondary">{mod.description}</p>

      {/* Meta Info */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <Clock className="w-4 h-4" />
          <span>{timeframeConfig.weeks}</span>
        </div>
        {mod.affectedSchools && mod.affectedSchools.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <Target className="w-4 h-4" />
            <span>{mod.affectedSchools.length} schools</span>
          </div>
        )}
      </div>

      {/* Requirements */}
      {showRequirements && mod.requirements && mod.requirements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>Requirements ({mod.requirements.length})</span>
            <ChevronRight
              className={cn('w-4 h-4 transition-transform', showDetails && 'rotate-90')}
            />
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {mod.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="text-text-disabled">•</span>
                    {req}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Lock Reason */}
      {mod.isLocked && mod.lockReason && (
        <div className="mt-4 p-3 rounded-lg bg-warning-amber/10 border border-warning-amber/30">
          <div className="flex items-center gap-2 text-sm text-warning-amber">
            <AlertTriangle className="w-4 h-4" />
            <span>{mod.lockReason}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!mod.isLocked && !mod.isApplied && onApply && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApply}
          className={cn(
            'mt-4 w-full py-3 rounded-xl font-semibold',
            'bg-primary-blue text-white',
            'hover:bg-primary-blue-hover shadow-glow-blue',
            'transition-all'
          )}
        >
          Apply This Mod
        </motion.button>
      )}
    </motion.div>
  );
}

// ============================================
// Mod Grid Component
// ============================================

interface ModGridProps {
  mods: Mod[];
  onApply?: (modId: string) => void;
  onInfo?: (modId: string) => void;
  columns?: 1 | 2 | 3;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ModGrid({
  mods,
  onApply,
  onInfo,
  columns = 2,
  variant = 'default',
  className,
}: ModGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {mods.map((mod) => (
        <ModCard
          key={mod.id}
          mod={mod}
          onApply={onApply}
          onInfo={onInfo}
          variant={variant}
        />
      ))}
    </div>
  );
}

// ============================================
// Sample Mods Data
// ============================================

export const SAMPLE_MODS: Mod[] = [
  {
    id: 'mod-sat-retake',
    name: 'SAT Retake Strategy',
    description: 'Focus on your weakest sections with targeted practice. Most students improve 50-100 points on a retake.',
    category: 'testing',
    difficulty: 'medium',
    timeframe: 'short',
    impactMin: 2,
    impactMax: 5,
    requirements: ['Current SAT score below 1550', 'Time to study before next test date'],
  },
  {
    id: 'mod-research',
    name: 'Summer Research Program',
    description: 'Apply to competitive summer research programs like RSI, MOSTEC, or SSP to demonstrate intellectual curiosity.',
    category: 'research',
    difficulty: 'hard',
    timeframe: 'medium',
    impactMin: 5,
    impactMax: 10,
    requirements: ['Strong academics in chosen field', 'Teacher recommendation'],
  },
  {
    id: 'mod-essay-coaching',
    name: 'Essay Deep Dive',
    description: 'Work with an experienced college counselor to craft a compelling personal narrative.',
    category: 'essay',
    difficulty: 'medium',
    timeframe: 'short',
    impactMin: 3,
    impactMax: 8,
  },
  {
    id: 'mod-leadership',
    name: 'Take Leadership Role',
    description: 'Run for president or lead a major initiative in your primary extracurricular.',
    category: 'leadership',
    difficulty: 'medium',
    timeframe: 'medium',
    impactMin: 3,
    impactMax: 6,
    requirements: ['Active member of organization', 'Elections/selection coming up'],
  },
];

export default ModCard;
