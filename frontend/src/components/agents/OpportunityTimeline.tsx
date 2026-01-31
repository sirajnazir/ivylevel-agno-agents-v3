// Opportunity Timeline Component
// File: components/agents/OpportunityTimeline.tsx

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  AlertCircle,
  Bell,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  ArrowRight,
  Shield,
  RefreshCw,
  Briefcase,
  GraduationCap,
  FlaskConical,
} from 'lucide-react';

interface OpportunityTimelineItem {
  opportunity_name: string;
  organization: string;
  type: string;
  deadline: string;
  months_until: number;
  prep_start_date: string;
  fit_score: number;
  status: 'future' | 'prepare_now' | 'approaching' | 'imminent' | 'urgent' | 'passed';
}

interface OpportunityAlert {
  alert_id?: string;
  opportunity_name: string;
  deadline?: string;
  months_remaining: number;
  urgency: 'PREPARE_NOW' | 'URGENT';
  recommended_actions: string[];
}

interface BackupCascade {
  primary: { id: string; name: string; fit_score: number; deadline: string };
  backups: Array<{ id: string; name: string; fit_score: number; deadline: string; priority: number }>;
  failover_strategy: string;
}

interface OpportunityTimelineProps {
  timeline: OpportunityTimelineItem[] | null | undefined;
  alerts: OpportunityAlert[] | null | undefined;
  cascades: BackupCascade[] | null | undefined;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  future: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  prepare_now: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  approaching: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  imminent: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500 animate-pulse' },
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500 animate-pulse' },
  passed: { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-400 dark:text-gray-600', dot: 'bg-gray-300' },
};

const typeIcons: Record<string, React.ElementType> = {
  research: FlaskConical,
  academic: GraduationCap,
  internship: Briefcase,
  default: Calendar,
};

function TimelineItem({ item, index }: { item: OpportunityTimelineItem; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = statusColors[item.status] || statusColors.future;
  const Icon = typeIcons[item.type] || typeIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${colors.dot} z-10`} />
        {index < 10 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 -mt-1" />}
      </div>

      <div className="flex-1 pb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full text-left ${colors.bg} rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{item.opportunity_name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.organization}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.deadline).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.months_until}mo left
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {Math.round(item.fit_score * 100)}% fit
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                {item.status.replace('_', ' ')}
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prep Start Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(item.prep_start_date).toLocaleDateString()} (6 months before)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{item.type}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AlertCard({ alert }: { alert: OpportunityAlert }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUrgent = alert.urgency === 'URGENT';

  return (
    <div className={`rounded-lg border p-4 ${isUrgent ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100 dark:bg-red-800' : 'bg-blue-100 dark:bg-blue-800'}`}>
            {isUrgent ? (
              <AlertCircle className={`w-4 h-4 ${isUrgent ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'}`} />
            ) : (
              <Bell className={`w-4 h-4 ${isUrgent ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'}`} />
            )}
          </div>
          <div>
            <h4 className={`font-medium ${isUrgent ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>
              {alert.opportunity_name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {alert.months_remaining} month{alert.months_remaining !== 1 ? 's' : ''} until deadline
            </p>
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-gray-600">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Recommended Actions:</p>
            <ul className="space-y-2">
              {alert.recommended_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CascadeCard({ cascade }: { cascade: BackupCascade }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="font-medium text-green-700 dark:text-green-300 text-sm">Backup Cascade</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs font-medium">Primary</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{cascade.primary.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{Math.round(cascade.primary.fit_score * 100)}% fit</span>
        </div>

        {cascade.backups.map((backup, i) => (
          <div key={backup.id} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">Backup {backup.priority}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{backup.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{Math.round(backup.fit_score * 100)}% fit</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">{cascade.failover_strategy}</p>
    </div>
  );
}

export function OpportunityTimeline({ timeline, alerts, cascades, isLoading = false, onRefresh }: OpportunityTimelineProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'alerts' | 'cascades'>('timeline');

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-100 dark:bg-teal-800 rounded-lg animate-pulse">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-300" />
          </div>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasData = timeline?.length || alerts?.length || cascades?.length;

  if (!hasData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-600 dark:text-gray-400">Opportunity Timeline</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Complete your assessment to see personalized opportunities and deadlines.
        </p>
      </div>
    );
  }

  const urgentAlerts = alerts?.filter((a) => a.urgency === 'URGENT') || [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-800 rounded-lg">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Opportunity Timeline</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeline?.length || 0} opportunities tracked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {urgentAlerts.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              {urgentAlerts.length} urgent
            </span>
          )}
          {onRefresh && (
            <button onClick={onRefresh} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Timeline ({timeline?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'alerts' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Alerts ({alerts?.length || 0})
          {urgentAlerts.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        </button>
        <button
          onClick={() => setActiveTab('cascades')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'cascades' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Backups ({cascades?.length || 0})
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'timeline' && timeline && (
          <div className="space-y-0">
            {timeline.slice(0, 10).map((item, index) => (
              <TimelineItem key={index} item={item} index={index} />
            ))}
          </div>
        )}

        {activeTab === 'alerts' && alerts && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No alerts at this time.</p>
            ) : (
              alerts.map((alert, index) => <AlertCard key={alert.alert_id || index} alert={alert} />)
            )}
          </div>
        )}

        {activeTab === 'cascades' && cascades && (
          <div className="space-y-4">
            {cascades.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">Backup cascades will be generated for your top opportunities.</p>
            ) : (
              cascades.map((cascade, index) => <CascadeCard key={index} cascade={cascade} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunityTimeline;
