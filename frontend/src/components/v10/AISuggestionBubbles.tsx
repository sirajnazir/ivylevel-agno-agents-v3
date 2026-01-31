/**
 * AISuggestionBubbles Component
 * Proactive AI suggestions displayed as floating bubbles.
 * MERGED from existing spec - triggered by agent events.
 * @version 10.0
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, Lightbulb, Trophy, Zap } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { getFeatureFlags } from '@/lib/config/featureFlags';
import { subscribe, AgentEventType } from '@/lib/events/eventBus';

export interface Suggestion {
  id: string;
  text: string;
  detail?: string;
  priority: 'high' | 'medium' | 'low';
  icon?: 'sparkles' | 'lightbulb' | 'trophy' | 'zap';
  action?: () => void;
  actionLabel?: string;
  expiresAt?: number;
}

interface AISuggestionBubblesProps {
  suggestions?: Suggestion[];
  maxVisible?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  autoHideDelay?: number;
}

const ICON_MAP = {
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  trophy: Trophy,
  zap: Zap,
};

const PRIORITY_COLORS = {
  high: { bg: BRAND_COLORS.primaryBg, border: BRAND_COLORS.primary, text: BRAND_COLORS.primary },
  medium: { bg: '#FEF3C7', border: '#D97706', text: '#92400E' },
  low: { bg: '#DBEAFE', border: '#2563EB', text: '#1E40AF' },
};

export function AISuggestionBubbles({
  suggestions: propSuggestions = [],
  maxVisible = 3,
  position = 'bottom-right',
  autoHideDelay = 10000,
}: AISuggestionBubblesProps) {
  const flags = getFeatureFlags();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(propSuggestions);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Subscribe to suggestion events from agents
  useEffect(() => {
    if (!flags.eventBus) return;

    const unsubscribe = subscribe('suggestion.ready', (event) => {
      const newSuggestion = event.data as Suggestion;
      setSuggestions(prev => {
        // Avoid duplicates
        if (prev.some(s => s.id === newSuggestion.id)) return prev;
        return [...prev, { ...newSuggestion, id: newSuggestion.id || crypto.randomUUID() }];
      });
    });

    return unsubscribe;
  }, [flags.eventBus]);

  // Also watch for prop changes
  useEffect(() => {
    if (propSuggestions.length > 0) {
      setSuggestions(prev => {
        const newOnes = propSuggestions.filter(ps => !prev.some(s => s.id === ps.id));
        return [...prev, ...newOnes];
      });
    }
  }, [propSuggestions]);

  // Auto-dismiss after delay
  useEffect(() => {
    if (autoHideDelay <= 0) return;

    const timers = suggestions.map(s => {
      if (dismissed.has(s.id)) return null;
      return setTimeout(() => {
        setDismissed(prev => new Set([...Array.from(prev), s.id]));
      }, s.expiresAt ? s.expiresAt - Date.now() : autoHideDelay);
    });

    return () => timers.forEach(t => t && clearTimeout(t));
  }, [suggestions, autoHideDelay, dismissed]);

  const handleDismiss = useCallback((id: string) => {
    setDismissed(prev => new Set([...Array.from(prev), id]));
  }, []);

  const handleAction = useCallback((suggestion: Suggestion) => {
    suggestion.action?.();
    handleDismiss(suggestion.id);
  }, [handleDismiss]);

  // Don't render if suggestions disabled (check after all hooks)
  if (!flags.suggestions) return null;

  const visibleSuggestions = suggestions
    .filter(s => !dismissed.has(s.id))
    .slice(0, maxVisible);

  if (visibleSuggestions.length === 0) return null;

  const positionClasses = {
    'bottom-right': 'fixed bottom-24 right-6',
    'bottom-left': 'fixed bottom-24 left-6',
    'top-right': 'fixed top-20 right-6',
  };

  return (
    <div className={`${positionClasses[position]} z-40 space-y-3 max-w-sm`}>
      <AnimatePresence mode="popLayout">
        {visibleSuggestions.map((suggestion, index) => (
          <SuggestionBubble
            key={suggestion.id}
            suggestion={suggestion}
            index={index}
            onDismiss={() => handleDismiss(suggestion.id)}
            onAction={() => handleAction(suggestion)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface SuggestionBubbleProps {
  suggestion: Suggestion;
  index: number;
  onDismiss: () => void;
  onAction: () => void;
}

function SuggestionBubble({ suggestion, index, onDismiss, onAction }: SuggestionBubbleProps) {
  const Icon = ICON_MAP[suggestion.icon || 'sparkles'];
  const colors = PRIORITY_COLORS[suggestion.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
      className="rounded-xl p-4 shadow-lg cursor-pointer group"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
      onClick={suggestion.action ? onAction : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${colors.border}20` }}
        >
          <Icon size={16} style={{ color: colors.text }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            {suggestion.text}
          </p>
          {suggestion.detail && (
            <p className="text-xs mt-1 opacity-80" style={{ color: colors.text }}>
              {suggestion.detail}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded"
        >
          <X size={14} style={{ color: colors.text }} />
        </button>
      </div>

      {/* Action hint */}
      {suggestion.action && (
        <div className="flex justify-end mt-2">
          <span
            className="text-xs flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ color: colors.text }}
          >
            {suggestion.actionLabel || 'Tap to learn more'} 
            <ChevronRight size={12} />
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Helper to create suggestions programmatically
export function createSuggestion(
  text: string,
  options: Partial<Omit<Suggestion, 'id' | 'text'>> = {}
): Suggestion {
  return {
    id: crypto.randomUUID(),
    text,
    priority: 'medium',
    icon: 'sparkles',
    ...options,
  };
}

export default AISuggestionBubbles;
