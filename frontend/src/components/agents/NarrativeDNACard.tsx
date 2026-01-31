// Narrative DNA Card Component
// File: components/agents/NarrativeDNACard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Quote, Tag, TrendingUp, Info, RefreshCw } from 'lucide-react';

interface NarrativeDNA {
  dna: string;
  themes: string[];
  confidence: number;
  rationale: string;
  identity_markers?: string[];
}

interface NarrativeDNACardProps {
  narrativeDNA: NarrativeDNA | null | undefined;
  isLoading?: boolean;
  onRefresh?: () => void;
  compact?: boolean;
  showAnimation?: boolean;
}

export function NarrativeDNACard({
  narrativeDNA,
  isLoading = false,
  onRefresh,
  compact = false,
  showAnimation = true,
}: NarrativeDNACardProps) {
  const [isRevealed, setIsRevealed] = useState(!showAnimation);

  useEffect(() => {
    if (narrativeDNA && showAnimation && !isRevealed) {
      const timer = setTimeout(() => setIsRevealed(true), 500);
      return () => clearTimeout(timer);
    }
  }, [narrativeDNA, showAnimation, isRevealed]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg animate-pulse">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </div>
          <div className="h-6 w-40 bg-purple-200 dark:bg-purple-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-purple-100 dark:bg-purple-800 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-purple-100 dark:bg-purple-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!narrativeDNA) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Sparkles className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-600 dark:text-gray-400">Narrative DNA</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Complete your assessment to synthesize your unique narrative DNA.
        </p>
      </div>
    );
  }

  const confidenceColor =
    narrativeDNA.confidence >= 0.8
      ? 'text-green-600 dark:text-green-400'
      : narrativeDNA.confidence >= 0.6
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-orange-600 dark:text-orange-400';

  const confidenceLabel =
    narrativeDNA.confidence >= 0.8
      ? 'High Confidence'
      : narrativeDNA.confidence >= 0.6
        ? 'Good Confidence'
        : 'Developing';

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Quote className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
            "{narrativeDNA.dna}"
          </p>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {(narrativeDNA.themes || []).slice(0, 3).map((theme, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={showAnimation ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Your Narrative DNA
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The core identity that threads through your story
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors"
              title="Regenerate narrative"
            >
              <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
          )}
        </div>

        {/* DNA Quote */}
        <motion.div
          initial={showAnimation && !isRevealed ? { opacity: 0, scale: 0.95 } : false}
          animate={isRevealed ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mb-6"
        >
          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-200 dark:text-purple-700" />
          <blockquote className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100 pl-6 py-2 border-l-4 border-purple-400 dark:border-purple-500 italic">
            {narrativeDNA.dna}
          </blockquote>
        </motion.div>

        {/* Themes */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Core Themes
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(narrativeDNA.themes || []).map((theme, index) => (
              <motion.span
                key={typeof theme === 'string' ? theme : (theme as any).name || index}
                initial={showAnimation ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
              >
                {typeof theme === 'object'
                  ? ((theme as any).name || (theme as any).label || JSON.stringify(theme))
                  : String(theme)}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Confidence
              </span>
            </div>
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {confidenceLabel} ({Math.round(narrativeDNA.confidence * 100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={showAnimation ? { width: 0 } : false}
              animate={{ width: `${narrativeDNA.confidence * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-2 rounded-full ${narrativeDNA.confidence >= 0.8
                ? 'bg-green-500'
                : narrativeDNA.confidence >= 0.6
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
                }`}
            />
          </div>
        </div>

        {/* Rationale */}
        {narrativeDNA.rationale && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {narrativeDNA.rationale}
              </p>
            </div>
          </div>
        )}

        {/* Identity Markers */}
        {narrativeDNA.identity_markers && narrativeDNA.identity_markers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Identity Markers
            </p>
            <div className="flex flex-wrap gap-1">
              {(narrativeDNA.identity_markers || []).map((marker, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                >
                  {typeof marker === 'object'
                    ? ((marker as any).name || (marker as any).label || JSON.stringify(marker))
                    : String(marker)}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default NarrativeDNACard;
