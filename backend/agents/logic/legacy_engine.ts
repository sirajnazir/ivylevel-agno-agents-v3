/**
 * IvyLevel Scoring Engine v6.0
 * Complete implementation with real formulas from spec
 *
 * Key Formulas (Spec Page 8-9):
 * - P_base = 1 / (1 + exp(-(0.05 * S - C_j)))  [Sigmoid for rubric score]
 * - P_final = min(0.95, P_base × ΠMultipliers)  [Capped at 95%]
 * - Ivy+ Ready Score = Weighted sum of Layer 1 categories (0-100)
 *
 * Data Sources:
 * - Chetty (2023): Legacy ROI (5x Harvard), first-gen (1.15x), income top 1% (1.20x)
 * - CDS 2025: Base acceptance rates (Harvard 4.2%, Stanford 3.9%, MIT 5.7%, etc.)
 * - SFFA v. Harvard: 1-6 rubric scale for ratings
 * - NSC: High school saturation data (-0.08 to +0.05 adjustments)
 */

import {
  StudentProfile,
  AptitudeAttributes,
  PassionAttributes,
  CommunityAttributes,
  SchoolConfig,
  SchoolProbability,
  IvyReadyScore,
  AssessmentResults,
  SchoolFit,
  SFFARubric,
} from '../types/student';

import { SCHOOL_DATABASE } from '../data/schools';
import { NORMALIZED_DEFAULTS, CATEGORY_WEIGHTS, VALIDATION_BOUNDS } from '../constants/defaults';
import { safeNormalized, safePercentage, safeProbability, weightedSum } from '../utils/safeValue';
import { analyzeHelpingFactors, analyzeHoldingBackFactors } from './factorAnalysis';
import { detectArchetype } from './archetypeDetector';

// ============================================================================
// LAYER 1: ATTRIBUTE NORMALIZATION (0.0-1.0 Rubric Scores)
// ============================================================================

/**
 * Normalize GPA to 0.0-1.0 rubric score
 *
 * SFFA Rubric Mapping:
 * 6 (Summa): 4.0+ weighted (top 1%)
 * 5 (Magna): 3.85-3.99 (top 5%)
 * 4 (Cum Laude): 3.7-3.84 (top 10%)
 * 3 (Good): 3.5-3.69 (top 25%)
 * 2 (Average): 3.0-3.49 (top 50%)
 * 1 (Below): <3.0
 */
export function normalizeGPA(gpa_weighted: number | null): number {
  if (gpa_weighted === null) return 0.0;

  // Piecewise linear mapping to match distribution
  if (gpa_weighted >= 4.0) return 1.0;  // Perfect = 1.0
  if (gpa_weighted >= 3.85) return 0.80 + (gpa_weighted - 3.85) / (4.0 - 3.85) * 0.20;  // 0.80-1.0
  if (gpa_weighted >= 3.7) return 0.60 + (gpa_weighted - 3.7) / (3.85 - 3.7) * 0.20;  // 0.60-0.80
  if (gpa_weighted >= 3.5) return 0.40 + (gpa_weighted - 3.5) / (3.7 - 3.5) * 0.20;  // 0.40-0.60
  if (gpa_weighted >= 3.0) return 0.20 + (gpa_weighted - 3.0) / (3.5 - 3.0) * 0.20;  // 0.20-0.40
  return Math.max(0.0, (gpa_weighted - 2.0) / (3.0 - 2.0) * 0.20);  // 0.0-0.20
}

/**
 * Normalize SAT to 0.0-1.0 rubric score
 *
 * Percentile Mapping (CollegeBoard 2025):
 * 1600: 99.9th percentile = 1.0
 * 1500-1590: 99th percentile = 0.85-0.95
 * 1400-1490: 95th percentile = 0.70-0.85
 * 1300-1390: 87th percentile = 0.55-0.70
 * 1200-1290: 76th percentile = 0.40-0.55
 * <1200: <0.40
 */
export function normalizeSAT(sat_total: number | null): number {
  if (sat_total === null) return 0.0;

  if (sat_total >= 1600) return 1.0;
  if (sat_total >= 1500) return 0.85 + (sat_total - 1500) / (1600 - 1500) * 0.15;
  if (sat_total >= 1400) return 0.70 + (sat_total - 1400) / (1500 - 1400) * 0.15;
  if (sat_total >= 1300) return 0.55 + (sat_total - 1300) / (1400 - 1300) * 0.15;
  if (sat_total >= 1200) return 0.40 + (sat_total - 1200) / (1300 - 1200) * 0.15;
  return Math.max(0.0, (sat_total - 800) / (1200 - 800) * 0.40);
}

/**
 * Normalize AP Rigor to 0.0-1.0
 *
 * Spec Page 4:
 * - AP count weighted 60%, avg score 40%
 * - Count: 11+ = 1.0, 8-10 = 0.80, 4-7 = 0.60, 0-3 = 0.20
 * - Avg: 5.0 = 1.0, 4.5-4.9 = 0.85, 4.0-4.4 = 0.70, <4.0 = 0.40
 */
export function normalizeRigor(ap_count: number | null, ap_avg_score: number | null): number {
  if (ap_count === null) return 0.0;

  // Count component (0.60 weight)
  let count_score = 0.0;
  if (ap_count >= 11) count_score = 1.0;
  else if (ap_count >= 8) count_score = 0.80;
  else if (ap_count >= 4) count_score = 0.60;
  else count_score = 0.20;

  // Avg score component (0.40 weight)
  let avg_score_norm = 0.0;
  if (ap_avg_score !== null) {
    if (ap_avg_score >= 5.0) avg_score_norm = 1.0;
    else if (ap_avg_score >= 4.5) avg_score_norm = 0.85;
    else if (ap_avg_score >= 4.0) avg_score_norm = 0.70;
    else avg_score_norm = 0.40;
  } else {
    avg_score_norm = 0.70;  // Default if unknown
  }

  return count_score * 0.60 + avg_score_norm * 0.40;
}

/**
 * Normalize Academic Awards to 0.0-1.0
 *
 * Hierarchy (Spec Page 4 ENUM_LIST):
 * - INTERNATIONAL (ISEF, IPhO, IMO): 1.0
 * - NATIONAL (USAMO, Regeneron, Intel): 0.85
 * - STATE (Science Olympiad State, etc.): 0.60
 * - SCHOOL (AP Scholar, Honor Roll): 0.30
 * - NONE: 0.0
 */
export function normalizeAcademicAwards(awards: string[]): number {
  if (awards.length === 0) return 0.0;

  const scores = awards.map(award => {
    const upper = award.toUpperCase();
    if (upper.includes('ISEF') || upper.includes('IPHO') || upper.includes('IMO') ||
        upper.includes('IOI') || upper.includes('INTERNATIONAL')) return 1.0;
    if (upper.includes('USAMO') || upper.includes('REGENERON') || upper.includes('INTEL') ||
        upper.includes('NATIONAL')) return 0.85;
    if (upper.includes('STATE')) return 0.60;
    if (upper.includes('AP SCHOLAR') || upper.includes('HONOR')) return 0.30;
    return 0.20;  // Generic award
  });

  return Math.max(...scores);  // Take highest award
}

/**
 * Normalize Leadership to 0.0-1.0
 *
 * Spec Page 5 Hierarchy:
 * - FOUNDER_NATIONAL: Founded org with national reach = 1.0
 * - FOUNDER_STATE: Founded state-level org = 0.85
 * - STATE_PRES: State-level elected position = 0.75
 * - SCHOOL_PRES: School president/founder = 0.70
 * - OFFICER: Club officer, team captain = 0.50
 * - PARTICIPANT: Active member = 0.25
 */
export function normalizeLeadership(level: string | null): number {
  if (!level) return 0.0;

  const mapping: Record<string, number> = {
    'FOUNDER_NATIONAL': 1.0,
    'FOUNDER_STATE': 0.85,
    'STATE_PRES': 0.75,
    'SCHOOL_PRES': 0.70,
    'OFFICER': 0.50,
    'PARTICIPANT': 0.25,
  };

  return mapping[level] || 0.0;
}

/**
 * Normalize Project Impact to 0.0-1.0
 *
 * Spec Page 5: People affected scale
 * - 10000+: 1.0 (viral impact)
 * - 1000-9999: 0.85 (significant reach)
 * - 200-999: 0.60 (school-wide)
 * - 50-199: 0.40 (class-level)
 * - 10-49: 0.20 (small group)
 * - <10: 0.10 (minimal)
 */
export function normalizeProjectImpact(impact: number | null): number {
  if (impact === null || impact === 0) return 0.0;

  if (impact >= 10000) return 1.0;
  if (impact >= 1000) return 0.85 + (Math.log10(impact) - 3) / (4 - 3) * 0.15;  // Log scale
  if (impact >= 200) return 0.60 + (impact - 200) / (1000 - 200) * 0.25;
  if (impact >= 50) return 0.40 + (impact - 50) / (200 - 50) * 0.20;
  if (impact >= 10) return 0.20 + (impact - 10) / (50 - 10) * 0.20;
  return 0.10 * impact / 10;
}

/**
 * Normalize Research Level to 0.0-1.0
 *
 * Spec Page 5:
 * - NATIONAL: Published/Intel/Regeneron = 1.0
 * - STATE: State science fair recognition = 0.75
 * - SCHOOL: School research program (e.g., COSMOS) = 0.50
 * - INDEPENDENT: Self-directed without recognition = 0.30
 * - NONE: 0.0
 */
export function normalizeResearch(level: string | null): number {
  if (!level) return 0.0;

  const mapping: Record<string, number> = {
    'NATIONAL': 1.0,
    'STATE': 0.75,
    'SCHOOL': 0.50,
    'INDEPENDENT': 0.30,
    'NONE': 0.0,
  };

  return mapping[level] || 0.0;
}

/**
 * Normalize EC Commitment to 0.0-1.0
 *
 * Spec Page 5:
 * - Years: 4+ = 1.0, 3 = 0.75, 2 = 0.50, 1 = 0.25
 * - Hours/week: 15+ = 1.0, 10-14 = 0.80, 5-9 = 0.60, 1-4 = 0.30
 * - Combined: 60% years + 40% hours
 */
export function normalizeECCommitment(years: number | null, hours_weekly: number | null): number {
  if (years === null) return 0.0;

  // Years component (0.60 weight)
  let years_score = 0.0;
  if (years >= 4) years_score = 1.0;
  else if (years >= 3) years_score = 0.75;
  else if (years >= 2) years_score = 0.50;
  else years_score = 0.25;

  // Hours component (0.40 weight)
  let hours_score = 0.70;  // Default if unknown
  if (hours_weekly !== null) {
    if (hours_weekly >= 15) hours_score = 1.0;
    else if (hours_weekly >= 10) hours_score = 0.80;
    else if (hours_weekly >= 5) hours_score = 0.60;
    else hours_score = 0.30;
  }

  return years_score * 0.60 + hours_score * 0.40;
}

/**
 * Normalize EC Awards to 0.0-1.0
 *
 * Similar to academic awards but for extracurriculars
 */
export function normalizeECAwards(awards: string[]): number {
  if (awards.length === 0) return 0.0;

  const scores = awards.map(award => {
    const upper = award.toUpperCase();
    if (upper.includes('INTERNATIONAL')) return 1.0;
    if (upper.includes('NATIONAL')) return 0.85;
    if (upper.includes('STATE')) return 0.60;
    if (upper.includes('REGIONAL') || upper.includes('SCHOOL')) return 0.30;
    return 0.20;
  });

  return Math.max(...scores);
}

/**
 * Normalize Service Leadership to 0.0-1.0
 *
 * Spec Page 5:
 * - NATIONAL: Founded national service org = 1.0
 * - REGIONAL: Regional coordinator = 0.75
 * - LOCAL: Local chapter lead = 0.60
 * - PARTICIPANT: Volunteer = 0.30
 */
export function normalizeServiceLeadership(level: string | null): number {
  if (!level) return 0.0;

  const mapping: Record<string, number> = {
    'NATIONAL': 1.0,
    'REGIONAL': 0.75,
    'LOCAL': 0.60,
    'PARTICIPANT': 0.30,
  };

  return mapping[level] || 0.0;
}

/**
 * Normalize Service Hours to 0.0-1.0
 *
 * Total by graduation:
 * - 500+: 1.0
 * - 250-499: 0.80
 * - 100-249: 0.60
 * - 50-99: 0.40
 * - <50: 0.20
 */
export function normalizeServiceHours(hours: number | null): number {
  if (hours === null || hours === 0) return 0.0;

  if (hours >= 500) return 1.0;
  if (hours >= 250) return 0.80 + (hours - 250) / (500 - 250) * 0.20;
  if (hours >= 100) return 0.60 + (hours - 100) / (250 - 100) * 0.20;
  if (hours >= 50) return 0.40 + (hours - 50) / (100 - 50) * 0.20;
  return 0.20 * hours / 50;
}

/**
 * Normalize Community Impact to 0.0-1.0
 * Same scale as project impact
 */
export const normalizeCommunityImpact = normalizeProjectImpact;

// ============================================================================
// LAYER 1: CATEGORY SCORES (0-100)
// ============================================================================

/**
 * Calculate Aptitude Category Score (0-100)
 *
 * Spec Page 4 Weights:
 * - GPA: 35%
 * - SAT: 30%
 * - Rigor: 20%
 * - Awards: 15%
 */
export function calculateAptitudeScore(aptitude: AptitudeAttributes): number {
  const defaults = NORMALIZED_DEFAULTS.aptitude;
  const weights = CATEGORY_WEIGHTS.aptitude;

  const score = weightedSum([
    { value: aptitude.gpa_normalized, weight: weights.gpa, fallback: defaults.gpa },
    { value: aptitude.sat_normalized, weight: weights.sat, fallback: defaults.sat },
    { value: aptitude.rigor_normalized, weight: weights.rigor, fallback: defaults.rigor },
    { value: aptitude.awards_normalized, weight: weights.awards, fallback: defaults.awards },
  ]);

  return safePercentage(score * 100, 0);
}

/**
 * Calculate Passion Category Score (0-100)
 *
 * Spec Page 5 Weights:
 * - Leadership: 35%
 * - Projects: 20%
 * - Research: 20%
 * - EC Commitment: 15%
 * - Awards: 10%
 */
export function calculatePassionScore(passion: PassionAttributes): number {
  const defaults = NORMALIZED_DEFAULTS.passion;
  const weights = CATEGORY_WEIGHTS.passion;

  const score = weightedSum([
    { value: passion.leadership_normalized, weight: weights.leadership, fallback: defaults.leadership },
    { value: passion.project_normalized, weight: weights.project, fallback: defaults.project },
    { value: passion.research_normalized, weight: weights.research, fallback: defaults.research },
    { value: passion.commitment_normalized, weight: weights.commitment, fallback: defaults.commitment },
    { value: passion.ec_awards_normalized, weight: weights.awards, fallback: defaults.awards },
  ]);

  return safePercentage(score * 100, 0);
}

/**
 * Calculate Community Category Score (0-100)
 *
 * Spec Page 5 Weights:
 * - Service Leadership: 35%
 * - Community Impact: 35%
 * - Hours: 20%
 * - Description Quality: 10% (NLP-derived if available)
 */
export function calculateCommunityScore(community: CommunityAttributes): number {
  const defaults = NORMALIZED_DEFAULTS.community;
  const weights = CATEGORY_WEIGHTS.community;

  const score = weightedSum([
    { value: community.service_normalized, weight: weights.service, fallback: defaults.service },
    { value: community.impact_normalized, weight: weights.impact, fallback: defaults.impact },
    { value: community.hours_normalized, weight: weights.hours, fallback: defaults.hours },
    { value: null, weight: weights.description, fallback: NORMALIZED_DEFAULTS.narrative.description_quality },
  ]);

  return safePercentage(score * 100, 0);
}

/**
 * Predict Narrative Score (0-100) from Layer 4
 *
 * Uses psychometric markers:
 * - Vision Clarity: 30%
 * - Identity Comfort: 25%
 * - Articulation Ability: 25%
 * - Maturity Level: 20%
 *
 * Note: This is a prediction; actual essays assessed later in Phase 2
 */
export function predictNarrativeScore(psychometrics: any): number {
  const defaults = NORMALIZED_DEFAULTS.narrative;
  const weights = CATEGORY_WEIGHTS.narrative;

  const score = weightedSum([
    { value: psychometrics?.vision_clarity, weight: weights.vision, fallback: defaults.vision_clarity },
    { value: psychometrics?.identity_comfort, weight: weights.identity, fallback: defaults.identity_comfort },
    { value: psychometrics?.articulation_ability, weight: weights.articulation, fallback: defaults.articulation },
    { value: psychometrics?.maturity_level, weight: weights.maturity, fallback: defaults.maturity },
  ]);

  return safePercentage(score * 100, 50);  // Default to 50 if all fallbacks used
}

// ============================================================================
// IVY+ READY SCORE (0-100, Controllables Focus)
// ============================================================================

/**
 * Calculate Ivy+ Ready Score (Spec Page 8)
 *
 * School-Agnostic Strength Metric (Dual-Model Controllables)
 * Weights average across top schools:
 * - Aptitude: ~30%
 * - Passion: ~35%
 * - Community: ~25%
 * - Narrative: ~10%
 */
export function calculateIvyReadyScore(profile: StudentProfile): IvyReadyScore {
  const weights = CATEGORY_WEIGHTS.overall;

  const aptitude_score = calculateAptitudeScore(profile.aptitude);
  const passion_score = calculatePassionScore(profile.passion);
  const community_score = calculateCommunityScore(profile.community);
  const narrative_score = predictNarrativeScore(profile.assessment_intelligence?.psychometrics);

  // Use weightedSum for consistent handling
  const total_score = safePercentage(
    aptitude_score * weights.aptitude +
    passion_score * weights.passion +
    community_score * weights.community +
    narrative_score * weights.narrative,
    50
  );

  // Percentile estimation (relative to Ivy applicant pool)
  // Based on Chetty data: median Ivy applicant ~55, admit ~75
  const percentile_rank = Math.min(99, Math.max(1,
    (total_score - 40) / (90 - 40) * 90 + 5
  ));

  return {
    total_score,
    category_scores: {
      aptitude: aptitude_score,
      passion: passion_score,
      community: community_score,
      narrative: narrative_score,
    },
    percentile_rank,
  };
}

// ============================================================================
// SFFA RUBRIC SCORE (1-6 Scale) → RUBRIC COMPOSITE (0-100)
// ============================================================================

/**
 * Calculate SFFA-Style Rubric Ratings (1-6 scale)
 *
 * Used by Harvard and similar schools in holistic review
 * Spec Page 8: Academic, EC, Athletic, Personal, Overall
 */
export function calculateSFFARubric(profile: StudentProfile): SFFARubric {
  // Academic Rating (1-6)
  // Based on aptitude score: 90+ = 6, 80+ = 5, 70+ = 4, 60+ = 3, 50+ = 2, <50 = 1
  const aptitude_score = calculateAptitudeScore(profile.aptitude);
  const academic_rating = Math.min(6, Math.max(1, Math.ceil(aptitude_score / 100 * 6)));

  // Extracurricular Rating (1-6)
  // Based on passion score
  const passion_score = calculatePassionScore(profile.passion);
  const extracurricular_rating = Math.min(6, Math.max(1, Math.ceil(passion_score / 100 * 6)));

  // Athletic Rating (1-6)
  // Default 3 unless recruited athlete
  const is_athlete = profile.demographics.recruited_athlete;
  const athletic_rating = is_athlete ? 5 : 3;

  // Personal Rating (1-6)
  // Based on community score + psychometrics
  const community_score = calculateCommunityScore(profile.community);
  const coachability = profile.assessment_intelligence.psychometrics.coachability_score ?? 0.70;
  const personal_composite = community_score * 0.60 + coachability * 100 * 0.40;
  const personal_rating = Math.min(6, Math.max(1, Math.ceil(personal_composite / 100 * 6)));

  // Overall Rating (1-6)
  // Average of components, weighted
  const overall_composite = (
    academic_rating * 0.30 +
    extracurricular_rating * 0.35 +
    athletic_rating * 0.10 +
    personal_rating * 0.25
  );
  const overall_rating = Math.min(6, Math.max(1, Math.round(overall_composite)));

  return {
    academic_rating,
    extracurricular_rating,
    athletic_rating,
    personal_rating,
    overall_rating,
  };
}

/**
 * Convert SFFA Rubric to Composite Score (0-100)
 * For sigmoid probability calculation
 */
export function rubricToComposite(rubric: SFFARubric): number {
  // Weighted average of rubric ratings (1-6) mapped to 0-100
  const composite_rating = (
    rubric.academic_rating * 0.30 +
    rubric.extracurricular_rating * 0.35 +
    rubric.athletic_rating * 0.10 +
    rubric.personal_rating * 0.25
  );

  // Map 1-6 to 0-100: (rating - 1) / 5 * 100
  return ((composite_rating - 1) / 5) * 100;
}

// ============================================================================
// LAYER 3: CONTEXT MULTIPLIERS
// ============================================================================

/**
 * Calculate all context multipliers for a given student
 *
 * Chetty 2023 Data (Spec Page 6):
 * - Legacy: 5.0x at Harvard/Yale/Princeton, 0x at MIT/Caltech
 * - First-Gen: 1.15x universal
 * - Athlete: 2.5x recruited
 * - Ethnicity: Asian 0.85x in STEM-saturated, URM 1.15x
 * - Income Top 1%: 1.20x (network effect)
 * - Saturation: -0.08 to +0.05 (NSC data)
 * - Major: CS 0.55x Stanford, 0.70x MIT, etc.
 */
export function calculateContextMultipliers(
  profile: StudentProfile,
  school_config: SchoolConfig
): number {
  let multiplier = 1.0;

  // Legacy (school-specific, Chetty 2023)
  if (profile.demographics.legacy &&
      profile.demographics.legacy_schools.includes(school_config.school_id)) {
    multiplier *= school_config.legacy_roi;
  }

  // First-Gen (universal 1.15x)
  if (profile.demographics.first_gen) {
    multiplier *= profile.demographics.first_gen_multiplier;
  }

  // Recruited Athlete (2.5x)
  if (profile.demographics.recruited_athlete) {
    multiplier *= school_config.athlete_roi;
  }

  // Ethnicity (competitive STEM context)
  multiplier *= profile.demographics.ethnicity_multiplier;

  // Income Top 1% (network ROI, Chetty)
  if (profile.demographics.income_top_1_percent) {
    multiplier *= profile.demographics.income_multiplier;
  }

  // High School Saturation (NSC data)
  if (profile.high_school) {
    multiplier *= (1 + profile.high_school.saturation_adjustment);
  }

  // Major Multiplier (school-specific)
  const major_mult = school_config.major_multipliers[profile.intended_major] ?? 1.0;
  multiplier *= major_mult;

  return multiplier;
}

// ============================================================================
// RS RUBRIC PROBABILITY (Spec Page 8-9 Formula)
// ============================================================================

/**
 * Calculate base probability from rubric score using sigmoid
 *
 * Formula: P_base = 1 / (1 + exp(-(0.05 * S - C_j)))
 *
 * Where:
 * - S: Student rubric composite (0-100)
 * - C_j: School acceptance threshold constant
 *
 * C_j values calibrated to CDS 2025 base rates:
 * - Harvard (4.2%): C_j = 3.1
 * - Stanford (3.9%): C_j = 3.2
 * - Yale (5.1%): C_j = 2.95
 * - MIT (5.7%): C_j = 2.8
 * - Princeton (5.8%): C_j = 2.75
 * - Caltech (6.4%): C_j = 2.6
 * - CMU (11%): C_j = 2.2
 */
const SCHOOL_THRESHOLDS: Record<string, number> = {
  'HARVARD': 3.1,
  'STANFORD': 3.2,
  'YALE': 2.95,
  'MIT': 2.8,
  'PRINCETON': 2.75,
  'CALTECH': 2.6,
  'CMU': 2.2,
};

export function calculateBaseProbability(rubric_composite: number, school_id: string): number {
  const C_j = SCHOOL_THRESHOLDS[school_id] ?? 3.0;  // Default conservative
  const S = rubric_composite;

  // Sigmoid: P = 1 / (1 + exp(-(0.05 * S - C_j)))
  const exponent = -(0.05 * S - C_j);
  const p_base = 1 / (1 + Math.exp(exponent));

  return p_base;
}

/**
 * Calculate final probability with context multipliers
 *
 * Formula: P_final = min(0.95, P_base × Π Multipliers)
 *
 * Capped at 95% (no certainty in admissions per spec)
 */
export function calculateFinalProbability(
  p_base: number,
  multiplier: number
): number {
  const p_final = Math.min(0.95, p_base * multiplier);
  return p_final;
}

// ============================================================================
// SCHOOL FIT ASSESSMENT
// ============================================================================

/**
 * Determine school fit level based on probability
 *
 * Spec Page 9:
 * - BEST_FIT: ≥15% (3.5x+ base rate)
 * - STRONG_FIT: 10-14.9% (2.5-3.5x base)
 * - TOUGH: 5-9.9% (1.2-2.5x base)
 * - WORST_FIT: <5% (<1.2x base or below base)
 */
export function determineFitLevel(p_final: number, base_rate: number): SchoolFit {
  if (p_final >= 0.15) return 'BEST_FIT';
  if (p_final >= 0.10) return 'STRONG_FIT';
  if (p_final >= 0.05) return 'TOUGH';
  return 'WORST_FIT';
}

/**
 * Generate "Why This School Likes You" reasons
 *
 * Based on category score alignment with school weights
 */
export function generateFitReasons(
  profile: StudentProfile,
  school_config: SchoolConfig,
  category_scores: IvyReadyScore['category_scores']
): string[] {
  const reasons: string[] = [];

  const aptitude_pct = category_scores.aptitude;
  const passion_pct = category_scores.passion;
  const community_pct = category_scores.community;

  // Check alignment with school emphases
  if (school_config.weight_aptitude >= 30 && aptitude_pct >= 80) {
    reasons.push(`Academic rigor valued (${school_config.weight_aptitude}% weight) — your ${aptitude_pct}% strength`);
  }

  if (school_config.weight_passion >= 35 && passion_pct >= 70) {
    reasons.push(`${school_config.distinctive_values[0]} passion emphasized (${school_config.weight_passion}% weight)`);
  }

  if (school_config.weight_community >= 25 && community_pct >= 60) {
    reasons.push(`Community impact matters (${school_config.weight_community}% weight)`);
  }

  // Legacy boost if applicable
  if (profile.demographics.legacy &&
      profile.demographics.legacy_schools.includes(school_config.school_id) &&
      school_config.legacy_roi > 1.0) {
    reasons.push(`Legacy advantage (${school_config.legacy_roi}x multiplier per Chetty 2023)`);
  }

  // Meritocracy if no legacy
  if (school_config.legacy_roi === 0 && !profile.demographics.legacy) {
    reasons.push('Pure meritocracy — fair competition (0x legacy)');
  }

  // Weakest category matters less
  const weakest_category = Math.min(aptitude_pct, passion_pct, community_pct);
  const weakest_name = weakest_category === aptitude_pct ? 'academic' :
                        weakest_category === passion_pct ? 'passion' : 'community';
  const weakest_weight = weakest_category === aptitude_pct ? school_config.weight_aptitude :
                         weakest_category === passion_pct ? school_config.weight_passion :
                         school_config.weight_community;

  if (weakest_weight <= 20) {
    reasons.push(`${weakest_name} only ${weakest_weight}% — your weakest area matters less`);
  }

  return reasons.slice(0, 3);  // Top 3
}

/**
 * Generate warnings (CS penalty, saturation, etc.)
 */
export function generateWarnings(
  profile: StudentProfile,
  school_config: SchoolConfig,
  multiplier: number
): string[] {
  const warnings: string[] = [];

  // Major penalty
  const major_mult = school_config.major_multipliers[profile.intended_major];
  if (major_mult && major_mult < 1.0) {
    warnings.push(`${profile.intended_major} penalty: ${major_mult}x multiplier (highly competitive)`);
  }

  // Saturation
  if (profile.high_school && profile.high_school.saturation_level === 'HIGH') {
    warnings.push(`High saturation zone: ${profile.high_school.ivy_applicants_per_year}+ Ivy applicants/year (${profile.high_school.saturation_adjustment * 100}% harder)`);
  }

  // Overall multiplier drag
  if (multiplier < 0.90) {
    warnings.push(`Context multipliers reduce odds (${(multiplier * 100).toFixed(0)}% of base)`);
  }

  return warnings;
}

// ============================================================================
// COMPLETE SCHOOL PROBABILITY CALCULATION
// ============================================================================

export function calculateSchoolProbability(
  profile: StudentProfile,
  school_config: SchoolConfig,
  ivy_ready_score: IvyReadyScore
): SchoolProbability {
  // 1. Calculate SFFA Rubric (1-6 scale)
  const sffa_rubric = calculateSFFARubric(profile);
  const rubric_composite = rubricToComposite(sffa_rubric);

  // 2. Base Probability (sigmoid)
  const p_base = calculateBaseProbability(rubric_composite, school_config.school_id);

  // 3. Context Multipliers
  const multiplier = calculateContextMultipliers(profile, school_config);

  // 4. Final Probability (capped 95%)
  const p_final = calculateFinalProbability(p_base, multiplier);

  // 5. Fit Assessment
  const fit_level = determineFitLevel(p_final, school_config.base_acceptance_rate);

  // 6. Fit Reasons & Warnings
  const fit_reasons = generateFitReasons(profile, school_config, ivy_ready_score.category_scores);
  const warnings = generateWarnings(profile, school_config, multiplier);

  // 7. Rubric Score for display (1-6 → composite)
  const rubric_score = sffa_rubric.overall_rating;

  // 8. Above Base Rate
  const above_base_rate = (p_final - school_config.base_acceptance_rate) / school_config.base_acceptance_rate;

  return {
    school_id: school_config.school_id,
    school_name: school_config.school_name,
    p_base,
    p_context: p_base * multiplier,  // Before capping
    p_final,
    fit_level,
    fit_reasons,
    warnings,
    rubric_score,
    above_base_rate,
  };
}

// ============================================================================
// HELPING / HOLDING BACK FACTORS
// ============================================================================

/**
 * Generate helping factors (green bullets)
 */
export function generateHelpingFactors(
  profile: StudentProfile,
  category_scores: IvyReadyScore['category_scores']
): string[] {
  const helping: string[] = [];

  // Perfect GPA
  if (profile.aptitude.gpa_normalized && profile.aptitude.gpa_normalized >= 0.95) {
    helping.push(`Perfect GPA (${profile.aptitude.gpa_weighted?.toFixed(2)}) — top 1% strength`);
  }

  // Strong SAT
  if (profile.aptitude.sat_normalized && profile.aptitude.sat_normalized >= 0.85) {
    helping.push(`High SAT (${profile.aptitude.sat_total}) — 99th percentile`);
  }

  // High rigor
  if (profile.aptitude.rigor_normalized && profile.aptitude.rigor_normalized >= 0.80) {
    helping.push(`Strong AP rigor (${profile.aptitude.ap_count} courses, avg ${profile.aptitude.ap_avg_score?.toFixed(1)})`);
  }

  // Long commitment
  if (profile.passion.ec_commitment_years && profile.passion.ec_commitment_years >= 4) {
    helping.push(`4+ years EC commitment — depth over breadth`);
  }

  // High leadership
  if (profile.passion.leadership_normalized && profile.passion.leadership_normalized >= 0.70) {
    helping.push(`Strong leadership role (${profile.passion.leadership_level})`);
  }

  // Research
  if (profile.passion.research_normalized && profile.passion.research_normalized >= 0.75) {
    helping.push(`Research experience (${profile.passion.research_level})`);
  }

  // Grit
  if (profile.assessment_intelligence.psychometrics.grit_resilience &&
      profile.assessment_intelligence.psychometrics.grit_resilience >= 0.80) {
    helping.push(`High grit/resilience (${(profile.assessment_intelligence.psychometrics.grit_resilience * 100).toFixed(0)}%) — coaches love this`);
  }

  return helping.slice(0, 5);  // Top 5
}

/**
 * Generate holding back factors (amber warnings)
 */
export function generateHoldingBackFactors(
  profile: StudentProfile,
  category_scores: IvyReadyScore['category_scores']
): string[] {
  const holding: string[] = [];

  // No academic awards
  if (profile.aptitude.awards_normalized === 0.0 ||
      profile.aptitude.academic_awards.length === 0) {
    holding.push('No academic awards (0.15 aptitude weight unfilled)');
  }

  // Low project impact
  if (profile.passion.project_normalized && profile.passion.project_normalized < 0.50) {
    holding.push(`Low project impact (${profile.passion.project_impact ?? 0} people) — aim for 200+`);
  }

  // Weak community
  if (category_scores.community < 50) {
    holding.push(`Community score ${category_scores.community}% — volunteer leadership gap`);
  }

  // Saturation
  if (profile.high_school && profile.high_school.saturation_level === 'HIGH') {
    holding.push(`High school saturation (${profile.high_school.ivy_applicants_per_year}+ Ivy apps/year) — differentiation critical`);
  }

  // CS penalty
  const has_cs_penalty = Object.values(SCHOOL_DATABASE).some(school => {
    const mult = school.major_multipliers[profile.intended_major];
    return mult && mult < 1.0;
  });
  if (has_cs_penalty) {
    holding.push(`${profile.intended_major} is highly competitive (0.55-0.70x at some schools)`);
  }

  // Demographic context
  if (profile.demographics.ethnicity_multiplier < 1.0) {
    holding.push(`Competitive demographic context (${profile.demographics.ethnicity}) in saturated region`);
  }

  return holding.slice(0, 5);  // Top 5
}

// ============================================================================
// COMPLETE ASSESSMENT RESULTS
// ============================================================================

export function generateAssessmentResults(profile: StudentProfile): AssessmentResults {
  // 1. Ivy+ Ready Score
  const ivy_ready_score = calculateIvyReadyScore(profile);

  // 2. School Probabilities for each target
  const school_probabilities = profile.target_schools.map(school_id => {
    const school_config = SCHOOL_DATABASE[school_id];
    if (!school_config) throw new Error(`Unknown school: ${school_id}`);
    return calculateSchoolProbability(profile, school_config, ivy_ready_score);
  });

  // Sort by p_final descending
  school_probabilities.sort((a, b) => b.p_final - a.p_final);

  // 3. Helping / Holding Back - Use universal factor analysis
  const helping_factors = analyzeHelpingFactors(profile, ivy_ready_score.category_scores);
  const holding_back_factors = analyzeHoldingBackFactors(profile, ivy_ready_score.category_scores);

  // 4. Archetype Detection - Use universal archetype detector
  const archetype = detectArchetype(profile, ivy_ready_score.category_scores);
  const archetype_detected = archetype.id;
  const archetype_label = archetype.label;
  const narrative_tagline = archetype.tagline;

  return {
    ivy_ready_score,
    school_probabilities,
    helping_factors,
    holding_back_factors,
    archetype_detected,
    archetype_label,
    narrative_tagline,
  };
}
