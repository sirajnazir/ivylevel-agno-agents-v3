/**
 * OrchestrationView Component
 * ===========================
 *
 * Visualizes the multi-agent orchestration flow:
 * EC Agent (FIRST, sequential) → Awards + Programs (PARALLEL)
 *
 * Shows:
 * - Agent execution timeline
 * - Data flow between agents
 * - Status indicators for each agent
 * - Overall orchestration metrics
 */
'use client';

import { Activity, Award, GraduationCap, Play, CheckCircle2, XCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import type { OrchestrationView as OrchestrationViewType, OrchestratedAgent, AgentStatus } from '@/lib/types/react-visualization';

interface OrchestrationViewProps {
  data: OrchestrationViewType;
  onAgentClick?: (agentType: string) => void;
}

// Agent icons mapping
const AGENT_ICONS: Record<string, React.ReactNode> = {
  EC: <Activity size={24} />,
  Awards: <Award size={24} />,
  Programs: <GraduationCap size={24} />,
  GamePlan: <Play size={24} />,
};

// Status icons and colors
const STATUS_CONFIG: Record<AgentStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  pending: {
    icon: <Clock size={16} />,
    color: BRAND_COLORS.textMuted,
    bgColor: BRAND_COLORS.bgSecondary,
  },
  running: {
    icon: <Loader2 size={16} className="animate-spin" />,
    color: BRAND_COLORS.primary,
    bgColor: BRAND_COLORS.primaryBg,
  },
  completed: {
    icon: <CheckCircle2 size={16} />,
    color: BRAND_COLORS.success,
    bgColor: BRAND_COLORS.bgSuccess,
  },
  failed: {
    icon: <XCircle size={16} />,
    color: BRAND_COLORS.error,
    bgColor: BRAND_COLORS.bgError,
  },
  skipped: {
    icon: <Clock size={16} />,
    color: BRAND_COLORS.textMuted,
    bgColor: BRAND_COLORS.bgSecondary,
  },
};

export function OrchestrationView({ data, onAgentClick }: OrchestrationViewProps) {
  const { orchestrator, strategy, agents, data_flow, total_duration_ms, overall_success } = data;

  // Group agents by execution order
  const sequentialAgents = agents.filter((a) => a.execution_order === 'sequential');
  const parallelAgents = agents.filter((a) => a.execution_order === 'parallel');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: overall_success ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgError,
          border: `1px solid ${overall_success ? BRAND_COLORS.success : BRAND_COLORS.error}40`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              {orchestrator} Orchestration
            </h3>
            <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textSecondary }}>
              Strategy: {strategy}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              {overall_success ? (
                <CheckCircle2 size={24} style={{ color: BRAND_COLORS.success }} />
              ) : (
                <XCircle size={24} style={{ color: BRAND_COLORS.error }} />
              )}
              <span
                className="text-lg font-bold"
                style={{ color: overall_success ? BRAND_COLORS.success : BRAND_COLORS.error }}
              >
                {overall_success ? 'Success' : 'Failed'}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
              Total: {(total_duration_ms / 1000).toFixed(2)}s
            </p>
          </div>
        </div>
      </div>

      {/* Execution Flow Visualization */}
      <div className="relative">
        {/* Flow Timeline */}
        <div className="flex items-center justify-center gap-4">
          {/* Sequential Agents */}
          {sequentialAgents.map((agent, idx) => (
            <div key={agent.name} className="flex items-center">
              <AgentNode
                agent={agent}
                onClick={() => onAgentClick?.(agent.type)}
              />
              {idx < sequentialAgents.length - 1 && (
                <ArrowRight size={24} style={{ color: BRAND_COLORS.textMuted, margin: '0 8px' }} />
              )}
            </div>
          ))}

          {/* Arrow to parallel section */}
          {sequentialAgents.length > 0 && parallelAgents.length > 0 && (
            <ArrowRight size={24} style={{ color: BRAND_COLORS.textMuted, margin: '0 8px' }} />
          )}

          {/* Parallel Agents */}
          {parallelAgents.length > 0 && (
            <div
              className="flex flex-col gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: BRAND_COLORS.bgSecondary,
                border: `1px dashed ${BRAND_COLORS.borderLight}`,
              }}
            >
              <p className="text-xs text-center font-medium" style={{ color: BRAND_COLORS.textMuted }}>
                PARALLEL
              </p>
              <div className="flex gap-4">
                {parallelAgents.map((agent) => (
                  <AgentNode
                    key={agent.name}
                    agent={agent}
                    onClick={() => onAgentClick?.(agent.type)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Flow */}
      {data_flow && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: BRAND_COLORS.bgSecondary,
            border: `1px solid ${BRAND_COLORS.borderLight}`,
          }}
        >
          <h4 className="text-sm font-semibold mb-3" style={{ color: BRAND_COLORS.textHeading }}>
            Data Flow
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {/* From EC Agent */}
            {data_flow.from_ec_agent && (
              <DataFlowCard
                title="From EC Agent"
                icon={<Activity size={16} />}
                color={BRAND_COLORS.primary}
                data={data_flow.from_ec_agent}
              />
            )}

            {/* To Awards Agent */}
            {data_flow.to_awards_agent && (
              <DataFlowCard
                title="To Awards Agent"
                icon={<Award size={16} />}
                color={BRAND_COLORS.warning}
                data={data_flow.to_awards_agent}
              />
            )}

            {/* To Programs Agent */}
            {data_flow.to_programs_agent && (
              <DataFlowCard
                title="To Programs Agent"
                icon={<GraduationCap size={16} />}
                color={BRAND_COLORS.success}
                data={data_flow.to_programs_agent}
              />
            )}
          </div>
        </div>
      )}

      {/* Agent Details */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
          Agent Execution Details
        </h4>
        {agents.map((agent) => (
          <AgentExecutionRow
            key={agent.name}
            agent={agent}
            onClick={() => onAgentClick?.(agent.type)}
          />
        ))}
      </div>
    </div>
  );
}

// Agent Node Component
function AgentNode({
  agent,
  onClick,
}: {
  agent: OrchestratedAgent;
  onClick?: () => void;
}) {
  const statusConfig = STATUS_CONFIG[agent.status];

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
      style={{
        backgroundColor: statusConfig.bgColor,
        border: `2px solid ${statusConfig.color}40`,
        minWidth: '100px',
      }}
    >
      <span style={{ color: statusConfig.color }}>{AGENT_ICONS[agent.type]}</span>
      <span
        className="text-sm font-semibold"
        style={{ color: BRAND_COLORS.textHeading }}
      >
        {agent.name}
      </span>
      <div className="flex items-center gap-1">
        {statusConfig.icon}
        <span className="text-xs capitalize" style={{ color: statusConfig.color }}>
          {agent.status}
        </span>
      </div>
      {agent.duration_ms !== undefined && (
        <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          {(agent.duration_ms / 1000).toFixed(2)}s
        </span>
      )}
    </button>
  );
}

// Data Flow Card Component
function DataFlowCard({
  title,
  icon,
  color,
  data,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  data: Record<string, unknown>;
}) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-medium" style={{ color }}>
          {title}
        </span>
      </div>
      <div className="space-y-1">
        {Object.entries(data).slice(0, 4).map(([key, value]) => (
          <div key={key} className="text-xs">
            <span style={{ color: BRAND_COLORS.textMuted }}>{key}: </span>
            <span style={{ color: BRAND_COLORS.textSecondary }}>
              {typeof value === 'string'
                ? value.slice(0, 50) + (value.length > 50 ? '...' : '')
                : Array.isArray(value)
                ? `[${value.length} items]`
                : JSON.stringify(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Agent Execution Row Component
function AgentExecutionRow({
  agent,
  onClick,
}: {
  agent: OrchestratedAgent;
  onClick?: () => void;
}) {
  const statusConfig = STATUS_CONFIG[agent.status];

  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg flex items-center justify-between hover:opacity-90 transition-opacity"
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: statusConfig.bgColor }}
        >
          <span style={{ color: statusConfig.color }}>{AGENT_ICONS[agent.type]}</span>
        </span>
        <div className="text-left">
          <p className="font-semibold text-sm" style={{ color: BRAND_COLORS.textHeading }}>
            {agent.name}
          </p>
          <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            {agent.execution_order === 'parallel' ? 'Parallel execution' : 'Sequential'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {agent.duration_ms !== undefined && (
          <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
            {(agent.duration_ms / 1000).toFixed(2)}s
          </span>
        )}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded"
          style={{ backgroundColor: statusConfig.bgColor }}
        >
          {statusConfig.icon}
          <span className="text-xs capitalize" style={{ color: statusConfig.color }}>
            {agent.status}
          </span>
        </div>
        {agent.react_metadata && agent.react_metadata.cycles_executed && (
          <span
            className="px-2 py-1 rounded text-xs"
            style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
          >
            {agent.react_metadata.cycles_executed} cycles
          </span>
        )}
      </div>
    </button>
  );
}

export default OrchestrationView;
