'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { REVEAL_COLORS, EASING } from '@/lib/constants/frame4.constants';
import type { CategoryBreakdown } from '@/lib/types/frame4.types';
import { CheckCircle, AlertCircle, Minus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface Card4CategoryBreakdownProps {
  categoryBreakdowns: CategoryBreakdown[];
  onComplete: () => void;
}

export function Card4CategoryBreakdown({
  categoryBreakdowns,
  onComplete,
}: Card4CategoryBreakdownProps) {
  const [animatedCategories, setAnimatedCategories] = useState<string[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  // Staggered animation for categories
  useEffect(() => {
    categoryBreakdowns.forEach((cat, idx) => {
      setTimeout(() => {
        setAnimatedCategories((prev) => [...prev, cat.id]);
      }, idx * 200);
    });

    // Show insights after all bars animate
    setTimeout(() => {
      setShowInsights(true);
    }, categoryBreakdowns.length * 200 + 500);
  }, [categoryBreakdowns]);

  // Get bar color based on score
  const getBarColor = (score: number) => {
    if (score >= 70) return REVEAL_COLORS.exceptional;
    if (score >= 50) return REVEAL_COLORS.average;
    return REVEAL_COLORS.below;
  };

  // Get status icon
  const getStatusIcon = (status: CategoryBreakdown['status']) => {
    switch (status) {
      case 'strength':
        return <CheckCircle className="w-4 h-4 text-success-green" />;
      case 'improvement':
        return <AlertCircle className="w-4 h-4 text-error-red" />;
      default:
        return <Minus className="w-4 h-4 text-warning-amber" />;
    }
  };

  // Find strongest category
  const strongestCategory = categoryBreakdowns.reduce((prev, curr) =>
    curr.score > prev.score ? curr : prev
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary">Your Profile Breakdown</h3>
        <p className="text-sm text-text-muted mt-1">
          See how you score across the four key categories
        </p>
      </div>

      {/* Category bars */}
      <Card padding="lg">
        <CardContent>
          <div className="space-y-6">
            {categoryBreakdowns.map((category) => {
              const isAnimated = animatedCategories.includes(category.id);
              const isStrongest = category.id === strongestCategory.id;

              return (
                <div key={category.id} className="space-y-2">
                  {/* Label row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-text-primary">{category.label}</span>
                      {isStrongest && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: 'spring' }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-green/20 text-success-green text-xs font-medium"
                        >
                          <Sparkles className="w-3 h-3" />
                          Strongest
                        </motion.span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(category.status)}
                      <span
                        className="text-lg font-bold"
                        style={{ color: getBarColor(category.score) }}
                      >
                        {category.score}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-4 bg-background-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        isStrongest && 'relative overflow-hidden'
                      )}
                      style={{ backgroundColor: getBarColor(category.score) }}
                      initial={{ width: 0 }}
                      animate={{ width: isAnimated ? `${category.score}%` : 0 }}
                      transition={{
                        duration: 0.5,
                        ease: EASING.scoreReveal as unknown as string,
                      }}
                    >
                      {/* Pulsing highlight for strongest */}
                      {isStrongest && (
                        <motion.div
                          className="absolute inset-0 bg-white/30"
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Benchmark markers */}
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className="absolute h-full w-px bg-text-muted/30"
                        style={{ left: '50%' }}
                      />
                      <div
                        className="absolute h-full w-px bg-text-muted/30"
                        style={{ left: '70%' }}
                      />
                    </div>
                  </div>

                  {/* Weight indicator */}
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{Math.round(category.weight * 100)}% of total score</span>
                    <span
                      className={cn(
                        'capitalize',
                        category.status === 'strength' && 'text-success-green',
                        category.status === 'improvement' && 'text-error-red'
                      )}
                    >
                      {category.status === 'strength'
                        ? 'Strength'
                        : category.status === 'improvement'
                        ? 'Needs Work'
                        : 'Solid'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights section */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {categoryBreakdowns
              .filter((cat) => cat.status !== 'average')
              .map((category, idx) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    padding="md"
                    className={cn(
                      'border-l-4',
                      category.status === 'strength'
                        ? 'border-l-success-green bg-success-green/5'
                        : 'border-l-error-red bg-error-red/5'
                    )}
                  >
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium text-text-primary">
                            {category.label}:{' '}
                            <span
                              className={
                                category.status === 'strength'
                                  ? 'text-success-green'
                                  : 'text-error-red'
                              }
                            >
                              {category.status === 'strength' ? 'Your Edge' : 'Growth Area'}
                            </span>
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">
                            {category.insight}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center p-4 rounded-xl bg-background-secondary"
          >
            <p className="text-sm text-text-secondary">
              Your strongest area is{' '}
              <span className="font-semibold text-text-primary">
                {strongestCategory.label}
              </span>{' '}
              at {strongestCategory.score}/100. Focus on boosting your other categories to
              strengthen your overall profile.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Card4CategoryBreakdown;
