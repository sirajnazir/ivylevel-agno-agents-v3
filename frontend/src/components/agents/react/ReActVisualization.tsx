/**
 * ReActVisualization Component v5.0
 * ==================================
 *
 * Main container for displaying ReAct cycle visualization in the Agent Detail Modal.
 * Shows THINK → ACT → OBSERVE → LEARN phases with expand/collapse like Claude AI.
 */
'use client';

import { Brain, TrendingUp, Clock, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { CycleCard } from './CycleCard';
import type { ReactMetadata } from '@/lib/types/react-visualization';

interface ReActVisualizationProps {
  agentName: string;
  reactData: ReactMetadata | null;
  isLoading?: boolean;
}

export function ReActVisualization({
  agentName,
  reactData,
  isLoading = false,
}: ReActVisualizationProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!reactData || !reactData.cycle_summary || reactData.cycle_summary.length === 0) {
    return <EmptyState agentName={agentName} />;
  }

  const {
    cycles_executed,
    max_cycles,
    improvement_trajectory = [],
    passed_quality,
    total_duration_ms,
    agentic_enabled,
    version,
    agent_name,
  } = reactData;

  // Use actual agent name from ReAct data if available, otherwise use passed agentName
  const displayAgentName = agent_name || agentName;

  // Calculate improvement (with safe array access)
  const trajectory = Array.isArray(improvement_trajectory) ? improvement_trajectory : [];
  const firstScore = trajectory[0] || 0;
  const lastScore = trajectory[trajectory.length - 1] || 0;
  const totalImprovement = lastScore - firstScore;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: BRAND_COLORS.bgSecondary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          backgroundColor: BRAND_COLORS.bgPrimary,
          borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: BRAND_COLORS.primaryBg }}
          >
            <Brain size={20} style={{ color: BRAND_COLORS.primary }} />
          </span>
          <div>
            <h3
              className="font-semibold"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Agent Reasoning Process
            </h3>
            <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              {displayAgentName} Agent • v{version}{agentic_enabled ? ' Agentic' : ''}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className="px-3 py-1.5 rounded-full flex items-center gap-2"
          style={{
            backgroundColor: passed_quality ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgError,
          }}
        >
          {passed_quality ? (
            <>
              <CheckCircle2 size={14} style={{ color: BRAND_COLORS.success }} />
              <span className="text-xs font-medium" style={{ color: BRAND_COLORS.success }}>
                Passed
              </span>
            </>
          ) : (
            <>
              <XCircle size={14} style={{ color: BRAND_COLORS.error }} />
              <span className="text-xs font-medium" style={{ color: BRAND_COLORS.error }}>
                Below 70
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div
        className="px-5 py-3 grid grid-cols-4 gap-4"
        style={{
          backgroundColor: BRAND_COLORS.bgPrimary,
          borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        <SummaryStat
          icon={<Zap size={16} />}
          label="Cycles"
          value={`${cycles_executed}/${max_cycles}`}
          color={BRAND_COLORS.primary}
        />
        <SummaryStat
          icon={<TrendingUp size={16} />}
          label="Final"
          value={`${Math.round(lastScore)}`}
          color={passed_quality ? BRAND_COLORS.success : BRAND_COLORS.error}
        />
        <SummaryStat
          icon={totalImprovement >= 0 ? <TrendingUp size={16} /> : <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />}
          label="Improvement"
          value={`${totalImprovement >= 0 ? '+' : ''}${Math.round(totalImprovement)}`}
          color={totalImprovement >= 0 ? BRAND_COLORS.success : BRAND_COLORS.error}
        />
        <SummaryStat
          icon={<Clock size={16} />}
          label="Duration"
          value={formatDuration(total_duration_ms)}
          color={BRAND_COLORS.textSecondary}
        />
      </div>

      {/* Improvement Trajectory */}
      {trajectory.length > 1 && (
        <div
          className="px-5 py-4"
          style={{
            backgroundColor: BRAND_COLORS.bgPrimary,
            borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
          }}
        >
          <p className="text-xs font-medium mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            Improvement Trajectory
          </p>
          <TrajectoryChart trajectory={trajectory} />
        </div>
      )}

      {/* Cycle Cards */}
      <div className="p-4 space-y-4">
        {reactData.cycle_summary.map((cycle, index) => (
          <CycleCard
            key={cycle.cycle || index}
            cycle={cycle}
            cycleNumber={cycle.cycle || index + 1}
            totalCycles={cycles_executed}
            isLatest={index === reactData.cycle_summary.length - 1}
            previousScore={index > 0 ? trajectory[index - 1] : undefined}
          />
        ))}
      </div>

      {/* Input Data Flow (if available) */}
      {reactData.input_data_flow && (
        <DataFlowSection dataFlow={reactData.input_data_flow} />
      )}
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function SummaryStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          {label}
        </span>
      </div>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function TrajectoryChart({ trajectory }: { trajectory: number[] }) {
  const max = Math.max(...trajectory, 70);
  const min = Math.min(...trajectory) - 10;
  const range = max - min;

  // SVG viewBox dimensions
  const svgWidth = 100;
  const svgHeight = 100;

  return (
    <div className="relative h-16">
      {/* Background Grid */}
      <div
        className="absolute inset-0 border-b"
        style={{ borderColor: BRAND_COLORS.borderLight }}
      >
        {/* 70 threshold line */}
        <div
          className="absolute w-full border-t border-dashed"
          style={{
            borderColor: BRAND_COLORS.primary + '60',
            top: `${100 - ((70 - min) / range) * 100}%`,
          }}
        >
          <span
            className="absolute right-0 -top-3 text-xs"
            style={{ color: BRAND_COLORS.textMuted }}
          >
            70
          </span>
        </div>
      </div>

      {/* Trajectory Line & Points */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
      >
        {/* Line */}
        <polyline
          fill="none"
          stroke={BRAND_COLORS.primary}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          points={trajectory
            .map((score, i) => {
              const x = trajectory.length === 1 ? svgWidth / 2 : (i / (trajectory.length - 1)) * svgWidth;
              const y = svgHeight - ((score - min) / range) * svgHeight;
              return `${x},${y}`;
            })
            .join(' ')}
        />
      </svg>

      {/* Points with labels */}
      <div className="absolute inset-0 flex justify-between items-end px-2">
        {trajectory.map((score, i) => {
          const passed = score >= 70;
          const y = 100 - ((score - min) / range) * 100;

          return (
            <div
              key={i}
              className="relative flex flex-col items-center"
              style={{ height: '100%' }}
            >
              {/* Point */}
              <div
                className="absolute w-3 h-3 rounded-full border-2"
                style={{
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: BRAND_COLORS.bgPrimary,
                  borderColor: passed ? BRAND_COLORS.success : BRAND_COLORS.error,
                }}
              />
              {/* Label */}
              <div
                className="absolute text-xs font-bold"
                style={{
                  top: `calc(${y}% - 20px)`,
                  color: passed ? BRAND_COLORS.success : BRAND_COLORS.error,
                }}
              >
                {Math.round(score)}
              </div>
              {/* Cycle label */}
              <div
                className="absolute bottom-0 text-xs"
                style={{ color: BRAND_COLORS.textMuted }}
              >
                C{i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DataFlowSection({ dataFlow }: { dataFlow: ReactMetadata['input_data_flow'] }) {
  if (!dataFlow) return null;

  const hasFromProfile = dataFlow.from_profile && Object.keys(dataFlow.from_profile).length > 0;
  const hasToDownstream = dataFlow.to_downstream_agents && Object.keys(dataFlow.to_downstream_agents).length > 0;

  if (!hasFromProfile && !hasToDownstream) return null;

  return (
    <div
      className="px-5 py-4"
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        borderTop: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      <p className="text-xs font-medium mb-3" style={{ color: BRAND_COLORS.textMuted }}>
        Data Flow
      </p>
      <div className="grid grid-cols-2 gap-4">
        {hasFromProfile && (
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.primary }}>
              Input from Profile
            </p>
            <div className="text-xs space-y-1" style={{ color: BRAND_COLORS.textSecondary }}>
              {Object.entries(dataFlow.from_profile || {}).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span>{' '}
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                </div>
              ))}
            </div>
          </div>
        )}
        {hasToDownstream && (
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.success }}>
              Output to Downstream
            </p>
            <div className="text-xs space-y-1" style={{ color: BRAND_COLORS.textSecondary }}>
              {Object.entries(dataFlow.to_downstream_agents || {}).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span>{' '}
                  {Array.isArray(value) ? value.join(', ') : String(value).slice(0, 50)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="rounded-xl p-8 text-center"
      style={{
        backgroundColor: BRAND_COLORS.bgSecondary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      <div className="animate-pulse">
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-4"
          style={{ backgroundColor: BRAND_COLORS.primaryBg }}
        />
        <div
          className="h-4 rounded w-48 mx-auto mb-2"
          style={{ backgroundColor: BRAND_COLORS.borderLight }}
        />
        <div
          className="h-3 rounded w-32 mx-auto"
          style={{ backgroundColor: BRAND_COLORS.borderLight }}
        />
      </div>
    </div>
  );
}

function EmptyState({ agentName }: { agentName: string }) {
  return (
    <div
      className="rounded-xl p-8 text-center"
      style={{
        backgroundColor: BRAND_COLORS.bgSecondary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      <Brain
        size={48}
        style={{ color: BRAND_COLORS.textMuted }}
        className="mx-auto mb-3"
      />
      <p
        className="font-semibold mb-1"
        style={{ color: BRAND_COLORS.textHeading }}
      >
        No ReAct Data
      </p>
      <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
        {agentName} did not produce ReAct cycle data.
        <br />
        This may happen if agentic mode is disabled.
      </p>
    </div>
  );
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(0);
  return `${minutes}m ${remainingSeconds}s`;
}

export default ReActVisualization;
