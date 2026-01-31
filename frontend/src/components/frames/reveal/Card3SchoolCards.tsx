'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { REVEAL_COLORS, EASING, SCHOOL_CARD_AUTOPLAY } from '@/lib/constants/frame4.constants';
import type { SchoolFitCard } from '@/lib/types/frame4.types';
import { GraduationCap, ChevronLeft, ChevronRight, Play, Pause, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Card3SchoolCardsProps {
  schoolFits: SchoolFitCard[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  autoplay: boolean;
  onToggleAutoplay: () => void;
  onComplete: () => void;
}

export function Card3SchoolCards({
  schoolFits,
  activeIndex,
  onIndexChange,
  autoplay,
  onToggleAutoplay,
  onComplete,
}: Card3SchoolCardsProps) {
  const [direction, setDirection] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle autoplay
  useEffect(() => {
    if (autoplay && schoolFits.length > 1) {
      autoplayRef.current = setInterval(() => {
        setDirection(1);
        onIndexChange((activeIndex + 1) % schoolFits.length);
      }, SCHOOL_CARD_AUTOPLAY.interval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, activeIndex, schoolFits.length, onIndexChange]);

  // Handle swipe
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x > threshold && activeIndex > 0) {
        setDirection(-1);
        onIndexChange(activeIndex - 1);
      } else if (info.offset.x < -threshold && activeIndex < schoolFits.length - 1) {
        setDirection(1);
        onIndexChange(activeIndex + 1);
      }
    },
    [activeIndex, schoolFits.length, onIndexChange]
  );

  const goToNext = useCallback(() => {
    if (activeIndex < schoolFits.length - 1) {
      setDirection(1);
      onIndexChange(activeIndex + 1);
    }
  }, [activeIndex, schoolFits.length, onIndexChange]);

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) {
      setDirection(-1);
      onIndexChange(activeIndex - 1);
    }
  }, [activeIndex, onIndexChange]);

  const activeSchool = schoolFits[activeIndex];

  if (!activeSchool) {
    return null;
  }

  // Get fit color
  const getFitColor = (label: string) => {
    switch (label) {
      case 'safety':
        return REVEAL_COLORS.safety;
      case 'target':
        return REVEAL_COLORS.target;
      default:
        return REVEAL_COLORS.reach;
    }
  };

  // Get category bar color
  const getCategoryColor = (id: string) => {
    return REVEAL_COLORS[id as keyof typeof REVEAL_COLORS] || REVEAL_COLORS.aptitude;
  };

  // Slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-4"
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-semibold text-text-primary">School Fit Analysis</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAutoplay}
            className="p-2"
          >
            {autoplay ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <span className="text-sm text-text-muted">
            {activeIndex + 1} / {schoolFits.length}
          </span>
        </div>
      </div>

      {/* Swipeable card container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl"
        style={{ minHeight: '400px' }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeSchool.schoolId}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: EASING.cardSwipe as unknown as string,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            <Card
              padding="lg"
              className="border-2"
              style={{ borderColor: activeSchool.schoolColor }}
            >
              <CardContent>
                {/* School header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: activeSchool.schoolColor }}
                  >
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-text-primary">
                      {activeSchool.schoolName}
                    </h4>
                    <p className="text-sm text-text-muted mt-1">
                      {activeSchool.culture}
                    </p>
                  </div>
                </div>

                {/* Probability display */}
                <div className="p-4 rounded-xl bg-background-secondary mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Your Probability Range</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize"
                      style={{ backgroundColor: getFitColor(activeSchool.fitLabel) }}
                    >
                      {activeSchool.fitLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: getFitColor(activeSchool.fitLabel) }}
                    >
                      {activeSchool.probability.min}-{activeSchool.probability.max}%
                    </span>
                    <span className="text-sm text-text-muted">probability</span>
                  </div>
                </div>

                {/* Category scores */}
                <div className="space-y-3 mb-6">
                  <h5 className="text-sm font-medium text-text-secondary">Your Fit by Category</h5>
                  {Object.entries(activeSchool.categoryScores).map(([key, score]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary capitalize">{key}</span>
                        <span className="font-medium text-text-primary">{score}</span>
                      </div>
                      <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: getCategoryColor(key) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key insight */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary-blue/10 border border-primary-blue/20">
                  <Lightbulb className="w-5 h-5 text-primary-blue flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary">
                    {activeSchool.keyInsight}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {activeIndex > 0 && (
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-primary/80 backdrop-blur flex items-center justify-center shadow-lg border border-border-subtle hover:bg-background-secondary transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5 text-text-primary" />
          </button>
        )}
        {activeIndex < schoolFits.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-primary/80 backdrop-blur flex items-center justify-center shadow-lg border border-border-subtle hover:bg-background-secondary transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5 text-text-primary" />
          </button>
        )}
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2">
        {schoolFits.map((school, idx) => (
          <button
            key={school.schoolId}
            onClick={() => {
              setDirection(idx > activeIndex ? 1 : -1);
              onIndexChange(idx);
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              idx === activeIndex
                ? 'w-6 bg-primary-blue'
                : 'bg-border-subtle hover:bg-text-muted'
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default Card3SchoolCards;
