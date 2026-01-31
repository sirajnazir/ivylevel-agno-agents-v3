'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useTraceStore,
  initializeTraceStore,
  traceContext,
} from '@/lib/trace';
import type { TraceEvent, TraceSpan, TraceLevel, TraceDomain } from '@/lib/trace';
import { cn } from '@/lib/utils/cn';
import {
  X,
  Pause,
  Play,
  Trash2,
  Download,
  Search,
  Bug,
  Activity,
  Database,
  Zap,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Filter,
} from 'lucide-react';

// ============================================
// Types
// ============================================

type TabType = 'events' | 'spans' | 'scoring' | 'state' | 'performance';

const TAB_CONFIG: { id: TabType; label: string; icon: typeof Bug }[] = [
  { id: 'events', label: 'Events', icon: Activity },
  { id: 'spans', label: 'Spans', icon: Zap },
  { id: 'scoring', label: 'Scoring', icon: Database },
  { id: 'state', label: 'State', icon: Database },
  { id: 'performance', label: 'Perf', icon: Activity },
];

const LEVEL_CONFIG: Record<TraceLevel, { color: string; icon: typeof Info; bg: string }> = {
  debug: { color: 'text-text-muted', icon: Bug, bg: 'bg-background-elevated' },
  info: { color: 'text-primary-blue', icon: Info, bg: 'bg-primary-blue/10' },
  warn: { color: 'text-warning-amber', icon: AlertTriangle, bg: 'bg-warning-amber/10' },
  error: { color: 'text-error-red', icon: AlertCircle, bg: 'bg-error-red/10' },
};

const DOMAIN_COLORS: Record<TraceDomain, string> = {
  scoring: 'text-success-green',
  input: 'text-primary-blue',
  state: 'text-warning-amber',
  navigation: 'text-info-cyan',
  api: 'text-gear-gold',
  twin: 'text-gear-mythic',
  animation: 'text-gear-legendary',
  validation: 'text-error-red',
  performance: 'text-gear-diamond',
};

// ============================================
// Debug Overlay Component
// ============================================

export function DebugOverlay() {
  const {
    overlay,
    toggleOverlay,
    setOverlayTab,
    togglePause,
    clearEvents,
    clearSpans,
    setSearchQuery,
    getFilteredEvents,
    getFilteredSpans,
    getScoringEvents,
    getStateEvents,
    events,
    spans,
  } = useTraceStore();

  const [showFilters, setShowFilters] = useState(false);

  // Initialize trace store on mount
  useEffect(() => {
    initializeTraceStore();
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleOverlay]);

  const handleExport = useCallback(() => {
    const json = traceContext.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ivyquest-trace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!overlay.isVisible) return null;

  const filteredEvents = getFilteredEvents();
  const filteredSpans = getFilteredSpans();
  const scoringEvents = getScoringEvents();
  const stateEvents = getStateEvents();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 w-[600px] max-h-[500px] z-debug"
      >
        <div className="glass-card-elevated overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-primary-blue" />
              <span className="font-mono text-sm font-semibold text-text-primary">
                Debug Trace
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-blue/20 text-primary-blue text-xs font-mono">
                {events.length} events
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePause}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  overlay.isPaused
                    ? 'bg-warning-amber/20 text-warning-amber'
                    : 'hover:bg-background-hover text-text-secondary'
                )}
                title={overlay.isPaused ? 'Resume' : 'Pause'}
              >
                {overlay.isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  clearEvents();
                  clearSpans();
                }}
                className="p-1.5 rounded-lg hover:bg-background-hover text-text-secondary"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-1.5 rounded-lg hover:bg-background-hover text-text-secondary"
                title="Export JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  showFilters
                    ? 'bg-primary-blue/20 text-primary-blue'
                    : 'hover:bg-background-hover text-text-secondary'
                )}
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={toggleOverlay}
                className="p-1.5 rounded-lg hover:bg-background-hover text-text-secondary"
                title="Close (Ctrl+Shift+D)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border-subtle">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setOverlayTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
                    overlay.activeTab === tab.id
                      ? 'text-primary-blue border-b-2 border-primary-blue'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="px-4 py-2 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search events..."
                value={overlay.filter.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-background-elevated border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-blue"
              />
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-border-subtle overflow-hidden"
              >
                <FilterPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[300px]">
            {overlay.activeTab === 'events' && (
              <EventsList events={filteredEvents} />
            )}
            {overlay.activeTab === 'spans' && (
              <SpansList spans={filteredSpans} />
            )}
            {overlay.activeTab === 'scoring' && (
              <EventsList events={scoringEvents} />
            )}
            {overlay.activeTab === 'state' && (
              <EventsList events={stateEvents} />
            )}
            {overlay.activeTab === 'performance' && (
              <PerformancePanel events={filteredEvents.filter(e => e.domain === 'performance')} />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Filter Panel
// ============================================

const FilterPanel = memo(function FilterPanel() {
  const { overlay, filterByLevel, filterByDomain } = useTraceStore();

  const levels: TraceLevel[] = ['debug', 'info', 'warn', 'error'];
  const domains: TraceDomain[] = [
    'scoring',
    'input',
    'state',
    'navigation',
    'api',
    'twin',
    'validation',
    'performance',
  ];

  return (
    <div className="p-3 space-y-3">
      <div>
        <div className="text-xs text-text-muted mb-2">Levels</div>
        <div className="flex flex-wrap gap-1">
          {levels.map((level) => {
            const config = LEVEL_CONFIG[level];
            const isActive = overlay.filter.levels.includes(level);
            return (
              <button
                key={level}
                onClick={() => {
                  const newLevels = isActive
                    ? overlay.filter.levels.filter((l) => l !== level)
                    : [...overlay.filter.levels, level];
                  filterByLevel(newLevels);
                }}
                className={cn(
                  'px-2 py-1 rounded text-xs font-mono transition-colors',
                  isActive ? config.bg : 'bg-background-elevated',
                  isActive ? config.color : 'text-text-muted'
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs text-text-muted mb-2">Domains</div>
        <div className="flex flex-wrap gap-1">
          {domains.map((domain) => {
            const isActive = overlay.filter.domains.includes(domain);
            return (
              <button
                key={domain}
                onClick={() => {
                  const newDomains = isActive
                    ? overlay.filter.domains.filter((d) => d !== domain)
                    : [...overlay.filter.domains, domain];
                  filterByDomain(newDomains);
                }}
                className={cn(
                  'px-2 py-1 rounded text-xs font-mono transition-colors',
                  isActive
                    ? `bg-background-elevated ${DOMAIN_COLORS[domain]}`
                    : 'bg-background-elevated text-text-muted'
                )}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// ============================================
// Events List
// ============================================

const EventsList = memo(function EventsList({ events }: { events: TraceEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-text-muted">
        <Bug className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No events to display</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-subtle">
      {events.slice(-100).reverse().map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
});

// ============================================
// Event Row
// ============================================

const EventRow = memo(function EventRow({ event }: { event: TraceEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = LEVEL_CONFIG[event.level];
  const Icon = config.icon;

  const timestamp = new Date(event.timestamp).toISOString().split('T')[1].slice(0, 12);

  return (
    <div className={cn('px-3 py-2 hover:bg-background-hover transition-colors', config.bg)}>
      <div
        className="flex items-start gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-muted">{timestamp}</span>
            <span className={cn('text-xs font-medium', DOMAIN_COLORS[event.domain])}>
              [{event.domain}]
            </span>
            <span className="text-xs text-text-secondary">{event.action}</span>
          </div>
          <p className="text-sm text-text-primary truncate">{event.message}</p>
        </div>
        {event.data && (
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-muted" />
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && event.data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 ml-6 overflow-hidden"
          >
            <pre className="p-2 rounded bg-background-primary text-xs font-mono text-text-secondary overflow-x-auto">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ============================================
// Spans List
// ============================================

const SpansList = memo(function SpansList({ spans }: { spans: TraceSpan[] }) {
  if (spans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-text-muted">
        <Zap className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No spans to display</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-subtle">
      {spans.slice(-50).reverse().map((span) => (
        <SpanRow key={span.id} span={span} />
      ))}
    </div>
  );
});

// ============================================
// Span Row
// ============================================

const SpanRow = memo(function SpanRow({ span }: { span: TraceSpan }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    running: 'text-warning-amber bg-warning-amber/10',
    completed: 'text-success-green bg-success-green/10',
    error: 'text-error-red bg-error-red/10',
  };

  return (
    <div className="px-3 py-2 hover:bg-background-hover transition-colors">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Zap className={cn('w-4 h-4', DOMAIN_COLORS[span.domain])} />
        <span className="font-mono text-sm text-text-primary">{span.name}</span>
        <span className={cn('px-1.5 py-0.5 rounded text-xs font-mono', statusColors[span.status])}>
          {span.status}
        </span>
        {span.duration && (
          <span className="text-xs text-text-muted font-mono">
            {span.duration.toFixed(2)}ms
          </span>
        )}
        <div className="flex-1" />
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted" />
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 ml-6 overflow-hidden space-y-2"
          >
            {span.metadata && (
              <pre className="p-2 rounded bg-background-primary text-xs font-mono text-text-secondary overflow-x-auto">
                {JSON.stringify(span.metadata, null, 2)}
              </pre>
            )}
            {span.events.length > 0 && (
              <div className="text-xs text-text-muted">
                {span.events.length} events in span
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ============================================
// Performance Panel
// ============================================

const PerformancePanel = memo(function PerformancePanel({ events }: { events: TraceEvent[] }) {
  const renderEvents = events.filter(e => e.action === 'render');
  const calcEvents = events.filter(e => e.action === 'calculate' || e.action === 'measure:complete');

  const avgRenderTime = renderEvents.length > 0
    ? renderEvents.reduce((sum, e) => sum + ((e.data?.durationMs as number) || 0), 0) / renderEvents.length
    : 0;

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-background-elevated">
          <div className="text-xs text-text-muted mb-1">Avg Render Time</div>
          <div className="text-xl font-mono text-text-primary">
            {avgRenderTime.toFixed(2)}ms
          </div>
        </div>
        <div className="p-3 rounded-lg bg-background-elevated">
          <div className="text-xs text-text-muted mb-1">Total Events</div>
          <div className="text-xl font-mono text-text-primary">{events.length}</div>
        </div>
      </div>

      {calcEvents.length > 0 && (
        <div>
          <div className="text-xs text-text-muted mb-2">Recent Calculations</div>
          <div className="space-y-1">
            {calcEvents.slice(-5).reverse().map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between text-xs p-2 rounded bg-background-elevated"
              >
                <span className="text-text-secondary">{event.message}</span>
                <span className="font-mono text-text-primary">
                  {(event.data?.durationMs as number)?.toFixed(2)}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default DebugOverlay;
