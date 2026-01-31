/**
 * IvyQuest v3.0 — Frame 4: Card 3 - Hidden Capabilities
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 *
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import {
  HIDDEN_CAPABILITIES,
  HIDDEN_CAPABILITY_IDS,
  VALIDATION_RULES,
  IVY_MESSAGES,
} from '@/lib/constants/frame3.constants';
import { BRAND_COLORS } from '@/lib/constants/brand';
import {
  IconAI,
  IconPen,
  IconMicrophone,
  IconPalette,
  IconWrench,
  IconUsers,
  IconBarChart,
  IconTarget,
  IconLightbulb,
} from '@/components/icons';
import type { Card3Props } from '@/lib/types/frame3.types';
import type { HiddenCapability } from '@/lib/constants/frame3.constants';

// Icon mapping for Hidden Capabilities - maps capability ID to icon component
const CAPABILITY_ICONS: Record<HiddenCapability, React.FC<{ size?: number; color?: string }>> = {
  writing: IconPen,
  public_speaking: IconMicrophone,
  creative_design: IconPalette,
  technical_build: IconWrench,
  networking: IconUsers,
  data_analysis: IconBarChart,
  strategic_planning: IconTarget,
  idea_generation: IconLightbulb,
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CapabilityTileProps {
  capabilityId: HiddenCapability;
  capability: (typeof HIDDEN_CAPABILITIES)[HiddenCapability];
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const CapabilityTile: React.FC<CapabilityTileProps> = ({
  capabilityId,
  capability,
  isSelected,
  isDisabled,
  onClick,
}) => {
  const IconComponent = CAPABILITY_ICONS[capabilityId];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 min-h-[120px]"
      style={
        isSelected
          ? {
              borderColor: BRAND_COLORS.primary,
              backgroundColor: BRAND_COLORS.primaryBg,
              boxShadow: BRAND_COLORS.shadowPrimary,
            }
          : isDisabled
            ? {
                borderColor: BRAND_COLORS.borderLight,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                opacity: 0.5,
                cursor: 'not-allowed',
              }
            : {
                borderColor: BRAND_COLORS.borderLight,
                backgroundColor: BRAND_COLORS.bgPrimary,
              }
      }
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: BRAND_COLORS.primary }}
          >
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>
      )}

      <div className="mb-2">
        <IconComponent
          size={32}
          color={isSelected ? BRAND_COLORS.primary : BRAND_COLORS.iconPrimary}
        />
      </div>
      <span
        className="font-semibold text-sm text-center"
        style={{ color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textHeading }}
      >
        {capability.label}
      </span>
      <span
        className="text-xs text-center mt-1 line-clamp-2"
        style={{ color: BRAND_COLORS.textMuted }}
      >
        {capability.description}
      </span>
    </motion.button>
  );
};

interface SelectedTagsProps {
  capabilities: HiddenCapability[];
  onRemove: (capability: HiddenCapability) => void;
}

const SelectedTags: React.FC<SelectedTagsProps> = ({ capabilities, onRemove }) => {
  if (capabilities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {capabilities.map((capId) => {
        const cap = HIDDEN_CAPABILITIES[capId];
        const IconComponent = CAPABILITY_ICONS[capId];
        return (
          <motion.button
            key={capId}
            type="button"
            onClick={() => onRemove(capId)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: BRAND_COLORS.primaryBg,
              border: `1px solid ${BRAND_COLORS.primary}50`,
              color: BRAND_COLORS.primary,
            }}
          >
            <IconComponent size={16} color={BRAND_COLORS.primary} />
            <span>{cap.label}</span>
            <span className="ml-1 opacity-60">×</span>
          </motion.button>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Card3HiddenCapabilities: React.FC<Card3Props> = ({
  hiddenCapabilities,
  onCapabilityToggle,
  onComplete,
  onBack,
  validation,
}) => {
  const maxReached =
    hiddenCapabilities.length >= VALIDATION_RULES.card3.maxCapabilities;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-display font-bold mb-3"
          style={{ color: BRAND_COLORS.textHeading }}
        >
          Hidden Capabilities
        </h2>
        <div
          className="flex items-center justify-center gap-2"
          style={{ color: BRAND_COLORS.textSecondary }}
        >
          <IconAI size={20} color={BRAND_COLORS.iconPrimary} />
          <span>Ivy: &quot;{IVY_MESSAGES.card3.intro}&quot;</span>
        </div>
      </div>

      {/* Capability grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{
          backgroundColor: BRAND_COLORS.bgPrimary,
          border: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HIDDEN_CAPABILITY_IDS.map((capId) => {
            const isSelected = hiddenCapabilities.includes(capId);
            const isDisabled = !isSelected && maxReached;

            return (
              <CapabilityTile
                key={capId}
                capabilityId={capId}
                capability={HIDDEN_CAPABILITIES[capId]}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onClick={() => onCapabilityToggle(capId)}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Selection status */}
      <div className="mt-6 space-y-3">
        <div className="text-center">
          <span
            className="text-sm font-medium"
            style={{
              color: hiddenCapabilities.length >= validation.minRequired
                ? BRAND_COLORS.success
                : BRAND_COLORS.textSecondary,
            }}
          >
            Selected: {hiddenCapabilities.length} of {validation.maxAllowed} max
          </span>
        </div>

        {/* Selected tags */}
        <SelectedTags capabilities={hiddenCapabilities} onRemove={onCapabilityToggle} />
      </div>

      {/* Validation message */}
      {!validation.isValid && (
        <p
          className="text-center text-sm mt-4"
          style={{ color: BRAND_COLORS.warning }}
        >
          Please select at least {validation.minRequired} capability to continue
        </p>
      )}

      {/* Max reached message */}
      {maxReached && (
        <p
          className="text-center text-sm mt-4"
          style={{ color: BRAND_COLORS.primary }}
        >
          Maximum selections reached. Click a selected item to change your choice.
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium transition-all"
          style={{
            color: BRAND_COLORS.textSecondary,
            backgroundColor: 'transparent',
          }}
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onComplete}
          disabled={!validation.isValid}
          className="px-6 py-3 rounded-xl font-medium transition-all"
          style={
            validation.isValid
              ? {
                  backgroundColor: BRAND_COLORS.primary,
                  color: 'white',
                  boxShadow: BRAND_COLORS.shadowPrimary,
                }
              : {
                  backgroundColor: BRAND_COLORS.borderLight,
                  color: BRAND_COLORS.textMuted,
                  cursor: 'not-allowed',
                }
          }
        >
          Complete Calibration →
        </button>
      </div>
    </div>
  );
};

export default Card3HiddenCapabilities;
