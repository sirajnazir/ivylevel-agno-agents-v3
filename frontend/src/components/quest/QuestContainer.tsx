'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useSessionStore, useStudentStore, useTwinStore } from '@/lib/store';
import { navigationLogger } from '@/lib/trace';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFrameIcon, IconRocket, IconChart, IconLayers, IconSettings, IconTarget, IconEnergy } from '@/components/icons';
import { BRAND_COLORS } from '@/lib/constants/brand';

// ============================================
// Types
// ============================================

export interface QuestContainerProps {
  children: React.ReactNode;
  frameId: number;
  frameName: string;
  frameDescription?: string;
  totalCards: number;
  currentCard: number;
  onNextCard: () => void;
  onPrevCard: () => void;
  canProgress: boolean;
  showTimeline?: boolean;
  showHUD?: boolean;
  showDrone?: boolean;
  droneMessage?: string;
  className?: string;
}

// ============================================
// Frame Metadata
// ============================================

export const FRAME_CONFIG = [
  { id: 1, name: 'Warmup', iconComponent: IconRocket, color: BRAND_COLORS.primary, description: 'Basic profile setup' },
  { id: 2, name: 'Snapshot', iconComponent: IconChart, color: BRAND_COLORS.success, description: 'Academic metrics' },
  { id: 3, name: 'Building', iconComponent: IconLayers, color: BRAND_COLORS.warning, description: 'Activities & achievements' },
  { id: 4, name: 'Context', iconComponent: IconSettings, color: BRAND_COLORS.secondary, description: 'Your situation & capacity' },
  { id: 5, name: 'Overview', iconComponent: IconTarget, color: BRAND_COLORS.primary, description: 'Your profile summary' },
  { id: 6, name: 'Game Plan', iconComponent: IconEnergy, color: BRAND_COLORS.primaryLight, description: 'Your personalized roadmap' },
];

// ============================================
// Animation Variants
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

// ============================================
// QuestContainer Component
// ============================================

export function QuestContainer({
  children,
  frameId,
  frameName,
  frameDescription,
  totalCards,
  currentCard,
  onNextCard,
  onPrevCard,
  canProgress,
  showTimeline = true,
  showHUD = true,
  showDrone = true,
  droneMessage,
  className,
}: QuestContainerProps) {
  const currentFrame = useSessionStore((s) => s.current_frame);
  const xp = useSessionStore((s) => s.total_xp);
  const startFrame = useSessionStore((s) => s.startFrame);
  const level = Math.floor(xp / 100) + 1; // Calculate level from Edge points
  const studentName = useStudentStore((s) => s.profile.identity.name);
  const twinCount = useTwinStore((s) => s.getTwinCount());

  const frameConfig = useMemo(() => FRAME_CONFIG.find((f) => f.id === frameId), [frameId]);

  // Initialize frame
  useEffect(() => {
    startFrame(frameId as 1 | 2 | 3 | 4 | 5 | 6, totalCards);
  }, [frameId, totalCards, startFrame]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (canProgress) {
          e.preventDefault();
          onNextCard();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        if (currentCard > 0) {
          e.preventDefault();
          onPrevCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProgress, currentCard, onNextCard, onPrevCard]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'min-h-screen bg-background-primary bg-grid-pattern',
        'flex flex-col',
        className
      )}
    >
      {/* Top Bar - HUD */}
      {showHUD && (
        <header className="sticky top-0 z-hud">
          <div className="glass-card-elevated mx-4 mt-4 px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Frame Info */}
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: frameConfig?.color ? `${frameConfig.color}20` : BRAND_COLORS.primaryBg,
                  }}
                >
                  {frameConfig?.iconComponent && (
                    <frameConfig.iconComponent size={20} color={frameConfig.color || BRAND_COLORS.iconPrimary} />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-display font-semibold text-text-primary">
                    {frameName}
                  </h1>
                  {frameDescription && (
                    <p className="text-sm text-text-secondary">{frameDescription}</p>
                  )}
                </div>
              </div>

              {/* Center: Progress */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="hud-text text-text-muted">CARD</div>
                  <div className="font-mono text-xl text-text-primary">
                    {currentCard + 1}/{totalCards}
                  </div>
                </div>
                <div className="w-px h-8 bg-border-subtle" />
                <div className="text-center">
                  <div className="hud-text text-text-muted">TWINS</div>
                  <div className="font-mono text-xl text-primary-blue">{twinCount}</div>
                </div>
              </div>

              {/* Right: Edge & Level */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="hud-text text-text-muted">LEVEL</div>
                  <div className="font-mono text-xl text-gear-gold">{level}</div>
                </div>
                <div className="w-32">
                  <div className="hud-text text-text-muted mb-1">Edge</div>
                  <div className="xp-bar">
                    <div
                      className="xp-fill"
                      style={{ width: `${(xp % 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 text-right font-mono">
                    {xp} Edge
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Timeline */}
      {showTimeline && (
        <nav className="px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {FRAME_CONFIG.map((frame, index) => {
              const isCompleted = frameId > frame.id;
              const isActive = frameId === frame.id;
              const isFuture = frameId < frame.id;

              return (
                <div key={frame.id} className="flex items-center">
                  {/* Node */}
                  <motion.div
                    whileHover={!isFuture ? { scale: 1.1 } : undefined}
                    className={cn(
                      'timeline-node',
                      isCompleted && 'timeline-node-complete',
                      isActive && 'timeline-node-active',
                      isFuture && 'timeline-node-inactive'
                    )}
                  >
                    {isCompleted ? (
                      <span className="text-sm">✓</span>
                    ) : (
                      <span className="text-sm">{frame.id}</span>
                    )}
                  </motion.div>

                  {/* Connector */}
                  {index < FRAME_CONFIG.length - 1 && (
                    <div
                      className={cn(
                        'w-8 mx-1 timeline-connector',
                        isCompleted && 'timeline-connector-active'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${frameId}-${currentCard}`}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-fixed">
        <div className="glass-card-elevated mx-4 mb-4 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={onPrevCard}
              disabled={currentCard === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
                currentCard === 0
                  ? 'text-text-disabled cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {/* Card Progress Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalCards }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: i === currentCard ? 1.2 : 1,
                    backgroundColor:
                      i === currentCard
                        ? 'var(--primary-blue)'
                        : i < currentCard
                          ? 'var(--success-green)'
                          : 'var(--border-subtle)',
                  }}
                  className="w-2 h-2 rounded-full"
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={onNextCard}
              disabled={!canProgress}
              className={cn(
                'flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all',
                canProgress
                  ? 'bg-primary-blue text-white hover:bg-primary-blue-hover shadow-glow-blue'
                  : 'bg-background-elevated text-text-disabled cursor-not-allowed'
              )}
            >
              {currentCard === totalCards - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

// ============================================
// Quest Card Wrapper
// ============================================

interface QuestCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function QuestCard({
  children,
  title,
  subtitle,
  icon,
  className,
}: QuestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('card-quest', className)}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-6">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-primary-blue/20 flex items-center justify-center text-primary-blue">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h2 className="text-xl font-display font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
}

// ============================================
// Quest Section
// ============================================

interface QuestSectionProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  className?: string;
}

export function QuestSection({
  children,
  label,
  required,
  className,
}: QuestSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          {required && <span className="text-xs text-error-red">*</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export default QuestContainer;
