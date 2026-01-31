/**
 * OpportunityRadar Dashboard Component
 * Displays 500+ opportunities with fit scores and alerts.
 * @version 10.0
 */

'use client';

import { useState } from 'react';
import { Radar, Star, BookOpen, Briefcase, FlaskConical, Trophy as TrophyIcon, Users } from 'lucide-react';
import { Opportunity } from '@/lib/hooks/useAgentAPI';

interface OpportunityAgentData {
  opportunities?: Opportunity[];
}

export interface OpportunityRadarProps {
  opportunities?: Opportunity[];
  data?: OpportunityAgentData | null;
  loading?: boolean;
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
  { id: '1', name: 'MIT PRIMES', type: 'research', organization: 'MIT', deadline: '2024-12-01', deadline_days: 76, fit_score: 92, requires_application: true, description: 'Research mentorship program for high school students', match_reasons: ['STEM interest', 'Math aptitude'] },
  { id: '2', name: 'Google CSSI', type: 'summer_program', organization: 'Google', deadline: '2025-03-15', deadline_days: 180, fit_score: 88, requires_application: true, cost: 0, description: 'Intensive CS program for rising freshmen', match_reasons: ['CS interest', 'First-gen'] },
  { id: '3', name: 'USACO', type: 'competition', organization: 'USA Computing Olympiad', deadline: '2024-12-15', deadline_days: 90, fit_score: 85, requires_application: false, description: 'Programming competition with multiple divisions', match_reasons: ['Programming skills'] },
  { id: '4', name: 'Bank of America Student Leaders', type: 'internship', organization: 'Bank of America', deadline: '2025-01-31', deadline_days: 137, fit_score: 78, requires_application: true, description: 'Paid summer internship with nonprofit placement', match_reasons: ['Leadership', 'Community interest'] },
  { id: '5', name: 'RSI', type: 'summer_program', organization: 'MIT/CEE', deadline: '2025-01-15', deadline_days: 121, fit_score: 95, requires_application: true, cost: 0, description: 'Premier summer science research program', match_reasons: ['Top academics', 'Research interest'] },
  { id: '6', name: 'TASP', type: 'summer_program', organization: 'Telluride Association', deadline: '2025-01-01', deadline_days: 107, fit_score: 82, requires_application: true, cost: 0, description: 'Intellectual seminar program for rising seniors', match_reasons: ['Intellectual curiosity', 'Writing skills'] },
];

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  summer_program: { icon: BookOpen, label: 'Summer', color: 'text-blue-700', bg: 'bg-blue-100' },
  internship: { icon: Briefcase, label: 'Internship', color: 'text-green-700', bg: 'bg-green-100' },
  research: { icon: FlaskConical, label: 'Research', color: 'text-purple-700', bg: 'bg-purple-100' },
  competition: { icon: TrophyIcon, label: 'Competition', color: 'text-amber-700', bg: 'bg-amber-100' },
  conference: { icon: Users, label: 'Conference', color: 'text-pink-700', bg: 'bg-pink-100' },
};

export function OpportunityRadar({ opportunities: opportunitiesProp, data, loading }: OpportunityRadarProps) {
  // Support both direct opportunities prop and data prop from agent response
  const opportunities = opportunitiesProp || data?.opportunities || MOCK_OPPORTUNITIES;
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  if (loading) {
    return <LoadingSkeleton />;
  }

  const filtered = opportunities.filter(o =>
    typeFilter === 'all' || o.type === typeFilter
  );

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const upcomingCount = opportunities.filter(o => o.deadline_days > 90).length;

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
        <FilterTab active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
          All
        </FilterTab>
        {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
          <FilterTab
            key={key}
            active={typeFilter === key}
            onClick={() => setTypeFilter(key)}
          >
            {label}
          </FilterTab>
        ))}
      </div>

      {/* Opportunity List */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {filtered.slice(0, 6).map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            isSaved={savedIds.has(opp.id)}
            onToggleSave={() => toggleSave(opp.id)}
          />
        ))}
      </div>

      {/* Alert Badge */}
      <div className="flex items-center justify-center gap-2 py-2 text-xs text-purple-600 bg-purple-50 rounded-lg">
        <Radar size={14} />
        <span>{upcomingCount} opportunities 3+ months ahead</span>
      </div>
    </div>
  );
}

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isSaved: boolean;
  onToggleSave: () => void;
}

function OpportunityCard({ opportunity, isSaved, onToggleSave }: OpportunityCardProps) {
  const typeConfig = TYPE_CONFIG[opportunity.type] || TYPE_CONFIG.summer_program;
  const Icon = typeConfig.icon;

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all">
      {/* Type Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeConfig.bg}`}>
        <Icon size={16} className={typeConfig.color} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{opportunity.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{opportunity.organization}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{opportunity.deadline_days}d left</span>
          {opportunity.cost === 0 && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-green-600 font-medium">Free</span>
            </>
          )}
        </div>
      </div>

      {/* Fit Score & Actions */}
      <div className="flex items-center gap-2">
        <div className="text-center">
          <div className={`text-sm font-bold ${
            opportunity.fit_score >= 90 ? 'text-green-600' :
            opportunity.fit_score >= 75 ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {opportunity.fit_score}%
          </div>
          <div className="text-[10px] text-gray-500">fit</div>
        </div>
        <button
          onClick={onToggleSave}
          className={`p-1.5 rounded-lg transition-colors ${
            isSaved ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 hover:text-amber-500'
          }`}
        >
          <Star size={14} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg" />
      <div className="h-14 bg-gray-200 rounded-lg" />
      <div className="h-14 bg-gray-200 rounded-lg" />
      <div className="h-14 bg-gray-200 rounded-lg" />
    </div>
  );
}

export default OpportunityRadar;
