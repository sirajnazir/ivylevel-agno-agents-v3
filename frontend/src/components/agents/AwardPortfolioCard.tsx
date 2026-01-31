// Award Portfolio Card Component
// File: components/agents/AwardPortfolioCard.tsx

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  TrendingUp,
  Target,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface AwardMatch {
  award_id?: string;
  name: string;
  category: string;
  level: string;
  deadline?: string;
  win_probability: number;
  roi?: number;
  effort_hours: number;
  prestige_score?: number;
  fit_reasons?: string[];
  months_until_deadline?: number;
}

interface AwardPortfolio {
  likely: AwardMatch[];
  target: AwardMatch[];
  stretch: AwardMatch[];
  total_recommended?: number;
  expected_wins: number;
  total_effort_hours?: number;
  strategy_notes?: string[];
}

interface AwardPortfolioCardProps {
  portfolio: AwardPortfolio | null | undefined;
  isLoading?: boolean;
  onRefresh?: () => void;
}

function AwardItem({ award, index }: { award: AwardMatch; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const probabilityColor =
    award.win_probability >= 0.5
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : award.win_probability >= 0.25
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
        : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {award.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {award.category} • {award.level}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${probabilityColor}`}>
            {Math.round(award.win_probability * 100)}%
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{award.effort_hours}h effort</span>
                </div>
                {award.roi && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <BarChart3 className="w-3 h-3" />
                    <span>ROI: {award.roi.toFixed(2)}</span>
                  </div>
                )}
                {award.months_until_deadline && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{award.months_until_deadline}mo until deadline</span>
                  </div>
                )}
                {award.prestige_score && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Target className="w-3 h-3" />
                    <span>Prestige: {award.prestige_score}/10</span>
                  </div>
                )}
              </div>

              {award.fit_reasons && award.fit_reasons.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Why this fits you:
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {award.fit_reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryColumn({
  title,
  subtitle,
  icon: Icon,
  awards,
  color,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  awards: AwardMatch[];
  color: 'green' | 'yellow' | 'orange';
}) {
  const colorClasses = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
      text: 'text-green-700 dark:text-green-300',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300',
      text: 'text-yellow-700 dark:text-yellow-300',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300',
      text: 'text-orange-700 dark:text-orange-300',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`rounded-xl ${classes.bg} ${classes.border} border p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${classes.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className={`font-semibold ${classes.text}`}>{title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>

      {awards.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">
          No awards in this category
        </p>
      ) : (
        <div className="space-y-2">
          {awards.map((award, index) => (
            <AwardItem key={award.award_id || index} award={award} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AwardPortfolioCard({
  portfolio,
  isLoading = false,
  onRefresh,
}: AwardPortfolioCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg animate-pulse">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-600 dark:text-gray-400">Award Portfolio</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Complete your assessment to see personalized award recommendations.
        </p>
      </div>
    );
  }

  const totalRecommended = portfolio.total_recommended || 
    (portfolio.likely?.length || 0) + (portfolio.target?.length || 0) + (portfolio.stretch?.length || 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Award Portfolio</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Balanced across risk levels for maximum impact
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh awards"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRecommended}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Recommended</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {portfolio.expected_wins?.toFixed(1) || '0'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Expected Wins</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {portfolio.total_effort_hours || 0}h
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Effort</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(portfolio.likely?.length || 0) + (portfolio.target?.length || 0) + (portfolio.stretch?.length || 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">In Portfolio</p>
        </div>
      </div>

      {/* Three-Column Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CategoryColumn
          title="Likely"
          subtitle=">50% probability"
          icon={TrendingUp}
          awards={portfolio.likely || []}
          color="green"
        />
        <CategoryColumn
          title="Target"
          subtitle="25-50% probability"
          icon={Target}
          awards={portfolio.target || []}
          color="yellow"
        />
        <CategoryColumn
          title="Stretch"
          subtitle="<25% probability"
          icon={Zap}
          awards={portfolio.stretch || []}
          color="orange"
        />
      </div>

      {/* Strategy Notes */}
      {portfolio.strategy_notes && portfolio.strategy_notes.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 text-sm">Strategy Notes</h4>
          <ul className="space-y-1">
            {portfolio.strategy_notes.map((note, i) => (
              <li key={i} className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
                <span className="text-blue-400">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AwardPortfolioCard;
