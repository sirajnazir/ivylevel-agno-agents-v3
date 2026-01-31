/**
 * ReAct Visualization Components
 * ===============================
 *
 * Barrel exports for ReAct cycle visualization components.
 * v5.1.1: Semantically correct THINK → ACT → OBSERVE → LEARN phases
 *
 * The OBSERVE + LEARN phases are the heart of self-correction:
 * - OBSERVE: See results, check quality metrics
 * - LEARN: Generate hints for next cycle improvement
 */

export { ReActVisualization } from './ReActVisualization';
export { CycleCard } from './CycleCard';
export { PhaseAccordion } from './PhaseAccordion';

// Re-export types for convenience
export type {
  // Core ReAct types
  ReActPhase,
  PhaseType,
  ReactMetadata,
  CycleSummary,
  ThinkPhaseData,
  ActPhaseData,
  ObservePhaseData,
  LearnPhaseData,
  PhaseColorConfig,
  InputDataFlow,
  // Quality Score types
  QualityScore,
  QualityWeights,
  QualityStatus,
  QualityTier,
  // EC Engine types
  FourPillarsData,
  FourPillars,
  TenDimensionsData,
  TenDimensions,
  PillarData,
  DimensionData,
  GeneratedActivity,
  ECGenerationResult,
  PillarType,
  DimensionType,
  ActivityType,
  ActivitySource,
  GapType,
  OnlyTheyResult,
  // Identity & Context types
  IdentitySynthesis,
  ReframeData,
  ECContext,
  GamePlanResult,
} from '@/lib/types/react-visualization';

// Re-export constants
export {
  PHASE_COLORS,
  PILLAR_COLORS,
  PILLAR_ICONS,
  DIMENSION_PRIORITY_COLORS,
  PHASE_CONFIG,
  DIMENSION_CONFIG,
  QUALITY_TIER_COLORS,
  DEFAULT_QUALITY_WEIGHTS,
} from '@/lib/types/react-visualization';
