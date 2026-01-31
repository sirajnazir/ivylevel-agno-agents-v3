/**
 * CrisisAgentCard Component
 * v13.3 - Crisis Response Agent card with Report Crisis button
 */
'use client';

import { useState } from 'react';
import { Flame, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { AgentCardBase } from './AgentCardBase';
import { CrisisAlchemyModal } from '../CrisisAlchemyModal';

interface CrisisAgentCardProps {
  profileId: string;
  onViewDetails?: (data: Record<string, unknown>) => void;
}

export function CrisisAgentCard({ profileId, onViewDetails }: CrisisAgentCardProps) {
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [activeCrises, setActiveCrises] = useState<number>(0);

  // No loading state for this card - it's action-based
  const isLoading = false;
  const isError = false;

  const handleRefresh = () => {
    // Could fetch active crises count here
  };

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails({ active_crises: [], resolved_crises: [] });
    }
  };

  return (
    <>
      <AgentCardBase
        title="Crisis Response"
        icon={<Flame size={20} style={{ color: BRAND_COLORS.warning }} />}
        isLoading={isLoading}
        isError={isError}
        onRefresh={handleRefresh}
        onClick={handleClick}
        actions={
          <button
            onClick={() => setShowCrisisModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: BRAND_COLORS.warning,
              color: '#ffffff',
            }}
          >
            <AlertTriangle size={14} />
            Report Crisis
          </button>
        }
      >
        <div className="space-y-4">
          {/* Status */}
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: activeCrises > 0 ? BRAND_COLORS.bgWarning : BRAND_COLORS.bgSuccess,
              border: `1px solid ${
                activeCrises > 0 ? BRAND_COLORS.warning : BRAND_COLORS.success
              }20`,
            }}
          >
            {activeCrises > 0 ? (
              <>
                <Clock
                  size={24}
                  style={{ color: BRAND_COLORS.warning }}
                  className="mx-auto mb-2"
                />
                <p
                  className="font-semibold"
                  style={{ color: BRAND_COLORS.warning }}
                >
                  {activeCrises} Active {activeCrises === 1 ? 'Crisis' : 'Crises'}
                </p>
                <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                  Pending resolution
                </p>
              </>
            ) : (
              <>
                <CheckCircle
                  size={24}
                  style={{ color: BRAND_COLORS.success }}
                  className="mx-auto mb-2"
                />
                <p
                  className="font-semibold"
                  style={{ color: BRAND_COLORS.success }}
                >
                  No Active Crises
                </p>
                <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                  Everything is on track
                </p>
              </>
            )}
          </div>

          {/* Help Text */}
          <div>
            <p className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
              Feeling stuck? Report a crisis and get instant support using our
              VARC framework:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="text-center">
                <span className="text-xs font-medium" style={{ color: BRAND_COLORS.success }}>
                  V
                </span>
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  alidate
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium" style={{ color: BRAND_COLORS.primary }}>
                  A
                </span>
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  ct
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium" style={{ color: BRAND_COLORS.warning }}>
                  R
                </span>
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  eframe
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium" style={{ color: BRAND_COLORS.secondary }}>
                  C
                </span>
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  reate
                </span>
              </div>
            </div>
          </div>
        </div>
      </AgentCardBase>

      {/* Crisis Modal */}
      <CrisisAlchemyModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        studentProfile={{ spike: 'general', profile_id: profileId }}
      />
    </>
  );
}

export default CrisisAgentCard;
