'use client';

/**
 * StrengthSelector Component
 * Reusable strength selection grid with icons
 * @version 11.0
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { STRENGTH_OPTIONS, type StrengthOption } from '@/lib/constants/icons';

interface StrengthSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}

export function StrengthSelector({
  selected,
  onChange,
  maxSelections = 3
}: StrengthSelectorProps) {
  const toggleStrength = useCallback((id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < maxSelections) {
      onChange([...selected, id]);
    }
  }, [selected, maxSelections, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Select your top strengths</span>
        <span className={`text-sm font-medium ${
          selected.length > 0 ? 'text-green-600' : 'text-gray-500'
        }`}>
          {selected.length}/{maxSelections}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {STRENGTH_OPTIONS.map((strength) => {
          const Icon = strength.icon;
          const isSelected = selected.includes(strength.id);
          const isDisabled = !isSelected && selected.length >= maxSelections;

          return (
            <motion.button
              key={strength.id}
              type="button"
              onClick={() => toggleStrength(strength.id)}
              disabled={isDisabled}
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              className={`relative p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                isSelected
                  ? 'border-[#641432] bg-[#FFF5F2]'
                  : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#641432] flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? '' : 'bg-gray-100'
                }`}
                style={isSelected ? { backgroundColor: `${strength.color}15` } : {}}
              >
                <Icon
                  size={24}
                  style={{ color: isSelected ? strength.color : '#6B7280' }}
                />
              </div>

              <span className={`text-sm font-medium text-center ${
                isSelected ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {strength.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default StrengthSelector;
