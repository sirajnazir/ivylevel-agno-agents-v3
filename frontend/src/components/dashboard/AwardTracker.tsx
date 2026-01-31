/**
 * AwardTracker Dashboard Component
 * Displays matched awards with deadlines, win probability, and ROI.
 * @version 10.0
 */

'use client';

import { useState } from 'react';
import { Trophy, Calendar, ChevronRight, ExternalLink } from 'lucide-react';
import { Award } from '@/lib/hooks/useAgentAPI';

interface AwardsAgentData {
  matched_awards?: Award[];
}

export interface AwardTrackerProps {
  awards?: Award[];
  data?: AwardsAgentData | null;
  loading?: boolean;
}

const MOCK_AWARDS: Award[] = [
  { id: '1', name: 'Coca-Cola Scholars Program', category: 'Leadership', deadline: '2024-10-31', deadline_days: 45, amount: 20000, win_probability: 35, roi: 'high', effort_hours: 8, requirements: ['3.0+ GPA', 'Leadership', 'Community Service'], match_reasons: ['Strong leadership', 'Community involvement'] },
  { id: '2', name: 'National Merit Scholarship', category: 'Academic', deadline: '2024-10-15', deadline_days: 29, amount: 2500, win_probability: 42, roi: 'high', effort_hours: 2, requirements: ['PSAT Qualifier'], match_reasons: ['PSAT score qualifies'] },
  { id: '3', name: 'Regeneron Science Talent Search', category: 'STEM', deadline: '2024-11-13', deadline_days: 58, amount: 250000, win_probability: 18, roi: 'high', effort_hours: 40, requirements: ['Research project', 'Senior year'], match_reasons: ['STEM interest', 'Research potential'] },
  { id: '4', name: 'Jack Kent Cooke Foundation', category: 'First-Gen', deadline: '2024-11-30', deadline_days: 75, amount: 55000, win_probability: 28, roi: 'medium', effort_hours: 12, requirements: ['Financial need', 'Academic excellence'], match_reasons: ['First-gen status', 'Strong academics'] },
  { id: '5', name: 'Dell Scholars Program', category: 'Financial Need', deadline: '2024-12-01', deadline_days: 76, amount: 20000, win_probability: 32, roi: 'high', effort_hours: 6, requirements: ['Pell Grant eligible', '2.4+ GPA'], match_reasons: ['Economic background', 'Determination'] },
];

const ROI_COLORS = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

export function AwardTracker({ awards: awardsProp, data, loading }: AwardTrackerProps) {
  // Support both direct awards prop and data prop from agent response
  const awards = awardsProp || data?.matched_awards || MOCK_AWARDS;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const urgentAwards = awards.filter(a => a.deadline_days < 30);
  const totalPotentialValue = awards.reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">
            {awards.length} Matched Awards
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-yellow-600 block">
            {urgentAwards.length} due soon
          </span>
          <span className="text-xs text-yellow-700 font-medium">
            ${(totalPotentialValue / 1000).toFixed(0)}K+ potential
          </span>
        </div>
      </div>

      {/* Award List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {awards.slice(0, 6).map((award) => (
          <AwardCard
            key={award.id}
            award={award}
            isExpanded={expandedId === award.id}
            onToggle={() => setExpandedId(expandedId === award.id ? null : award.id)}
          />
        ))}
      </div>

      {awards.length > 6 && (
        <button className="w-full text-center text-sm text-amber-600 hover:text-amber-700 py-2">
          View all {awards.length} awards →
        </button>
      )}
    </div>
  );
}

interface AwardCardProps {
  award: Award;
  isExpanded: boolean;
  onToggle: () => void;
}

function AwardCard({ award, isExpanded, onToggle }: AwardCardProps) {
  const isUrgent = award.deadline_days < 30;

  return (
    <div className="rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between"
      >
        <div className="flex-1 text-left">
          <p className="font-medium text-gray-900 text-sm">{award.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              <Calendar size={10} className="inline mr-1" />
              {award.deadline_days} days
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${ROI_COLORS[award.roi]}`}>
              {award.roi} ROI
            </span>
            {award.amount && (
              <span className="text-xs text-gray-500">
                ${(award.amount / 1000).toFixed(0)}K
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-semibold text-green-600">
              {award.win_probability}%
            </div>
            <div className="text-[10px] text-gray-500">win prob</div>
          </div>
          <ChevronRight
            size={16}
            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="mt-2 space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Why You Match</p>
              <div className="flex flex-wrap gap-1">
                {award.match_reasons.map((reason, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Requirements</p>
              <p className="text-xs text-gray-600">{award.requirements.join(' • ')}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">
                ~{award.effort_hours} hours to apply
              </span>
              <button className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                Apply Now <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-16 bg-gray-200 rounded-lg" />
      <div className="h-16 bg-gray-200 rounded-lg" />
    </div>
  );
}

export default AwardTracker;
