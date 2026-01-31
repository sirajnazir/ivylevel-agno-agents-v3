'use client';

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { inputLogger } from '@/lib/trace';
import { Check, X, Plus } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface ChipOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface ChipSelectorProps {
  id: string;
  label?: string;
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  maxSelections?: number;
  minSelections?: number;
  variant?: 'default' | 'compact' | 'pill';
  showCount?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  chipClassName?: string;
  frameId?: number;
  cardId?: string;
}

// ============================================
// Animation Variants
// ============================================

const chipVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  tap: { scale: 0.95 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// ============================================
// ChipSelector Component
// ============================================

export function ChipSelector({
  id,
  label,
  options,
  selected,
  onChange,
  multiSelect = true,
  maxSelections,
  minSelections = 0,
  variant = 'default',
  showCount = false,
  allowCustom = false,
  customPlaceholder = 'Add custom...',
  error,
  hint,
  disabled = false,
  className,
  chipClassName,
  frameId,
  cardId,
}: ChipSelectorProps) {
  // Computed state
  const canSelectMore = useMemo(() => {
    if (!multiSelect) return selected.length === 0;
    if (maxSelections) return selected.length < maxSelections;
    return true;
  }, [multiSelect, maxSelections, selected.length]);

  const canDeselect = useMemo(() => {
    return selected.length > minSelections;
  }, [selected.length, minSelections]);

  // Handlers
  const handleToggle = useCallback(
    (value: string) => {
      if (disabled) return;

      const isSelected = selected.includes(value);

      if (isSelected) {
        if (!canDeselect) return;
        const newSelected = selected.filter((v) => v !== value);
        onChange(newSelected);

        inputLogger.logChipSelection(id, newSelected, 'remove', value);
      } else {
        if (!canSelectMore) {
          // In single-select mode, replace the selection
          if (!multiSelect) {
            onChange([value]);
            inputLogger.logChipSelection(id, [value], 'add', value);
          }
          return;
        }

        const newSelected = multiSelect ? [...selected, value] : [value];
        onChange(newSelected);

        inputLogger.logChipSelection(id, newSelected, 'add', value);
      }
    },
    [
      disabled,
      selected,
      canDeselect,
      canSelectMore,
      multiSelect,
      onChange,
      id,
    ]
  );

  // Size variants
  const sizeClasses = {
    default: 'px-4 py-2.5 text-sm',
    compact: 'px-3 py-1.5 text-xs',
    pill: 'px-4 py-2 text-sm',
  };

  const borderRadiusClasses = {
    default: 'rounded-xl',
    compact: 'rounded-lg',
    pill: 'rounded-full',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-text-secondary">
            {label}
          </label>
          {showCount && maxSelections && (
            <span
              className={cn(
                'text-xs font-mono',
                selected.length === maxSelections
                  ? 'text-success-green'
                  : 'text-text-muted'
              )}
            >
              {selected.length}/{maxSelections}
            </span>
          )}
        </div>
      )}

      {/* Chips Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2"
      >
        <AnimatePresence mode="popLayout">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            const isDisabled = disabled || option.disabled || (!isSelected && !canSelectMore);

            return (
              <motion.button
                key={option.value}
                type="button"
                variants={chipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileTap={!isDisabled ? "tap" : undefined}
                onClick={() => handleToggle(option.value)}
                disabled={isDisabled}
                className={cn(
                  'chip inline-flex items-center gap-2 font-medium transition-all duration-200',
                  sizeClasses[variant],
                  borderRadiusClasses[variant],
                  isSelected
                    ? 'chip-selected bg-primary-blue text-white border-primary-blue shadow-glow-blue'
                    : 'chip-default bg-background-elevated text-text-secondary border border-border-subtle hover:border-border-default hover:text-text-primary',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  chipClassName
                )}
              >
                {/* Icon */}
                {option.icon && (
                  <span className={cn('flex-shrink-0', isSelected ? 'text-white' : 'text-text-muted')}>
                    {option.icon}
                  </span>
                )}

                {/* Label */}
                <span>{option.label}</span>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                )}
              </motion.button>
            );
          })}

          {/* Custom Input Chip */}
          {allowCustom && canSelectMore && (
            <CustomChipInput
              placeholder={customPlaceholder}
              onAdd={(value) => {
                const newSelected = [...selected, value];
                onChange(newSelected);
                inputLogger.logChipSelection(id, newSelected, 'add', value);
              }}
              variant={variant}
              disabled={disabled}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Selected Pills (for compact display) */}
      {showCount && selected.length > 0 && variant === 'compact' && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border-subtle">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <motion.span
                key={value}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-blue/20 text-primary-blue text-xs"
              >
                {option?.label || value}
                <button
                  type="button"
                  onClick={() => handleToggle(value)}
                  className="hover:bg-primary-blue/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Error/Hint */}
      {error && <p className="mt-2 text-sm text-error-red">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-text-muted">{hint}</p>}
    </div>
  );
}

// ============================================
// Custom Chip Input
// ============================================

interface CustomChipInputProps {
  placeholder: string;
  onAdd: (value: string) => void;
  variant: 'default' | 'compact' | 'pill';
  disabled?: boolean;
}

function CustomChipInput({ placeholder, onAdd, variant, disabled }: CustomChipInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        onAdd(value);
        e.currentTarget.value = '';
      }
    }
  };

  const sizeClasses = {
    default: 'px-3 py-2.5 text-sm',
    compact: 'px-2 py-1.5 text-xs',
    pill: 'px-3 py-2 text-sm',
  };

  const borderRadiusClasses = {
    default: 'rounded-xl',
    compact: 'rounded-lg',
    pill: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 border border-dashed border-border-subtle bg-transparent transition-colors hover:border-primary-blue',
        sizeClasses[variant],
        borderRadiusClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Plus className="w-4 h-4 text-text-muted flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted w-24 min-w-0"
      />
    </div>
  );
}

// ============================================
// Preset Chip Groups
// ============================================

export const ACADEMIC_AWARDS_OPTIONS: ChipOption[] = [
  { value: 'national_merit', label: 'National Merit' },
  { value: 'ap_scholar', label: 'AP Scholar' },
  { value: 'honor_roll', label: 'Honor Roll' },
  { value: 'valedictorian', label: 'Valedictorian' },
  { value: 'salutatorian', label: 'Salutatorian' },
  { value: 'presidential_scholar', label: 'Presidential Scholar' },
  { value: 'state_champion', label: 'State Champion' },
  { value: 'national_champion', label: 'National Champion' },
  { value: 'olympiad_medal', label: 'Olympiad Medalist' },
];

export const SPIKE_CATEGORY_OPTIONS: ChipOption[] = [
  { value: 'STEM_RESEARCH', label: 'STEM Research' },
  { value: 'STEM_ENGINEERING', label: 'Engineering' },
  { value: 'ARTS_VISUAL', label: 'Visual Arts' },
  { value: 'ARTS_PERFORMING', label: 'Performing Arts' },
  { value: 'BUSINESS_ENTREPRENEURSHIP', label: 'Entrepreneurship' },
  { value: 'SOCIAL_IMPACT', label: 'Social Impact' },
  { value: 'ATHLETICS', label: 'Athletics' },
  { value: 'WRITING_JOURNALISM', label: 'Writing/Journalism' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'POLITICS_GOVERNMENT', label: 'Politics/Government' },
];

export const MAJOR_OPTIONS: ChipOption[] = [
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'biology', label: 'Biology' },
  { value: 'economics', label: 'Economics' },
  { value: 'pre_med', label: 'Pre-Med' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'political_science', label: 'Political Science' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'business', label: 'Business' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
];

export default ChipSelector;
