'use client';

import { useState } from 'react';
import { useAwardsPortfolio } from '@/lib/hooks/useAgentV2';
import type { AwardsPortfolioResult, AwardProbability } from '@/lib/api/agentV2Client';

interface AwardsPortfolioCardV2Props {
  studentProfile: {
    spike?: string;
    identity?: string[];
    activities?: Array<{ name: string; description?: string }>;
    has_working_project?: boolean;
  };
  onRefresh?: () => void;
}

function AwardTierSection({
  title,
  awards,
  color
}: {
  title: string;
  awards: AwardProbability[];
  color: 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      {awards.length > 0 ? (
        <ul className="space-y-2">
          {awards.map((award, i) => (
            <li key={i} className="text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">{award.award_name}</span>
                <span className="text-xs font-semibold">
                  {(award.probability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs opacity-75 mt-0.5">
                {award.reasoning}
              </div>
              {(award.vulnerability_bonus || award.identity_bonus) && (
                <div className="flex gap-1 mt-1">
                  {award.vulnerability_bonus && (
                    <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded">
                      +15% vulnerability
                    </span>
                  )}
                  {award.identity_bonus && (
                    <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded">
                      +10% identity
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm opacity-75">No awards in this tier</p>
      )}
    </div>
  );
}

export function AwardsPortfolioCardV2({ studentProfile, onRefresh }: AwardsPortfolioCardV2Props) {
  const [portfolio, setPortfolio] = useState<AwardsPortfolioResult | null>(null);
  const awardsPortfolio = useAwardsPortfolio();

  const handleGenerate = async () => {
    try {
      const result = await awardsPortfolio.mutateAsync({
        student_profile: studentProfile,
      });
      setPortfolio(result);
    } catch (error) {
      console.error('Failed to generate portfolio:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            2-2-1 Awards Portfolio
          </h3>
          <p className="text-sm text-gray-600">
            Balanced portfolio for maximum impact
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={awardsPortfolio.isPending}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50 text-sm font-medium"
        >
          {awardsPortfolio.isPending ? 'Generating...' : portfolio ? 'Refresh' : 'Generate'}
        </button>
      </div>

      {portfolio ? (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-700">
                {portfolio.portfolio.likely.length + portfolio.portfolio.target.length + portfolio.portfolio.stretch.length}
              </div>
              <div className="text-xs text-gray-500">Total Awards</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {portfolio.expected_wins.toFixed(1)}
              </div>
              <div className="text-xs text-green-600">Expected Wins</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {portfolio.balance_score.toFixed(0)}%
              </div>
              <div className="text-xs text-blue-600">Balance Score</div>
            </div>
          </div>

          {/* Tier Sections */}
          <div className="space-y-3">
            <AwardTierSection
              title={`Likely (60%+) - ${portfolio.portfolio.likely.length} awards`}
              awards={portfolio.portfolio.likely}
              color="green"
            />
            <AwardTierSection
              title={`Target (40-60%) - ${portfolio.portfolio.target.length} awards`}
              awards={portfolio.portfolio.target}
              color="yellow"
            />
            <AwardTierSection
              title={`Stretch (<40%) - ${portfolio.portfolio.stretch.length} awards`}
              awards={portfolio.portfolio.stretch}
              color="red"
            />
          </div>

          {/* Recommendations */}
          {portfolio.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">
                Recommendations
              </h4>
              <ul className="space-y-1">
                {portfolio.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-blue-700">- {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Click &quot;Generate&quot; to build your awards portfolio</p>
        </div>
      )}
    </div>
  );
}

export default AwardsPortfolioCardV2;
