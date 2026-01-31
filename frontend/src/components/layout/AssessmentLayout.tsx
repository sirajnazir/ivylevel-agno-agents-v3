'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { FrameProgress } from '@/components/ui/Progress';
import { useSessionStore } from '@/lib/store';
import { IvylevelLogo } from '@/components/IvylevelLogo';
import { ChevronLeft, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { HighlightedText } from '@/components/ui/HighlightedText';
import { PillarProgressMini } from '@/components/progress/PillarProgressMini';

interface AssessmentLayoutProps {
  children: ReactNode;
  showProgress?: boolean;
  showXP?: boolean;
  showPillarProgress?: boolean; // 🆕 NEW: Show mini pillar cards
  className?: string;
}

export function AssessmentLayout({
  children,
  showProgress = true,
  showXP = true,
  showPillarProgress = false, // 🆕 Default to false (original behavior)
  className,
}: AssessmentLayoutProps) {
  const currentFrame = useSessionStore((s) => s.current_frame);
  const totalXP = useSessionStore((s) => s.total_xp);

  return (
    <div
      className={cn('min-h-screen', className)}
      style={{
        background: `linear-gradient(135deg, ${BRAND_COLORS.bgPage} 0%, #FFF8F6 50%, ${BRAND_COLORS.bgPage} 100%)`,
      }}
    >
      {/* Background floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(254, 74, 34, 0.3) 0%, transparent 70%)',
            left: '-5%',
            top: '20%',
            animation: 'float-slow 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(100, 20, 50, 0.25) 0%, transparent 70%)',
            right: '-5%',
            bottom: '20%',
            animation: 'float-medium 6s ease-in-out infinite',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
      `}</style>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 20px rgba(100, 20, 50, 0.05)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button / Logo */}
            <div className="flex items-center gap-4">
              <Link
                href="/quest"
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#641432' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(100, 20, 50, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <IvylevelLogo size="sm" />
            </div>

            {/* Right side: Edge Counter + Pillar Progress */}
            <div className="flex items-center gap-4">
              {/* Edge Counter */}
              {showXP && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 74, 35, 0.1)',
                    border: '1px solid rgba(255, 74, 35, 0.2)',
                  }}
                >
                  <Zap className="w-4 h-4" style={{ color: '#FF4A23' }} />
                  <span className="font-semibold" style={{ color: '#FF4A23' }}>{totalXP} Edge</span>
                </motion.div>
              )}

              {/* 🆕 Pillar Progress (NEW - optional) */}
              {showPillarProgress && (
                <div className="hidden md:block">
                  <PillarProgressMini variant="horizontal" />
                </div>
              )}
            </div>
          </div>

          {/* Frame Progress */}
          {showProgress && (
            <div className="mt-3">
              <FrameProgress currentFrame={currentFrame} />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className={cn('relative z-10 pt-32 pb-12 px-4', showProgress ? 'pt-40' : 'pt-24')}>
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Frame wrapper with animations
interface FrameWrapperProps {
  children: ReactNode;
  title: string;
  /** Words to highlight in primary orange */
  highlights?: string[];
  subtitle?: string;
  className?: string;
}

export function FrameWrapper({ children, title, highlights, subtitle, className }: FrameWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-8', className)}
    >
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <HighlightedText
            text={title}
            highlights={highlights}
            baseColor={BRAND_COLORS.textHeading}
            highlightColor={BRAND_COLORS.primary}
          />
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-lg"
            style={{ color: BRAND_COLORS.textSecondary }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// Card navigation component with Ivylevel styling
interface CardStepProps {
  currentCard: number;
  totalCards: number;
  onNext: () => void;
  onPrev: () => void;
  canProgress?: boolean;
  nextLabel?: string;
  showPrev?: boolean;
}

export function CardNavigation({
  currentCard,
  totalCards,
  onNext,
  onPrev,
  canProgress = true,
  nextLabel = 'Continue',
  showPrev = true,
}: CardStepProps) {
  const isLast = currentCard === totalCards - 1;

  return (
    <div className="flex items-center justify-between pt-6">
      <div>
        {showPrev && currentCard > 0 && (
          <button
            onClick={onPrev}
            className="px-4 py-2 rounded-xl font-medium transition-all duration-200"
            style={{
              color: '#641432',
              backgroundColor: 'transparent',
              border: '2px solid #641432',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 20, 50, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalCards }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all',
              i === currentCard
                ? 'w-6'
                : 'w-2'
            )}
            style={{
              backgroundColor:
                i === currentCard
                  ? '#FF4A23'
                  : i < currentCard
                  ? 'rgba(255, 74, 35, 0.5)'
                  : '#e5e7eb',
            }}
          />
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!canProgress}
        className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
        style={{
          background: canProgress
            ? 'linear-gradient(135deg, #FE4A22, #FF6B47)'
            : '#e5e7eb',
          color: canProgress ? 'white' : '#9ca3af',
          boxShadow: canProgress ? '0 4px 12px rgba(254, 74, 34, 0.3)' : 'none',
          cursor: canProgress ? 'pointer' : 'not-allowed',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          if (canProgress) {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(254, 74, 34, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (canProgress) {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(254, 74, 34, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isLast ? 'Complete' : nextLabel}
      </button>
    </div>
  );
}
