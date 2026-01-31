'use client';

import React from 'react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { DronePanel } from '@/components/common/DroneAssistant';

/**
 * SplitFrameLayout - 2-column responsive layout for frames
 *
 * Layout Structure:
 * ┌──────────────────────────────────────────────────────┐
 * │  Left Panel (50%)       │  Right Panel (50%)        │
 * │  ─────────────────      │  ─────────────────        │
 * │  Input Cards            │  Drone Assistant          │
 * │  (children)             │  or IV Animation          │
 * │                         │  + Code Box               │
 * └──────────────────────────────────────────────────────┘
 *
 * Responsive Behavior:
 * - Desktop (≥1024px): 2 columns side-by-side
 * - Mobile/Tablet (<1024px): Stack vertically (left only, drone hidden)
 */

interface SplitFrameLayoutProps {
  /** Left panel content (input cards) */
  children: React.ReactNode;

  /** Right panel: Drone assistant message */
  droneMessage?: string;

  /** Right panel: Show coral gradient background for drone (default: true) */
  droneGradientBg?: boolean;

  /** Right panel: IV animation component (centered in container) */
  ivAnimation?: React.ReactNode;

  /** Right panel: Full-width custom content (no centering wrapper) */
  rightPanel?: React.ReactNode;

  /** Right panel: Code box content (single message or array of messages) */
  codeBoxContent?: string | string[];

  /** Left panel width (default: "50%") - used for inline style on desktop */
  leftWidth?: string;

  /** Right panel width (default: "50%") - used for inline style on desktop */
  rightWidth?: string;

  /** Additional CSS classes for the container */
  className?: string;

  /** Hide the code box even if content is provided */
  hideCodeBox?: boolean;

  /** Hide the IV animation section even if provided */
  hideIVAnimation?: boolean;

  /** Hide the drone on mobile (default: true) */
  hideDroneOnMobile?: boolean;
}

/**
 * Code box styling constants
 * Using brand orange colors for the code box
 */
const CODE_BOX_STYLES = {
  container: {
    backgroundColor: BRAND_COLORS.primaryBg,
    border: `2px solid ${BRAND_COLORS.primary}20`,
    borderRadius: '12px',
    padding: '24px',
  },
  text: {
    color: BRAND_COLORS.secondary,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '14px',
    lineHeight: '1.6',
  },
} as const;

/**
 * IV Animation section styling constants
 */
const IV_ANIMATION_STYLES = {
  container: {
    backgroundColor: BRAND_COLORS.bgPrimary,
    border: `1px solid ${BRAND_COLORS.borderLight}`,
    borderRadius: '12px',
    padding: '32px',
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
} as const;

export function SplitFrameLayout({
  children,
  droneMessage,
  droneGradientBg = true,
  ivAnimation,
  rightPanel,
  codeBoxContent,
  leftWidth = '50%',
  rightWidth = '50%',
  className = '',
  hideCodeBox = false,
  hideIVAnimation = false,
  hideDroneOnMobile = true,
}: SplitFrameLayoutProps) {
  // Determine if we should show right panel sections
  const showDrone = !!droneMessage;
  const showIVAnimation = ivAnimation && !hideIVAnimation;
  const showRightPanel = !!rightPanel;
  const showCodeBox = codeBoxContent && !hideCodeBox;
  const hasRightPanelContent = showDrone || showIVAnimation || showRightPanel || showCodeBox;

  // Convert codeBoxContent to array for consistent rendering
  const codeMessages = codeBoxContent
    ? Array.isArray(codeBoxContent)
      ? codeBoxContent
      : [codeBoxContent]
    : [];

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop: 2-column grid, Mobile: Stack vertically */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Input Cards (children) */}
        <div className="space-y-6">
          {children}
        </div>

        {/* RIGHT PANEL: Drone Assistant / IV Animation / Custom Panel / Code Box */}
        {hasRightPanelContent && (
          <div className={`space-y-6 ${hideDroneOnMobile && showDrone ? 'hidden lg:block' : ''}`}>
            {/* Drone Assistant Panel */}
            {showDrone && (
              <DronePanel
                message={droneMessage}
                showGradientBg={droneGradientBg}
                className="min-h-[400px]"
              />
            )}

            {/* IV Animation Section (centered) */}
            {showIVAnimation && (
              <div style={IV_ANIMATION_STYLES.container}>
                {ivAnimation}
              </div>
            )}

            {/* Custom Right Panel (full-width, no wrapper) */}
            {showRightPanel && rightPanel}

            {/* Code Box Section */}
            {showCodeBox && (
              <div style={CODE_BOX_STYLES.container}>
                <div className="space-y-3">
                  {codeMessages.map((message, index) => (
                    <p
                      key={index}
                      style={CODE_BOX_STYLES.text}
                    >
                      {message}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SplitFrameLayout;
