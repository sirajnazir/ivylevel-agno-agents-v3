'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useSessionStore } from '@/lib/store';
import { Check, Lock } from 'lucide-react';
import { IconRocket, IconChart, IconLayers, IconSettings, IconTarget, IconEnergy } from '@/components/icons';
import { BRAND_COLORS } from '@/lib/constants/brand';

// ============================================
// Types
// ============================================

export interface TimelineNode {
  id: number;
  name: string;
  shortName: string;
  iconComponent: React.FC<{ size?: number; color?: string }>;
  description: string;
  color: string;
}

export interface TimelineProps {
  nodes: TimelineNode[];
  currentNode: number;
  completedNodes?: number[];
  onNodeClick?: (nodeId: number) => void;
  allowNavigation?: boolean;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showProgress?: boolean;
  className?: string;
}

// ============================================
// Default Frame Nodes
// ============================================

export const FRAME_NODES: TimelineNode[] = [
  {
    id: 1,
    name: 'Warmup',
    shortName: 'START',
    iconComponent: IconRocket,
    description: 'Basic profile setup',
    color: BRAND_COLORS.primary,
  },
  {
    id: 2,
    name: 'Snapshot',
    shortName: 'SNAP',
    iconComponent: IconChart,
    description: 'Academic metrics',
    color: BRAND_COLORS.success,
  },
  {
    id: 3,
    name: 'Building',
    shortName: 'BUILD',
    iconComponent: IconLayers,
    description: 'Activities & passion',
    color: BRAND_COLORS.warning,
  },
  {
    id: 4,
    name: 'Operating',
    shortName: 'LIVE',
    iconComponent: IconSettings,
    description: 'Twin evolution',
    color: BRAND_COLORS.secondary,
  },
  {
    id: 5,
    name: 'Reveal',
    shortName: 'ODDS',
    iconComponent: IconTarget,
    description: 'Your chances',
    color: BRAND_COLORS.primary,
  },
  {
    id: 6,
    name: 'Power-Ups',
    shortName: 'MODS',
    iconComponent: IconEnergy,
    description: 'Strategy boosters',
    color: BRAND_COLORS.primaryLight,
  },
];

// ============================================
// Timeline Component
// ============================================

export function Timeline({
  nodes = FRAME_NODES,
  currentNode,
  completedNodes = [],
  onNodeClick,
  allowNavigation = false,
  variant = 'horizontal',
  size = 'md',
  showLabels = true,
  showProgress = true,
  className,
}: TimelineProps) {
  const frameProgress = useSessionStore((s) => s.frame_progress);

  // Calculate overall progress
  const progress = useMemo(() => {
    const totalNodes = nodes.length;
    const completed = completedNodes.length;
    return (completed / totalNodes) * 100;
  }, [nodes.length, completedNodes.length]);

  // Size configurations
  const sizes = {
    sm: {
      node: 'w-8 h-8',
      icon: 'text-sm',
      connector: 'w-6',
      text: 'text-xs',
    },
    md: {
      node: 'w-10 h-10',
      icon: 'text-base',
      connector: 'w-8',
      text: 'text-sm',
    },
    lg: {
      node: 'w-12 h-12',
      icon: 'text-lg',
      connector: 'w-12',
      text: 'text-base',
    },
  };

  const sizeConfig = sizes[size];

  const isHorizontal = variant === 'horizontal';

  return (
    <div
      className={cn(
        'relative',
        isHorizontal ? 'flex items-center justify-center' : 'flex flex-col items-start',
        className
      )}
    >
      {/* Progress overlay (optional) */}
      {showProgress && isHorizontal && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-border-subtle -z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-success-green to-primary-blue"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {nodes.map((node, index) => {
        const isCompleted = completedNodes.includes(node.id);
        const isCurrent = currentNode === node.id;
        const isFuture = currentNode < node.id && !isCompleted;
        const isClickable = allowNavigation && (isCompleted || isCurrent);

        return (
          <div
            key={node.id}
            className={cn(
              'flex items-center',
              isHorizontal ? '' : 'mb-4 last:mb-0'
            )}
          >
            {/* Node */}
            <motion.button
              onClick={() => isClickable && onNodeClick?.(node.id)}
              disabled={!isClickable}
              whileHover={isClickable ? { scale: 1.1 } : undefined}
              whileTap={isClickable ? { scale: 0.95 } : undefined}
              className={cn(
                'relative rounded-full flex items-center justify-center transition-all duration-300',
                sizeConfig.node,
                isCurrent && [
                  'bg-primary-blue border-2 border-primary-blue',
                  'shadow-glow-blue',
                  'text-white',
                ],
                isCompleted && !isCurrent && [
                  'bg-success-green border-2 border-success-green',
                  'text-white',
                ],
                isFuture && [
                  'bg-background-elevated border-2 border-border-subtle',
                  'text-text-muted',
                ],
                isClickable && 'cursor-pointer',
                !isClickable && isFuture && 'cursor-not-allowed'
              )}
            >
              {isCompleted && !isCurrent ? (
                <Check className="w-4 h-4" />
              ) : isFuture ? (
                <Lock className="w-3 h-3" />
              ) : (
                <node.iconComponent size={16} color="currentColor" />
              )}

              {/* Pulse animation for current */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary-blue"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.button>

            {/* Label */}
            {showLabels && isHorizontal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap',
                  sizeConfig.text,
                  isCurrent && 'text-primary-blue font-medium',
                  isCompleted && !isCurrent && 'text-success-green',
                  isFuture && 'text-text-muted'
                )}
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {node.shortName}
              </motion.div>
            )}

            {/* Vertical label */}
            {showLabels && !isHorizontal && (
              <div className="ml-3">
                <div
                  className={cn(
                    'font-medium',
                    sizeConfig.text,
                    isCurrent && 'text-primary-blue',
                    isCompleted && !isCurrent && 'text-success-green',
                    isFuture && 'text-text-muted'
                  )}
                >
                  {node.name}
                </div>
                <div className="text-xs text-text-muted">{node.description}</div>
              </div>
            )}

            {/* Connector */}
            {index < nodes.length - 1 && isHorizontal && (
              <div
                className={cn(
                  'mx-1 h-0.5 transition-colors duration-300',
                  sizeConfig.connector,
                  isCompleted || (isCurrent && index < currentNode - 1)
                    ? 'bg-success-green'
                    : 'bg-border-subtle'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Mini Timeline - Compact Version
// ============================================

interface MiniTimelineProps {
  currentFrame: number;
  className?: string;
}

export function MiniTimeline({ currentFrame, className }: MiniTimelineProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {FRAME_NODES.map((node, index) => {
        const isCompleted = currentFrame > node.id;
        const isCurrent = currentFrame === node.id;

        return (
          <div key={node.id} className="flex items-center">
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                isCurrent && 'bg-primary-blue',
                isCompleted && 'bg-success-green',
                !isCurrent && !isCompleted && 'bg-border-subtle'
              )}
            />
            {index < FRAME_NODES.length - 1 && (
              <div
                className={cn(
                  'w-3 h-px mx-0.5',
                  isCompleted ? 'bg-success-green' : 'bg-border-subtle'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
