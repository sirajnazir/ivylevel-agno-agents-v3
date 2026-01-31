/**
 * EC Generation Engine Components
 * ================================
 *
 * Barrel exports for EC Generation Engine visualization components.
 * These display the 4 Pillars + 10 Dimensions framework.
 */

export { FourPillarsGrid } from './FourPillarsGrid';
export { TenDimensionsAccordion } from './TenDimensionsAccordion';
export { ActivityOutputCard } from './ActivityOutputCard';

// Re-export types for convenience
export type {
  FourPillarsData,
  TenDimensionsData,
  PillarData,
  DimensionData,
  GeneratedActivity,
  ECGenerationResult,
  PillarType,
  DimensionType,
} from '@/lib/types/react-visualization';

// Re-export constants
export {
  PILLAR_COLORS,
  PILLAR_ICONS,
  DIMENSION_CONFIG,
  DIMENSION_PRIORITY_COLORS,
} from '@/lib/types/react-visualization';
