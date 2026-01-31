/**
 * AssessmentTab - Main Assessment Results View
 * v12.1 - Added Strategic Intelligence display
 */
'use client';

import { motion } from 'framer-motion';
import {
  Award, AlertTriangle, Target, TrendingUp, TrendingDown,
  GraduationCap, Users, Heart, Sparkles
} from 'lucide-react';
import CircularProgress from '@/components/rings/CircularProgress';
import { PillarCards } from '@/components/rings/PillarCards';
import { COLORS, STATUS_COLORS, GRADIENTS } from '@/lib/constants/design';
import { ArchetypeBadge } from '@/components/ui/ArchetypeBadge';
import { SpikeIndicator } from '@/components/ui/SpikeIndicator';
import { ProjectSimulator } from '@/components/ProjectSimulator';
import type { IdentitySynthesis, PortfolioAudit, Archetype } from '@/lib/store/useResultsStore';

interface AssessmentData {
  ivyReadyScore: {
    overall: number;
    tier: string;
    changeVs180Days: number;
  };
  pillars: {
    aptitude: number;
    passion: number;
    service: number;
    identity: number;
  };
  dimensionalScores: Array<{
    dimension: string;
    score: number;
    tier: string;
  }>;
  strengths: Array<{
    title: string;
    roi: number;
    impact: string;
  }>;
  weakSpots: Array<{
    title: string;
    priority: 'P0' | 'P1' | 'P2';
    description: string;
  }>;
  admissionsRubric?: {
    academicIndex: number;
    extracurricularRating: number;
    personalQualities: number;
    recommendationStrength: number;
    overallAdmitProbability: number;
    targetSchools: string[];
  };
  criMultiplier?: number;
  // Narrative synthesis from agents
  brandStatement?: string | null;
  narrativeThemes?: string[];
  narrativeDna?: string | null;
  firstPrinciple?: string | null;
  // Strategic Intelligence (v1.1.0)
  identitySynthesis?: IdentitySynthesis | null;
  portfolioAudit?: PortfolioAudit | null;
}

interface AssessmentTabProps {
  data: AssessmentData;
}

export function AssessmentTab({ data }: AssessmentTabProps) {
  // Defensive validation to prevent rendering invalid data as React children
  const safeStrengths = data.strengths.filter((s) =>
    s &&
    typeof s === 'object' &&
    typeof s.title === 'string' &&
    typeof s.impact === 'string'
  );

  const safeWeakSpots = data.weakSpots.filter((w) =>
    w &&
    typeof w === 'object' &&
    typeof w.title === 'string' &&
    typeof w.description === 'string'
  );

  const safeNarrativeThemes = Array.isArray(data.narrativeThemes)
    ? data.narrativeThemes.filter((t): t is string => typeof t === 'string')
    : [];

  const safeTargetSchools = data.admissionsRubric?.targetSchools
    ? data.admissionsRubric.targetSchools.filter((school) => typeof school === 'string')
    : [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Brand Statement - Narrative Synthesis Result */}
      {data.brandStatement && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #f59e0b',
          }}
        >
          <h2
            className="text-sm font-semibold mb-3 uppercase tracking-wider"
            style={{ color: '#92400e' }}
          >
            Your Brand Statement
          </h2>
          <p
            className="text-xl md:text-2xl font-bold leading-relaxed"
            style={{ color: '#78350f' }}
          >
            "{data.brandStatement}"
          </p>
          {safeNarrativeThemes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {safeNarrativeThemes.slice(0, 4).map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(120, 53, 15, 0.1)',
                    color: '#78350f',
                  }}
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
          {data.firstPrinciple && (
            <p
              className="mt-4 text-sm italic"
              style={{ color: '#92400e' }}
            >
              Core Principle: {data.firstPrinciple}
            </p>
          )}
        </motion.section>
      )}

      {/* Strategic Identity Section (v1.1.0) */}
      {data.identitySynthesis && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            border: '2px solid #818cf8',
          }}
        >
          <h2
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: '#4338ca' }}
          >
            Strategic Identity
          </h2>

          {/* Archetype Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <ArchetypeBadge
              archetype={data.identitySynthesis.archetype}
              confidence={data.identitySynthesis.archetype_confidence}
              size="md"
            />
          </div>

          {/* Spike */}
          <div className="mb-4">
            <label
              className="text-sm font-medium mb-1 block"
              style={{ color: '#4338ca' }}
            >
              Your Spike
            </label>
            <SpikeIndicator spike={data.identitySynthesis.spike} size="md" />
          </div>

          {/* Pillars */}
          {data.identitySynthesis.pillars && data.identitySynthesis.pillars.length > 0 && (
            <div className="mb-4">
              <label
                className="text-sm font-medium mb-2 block"
                style={{ color: '#4338ca' }}
              >
                Identity Pillars
              </label>
              <div className="flex flex-wrap gap-2">
                {data.identitySynthesis.pillars.map((pillar, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white rounded-full text-sm border"
                    style={{ color: '#4338ca', borderColor: '#a5b4fc' }}
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Narrative Hook */}
          {data.identitySynthesis.narrative_hook && (
            <div
              className="mt-4 p-3 bg-white rounded-md"
              style={{ borderLeft: '4px solid #6366f1' }}
            >
              <label
                className="text-xs font-medium uppercase"
                style={{ color: '#6b7280' }}
              >
                Narrative Hook
              </label>
              <p
                className="italic mt-1"
                style={{ color: '#1f2937' }}
              >
                "{data.identitySynthesis.narrative_hook}"
              </p>
            </div>
          )}
        </motion.section>
      )}

      {/* Portfolio Diagnosis */}
      {data.portfolioAudit && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="font-semibold"
                style={{ color: COLORS.textHeading }}
              >
                Portfolio Strength
              </h3>
              <p
                className="text-sm mt-1"
                style={{ color: COLORS.textSecondary }}
              >
                {data.portfolioAudit.diagnosis.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-3xl font-bold"
                style={{ color: '#6366f1' }}
              >
                {data.portfolioAudit.score}
              </div>
              <div
                className="text-xs"
                style={{ color: COLORS.textMuted }}
              >
                out of 100
              </div>
            </div>
          </div>

          {/* Tier Summary */}
          <div className="mt-4 flex gap-4 text-sm">
            <span style={{ color: '#16a34a' }}>
              T1: {data.portfolioAudit.tier_summary?.T1 || 0}
            </span>
            <span style={{ color: '#2563eb' }}>
              T2: {data.portfolioAudit.tier_summary?.T2 || 0}
            </span>
            <span style={{ color: '#d97706' }}>
              T3: {data.portfolioAudit.tier_summary?.T3 || 0}
            </span>
            <span style={{ color: '#6b7280' }}>
              T4: {data.portfolioAudit.tier_summary?.T4 || 0}
            </span>
          </div>

          {/* Gaps */}
          {data.portfolioAudit.gaps && data.portfolioAudit.gaps.length > 0 && (
            <div className="mt-4">
              <label
                className="text-xs font-medium uppercase"
                style={{ color: COLORS.textMuted }}
              >
                Areas to Develop
              </label>
              <ul className="mt-2 space-y-1">
                {data.portfolioAudit.gaps.slice(0, 3).map((gap, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: COLORS.textSecondary }}
                  >
                    <span style={{ color: '#d97706' }}>!</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.section>
      )}

      {/* Row 1: Ivy+ Ready Score (Rings) + Four Pillars - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ivy+ Ready Score - 5-Ring Visualization */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 flex flex-col"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <h2 className="text-lg font-semibold mb-4 text-center" style={{ color: COLORS.textHeading }}>
            Your Ivy+ Ready Score
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <CircularProgress
              aptitude={data.pillars.aptitude}
              passion={data.pillars.passion}
              community={data.pillars.service}
              narrative={data.pillars.identity}
              totalScore={data.ivyReadyScore.overall}
              size={320}
            />
          </div>
          {data.ivyReadyScore.changeVs180Days !== 0 && (
            <div className="text-center mt-4">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: data.ivyReadyScore.changeVs180Days > 0 ? '#dcfce7' : '#fee2e2',
                  color: data.ivyReadyScore.changeVs180Days > 0 ? '#16a34a' : '#dc2626',
                }}
              >
                {data.ivyReadyScore.changeVs180Days > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {data.ivyReadyScore.changeVs180Days > 0 ? '+' : ''}{data.ivyReadyScore.changeVs180Days}% vs 180 days ago
              </span>
            </div>
          )}
        </motion.section>

        {/* Four Pillars - 2x2 Grid with Wave Animations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 flex flex-col"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <h2 className="text-lg font-semibold mb-4 text-center" style={{ color: COLORS.textHeading }}>
            Four Pillars of Excellence
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <PillarCards
              aptitude={data.pillars.aptitude}
              passion={data.pillars.passion}
              community={data.pillars.service}
              narrative={data.pillars.identity}
            />
          </div>
        </motion.section>
      </div>

      {/* Row 2: Score Summary + Admissions Rubric - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textHeading }}>
            Score Summary
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Aptitude', score: data.pillars.aptitude, color: '#FFBB6D' },
              { name: 'Passion', score: data.pillars.passion, color: '#FF6E6D' },
              { name: 'Service', score: data.pillars.service, color: '#55AAAA' },
              { name: 'Identity', score: data.pillars.identity, color: '#9698A6' },
            ].map((pillar) => (
              <div key={pillar.name} className="flex items-center gap-4">
                <span className="text-sm font-medium w-20" style={{ color: COLORS.textSecondary }}>{pillar.name}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pillar.score}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ backgroundColor: pillar.color }}
                  />
                </div>
                <span className="text-sm font-bold w-12 text-right" style={{ color: pillar.color }}>
                  {pillar.score}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t" style={{ borderColor: COLORS.borderDefault }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Overall Ivy+ Ready</span>
              <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                {data.ivyReadyScore.overall}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Admissions Rubric Correlation */}
        {data.admissionsRubric && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-6 text-white"
            style={{ background: GRADIENTS.primary }}
          >
            <h3 className="text-lg font-semibold mb-4">Admissions Rubric Correlation</h3>

            <div className="space-y-3">
              <RubricItem label="Academic Index" value={data.admissionsRubric.academicIndex} />
              <RubricItem label="Extracurricular Rating" value={data.admissionsRubric.extracurricularRating} />
              <RubricItem label="Personal Qualities" value={data.admissionsRubric.personalQualities} />
              <RubricItem label="Recommendation Strength" value={data.admissionsRubric.recommendationStrength} />
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <span className="text-sm opacity-75">Overall Admit Probability</span>
              <div className="text-3xl font-bold mt-1">
                {data.admissionsRubric.overallAdmitProbability}%
              </div>
            </div>

            {safeTargetSchools.length > 0 && (
              <div className="mt-4">
                <span className="text-sm opacity-75">Target Schools</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {safeTargetSchools.map(school => (
                    <span key={school} className="px-2 py-1 rounded-full text-xs bg-white/20">
                      {school}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Row 3: Dimensional Scores Grid */}
      {data.dimensionalScores && data.dimensionalScores.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.textHeading }}>
            Dimensional Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.dimensionalScores.map((dim, i) => (
              <motion.div
                key={dim.dimension}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="bg-white rounded-xl p-4 border"
                style={{ borderColor: COLORS.borderDefault }}
              >
                <span className="text-xs font-medium" style={{ color: COLORS.textMuted }}>
                  {dim.dimension}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold" style={{ color: COLORS.textHeading }}>
                    {dim.score}
                  </span>
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>/100</span>
                </div>
                <span
                  className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: STATUS_COLORS.completed.bg,
                    color: STATUS_COLORS.completed.text,
                  }}
                >
                  {dim.tier}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Row 4: Strengths + Focus Areas - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} style={{ color: COLORS.success }} />
            <h2 className="text-lg font-semibold" style={{ color: COLORS.textHeading }}>
              Standout Strengths
            </h2>
          </div>
          <div className="space-y-3">
            {safeStrengths.map((strength, i) => (
              <motion.div
                key={strength.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="bg-white rounded-xl p-4 border-l-4"
                style={{ borderColor: COLORS.success }}
              >
                <h3 className="font-medium" style={{ color: COLORS.textHeading }}>
                  {strength.title}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: '#dcfce7', color: COLORS.success }}
                  >
                    ROI: {strength.roi}x
                  </span>
                  <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                    {strength.impact}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Focus Areas Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} style={{ color: COLORS.warning }} />
            <h2 className="text-lg font-semibold" style={{ color: COLORS.textHeading }}>
              Focus Areas
            </h2>
          </div>
          <div className="space-y-3">
            {safeWeakSpots.map((spot, i) => {
              const priorityColors = {
                P0: { bg: '#fee2e2', text: '#dc2626', border: '#dc2626' },
                P1: { bg: '#fef3c7', text: '#d97706', border: '#d97706' },
                P2: { bg: '#f3f4f6', text: '#6b7280', border: '#6b7280' },
              };
              const colors = priorityColors[spot.priority];

              return (
                <motion.div
                  key={spot.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="bg-white rounded-xl p-4 flex items-start gap-4"
                  style={{
                    borderLeft: `4px solid ${colors.border}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <span
                    className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {spot.priority}
                  </span>
                  <div>
                    <h3 className="font-medium" style={{ color: COLORS.textHeading }}>
                      {spot.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                      {spot.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* Project Simulator Integration - Phase 7 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <ProjectSimulator />
      </motion.section>
    </div>
  );
}

function RubricItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm opacity-75">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 rounded-full bg-white/20 overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <span className="text-sm font-medium w-8">{value}</span>
      </div>
    </div>
  );
}

export default AssessmentTab;
