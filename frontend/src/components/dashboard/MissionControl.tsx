/**
 * MissionControl Component
 * Active projects, microsteps, EDS score, and blockers.
 * Connected to Execution Agent.
 * @version 10.0
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, AlertTriangle, ChevronDown, ChevronUp,
  Gauge, Zap
} from 'lucide-react';
import { ExecutionAgentResponse, Project, Microstep } from '@/lib/hooks/useAgentAPI';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface MissionControlProps {
  loading?: boolean;
  data?: ExecutionAgentResponse | null;
  highlightActionId?: string | null;
}

const MOCK_DATA: ExecutionAgentResponse = {
  projects: [
    {
      id: 'p1',
      name: 'Common App Essay',
      description: 'Write and refine your personal statement',
      status: 'in_progress',
      progress_percentage: 45,
      eds_score: 72,
      microsteps: [
        { id: 'm1', title: 'Brainstorm 3 potential topics', completed: true },
        { id: 'm2', title: 'Write first draft (500 words)', completed: true },
        { id: 'm3', title: 'Get feedback from mentor', completed: false },
        { id: 'm4', title: 'Revise based on feedback', completed: false },
      ],
      blockers: [],
    },
    {
      id: 'p2',
      name: 'SAT Prep',
      description: 'Improve math and reading scores',
      status: 'blocked',
      progress_percentage: 30,
      eds_score: 45,
      microsteps: [
        { id: 'm5', title: 'Complete diagnostic test', completed: true },
        { id: 'm6', title: 'Review weak areas', completed: false },
      ],
      blockers: [
        { id: 'b1', description: 'Need to purchase prep materials', severity: 'medium', suggested_resolution: 'Check Khan Academy for free resources' }
      ],
    },
  ],
  overall_eds: 58,
  active_blockers: 1,
  next_actions: [],
};

export function MissionControl({ loading, data, highlightActionId }: MissionControlProps) {
  const projects = data?.projects || MOCK_DATA.projects;
  const overallEds = data?.overall_eds || MOCK_DATA.overall_eds;
  const activeBlockers = data?.active_blockers || MOCK_DATA.active_blockers;

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* EDS Score Header */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: BRAND_COLORS.primaryBg }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.primary }}>
            <Gauge size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Execution Discipline Score</p>
            <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>{overallEds}%</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{projects.length} active projects</p>
          {activeBlockers > 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              {activeBlockers} blocker{activeBlockers !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project}
            isHighlighted={highlightActionId === project.id}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Zap size={32} className="mx-auto mb-2 opacity-30" />
          <p>No active projects yet</p>
          <p className="text-sm">Start an action from your game plan!</p>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  isHighlighted?: boolean;
}

function ProjectCard({ project, isHighlighted }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(isHighlighted || false);
  const completedSteps = project.microsteps.filter(m => m.completed).length;
  const totalSteps = project.microsteps.length;

  useEffect(() => {
    if (isHighlighted) setExpanded(true);
  }, [isHighlighted]);

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    blocked: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div 
      className={`rounded-xl border transition-all ${
        isHighlighted ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status]}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: BRAND_COLORS.primary }}>
              {project.eds_score}% EDS
            </p>
            <p className="text-xs text-gray-500">{completedSteps}/{totalSteps} steps</p>
          </div>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              {/* Progress Bar */}
              <div className="mt-3 mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress_percentage}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: BRAND_COLORS.primary }}
                  />
                </div>
              </div>

              {/* Microsteps */}
              <div className="space-y-2">
                {project.microsteps.map((step) => (
                  <MicrostepItem key={step.id} step={step} />
                ))}
              </div>

              {/* Blockers */}
              {project.blockers.length > 0 && (
                <div className="mt-4 space-y-2">
                  {project.blockers.map((blocker) => (
                    <div 
                      key={blocker.id}
                      className="p-3 rounded-lg bg-amber-50 border border-amber-200"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-800">{blocker.description}</p>
                          <p className="text-xs text-amber-600 mt-1">
                            💡 {blocker.suggested_resolution}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MicrostepItem({ step }: { step: Microstep }) {
  return (
    <div className="flex items-center gap-3 py-1">
      {step.completed ? (
        <CheckCircle2 size={18} className="text-green-500" />
      ) : (
        <Circle size={18} className="text-gray-300" />
      )}
      <span className={`text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
        {step.title}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-gray-200 rounded-xl" />
      <div className="h-20 bg-gray-200 rounded-xl" />
      <div className="h-20 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default MissionControl;
