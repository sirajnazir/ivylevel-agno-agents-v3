// Micro Edit Panel Component
// File: components/agents/MicroEditPanel.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Info,
  Sparkles,
  ArrowRight,
  Copy,
  Loader2,
} from 'lucide-react';

interface MicroEditChange {
  original: string;
  replacement: string;
  category: string;
  explanation: string;
}

interface MicroEditResult {
  original: string;
  edited: string;
  change_count: number;
  categories_affected: string[];
  changes?: MicroEditChange[];
}

interface EssayAnalysis {
  word_count: number;
  total_issues: number;
  issues_by_category: Record<string, number>;
  language_score: number;
  recommendations: string[];
  can_improve: boolean;
  sample_changes?: MicroEditChange[];
}

interface MicroEditPanelProps {
  text: string;
  onTextChange?: (text: string) => void;
  essayType?: 'common_app' | 'supplemental' | 'activities';
  autoAnalyze?: boolean;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  financial: { label: 'Financial Framing', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  framing: { label: 'Positive Framing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  voice: { label: 'Active Voice', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  confidence: { label: 'Confidence', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  background: { label: 'Background', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
  responsibility: { label: 'Responsibility', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
  growth: { label: 'Growth Mindset', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
};

function ScoreGauge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: { container: 'w-12 h-12', text: 'text-sm' }, md: { container: 'w-16 h-16', text: 'text-lg' }, lg: { container: 'w-24 h-24', text: 'text-2xl' } };
  const { container, text } = sizeClasses[size];
  const radius = size === 'lg' ? 40 : size === 'md' ? 28 : 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const getColor = () => score >= 80 ? 'stroke-green-500' : score >= 60 ? 'stroke-yellow-500' : 'stroke-orange-500';

  return (
    <div className={`relative ${container}`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r={radius} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={4} fill="none" />
        <motion.circle
          cx="50%" cy="50%" r={radius} className={getColor()} strokeWidth={4} fill="none" strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold text-gray-900 dark:text-white ${text}`}>{score}</span>
      </div>
    </div>
  );
}

function ChangeItem({ change, onApply, onDismiss }: { change: MicroEditChange; onApply: () => void; onDismiss: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const category = categoryLabels[change.category] || { label: change.category, color: 'bg-gray-100 text-gray-700' };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${category.color}`}>{category.label}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="line-through text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1 rounded">{change.original}</span>
              </p>
              <p className="text-sm flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1 rounded">
                  {change.replacement === '(removed)' ? <em>(remove)</em> : change.replacement}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onApply} className="p-1.5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded hover:bg-green-200 transition-colors" title="Apply">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={onDismiss} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 transition-colors" title="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button onClick={() => setIsExpanded(!isExpanded)} className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
          Why this change?
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
              {change.explanation}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function MicroEditPanel({ text, onTextChange, essayType = 'common_app', autoAnalyze = true }: MicroEditPanelProps) {
  const [editedText, setEditedText] = useState(text);
  const [dismissedChanges, setDismissedChanges] = useState<Set<string>>(new Set());
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [analysis, setAnalysis] = useState<EssayAnalysis | null>(null);
  const [editResult, setEditResult] = useState<MicroEditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents/tools/analyze-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, essay_type: essayType }),
      });
      const data = await response.json();
      if (data.success !== false) setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [text, essayType]);

  const handleApplyAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents/tools/micro-edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, essay_type: essayType }),
      });
      const data = await response.json();
      if (data.edited) {
        setEditResult(data);
        setEditedText(data.edited);
        if (onTextChange) onTextChange(data.edited);
      }
    } catch (error) {
      console.error('Micro-edits failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [text, essayType, onTextChange]);

  const handleApplySingleChange = useCallback((change: MicroEditChange) => {
    const newText = text.replace(new RegExp(change.original, 'gi'), change.replacement === '(removed)' ? '' : change.replacement);
    setEditedText(newText);
    if (onTextChange) onTextChange(newText);
    handleAnalyze();
  }, [text, onTextChange, handleAnalyze]);

  const handleDismissChange = useCallback((change: MicroEditChange) => {
    setDismissedChanges((prev) => new Set([...Array.from(prev), change.original]));
  }, []);

  const handleCopyEdited = useCallback(() => {
    navigator.clipboard.writeText(editedText);
  }, [editedText]);

  const activeChanges = analysis?.sample_changes?.filter((c) => !dismissedChanges.has(c.original)) || [];

  if (!text || text.length < 20) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Wand2 className="w-4 h-4" />
          <span className="text-sm">Start writing to see language suggestions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-lg">
              <Wand2 className="w-5 h-5 text-violet-600 dark:text-violet-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Language Enhancement</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">ACP-008: Micro-Edit Mastery</p>
            </div>
          </div>
          {analysis && (
            <div className="flex items-center gap-4">
              <ScoreGauge score={analysis.language_score} size="sm" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{analysis.language_score}/100</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{analysis.total_issues} suggestions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button onClick={handleAnalyze} disabled={isLoading} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Analyze
          </button>
          <button onClick={handleApplyAll} disabled={isLoading || !analysis?.can_improve} className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
            <Sparkles className="w-4 h-4" />
            Apply All Improvements
          </button>
          <button onClick={() => setShowBeforeAfter(!showBeforeAfter)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors">
            {showBeforeAfter ? 'Hide' : 'Show'} Comparison
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBeforeAfter && editResult && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Original</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-2">{text}</p>
              </div>
              <div className="p-4 bg-green-50/50 dark:bg-green-900/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Improved</span>
                  <button onClick={handleCopyEdited} className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded" title="Copy">
                    <Copy className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-2">{editResult.edited}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4">
        {activeChanges.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested Improvements ({activeChanges.length})</p>
            {activeChanges.map((change, index) => (
              <ChangeItem key={`${change.original}-${index}`} change={change} onApply={() => handleApplySingleChange(change)} onDismiss={() => handleDismissChange(change)} />
            ))}
          </div>
        ) : analysis ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="font-medium text-gray-900 dark:text-white">Great language quality!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No immediate improvements detected.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wand2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Click "Analyze" to check for language improvements</p>
          </div>
        )}
      </div>

      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MicroEditPanel;
