/**
 * Archetype Detection System
 *
 * PRINCIPLE: Every student has a unique profile that maps to an archetype.
 * Archetypes are determined by the DOMINANT characteristics of the profile.
 * No student should get "Generic" - there's always a pattern to detect.
 */

import type { StudentProfile, IvyReadyScore } from '../types/student';
import type { ArchetypeID } from '../types/student';

// =============================================================================
// ARCHETYPE DEFINITIONS
// =============================================================================

export interface ArchetypeDefinition {
  id: ArchetypeID;
  label: string;
  tagline: string;
  description: string;
  matchScore: (profile: StudentProfile, scores: IvyReadyScore['category_scores']) => number;
}

/**
 * Archetype definitions with scoring functions
 * Each archetype is detected based on profile characteristics
 */
export const ARCHETYPES: ArchetypeDefinition[] = [
  // Academic Excellence Archetypes
  {
    id: 'SCHOLAR',
    label: 'The Scholar',
    tagline: 'Excellence through intellectual mastery',
    description: 'Strong academics with rigorous course load',
    matchScore: (p, scores) => {
      let score = 0;
      // High aptitude is primary
      if (scores.aptitude >= 70) score += 40;
      else if (scores.aptitude >= 50) score += 20;
      // GPA and rigor
      if ((p.aptitude.gpa_normalized ?? 0) >= 0.80) score += 20;
      if ((p.aptitude.rigor_normalized ?? 0) >= 0.70) score += 20;
      // Research bonus
      if (p.passion.research_level && p.passion.research_level !== 'NONE') score += 15;
      // Aptitude must be dominant category
      if (scores.aptitude > scores.passion && scores.aptitude > scores.community) score += 10;
      return score;
    },
  },
  {
    id: 'RESEARCHER',
    label: 'The Researcher',
    tagline: 'Driven by curiosity and discovery',
    description: 'Research-focused with scientific interests',
    matchScore: (p, scores) => {
      let score = 0;
      // Research is key
      if (p.passion.research_level === 'NATIONAL') score += 50;
      else if (p.passion.research_level === 'STATE') score += 35;
      else if (p.passion.research_level === 'SCHOOL') score += 20;
      else if (p.passion.research_level === 'INDEPENDENT') score += 10;
      // STEM major bonus
      const stemMajors = ['Computer Science', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Engineering'];
      if (stemMajors.includes(p.intended_major ?? '')) score += 15;
      // Academic foundation
      if (scores.aptitude >= 60) score += 15;
      return score;
    },
  },

  // Leadership Archetypes
  {
    id: 'LEADER',
    label: 'The Leader',
    tagline: 'Inspiring others to achieve together',
    description: 'Strong leadership with team impact',
    matchScore: (p, scores) => {
      let score = 0;
      // Leadership level
      if (p.passion.leadership_level?.includes('FOUNDER')) score += 40;
      else if (p.passion.leadership_level?.includes('PRES')) score += 35;
      else if (p.passion.leadership_level === 'OFFICER') score += 20;
      // High passion score
      if (scores.passion >= 60) score += 20;
      // Long commitment
      if ((p.passion.ec_commitment_years ?? 0) >= 3) score += 15;
      // Community involvement
      if (scores.community >= 50) score += 10;
      return score;
    },
  },
  {
    id: 'ENTREPRENEUR',
    label: 'The Entrepreneur',
    tagline: 'Creating solutions that matter',
    description: 'Founder mentality with startup energy',
    matchScore: (p, scores) => {
      let score = 0;
      // Founder is key
      if (p.passion.leadership_level?.includes('FOUNDER')) score += 45;
      // Project impact
      if ((p.passion.project_impact ?? 0) >= 500) score += 25;
      else if ((p.passion.project_impact ?? 0) >= 100) score += 15;
      // Business/CS/Econ interest
      const bizMajors = ['Business', 'Economics', 'Computer Science', 'Engineering'];
      if (bizMajors.includes(p.intended_major ?? '')) score += 15;
      // Passion dominant
      if (scores.passion > scores.aptitude) score += 10;
      return score;
    },
  },

  // Community/Service Archetypes
  {
    id: 'CHANGEMAKER',
    label: 'The Changemaker',
    tagline: 'Transforming communities through action',
    description: 'Service-oriented with measurable impact',
    matchScore: (p, scores) => {
      let score = 0;
      // Community is primary
      if (scores.community >= 60) score += 35;
      else if (scores.community >= 45) score += 20;
      // Service leadership
      if (p.community.service_leadership === 'NATIONAL') score += 25;
      else if (p.community.service_leadership === 'REGIONAL') score += 20;
      else if (p.community.service_leadership === 'LOCAL') score += 15;
      // High hours
      if ((p.community.service_hours ?? 0) >= 200) score += 15;
      // Impact
      if ((p.community.community_impact ?? 0) >= 100) score += 10;
      // Community is dominant
      if (scores.community > scores.aptitude && scores.community > scores.passion) score += 10;
      return score;
    },
  },
  {
    id: 'ADVOCATE',
    label: 'The Advocate',
    tagline: 'Voice for those who need one',
    description: 'Social justice focus with community engagement',
    matchScore: (p, scores) => {
      let score = 0;
      // Service involvement
      if ((p.community.service_hours ?? 0) >= 150) score += 25;
      // Community score
      if (scores.community >= 50) score += 20;
      // Social science majors
      const socialMajors = ['Political Science', 'Sociology', 'Psychology', 'Government', 'Public Policy'];
      if (socialMajors.includes(p.intended_major ?? '')) score += 20;
      // First-gen or underrepresented
      if (p.demographics.first_gen) score += 15;
      return score;
    },
  },

  // Passion/Spike Archetypes
  {
    id: 'CREATOR',
    label: 'The Creator',
    tagline: 'Building what others only imagine',
    description: 'Project-focused with tangible outputs',
    matchScore: (p, scores) => {
      let score = 0;
      // Project impact is key
      if ((p.passion.project_impact ?? 0) >= 200) score += 35;
      else if ((p.passion.project_impact ?? 0) >= 50) score += 20;
      // Long commitment to craft
      if ((p.passion.ec_commitment_years ?? 0) >= 4) score += 20;
      else if ((p.passion.ec_commitment_years ?? 0) >= 3) score += 10;
      // Creative/technical majors
      const creatorMajors = ['Computer Science', 'Engineering', 'Design', 'Architecture', 'Art'];
      if (creatorMajors.includes(p.intended_major ?? '')) score += 15;
      // Passion score
      if (scores.passion >= 50) score += 15;
      return score;
    },
  },
  {
    id: 'PERFORMER',
    label: 'The Performer',
    tagline: 'Excellence on every stage',
    description: 'Arts/athletics focus with competitive achievement',
    matchScore: (p, scores) => {
      let score = 0;
      // Recruited athlete
      if (p.demographics.recruited_athlete) score += 50;
      // Performance majors
      const perfMajors = ['Music', 'Theater', 'Dance', 'Film', 'Drama'];
      if (perfMajors.includes(p.intended_major ?? '')) score += 30;
      // EC awards (competition success)
      if ((p.passion.ec_awards_normalized ?? 0) >= 0.5) score += 20;
      // High passion
      if (scores.passion >= 55) score += 15;
      return score;
    },
  },

  // Balanced Archetypes
  {
    id: 'POLYMATH',
    label: 'The Polymath',
    tagline: 'Excellence without boundaries',
    description: 'Strong across multiple dimensions',
    matchScore: (_, scores) => {
      let score = 0;
      // All scores above 50
      const allAbove50 = scores.aptitude >= 50 && scores.passion >= 50 && scores.community >= 50;
      if (allAbove50) score += 40;
      // Balanced (no dimension more than 20 points higher than another)
      const max = Math.max(scores.aptitude, scores.passion, scores.community);
      const min = Math.min(scores.aptitude, scores.passion, scores.community);
      if (max - min <= 20) score += 25;
      // High overall
      const avg = (scores.aptitude + scores.passion + scores.community) / 3;
      if (avg >= 55) score += 20;
      return score;
    },
  },
  {
    id: 'EMERGING',
    label: 'The Emerging Talent',
    tagline: 'Potential waiting to be unlocked',
    description: 'Growing profile with clear trajectory',
    matchScore: (p, scores) => {
      let score = 0;
      // Younger grade (more time to grow)
      const grade = Number(p.identity?.grade ?? 12);
      if (grade <= 10) score += 25;
      else if (grade === 11) score += 15;
      // Some activity but room to grow
      if ((p.passion.ec_commitment_years ?? 0) >= 1) score += 15;
      // Moderate scores (not yet peaked)
      const avg = (scores.aptitude + scores.passion + scores.community) / 3;
      if (avg >= 30 && avg < 55) score += 20;
      // High grit (will improve)
      if ((p.assessment_intelligence?.psychometrics?.grit_resilience ?? 0) >= 0.6) score += 15;
      return score;
    },
  },

  // Fallback - should rarely be primary
  {
    id: 'EXPLORER',
    label: 'The Explorer',
    tagline: 'Mapping Strategic Growth',
    description: 'Identifying unique strengths and future spikes',
    matchScore: (p) => {
      let score = 20; // Base score so it's always an option
      // Major undeclared
      if (!p.intended_major || p.intended_major === 'Undeclared') score += 15;
      // Major certainty exploring
      if (p.major_certainty === 'EXPLORING') score += 15;
      return score;
    },
  },
];

// =============================================================================
// ARCHETYPE DETECTION
// =============================================================================

export interface ArchetypeResult {
  id: ArchetypeID;
  label: string;
  tagline: string;
  confidence: number;  // 0-100
  alternates: Array<{ id: ArchetypeID; label: string; confidence: number }>;
}

/**
 * Detect the best-matching archetype for a profile
 * UNIVERSAL: Always returns a valid archetype, never null or "GENERIC"
 */
export function detectArchetype(
  profile: StudentProfile,
  categoryScores: IvyReadyScore['category_scores']
): ArchetypeResult {
  // Score all archetypes
  const scored = ARCHETYPES.map(arch => ({
    ...arch,
    score: arch.matchScore(profile, categoryScores),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Get top archetype
  const primary = scored[0];
  const maxScore = Math.max(...scored.map(s => s.score));

  // Calculate confidence (primary score as percentage of max possible)
  const confidence = Math.min(100, Math.round((primary.score / Math.max(maxScore, 1)) * 100));

  // Get alternates (next 2 with reasonable scores)
  const alternates = scored
    .slice(1, 3)
    .filter(s => s.score >= primary.score * 0.5)
    .map(s => ({
      id: s.id,
      label: s.label,
      confidence: Math.round((s.score / Math.max(primary.score, 1)) * 100),
    }));

  return {
    id: primary.id,
    label: primary.label,
    tagline: primary.tagline,
    confidence,
    alternates,
  };
}

/**
 * Get archetype by ID (for lookup)
 */
export function getArchetypeById(id: ArchetypeID): ArchetypeDefinition | undefined {
  return ARCHETYPES.find(a => a.id === id);
}

// =============================================================================
// JENNY INTELLIGENCE: NARRATIVE FORMULA
// =============================================================================

/**
 * Jenny Intelligence: Narrative Formula
 * Each archetype has a proven essay structure that resonates
 */
export interface NarrativeFormula {
  archetype: ArchetypeID;
  essayStructure: {
    hook: string;
    development: string;
    turn: string;
    resolution: string;
  };
  keyThemes: string[];
  avoidThemes: string[];
  exemplarOpeners: string[];
  powerWords: string[];
  narrativeArc: 'hero_journey' | 'transformation' | 'evolution' | 'impact' | 'connection';
}

/**
 * Narrative formulas by archetype
 * Based on successful essay patterns from Jenny's coaching data
 * Note: Not all archetypes have formulas defined yet - using Partial<Record>
 */
const NARRATIVE_FORMULAS: Partial<Record<ArchetypeID, NarrativeFormula>> = {
  SCHOLAR: {
    archetype: 'SCHOLAR',
    essayStructure: {
      hook: 'Start with a moment of intellectual fascination—when you first fell down the rabbit hole',
      development: 'Show the progression of your curiosity: from question to investigation to deeper questions',
      turn: 'Reveal the limitation you discovered, or the unexpected connection you made',
      resolution: 'Connect your intellectual journey to who you want to become at [university]',
    },
    keyThemes: ['intellectual curiosity', 'depth over breadth', 'questions over answers', 'knowledge as joy'],
    avoidThemes: ['listing achievements', 'genius narrative', 'proving intelligence'],
    exemplarOpeners: [
      'The footnote changed everything.',
      'I\'ve read the same paper 47 times, and I still find something new.',
      'The question kept me up at night for three weeks.',
    ],
    powerWords: ['discovered', 'questioned', 'uncovered', 'fascinated', 'puzzled'],
    narrativeArc: 'evolution',
  },
  RESEARCHER: {
    archetype: 'RESEARCHER',
    essayStructure: {
      hook: 'Begin with the problem that hooked you—make the reader feel its urgency',
      development: 'Walk through your methodology: the failures, the pivots, the breakthroughs',
      turn: 'Show what you learned beyond the data—about yourself, about science, about persistence',
      resolution: 'Connect to the bigger questions you want to pursue',
    },
    keyThemes: ['methodical curiosity', 'failure as data', 'persistence', 'contribution to field'],
    avoidThemes: ['just describing research', 'technical jargon', 'name-dropping mentors'],
    exemplarOpeners: [
      'The experiment failed. Again. But this time, I noticed something different.',
      '347 hours in the lab, and the answer was in the 348th.',
      'My hypothesis was wrong. That\'s when the real research began.',
    ],
    powerWords: ['hypothesized', 'tested', 'discovered', 'persisted', 'contributed'],
    narrativeArc: 'hero_journey',
  },
  LEADER: {
    archetype: 'LEADER',
    essayStructure: {
      hook: 'Start with a moment of difficult leadership—when you had to make a hard choice',
      development: 'Show how you navigated the challenge while bringing others along',
      turn: 'Reveal what you learned about leadership that you didn\'t expect',
      resolution: 'Connect to the kind of leader you\'re becoming',
    },
    keyThemes: ['servant leadership', 'building others up', 'difficult decisions', 'growth through responsibility'],
    avoidThemes: ['listing positions held', 'being the hero', 'others as backdrop'],
    exemplarOpeners: [
      'I didn\'t want to fire my friend. But I had to.',
      'The team was falling apart, and everyone was looking at me.',
      'Leading isn\'t about the title. I learned that the hard way.',
    ],
    powerWords: ['unified', 'empowered', 'navigated', 'transformed', 'built'],
    narrativeArc: 'transformation',
  },
  ENTREPRENEUR: {
    archetype: 'ENTREPRENEUR',
    essayStructure: {
      hook: 'Start with the problem you couldn\'t ignore—the gap you saw that others missed',
      development: 'Show the journey from idea to reality: the risks, the pivots, the growth',
      turn: 'Reveal what you learned about creating value and yourself',
      resolution: 'Connect to the problems you want to solve next',
    },
    keyThemes: ['problem-solving', 'creating value', 'learning from failure', 'bias toward action'],
    avoidThemes: ['startup jargon', 'revenue bragging', 'disruption rhetoric'],
    exemplarOpeners: [
      'I saw the problem every day. One day, I stopped complaining and started building.',
      'My first customer was my mom. My second customer changed everything.',
      'The startup failed. The lesson didn\'t.',
    ],
    powerWords: ['built', 'launched', 'solved', 'created', 'scaled'],
    narrativeArc: 'hero_journey',
  },
  CHANGEMAKER: {
    archetype: 'CHANGEMAKER',
    essayStructure: {
      hook: 'Start with the moment you couldn\'t look away—when someone\'s story became your cause',
      development: 'Show how you moved from awareness to action to impact',
      turn: 'Reveal how the work changed you as much as you changed the situation',
      resolution: 'Connect to the systemic change you want to drive',
    },
    keyThemes: ['empathy to action', 'sustainable impact', 'learning from communities', 'systemic thinking'],
    avoidThemes: ['savior complex', 'tragedy porn', 'counting hours'],
    exemplarOpeners: [
      'She asked me why I was really there. I didn\'t have a good answer.',
      'The community taught me more than I ever gave them.',
      'I went to help. I left transformed.',
    ],
    powerWords: ['served', 'learned', 'partnered', 'sustained', 'amplified'],
    narrativeArc: 'transformation',
  },
  ADVOCATE: {
    archetype: 'ADVOCATE',
    essayStructure: {
      hook: 'Start with the injustice that sparked your fire—make it personal',
      development: 'Show how you found your voice and learned to use it effectively',
      turn: 'Reveal the complexity you discovered—advocacy isn\'t simple',
      resolution: 'Connect to the change you\'re committed to pursuing',
    },
    keyThemes: ['voice for others', 'learning complexity', 'coalition building', 'persistence'],
    avoidThemes: ['political preaching', 'us vs them', 'simplistic solutions'],
    exemplarOpeners: [
      'I used to think I knew what was right. Then I listened.',
      'The system failed my neighbor. I decided to understand why.',
      'Advocacy, I learned, is 90% listening and 10% speaking.',
    ],
    powerWords: ['advocated', 'amplified', 'organized', 'challenged', 'united'],
    narrativeArc: 'evolution',
  },
  CREATOR: {
    archetype: 'CREATOR',
    essayStructure: {
      hook: 'Start with something you made—the artifact that reveals who you are',
      development: 'Show the creative process: the iterations, the dead ends, the breakthroughs',
      turn: 'Reveal what creating taught you about yourself',
      resolution: 'Connect to what you want to create next and why it matters',
    },
    keyThemes: ['making things', 'iteration and craft', 'process over product', 'creative problem-solving'],
    avoidThemes: ['describing the thing', 'technical how-to', 'awards won'],
    exemplarOpeners: [
      'Version 23 was terrible. Version 24 changed everything.',
      'I didn\'t know what I was making until it was finished.',
      'The code didn\'t work. So I stayed up all night until it did.',
    ],
    powerWords: ['created', 'iterated', 'designed', 'crafted', 'built'],
    narrativeArc: 'hero_journey',
  },
  PERFORMER: {
    archetype: 'PERFORMER',
    essayStructure: {
      hook: 'Start with a moment on stage—when performance revealed something true',
      development: 'Show the discipline behind the performance: the practice, the sacrifice, the growth',
      turn: 'Reveal what performing taught you beyond the performance itself',
      resolution: 'Connect to how you\'ll bring this energy to [university]',
    },
    keyThemes: ['discipline and craft', 'vulnerability', 'connection through performance', 'growth through pressure'],
    avoidThemes: ['trophy listing', 'natural talent narrative', 'performance description'],
    exemplarOpeners: [
      'I forgot my lines. In front of 500 people. Best thing that ever happened.',
      'Practice isn\'t about perfection. I learned that the hard way.',
      'The standing ovation meant nothing. One person\'s tears meant everything.',
    ],
    powerWords: ['performed', 'practiced', 'connected', 'expressed', 'evolved'],
    narrativeArc: 'transformation',
  },
  POLYMATH: {
    archetype: 'POLYMATH',
    essayStructure: {
      hook: 'Start with an unexpected connection—when two different interests illuminated each other',
      development: 'Show how your diverse interests create unique perspective',
      turn: 'Reveal the synthesis that emerges from your breadth',
      resolution: 'Connect to how you\'ll bring this integrative thinking to [university]',
    },
    keyThemes: ['synthesis', 'unexpected connections', 'breadth as strength', 'integrative thinking'],
    avoidThemes: ['listing interests', 'jack of all trades', 'scattered focus'],
    exemplarOpeners: [
      'My physics class and my poetry seminar were talking about the same thing.',
      'Everyone told me to pick one thing. I found something better.',
      'The connection was there all along. I just had to learn to see it.',
    ],
    powerWords: ['connected', 'synthesized', 'integrated', 'bridged', 'unified'],
    narrativeArc: 'evolution',
  },
  EMERGING: {
    archetype: 'EMERGING',
    essayStructure: {
      hook: 'Start with a moment of awakening—when you started becoming who you\'re meant to be',
      development: 'Show the journey of discovery: what you\'re exploring and why',
      turn: 'Reveal what you\'ve learned about yourself through exploration',
      resolution: 'Connect to the potential you\'re excited to develop at [university]',
    },
    keyThemes: ['potential', 'growth mindset', 'curiosity', 'authentic exploration'],
    avoidThemes: ['apologizing for inexperience', 'false certainty', 'resume padding'],
    exemplarOpeners: [
      'I don\'t know exactly who I\'ll become. And that excites me.',
      'The question changed from "what am I good at?" to "what do I care about?"',
      'I\'m still figuring it out. Here\'s what I\'ve learned so far.',
    ],
    powerWords: ['exploring', 'discovering', 'growing', 'becoming', 'learning'],
    narrativeArc: 'evolution',
  },
  EXPLORER: {
    archetype: 'EXPLORER',
    essayStructure: {
      hook: 'Start with a moment of genuine curiosity—when you followed a thread',
      development: 'Show the exploration process: what you tried, what surprised you',
      turn: 'Reveal what exploration itself has taught you',
      resolution: 'Connect to how you\'ll continue exploring at [university]',
    },
    keyThemes: ['curiosity', 'openness', 'learning from experience', 'authentic seeking'],
    avoidThemes: ['pretending to have answers', 'indecision as weakness', 'scattered narrative'],
    exemplarOpeners: [
      'I didn\'t know what I was looking for until I found it.',
      'Every answer led to ten more questions. I loved it.',
      'The best discoveries happened when I stopped planning.',
    ],
    powerWords: ['explored', 'discovered', 'wondered', 'ventured', 'sought'],
    narrativeArc: 'evolution',
  },
};

/**
 * Get narrative formula for an archetype
 */
export function getNarrativeFormula(archetypeId: ArchetypeID): NarrativeFormula | undefined {
  return NARRATIVE_FORMULAS[archetypeId];
}

/**
 * Generate narrative guidance based on detected archetype
 */
export function generateNarrativeGuidance(
  profile: StudentProfile,
  categoryScores: IvyReadyScore['category_scores']
): {
  archetype: ArchetypeResult;
  primaryFormula: NarrativeFormula | undefined;
  alternateFormulas: NarrativeFormula[];
  personalizedTips: string[];
} {
  const archetype = detectArchetype(profile, categoryScores);
  const primaryFormula = NARRATIVE_FORMULAS[archetype.id];

  // Get alternate formulas from alternate archetypes
  const alternateFormulas = archetype.alternates
    .map(alt => NARRATIVE_FORMULAS[alt.id])
    .filter((f): f is NarrativeFormula => f !== undefined);

  // Generate personalized tips based on profile
  const personalizedTips = generatePersonalizedTips(profile, archetype, primaryFormula);

  return {
    archetype,
    primaryFormula,
    alternateFormulas,
    personalizedTips,
  };
}

function generatePersonalizedTips(
  profile: StudentProfile,
  archetype: ArchetypeResult,
  formula: NarrativeFormula | undefined
): string[] {
  const tips: string[] = [];
  if (!formula) return tips; // Return empty tips if no formula defined
  const profileData = profile as unknown as Record<string, unknown>;

  // Tip based on archetype confidence
  if (archetype.confidence >= 80) {
    tips.push(`Your ${archetype.label} identity is clear. Lean into this narrative confidently.`);
  } else if (archetype.confidence >= 60) {
    tips.push(`You show strong ${archetype.label} tendencies. Consider how your alternate archetypes (${archetype.alternates.map(a => a.label).join(', ')}) might add depth.`);
  } else {
    tips.push(`You're a blend of archetypes. This is a strength—use it to show complexity.`);
  }

  // Tip based on formula's narrative arc
  switch (formula.narrativeArc) {
    case 'hero_journey':
      tips.push('Your essay should follow a challenge → struggle → triumph → wisdom arc.');
      break;
    case 'transformation':
      tips.push('Focus on showing clear before/after change. Make the transformation visible.');
      break;
    case 'evolution':
      tips.push('Center your essay on moments of realization. The "aha" moments are your gold.');
      break;
    case 'impact':
      tips.push('Show the ripple effects of your work. Use specific numbers and stories.');
      break;
    case 'connection':
      tips.push('Emphasize relationships and how others have shaped (and been shaped by) you.');
      break;
  }

  // Add a theme-based tip
  const randomTheme = formula.keyThemes[Math.floor(Math.random() * formula.keyThemes.length)];
  tips.push(`Key theme to weave throughout: "${randomTheme}"`);

  // Add a power word tip
  tips.push(`Power words for your archetype: ${formula.powerWords.slice(0, 3).join(', ')}`);

  return tips;
}
