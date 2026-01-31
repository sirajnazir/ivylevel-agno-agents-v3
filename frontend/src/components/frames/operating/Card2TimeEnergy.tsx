/**
 * IvyQuest v3.0 — Frame 4: Card 2 - Time & Energy
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 *
 * @version 2.0.0
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import {
  TIME_BANDS,
  TIME_BAND_IDS,
  PRODUCTIVITY_OPTIONS,
  PRODUCTIVITY_IDS,
  ENERGY_SPECTRUM,
  IVY_MESSAGES,
} from '@/lib/constants/frame3.constants';
import { BRAND_COLORS } from '@/lib/constants/brand';
import {
  IconAI,
  IconClock,
  IconSun,
  IconEnergy,
  IconLightbulb,
  IconMoon,
  IconBalance,
  IconUsers,
} from '@/components/icons';
import type { Card2Props } from '@/lib/types/frame3.types';
import type { TimeBandId, ProductivityId } from '@/lib/constants/frame3.constants';

// Icon mapping for Productivity Options - maps productivity ID to icon component
const PRODUCTIVITY_ICONS: Record<ProductivityId, React.FC<{ size?: number; color?: string }>> = {
  early_bird: IconSun,
  night_owl: IconMoon,
  flexible: IconBalance,
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TimeBandButtonProps {
  band: (typeof TIME_BANDS)[TimeBandId];
  isSelected: boolean;
  onClick: () => void;
}

const TimeBandButton: React.FC<TimeBandButtonProps> = ({ band, isSelected, onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="px-4 py-3 rounded-xl border-2 transition-all duration-300 text-center min-w-[70px]"
      style={
        isSelected
          ? {
              borderColor: BRAND_COLORS.primary,
              backgroundColor: BRAND_COLORS.primaryBg,
              color: BRAND_COLORS.primary,
            }
          : {
              borderColor: BRAND_COLORS.borderLight,
              backgroundColor: BRAND_COLORS.bgPrimary,
              color: BRAND_COLORS.textSecondary,
            }
      }
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="font-semibold">{band.label}</span>
    </motion.button>
  );
};

interface ProductivityOptionProps {
  productivityId: ProductivityId;
  option: (typeof PRODUCTIVITY_OPTIONS)[ProductivityId];
  isSelected: boolean;
  onClick: () => void;
}

const ProductivityOption: React.FC<ProductivityOptionProps> = ({
  productivityId,
  option,
  isSelected,
  onClick,
}) => {
  const IconComponent = PRODUCTIVITY_ICONS[productivityId];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 min-w-[120px]"
      style={
        isSelected
          ? {
              borderColor: BRAND_COLORS.primary,
              backgroundColor: BRAND_COLORS.primaryBg,
            }
          : {
              borderColor: BRAND_COLORS.borderLight,
              backgroundColor: BRAND_COLORS.bgPrimary,
            }
      }
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-1">
        <IconComponent
          size={28}
          color={isSelected ? BRAND_COLORS.primary : BRAND_COLORS.iconPrimary}
        />
      </div>
      <span
        className="font-medium text-sm"
        style={{ color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textHeading }}
      >
        {option.label}
      </span>
      <span className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
        {option.description}
      </span>
    </motion.button>
  );
};

interface EnergySliderProps {
  value: number;
  onChange: (value: number) => void;
}

const EnergySlider: React.FC<EnergySliderProps> = ({ value, onChange }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  // Get current label
  const currentPosition = ENERGY_SPECTRUM.positions.reduce((prev, curr) => {
    return Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev;
  });

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <IconUsers size={22} color={BRAND_COLORS.iconPrimary} />
          <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
            {ENERGY_SPECTRUM.min.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
            {ENERGY_SPECTRUM.max.label}
          </span>
          <IconLightbulb size={22} color={BRAND_COLORS.iconPrimary} />
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={handleChange}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
          }}
        />
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            border: 2px solid ${BRAND_COLORS.borderDefault};
          }
          input[type='range']::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            border: 2px solid ${BRAND_COLORS.borderDefault};
          }
        `}</style>
      </div>

      {/* Current position label */}
      <div className="text-center mt-3">
        <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
          {currentPosition.label}
        </span>
      </div>

      {/* Descriptions */}
      <div className="flex justify-between text-xs mt-2" style={{ color: BRAND_COLORS.textMuted }}>
        <span>{ENERGY_SPECTRUM.min.description}</span>
        <span>{ENERGY_SPECTRUM.max.description}</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Card2TimeEnergy: React.FC<Card2Props> = ({
  weeklyHours,
  peakProductivity,
  energySource,
  onWeeklyHoursSelect,
  onProductivitySelect,
  onEnergyChange,
  onContinue,
  onBack,
  validation,
}) => {
  // Show insight based on selection
  const selectedTimeBand = weeklyHours ? TIME_BANDS[weeklyHours] : null;
  const selectedProductivity = peakProductivity
    ? PRODUCTIVITY_OPTIONS[peakProductivity]
    : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-display font-bold mb-3"
          style={{ color: BRAND_COLORS.textHeading }}
        >
          Your Time & Energy
        </h2>
        <div
          className="flex items-center justify-center gap-2"
          style={{ color: BRAND_COLORS.textSecondary }}
        >
          <IconAI size={20} color={BRAND_COLORS.iconPrimary} />
          <span>Ivy: &quot;{IVY_MESSAGES.card2.intro}&quot;</span>
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        {/* Weekly Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: BRAND_COLORS.bgPrimary,
            borderColor: BRAND_COLORS.borderLight,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <IconClock size={20} color={BRAND_COLORS.iconPrimary} />
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              Weekly Hours for College Prep
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: BRAND_COLORS.textMuted }}>
            (Outside of school & current commitments)
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {TIME_BAND_IDS.map((bandId) => (
              <TimeBandButton
                key={bandId}
                band={TIME_BANDS[bandId]}
                isSelected={weeklyHours === bandId}
                onClick={() => onWeeklyHoursSelect(bandId)}
              />
            ))}
          </div>

          {/* Insight */}
          {selectedTimeBand && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm mt-4 text-center flex items-center justify-center gap-1"
              style={{ color: BRAND_COLORS.primary }}
            >
              <IconLightbulb size={16} color={BRAND_COLORS.primary} />
              {selectedTimeBand.insight}
            </motion.p>
          )}
        </motion.div>

        {/* Peak Productivity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: BRAND_COLORS.bgPrimary,
            borderColor: BRAND_COLORS.borderLight,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <IconSun size={20} color={BRAND_COLORS.iconPrimary} />
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              When Are You Most Productive?
            </h3>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {PRODUCTIVITY_IDS.map((prodId) => (
              <ProductivityOption
                key={prodId}
                productivityId={prodId}
                option={PRODUCTIVITY_OPTIONS[prodId]}
                isSelected={peakProductivity === prodId}
                onClick={() => onProductivitySelect(prodId)}
              />
            ))}
          </div>

          {/* Insight */}
          {selectedProductivity && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm mt-4 text-center flex items-center justify-center gap-1"
              style={{ color: BRAND_COLORS.primary }}
            >
              <IconLightbulb size={16} color={BRAND_COLORS.primary} />
              {selectedProductivity.insight}
            </motion.p>
          )}
        </motion.div>

        {/* Energy Source */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: BRAND_COLORS.bgPrimary,
            borderColor: BRAND_COLORS.borderLight,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <IconEnergy size={20} color={BRAND_COLORS.iconPrimary} />
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              What Energizes You More?
            </h3>
          </div>

          <EnergySlider value={energySource} onChange={onEnergyChange} />
        </motion.div>
      </div>

      {/* Validation message */}
      {!validation.isValid && validation.missingFields.length > 0 && (
        <p
          className="text-center text-sm mt-6"
          style={{ color: BRAND_COLORS.warning }}
        >
          Please complete all sections to continue
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
          onClick={onContinue}
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
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Card2TimeEnergy;
