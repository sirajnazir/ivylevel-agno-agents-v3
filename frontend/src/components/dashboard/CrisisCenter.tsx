/**
 * CrisisCenter Dashboard Component
 * Displays active crises with CrisisAlchemyCards and HITL controls.
 * @version 10.0
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { CrisisAlchemyCard } from '@/components/v10/CrisisAlchemyCard';
import { useCrisisAgent, CrisisAlchemyResponse } from '@/lib/hooks/useAgentAPI';
import { useEventBus } from '@/lib/events/eventBus';

interface CrisCenterProps {
  profile?: any;
}

const MOCK_CRISIS: CrisisAlchemyResponse = {
  crisis_id: 'crisis-001',
  title: 'Grade Drop in AP Chemistry',
  description: 'Recent test scores dropped from A to C-',
  urgency: 'high',
  status: 'proposed',
  steps: {
    validate: {
      completed: true,
      message: "It's completely normal to feel frustrated about this grade drop. Chemistry is one of the most challenging subjects, and many successful students have faced similar setbacks.",
      emotion_acknowledged: 'Frustration and disappointment',
    },
    act: {
      completed: false,
      action: 'Schedule a 15-minute meeting with your Chemistry teacher during office hours',
      duration_minutes: 15,
      why_it_helps: 'Taking immediate action creates momentum and shows initiative. Teachers appreciate students who seek help proactively.',
    },
    reframe: {
      completed: false,
      opportunity_angle: 'This grade drop could become a powerful essay topic about resilience and growth mindset.',
      narrative_connection: 'Your story of overcoming academic challenges aligns with your narrative of persistence.',
    },
    create: {
      completed: false,
      activity_name: 'Chemistry Study Group',
      activity_description: 'Start a peer study group for AP Chemistry students to review concepts together.',
      first_step: 'Post a message in your class group chat asking if anyone wants to form a study group.',
    },
  },
  approval_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
};

export function CrisisCenter({ profile }: CrisCenterProps) {
  const [crises, setCrises] = useState<CrisisAlchemyResponse[]>([MOCK_CRISIS]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const crisisAgent = useCrisisAgent();
  const crisisEvent = useEventBus('crisis.detected');

  // Handle new crisis events
  useEffect(() => {
    if (crisisEvent?.data) {
      setCrises(prev => {
        const exists = prev.some(c => c.crisis_id === crisisEvent.data.crisis_id);
        if (!exists) return [crisisEvent.data, ...prev];
        return prev;
      });
    }
  }, [crisisEvent]);

  const handleApprove = async (crisisId: string) => {
    setCrises(prev => prev.map(c => 
      c.crisis_id === crisisId ? { ...c, status: 'approved' as const } : c
    ));
  };

  const handleReject = async (crisisId: string) => {
    setCrises(prev => prev.filter(c => c.crisis_id !== crisisId));
  };

  const handleStepComplete = (crisisId: string, step: number) => {
    const stepKeys = ['validate', 'act', 'reframe', 'create'] as const;
    const stepKey = stepKeys[step - 1];
    
    setCrises(prev => prev.map(c => {
      if (c.crisis_id !== crisisId) return c;
      return {
        ...c,
        steps: {
          ...c.steps,
          [stepKey]: { ...c.steps[stepKey], completed: true },
        },
      };
    }));
  };

  const handleRefresh = async () => {
    if (!profile) return;
    setIsRefreshing(true);
    const result = await crisisAgent.invoke({ profile });
    if (result.success && result.data) {
      setCrises(prev => {
        const exists = prev.some(c => c.crisis_id === result.data!.crisis_id);
        if (!exists) return [result.data!, ...prev];
        return prev;
      });
    }
    setIsRefreshing(false);
  };

  const activeCrises = crises.filter(c => c.status !== 'resolved');
  const resolvedCount = crises.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeCrises.length > 0 ? (
            <>
              <AlertTriangle size={18} className="text-amber-500" />
              <span className="text-sm font-medium text-gray-700">
                {activeCrises.length} Active {activeCrises.length === 1 ? 'Crisis' : 'Crises'}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="text-green-500" />
              <span className="text-sm font-medium text-gray-700">All Clear</span>
            </>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={`text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Crisis List */}
      <AnimatePresence mode="popLayout">
        {activeCrises.length > 0 ? (
          <div className="space-y-3">
            {activeCrises.map((crisis) => (
              <motion.div
                key={crisis.crisis_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <CrisisAlchemyCard
                  crisisId={crisis.crisis_id}
                  title={crisis.title}
                  description={crisis.description}
                  urgency={crisis.urgency}
                  status={crisis.status}
                  step1={crisis.steps.validate}
                  step2={crisis.steps.act}
                  step3={crisis.steps.reframe}
                  step4={crisis.steps.create}
                  approvalDeadline={crisis.approval_deadline}
                  onApprove={() => handleApprove(crisis.crisis_id)}
                  onReject={() => handleReject(crisis.crisis_id)}
                  onStepComplete={handleStepComplete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
            <p className="text-green-700 font-medium">No crises detected</p>
            <p className="text-green-600 text-sm">
              {resolvedCount > 0 && `${resolvedCount} resolved`}
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CrisisCenter;
