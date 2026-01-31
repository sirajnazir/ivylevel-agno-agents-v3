/**
 * CycleCard Component
 * ===================
 *
 * Displays a single ReAct cycle with all 4 phases (THINK, ACT, OBSERVE, LEARN).
 * Each phase is expandable/collapsible like Claude AI's thinking view.
 */
'use client';

import { Brain, Zap, Eye, BookOpen, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { PhaseAccordion } from './PhaseAccordion';
import type { CycleSummary } from '@/lib/types/react-visualization';
import { PHASE_COLORS } from '@/lib/types/react-visualization';

interface CycleCardProps {
  cycle: CycleSummary;
  cycleNumber: number;
  totalCycles: number;
  isLatest: boolean;
  previousScore?: number;
}

export function CycleCard({
  cycle,
  cycleNumber,
  totalCycles,
  isLatest,
  previousScore,
}: CycleCardProps) {
  const qualityScore = cycle.observe?.quality_score ?? cycle.quality_score ?? 0;
  const passed = cycle.observe?.passed ?? qualityScore >= 70;
  const delta = previousScore !== undefined ? qualityScore - previousScore : 0;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        border: `1px solid ${isLatest ? BRAND_COLORS.primary + '40' : BRAND_COLORS.borderLight}`,
        boxShadow: isLatest ? '0 4px 12px rgba(255, 74, 35, 0.1)' : 'none',
      }}
    >
      {/* Cycle Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          backgroundColor: isLatest ? BRAND_COLORS.primaryBg : BRAND_COLORS.bgSecondary,
          borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold"
            style={{ color: BRAND_COLORS.textHeading }}
          >
            Cycle {cycleNumber} of {totalCycles}
          </span>
          {isLatest && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: BRAND_COLORS.primary, color: 'white' }}
            >
              Latest
            </span>
          )}
        </div>

        {/* Score + Delta */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{
                color: passed ? BRAND_COLORS.success : BRAND_COLORS.error,
              }}
            >
              {Math.round(qualityScore)}
            </span>
            {delta !== 0 && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: delta > 0 ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgError,
                  color: delta > 0 ? BRAND_COLORS.success : BRAND_COLORS.error,
                }}
              >
                {delta > 0 ? '+' : ''}{Math.round(delta)}
              </span>
            )}
          </div>
          {passed ? (
            <CheckCircle2 size={20} style={{ color: BRAND_COLORS.success }} />
          ) : (
            <XCircle size={20} style={{ color: BRAND_COLORS.error }} />
          )}
        </div>
      </div>

      {/* Phases */}
      <div className="p-3">
        {/* THINK Phase */}
        <PhaseAccordion
          phase="think"
          icon={<Brain size={16} />}
          title="THINK"
          badge={cycle.think?.tools_selected?.length > 0 ? `${cycle.think.tools_selected.length} tools` : undefined}
          defaultExpanded={isLatest}
          isFirst
        >
          <ThinkPhaseContent think={cycle.think} />
        </PhaseAccordion>

        {/* ACT Phase */}
        <PhaseAccordion
          phase="act"
          icon={<Zap size={16} />}
          title="ACT"
          duration={cycle.act?.duration_ms}
          badge={cycle.act?.hints_applied?.length > 0 ? `${cycle.act.hints_applied.length} hints` : undefined}
        >
          <ActPhaseContent act={cycle.act} />
        </PhaseAccordion>

        {/* OBSERVE Phase */}
        <PhaseAccordion
          phase="observe"
          icon={<Eye size={16} />}
          title="OBSERVE"
          badge={`${Math.round(qualityScore)}%`}
        >
          <ObservePhaseContent observe={cycle.observe} />
        </PhaseAccordion>

        {/* LEARN Phase */}
        <PhaseAccordion
          phase="learn"
          icon={<BookOpen size={16} />}
          title="LEARN"
          badge={cycle.learn?.quality_delta ? `${cycle.learn.quality_delta > 0 ? '+' : ''}${cycle.learn.quality_delta} pts` : undefined}
        >
          <LearnPhaseContent learn={cycle.learn} />
        </PhaseAccordion>
      </div>
    </div>
  );
}

// =============================================================================
// PHASE CONTENT COMPONENTS
// =============================================================================

function ThinkPhaseContent({ think }: { think: CycleSummary['think'] }) {
  if (!think) {
    return <EmptyPhaseMessage message="No thinking data available" />;
  }

  return (
    <div className="space-y-4">
      {/* Reasoning Text - Claude-like thinking display */}
      {think.reasoning && (
        <div
          className="text-sm leading-relaxed p-3 rounded-lg"
          style={{
            backgroundColor: 'white',
            border: `1px solid ${PHASE_COLORS.think.color}20`,
            color: BRAND_COLORS.textPrimary,
          }}
        >
          <span className="italic">"{think.reasoning}"</span>
        </div>
      )}

      {/* Focus Areas */}
      {think.focus_areas && think.focus_areas.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>
            Focus Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {think.focus_areas.map((area, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: PHASE_COLORS.think.bgColor,
                  color: PHASE_COLORS.think.color,
                }}
              >
                {safeString(area)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tools Selected */}
      {think.tools_selected && think.tools_selected.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>
            Tools Selected
          </p>
          <div className="flex flex-wrap gap-2">
            {think.tools_selected.map((tool, i) => {
              // Handle both string (legacy) and ToolSelection object formats
              const toolName = typeof tool === 'string' ? tool : tool.tool_name || tool.tool_id;
              const toolPurpose = typeof tool === 'object' && tool.purpose ? tool.purpose : undefined;
              return (
                <span
                  key={i}
                  className="px-2 py-1 rounded text-xs font-mono"
                  style={{
                    backgroundColor: BRAND_COLORS.bgSecondary,
                    color: BRAND_COLORS.textSecondary,
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                  }}
                  title={toolPurpose}
                >
                  {toolName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      {think.gap_analysis && typeof think.gap_analysis === 'object' && (
        <GapAnalysisDisplay gapAnalysis={think.gap_analysis as Record<string, unknown>} />
      )}

      {/* Confidence */}
      {think.confidence !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            Confidence:
          </span>
          <span
            className="text-xs font-medium"
            style={{
              color: think.confidence >= 0.7 ? BRAND_COLORS.success : BRAND_COLORS.warning,
            }}
          >
            {Math.round(think.confidence * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

function ActPhaseContent({ act }: { act: CycleSummary['act'] }) {
  if (!act) {
    return <EmptyPhaseMessage message="No action data available" />;
  }

  return (
    <div className="space-y-4">
      {/* Action Description */}
      {act.action && (
        <div className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
          <span className="font-medium">{act.action}</span>
        </div>
      )}

      {/* Tools Executed */}
      {act.tools_executed && act.tools_executed.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>
            Tools Executed
          </p>
          <div className="space-y-1">
            {act.tools_executed.map((tool, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-2 py-1.5 rounded text-xs"
                style={{
                  backgroundColor: tool.success ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgError,
                }}
              >
                <span className="font-mono" style={{ color: BRAND_COLORS.textPrimary }}>
                  {safeString(tool.name)}
                </span>
                <div className="flex items-center gap-2">
                  {tool.duration_ms !== undefined && (
                    <span style={{ color: BRAND_COLORS.textMuted }}>
                      {tool.duration_ms}ms
                    </span>
                  )}
                  {tool.success ? (
                    <CheckCircle2 size={14} style={{ color: BRAND_COLORS.success }} />
                  ) : (
                    <XCircle size={14} style={{ color: BRAND_COLORS.error }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input/Output Summary */}
      <div className="grid grid-cols-2 gap-3">
        {act.input_summary && Object.keys(act.input_summary).length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.textMuted }}>
              Input
            </p>
            <div className="text-xs space-y-0.5" style={{ color: BRAND_COLORS.textSecondary }}>
              {Object.entries(act.input_summary).slice(0, 3).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span>{' '}
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              ))}
            </div>
          </div>
        )}
        {act.output_summary && Object.keys(act.output_summary).length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.textMuted }}>
              Output
            </p>
            <div className="text-xs space-y-0.5" style={{ color: BRAND_COLORS.textSecondary }}>
              {Object.entries(act.output_summary).slice(0, 3).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span>{' '}
                  {typeof value === 'string' ? value.slice(0, 50) : String(value)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hints Applied */}
      {act.hints_applied && act.hints_applied.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            Hints applied:
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: PHASE_COLORS.act.bgColor,
              color: PHASE_COLORS.act.color,
            }}
          >
            {act.hints_applied.length}
          </span>
        </div>
      )}
    </div>
  );
}

function ObservePhaseContent({ observe }: { observe: CycleSummary['observe'] }) {
  if (!observe) {
    return <EmptyPhaseMessage message="No observation data available" />;
  }

  return (
    <div className="space-y-4">
      {/* Score Gauges */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreGauge label="Quality" value={observe.quality_score} threshold={70} />
        <ScoreGauge label="Voice" value={observe.voice_score} threshold={70} />
        <ScoreGauge label="Golden" value={observe.golden_similarity * 100} threshold={60} />
      </div>

      {/* Pass/Fail Status */}
      <div
        className="p-3 rounded-lg flex items-center gap-3"
        style={{
          backgroundColor: observe.passed ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgError,
        }}
      >
        {observe.passed ? (
          <>
            <CheckCircle2 size={20} style={{ color: BRAND_COLORS.success }} />
            <span className="text-sm font-medium" style={{ color: BRAND_COLORS.success }}>
              Quality threshold met
            </span>
          </>
        ) : (
          <>
            <XCircle size={20} style={{ color: BRAND_COLORS.error }} />
            <span className="text-sm font-medium" style={{ color: BRAND_COLORS.error }}>
              Below quality threshold (70)
            </span>
          </>
        )}
      </div>

      {/* Issues Found */}
      {observe.issues_found && observe.issues_found.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.error }}>
            Issues Found
          </p>
          <ul className="space-y-1">
            {observe.issues_found.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <XCircle size={12} style={{ color: BRAND_COLORS.error }} className="mt-0.5" />
                <span style={{ color: BRAND_COLORS.textSecondary }}>{safeString(issue)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths Found */}
      {observe.strengths_found && observe.strengths_found.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.success }}>
            Strengths Found
          </p>
          <ul className="space-y-1">
            {observe.strengths_found.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle2 size={12} style={{ color: BRAND_COLORS.success }} className="mt-0.5" />
                <span style={{ color: BRAND_COLORS.textSecondary }}>{safeString(strength)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Failing Dimensions */}
      {observe.failing_dimensions && observe.failing_dimensions.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.warning }}>
            Needs Improvement
          </p>
          <div className="flex flex-wrap gap-2">
            {observe.failing_dimensions.map((dim, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: BRAND_COLORS.bgWarning,
                  color: BRAND_COLORS.warning,
                }}
              >
                {safeString(dim)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LearnPhaseContent({ learn }: { learn: CycleSummary['learn'] }) {
  if (!learn) {
    return <EmptyPhaseMessage message="No learning data available" />;
  }

  return (
    <div className="space-y-4">
      {/* Learning Reasoning */}
      {learn.reasoning && (
        <div
          className="text-sm leading-relaxed p-3 rounded-lg"
          style={{
            backgroundColor: 'white',
            border: `1px solid ${PHASE_COLORS.learn.color}20`,
            color: BRAND_COLORS.textPrimary,
          }}
        >
          <span className="italic">"{learn.reasoning}"</span>
        </div>
      )}

      {/* Quality Delta */}
      {learn.quality_delta !== undefined && learn.quality_delta !== 0 && (
        <div
          className="p-3 rounded-lg flex items-center gap-3"
          style={{
            backgroundColor: learn.quality_delta > 0 ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgError,
          }}
        >
          <span
            className="text-lg font-bold"
            style={{
              color: learn.quality_delta > 0 ? BRAND_COLORS.success : BRAND_COLORS.error,
            }}
          >
            {learn.quality_delta > 0 ? '+' : ''}{learn.quality_delta}
          </span>
          <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
            points {learn.quality_delta > 0 ? 'improvement' : 'regression'}
          </span>
        </div>
      )}

      {/* What Worked */}
      {learn.what_worked && learn.what_worked.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.success }}>
            What Worked
          </p>
          <ul className="space-y-1">
            {learn.what_worked.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle2 size={12} style={{ color: BRAND_COLORS.success }} className="mt-0.5" />
                <span style={{ color: BRAND_COLORS.textSecondary }}>{safeString(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What Failed */}
      {learn.what_failed && learn.what_failed.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.error }}>
            What Failed
          </p>
          <ul className="space-y-1">
            {learn.what_failed.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <XCircle size={12} style={{ color: BRAND_COLORS.error }} className="mt-0.5" />
                <span style={{ color: BRAND_COLORS.textSecondary }}>{safeString(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrections to Apply */}
      {learn.corrections_to_apply && learn.corrections_to_apply.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: PHASE_COLORS.learn.color }}>
            Next Cycle Corrections
          </p>
          <ul className="space-y-1">
            {learn.corrections_to_apply.map((correction, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span style={{ color: PHASE_COLORS.learn.color }}>→</span>
                <span style={{ color: BRAND_COLORS.textSecondary }}>{safeString(correction)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Continue Status */}
      {learn.should_continue !== undefined && (
        <div
          className="p-2 rounded text-xs text-center"
          style={{
            backgroundColor: learn.should_continue ? PHASE_COLORS.learn.bgColor : BRAND_COLORS.bgSuccess,
            color: learn.should_continue ? PHASE_COLORS.learn.color : BRAND_COLORS.success,
          }}
        >
          {learn.should_continue ? 'Continuing to next cycle...' : 'Quality target achieved!'}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Helper to safely convert any value to displayable string
function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return '';
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Handle common object structures
    if (obj.message) return String(obj.message);
    if (obj.text) return String(obj.text);
    if (obj.gap) return String(obj.gap);
    if (obj.description) return String(obj.description);
    if (obj.name) return String(obj.name);
    if (obj.type && obj.current !== undefined && obj.target !== undefined) {
      return `${obj.type}: ${obj.current} → ${obj.target}`;
    }
    // Fallback: stringify the object
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

// Helper to convert gap item to displayable string (uses safeString)
function formatGapItem(gap: unknown): string {
  return safeString(gap);
}

function GapAnalysisDisplay({ gapAnalysis }: { gapAnalysis: Record<string, unknown> }) {
  // Handle both formats: {critical: [], medium: [], low: []} and other structures
  const critical = Array.isArray(gapAnalysis.critical) ? gapAnalysis.critical : [];
  const medium = Array.isArray(gapAnalysis.medium) ? gapAnalysis.medium : [];
  const low = Array.isArray(gapAnalysis.low) ? gapAnalysis.low : [];

  const hasGaps = critical.length + medium.length + low.length > 0;

  if (!hasGaps) return null;

  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>
        Gap Analysis
      </p>
      <div className="space-y-2">
        {critical.map((gap, i) => (
          <div key={`c-${i}`} className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} style={{ color: BRAND_COLORS.error }} className="mt-0.5" />
            <span style={{ color: BRAND_COLORS.error }}>{formatGapItem(gap)}</span>
          </div>
        ))}
        {medium.map((gap, i) => (
          <div key={`m-${i}`} className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} style={{ color: BRAND_COLORS.warning }} className="mt-0.5" />
            <span style={{ color: BRAND_COLORS.warning }}>{formatGapItem(gap)}</span>
          </div>
        ))}
        {low.map((gap, i) => (
          <div key={`l-${i}`} className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} style={{ color: BRAND_COLORS.textMuted }} className="mt-0.5" />
            <span style={{ color: BRAND_COLORS.textMuted }}>{formatGapItem(gap)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreGauge({ label, value, threshold }: { label: string; value: number; threshold: number }) {
  const passed = value >= threshold;
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className="text-center">
      <div
        className="relative w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: passed ? BRAND_COLORS.success : BRAND_COLORS.error,
          }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
        {label}
      </p>
      <p
        className="text-sm font-bold"
        style={{ color: passed ? BRAND_COLORS.success : BRAND_COLORS.error }}
      >
        {Math.round(value)}%
      </p>
    </div>
  );
}

function EmptyPhaseMessage({ message }: { message: string }) {
  return (
    <p className="text-sm italic text-center py-2" style={{ color: BRAND_COLORS.textMuted }}>
      {message}
    </p>
  );
}

export default CycleCard;
