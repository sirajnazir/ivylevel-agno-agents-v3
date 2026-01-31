'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useSessionStore, useStudentStore } from '@/lib/store';
import {
  Bot,
  X,
  MessageCircle,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export type DroneMessageType = 'tip' | 'warning' | 'success' | 'info' | 'encouragement';

export interface DroneMessage {
  id: string;
  type: DroneMessageType;
  content: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoDismiss?: number; // ms
}

export interface DroneGuideProps {
  frameId: number;
  cardId?: string;
  customMessages?: DroneMessage[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  minimizable?: boolean;
  autoShow?: boolean;
  className?: string;
}

// ============================================
// Drone Message Content by Frame/Card
// ============================================

const FRAME_TIPS: Record<number, Record<string, DroneMessage[]>> = {
  1: {
    default: [
      {
        id: 'f1-welcome',
        type: 'info',
        content: "Welcome to IvyQuest! I'm your drone guide. Let's set up your profile and create your Digital Twin Fleet.",
      },
    ],
    role: [
      {
        id: 'f1-role',
        type: 'tip',
        content: "Select your role. Are you a student working on your own applications, or a parent helping your child?",
      },
    ],
    identity: [
      {
        id: 'f1-name',
        type: 'tip',
        content: "Enter your first name. This helps personalize your experience!",
      },
    ],
    schools: [
      {
        id: 'f1-schools',
        type: 'tip',
        content: "Select your dream schools. Each school creates a Digital Twin that analyzes your chances specific to that institution.",
      },
      {
        id: 'f1-schools-pro',
        type: 'encouragement',
        content: "Pro tip: Select 3-5 schools for the most meaningful comparison!",
      },
    ],
    major: [
      {
        id: 'f1-major',
        type: 'tip',
        content: "What do you want to study? Major competitiveness varies significantly by school.",
      },
    ],
  },
  2: {
    default: [
      {
        id: 'f2-intro',
        type: 'info',
        content: "Time for your Academic Snapshot! These metrics help us gauge your baseline competitiveness.",
      },
    ],
    gpa: [
      {
        id: 'f2-gpa',
        type: 'tip',
        content: "Enter your weighted GPA. For elite schools, 3.9+ is typically competitive.",
      },
    ],
    sat: [
      {
        id: 'f2-sat',
        type: 'tip',
        content: "SAT scores matter less than before, but 1500+ still helps at most schools.",
      },
    ],
    ap: [
      {
        id: 'f2-ap',
        type: 'tip',
        content: "AP courses show academic rigor. Quality matters more than quantity!",
      },
    ],
  },
  3: {
    default: [
      {
        id: 'f3-intro',
        type: 'info',
        content: "Now let's explore your extracurriculars and 'spike'. This is where you really stand out!",
      },
    ],
    spike: [
      {
        id: 'f3-spike',
        type: 'encouragement',
        content: "Your spike is your superpower! What's the ONE thing you're truly passionate about?",
      },
    ],
    activities: [
      {
        id: 'f3-activities',
        type: 'tip',
        content: "Depth > breadth. A few meaningful activities beat a long list of shallow ones.",
      },
    ],
    leadership: [
      {
        id: 'f3-leadership',
        type: 'tip',
        content: "Leadership doesn't require formal titles. Initiative and impact matter most.",
      },
    ],
  },
  4: {
    default: [
      {
        id: 'f4-intro',
        type: 'info',
        content: "Watch your Digital Twins come alive! Each one represents you as seen by that school's admissions.",
      },
    ],
  },
  5: {
    default: [
      {
        id: 'f5-intro',
        type: 'success',
        content: "Your assessment is complete! Let's reveal your admission chances.",
      },
    ],
  },
  6: {
    default: [
      {
        id: 'f6-intro',
        type: 'info',
        content: "Power-Ups are strategic actions that can boost your profile. Each mod shows potential impact!",
      },
    ],
  },
};

// ============================================
// Helper Functions
// ============================================

function getMessagesForContext(
  frameId: number,
  cardId?: string,
  customMessages?: DroneMessage[]
): DroneMessage[] {
  const frameTips = FRAME_TIPS[frameId] || {};
  const cardTips = cardId ? frameTips[cardId] || [] : [];
  const defaultTips = frameTips.default || [];

  // Combine with custom messages, custom first
  return [...(customMessages || []), ...cardTips, ...defaultTips];
}

// ============================================
// DroneGuide Component
// ============================================

export function DroneGuide({
  frameId,
  cardId,
  customMessages,
  position = 'bottom-right',
  minimizable = true,
  autoShow = true,
  className,
}: DroneGuideProps) {
  const [isMinimized, setIsMinimized] = useState(!autoShow);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());
  const studentName = useStudentStore((s) => s.profile.identity.name);

  // Get messages for current context
  const allMessages = useMemo(
    () => getMessagesForContext(frameId, cardId, customMessages),
    [frameId, cardId, customMessages]
  );

  // Filter out dismissed messages
  const activeMessages = useMemo(
    () => allMessages.filter((m) => !dismissedMessages.has(m.id)),
    [allMessages, dismissedMessages]
  );

  const currentMessage = activeMessages[currentMessageIndex];

  // Reset message index when context changes
  useEffect(() => {
    setCurrentMessageIndex(0);
  }, [frameId, cardId]);

  // Auto-dismiss handler
  useEffect(() => {
    if (currentMessage?.autoDismiss) {
      const timer = setTimeout(() => {
        handleDismiss(currentMessage.id);
      }, currentMessage.autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [currentMessage]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // Message type styling
  const messageTypeConfig: Record<DroneMessageType, { icon: typeof Bot; color: string; bgColor: string }> = {
    tip: { icon: Lightbulb, color: 'text-warning-amber', bgColor: 'bg-warning-amber/10' },
    warning: { icon: AlertCircle, color: 'text-error-red', bgColor: 'bg-error-red/10' },
    success: { icon: CheckCircle, color: 'text-success-green', bgColor: 'bg-success-green/10' },
    info: { icon: MessageCircle, color: 'text-primary-blue', bgColor: 'bg-primary-blue/10' },
    encouragement: { icon: Sparkles, color: 'text-gear-gold', bgColor: 'bg-gear-gold/10' },
  };

  const handleDismiss = useCallback((messageId: string) => {
    setDismissedMessages((prev) => new Set([...Array.from(prev), messageId]));
    if (currentMessageIndex >= activeMessages.length - 1) {
      setCurrentMessageIndex(Math.max(0, activeMessages.length - 2));
    }
  }, [currentMessageIndex, activeMessages.length]);

  const handlePrevMessage = useCallback(() => {
    setCurrentMessageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextMessage = useCallback(() => {
    setCurrentMessageIndex((prev) => Math.min(activeMessages.length - 1, prev + 1));
  }, [activeMessages.length]);

  // Don't render if no messages
  if (activeMessages.length === 0) return null;

  const typeConfig = currentMessage ? messageTypeConfig[currentMessage.type] : messageTypeConfig.info;
  const Icon = typeConfig?.icon || Bot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={cn(
        'fixed z-fixed',
        positionClasses[position],
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          // Minimized State - Just the drone icon
          <motion.button
            key="minimized"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsMinimized(false)}
            className="relative w-14 h-14 rounded-full bg-primary-blue hover:bg-primary-blue-hover shadow-glow-blue transition-all"
          >
            <Bot className="w-7 h-7 text-white mx-auto" />
            {activeMessages.length > 0 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gear-gold text-xs font-bold text-background-primary flex items-center justify-center"
              >
                {activeMessages.length}
              </motion.div>
            )}
          </motion.button>
        ) : (
          // Expanded State - Message bubble
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="drone-bubble w-80"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-text-primary">Drone Guide</span>
              </div>
              <div className="flex items-center gap-1">
                {minimizable && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-background-hover text-text-muted transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => currentMessage && handleDismiss(currentMessage.id)}
                  className="p-1.5 rounded-lg hover:bg-background-hover text-text-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Content */}
            {currentMessage && (
              <div className={cn('p-3 rounded-xl', typeConfig.bgColor)}>
                <div className="flex gap-2">
                  <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', typeConfig.color)} />
                  <p className="text-sm text-text-primary leading-relaxed">
                    {currentMessage.content}
                  </p>
                </div>

                {/* Action Button */}
                {currentMessage.action && (
                  <button
                    onClick={currentMessage.action.onClick}
                    className="mt-3 w-full px-3 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue-hover transition-colors"
                  >
                    {currentMessage.action.label}
                  </button>
                )}
              </div>
            )}

            {/* Navigation (if multiple messages) */}
            {activeMessages.length > 1 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                <button
                  onClick={handlePrevMessage}
                  disabled={currentMessageIndex === 0}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    currentMessageIndex === 0
                      ? 'text-text-disabled cursor-not-allowed'
                      : 'text-text-secondary hover:bg-background-hover'
                  )}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-xs text-text-muted">
                  {currentMessageIndex + 1} / {activeMessages.length}
                </span>
                <button
                  onClick={handleNextMessage}
                  disabled={currentMessageIndex === activeMessages.length - 1}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    currentMessageIndex === activeMessages.length - 1
                      ? 'text-text-disabled cursor-not-allowed'
                      : 'text-text-secondary hover:bg-background-hover'
                  )}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// useDroneMessages Hook
// ============================================

export function useDroneMessages(frameId: number, cardId?: string) {
  const [customMessages, setCustomMessages] = useState<DroneMessage[]>([]);

  const addMessage = useCallback((message: Omit<DroneMessage, 'id'>) => {
    const newMessage: DroneMessage = {
      ...message,
      id: `custom-${Date.now()}`,
    };
    setCustomMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setCustomMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setCustomMessages([]);
  }, []);

  return {
    customMessages,
    addMessage,
    removeMessage,
    clearMessages,
  };
}

export default DroneGuide;
