/**
 * CrisisAlchemyCard Component
 * 4-step crisis response protocol with HITL approval.
 * @version 10.0
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Zap, RefreshCw, Lightbulb, 
  ChevronDown, ChevronUp, Check, X, Clock,
  AlertTriangle, AlertCircle
} from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

export interface CrisisStep {
  completed: boolean;
  message?: string;
  emotion_acknowledged?: string;
  action?: string;
  duration_minutes?: number;
  why_it_helps?: string;
  opportunity_angle?: string;
  narrative_connection?: string;
  activity_name?: string;
  description?: string;
  first_step?: string;
  touchpoints?: string[];
}

export interface CrisisAlchemyCardProps {
  crisisId: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'proposed' | 'approved' | 'resolved' | 'escalated';
  step1?: CrisisStep;
  step2?: CrisisStep;
  step3?: CrisisStep;
  step4?: CrisisStep;
  approvalDeadline?: string;
  onApprove?: (crisisId: string) => void;
  onReject?: (crisisId: string) => void;
  onStepComplete?: (crisisId: string, step: number) => void;
}

const URGENCY_CONFIG = {
  low: { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', icon: AlertCircle },
  medium: { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', icon: AlertCircle },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200', icon: AlertTriangle },
  critical: { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200', icon: AlertTriangle },
};

const STEP_CONFIG = [
  { key: 'validate', icon: Heart, label: 'Validate', time: '2s', color: 'text-pink-600', bg: 'bg-pink-50' },
  { key: 'act', icon: Zap, label: 'Act', time: '10s', color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'reframe', icon: RefreshCw, label: 'Reframe', time: '30s', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'create', icon: Lightbulb, label: 'Create', time: '2min', color: 'text-green-600', bg: 'bg-green-50' },
];

export function CrisisAlchemyCard({
  crisisId,
  title,
  description,
  urgency,
  status,
  step1,
  step2,
  step3,
  step4,
  approvalDeadline,
  onApprove,
  onReject,
  onStepComplete,
}: CrisisAlchemyCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [step1, step2, step3, step4];
  const urgencyConfig = URGENCY_CONFIG[urgency];
  const UrgencyIcon = urgencyConfig.icon;

  const getDeadlineText = () => {
    if (!approvalDeadline) return null;
    const deadline = new Date(approvalDeadline);
    const now = new Date();
    const hoursLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursLeft <= 0) return 'Expired';
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.ceil(hoursLeft / 24)}d left`;
  };

  return (
    <div className={`rounded-2xl border ${urgencyConfig.border} bg-white overflow-hidden shadow-sm`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${urgencyConfig.bg} flex items-center justify-center`}>
            <UrgencyIcon size={20} className={urgencyConfig.color} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyConfig.bg} ${urgencyConfig.color} font-medium`}>
                {urgency}
              </span>
              <span className="text-xs text-gray-500">{status}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {approvalDeadline && status === 'proposed' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} />
              {getDeadlineText()}
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              {/* Description */}
              <p className="text-sm text-gray-600 mt-3 mb-4">{description}</p>

              {/* Step Tabs */}
              <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
                {STEP_CONFIG.map((config, idx) => {
                  const StepIcon = config.icon;
                  const isActive = activeStep === idx;
                  const isComplete = steps[idx]?.completed;

                  return (
                    <button
                      key={config.key}
                      onClick={() => setActiveStep(idx)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive 
                          ? `bg-white shadow-sm ${config.color}` 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {isComplete ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <StepIcon size={14} />
                      )}
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="text-[10px] opacity-60">({config.time})</span>
                    </button>
                  );
                })}
              </div>

              {/* Step Content */}
              <div className={`rounded-xl p-4 ${STEP_CONFIG[activeStep].bg}`}>
                <StepContent 
                  stepIndex={activeStep} 
                  stepData={steps[activeStep]} 
                  config={STEP_CONFIG[activeStep]}
                  onComplete={() => onStepComplete?.(crisisId, activeStep + 1)}
                />
              </div>

              {/* HITL Approval Buttons */}
              {status === 'proposed' && (onApprove || onReject) && (
                <div className="flex gap-3 mt-4">
                  {onApprove && (
                    <button
                      onClick={() => onApprove(crisisId)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      <Check size={18} />
                      Approve Plan
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={() => onReject(crisisId)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StepContentProps {
  stepIndex: number;
  stepData?: CrisisStep;
  config: typeof STEP_CONFIG[0];
  onComplete?: () => void;
}

function StepContent({ stepIndex, stepData, config, onComplete }: StepContentProps) {
  if (!stepData) {
    return (
      <p className="text-sm text-gray-500 italic">
        This step is being prepared...
      </p>
    );
  }

  const StepIcon = config.icon;

  switch (stepIndex) {
    case 0: // Validate
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StepIcon size={18} className={config.color} />
            <span className="font-medium text-gray-800">Emotional Validation</span>
          </div>
          <p className="text-sm text-gray-700">{stepData.message || stepData.emotion_acknowledged}</p>
        </div>
      );

    case 1: // Act
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StepIcon size={18} className={config.color} />
            <span className="font-medium text-gray-800">Quick Action</span>
            {stepData.duration_minutes && (
              <span className="text-xs text-gray-500">({stepData.duration_minutes} min)</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-2">{stepData.action}</p>
          {stepData.why_it_helps && (
            <p className="text-xs text-gray-500 italic">Why: {stepData.why_it_helps}</p>
          )}
        </div>
      );

    case 2: // Reframe
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StepIcon size={18} className={config.color} />
            <span className="font-medium text-gray-800">Reframe as Opportunity</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{stepData.opportunity_angle}</p>
          {stepData.narrative_connection && (
            <p className="text-xs text-gray-500 mt-2">
              <strong>Narrative connection:</strong> {stepData.narrative_connection}
            </p>
          )}
        </div>
      );

    case 3: // Create
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StepIcon size={18} className={config.color} />
            <span className="font-medium text-gray-800">Create New Activity</span>
          </div>
          {stepData.activity_name && (
            <p className="font-semibold text-gray-800 mb-1">{stepData.activity_name}</p>
          )}
          <p className="text-sm text-gray-700 mb-2">{stepData.description}</p>
          {stepData.first_step && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-1">First Step:</p>
              <p className="text-sm text-gray-800">{stepData.first_step}</p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

export default CrisisAlchemyCard;
