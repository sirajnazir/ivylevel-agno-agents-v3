/**
 * ExecutionAgentCard Component
 * v13.3 - Displays Execution Debt Score and status from Execution Agent
 */
'use client';

import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useExecutionDebtScore, useBlockers } from '@/hooks/useAgentData';
import { AgentCardBase } from './AgentCardBase';

interface ExecutionAgentCardProps {
  profileId: string;
  onChat?: () => void;
  onViewDetails?: (data: Record<string, unknown>) => void;
}

export function ExecutionAgentCard({ profileId, onChat, onViewDetails }: ExecutionAgentCardProps) {
  const { data: edsData, isLoading: edsLoading, isError: edsError, refetch: refetchEds } = useExecutionDebtScore(profileId);
  const { data: blockersData, isLoading: blockersLoading } = useBlockers(profileId);

  const isLoading = edsLoading || blockersLoading;
  const isError = edsError;

  const handleRefresh = () => {
    refetchEds();
  };

  const handleClick = () => {
    if (onViewDetails && edsData) {
      onViewDetails({ eds: edsData.execution_debt_score, blockers: blockersData?.blockers || [], ...edsData } as Record<string, unknown>);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string | undefined) => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle size={16} />,
          color: BRAND_COLORS.success,
          bgColor: BRAND_COLORS.bgSuccess,
          label: 'Healthy',
        };
      case 'at_risk':
        return {
          icon: <AlertTriangle size={16} />,
          color: BRAND_COLORS.warning,
          bgColor: BRAND_COLORS.bgWarning,
          label: 'At Risk',
        };
      case 'critical':
        return {
          icon: <XCircle size={16} />,
          color: BRAND_COLORS.error,
          bgColor: BRAND_COLORS.bgError,
          label: 'Critical',
        };
      default:
        return {
          icon: <Activity size={16} />,
          color: BRAND_COLORS.textMuted,
          bgColor: BRAND_COLORS.bgSecondary,
          label: 'Unknown',
        };
    }
  };

  const statusInfo = getStatusInfo(edsData?.status);
  const edsScore = edsData?.execution_debt_score || 0;
  const blockerCount = blockersData?.blockers?.length || 0;

  // EDS interpretation
  const getEdsInterpretation = (score: number) => {
    if (score < 20) return 'Excellent execution';
    if (score < 40) return 'Good progress';
    if (score < 60) return 'Needs attention';
    if (score < 80) return 'Falling behind';
    return 'Critical backlog';
  };

  return (
    <AgentCardBase
      title="Execution Agent"
      icon={<Activity size={20} style={{ color: BRAND_COLORS.primary }} />}
      isLoading={isLoading}
      isError={isError}
      onRefresh={handleRefresh}
      onChat={onChat}
      onClick={handleClick}
      headerBadge={
        edsData?.status && (
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1"
            style={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
            }}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        )
      }
    >
      <div className="space-y-4">
        {/* EDS Score */}
        <div className="text-center">
          <div
            className="text-4xl font-bold"
            style={{
              color:
                edsScore < 30
                  ? BRAND_COLORS.success
                  : edsScore < 60
                    ? BRAND_COLORS.warning
                    : BRAND_COLORS.error,
            }}
          >
            {edsScore}
          </div>
          <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
            Execution Debt Score
          </p>
          <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textSecondary }}>
            {getEdsInterpretation(edsScore)}
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: BRAND_COLORS.textMuted }}>Debt Level</span>
            <span style={{ color: BRAND_COLORS.textMuted }}>
              {edsScore}/100
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${edsScore}%`,
                backgroundColor:
                  edsScore < 30
                    ? BRAND_COLORS.success
                    : edsScore < 60
                      ? BRAND_COLORS.warning
                      : BRAND_COLORS.error,
              }}
            />
          </div>
        </div>

        {/* Blockers Count */}
        <div className="flex items-center justify-between">
          <span style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
            Active Blockers
          </span>
          <span
            className="text-sm font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: blockerCount > 0 ? BRAND_COLORS.bgError : BRAND_COLORS.bgSuccess,
              color: blockerCount > 0 ? BRAND_COLORS.error : BRAND_COLORS.success,
            }}
          >
            {blockerCount}
          </span>
        </div>

        {/* Contributing Factors */}
        {edsData?.factors && edsData.factors.length > 0 && (
          <div>
            <p className="text-xs mb-1" style={{ color: BRAND_COLORS.textMuted }}>
              Contributing Factors
            </p>
            <div className="flex flex-wrap gap-1">
              {edsData.factors.slice(0, 2).map((factor: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: BRAND_COLORS.bgSecondary,
                    color: BRAND_COLORS.textSecondary,
                  }}
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </AgentCardBase>
  );
}

export default ExecutionAgentCard;
