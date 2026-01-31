'use client';

import { useState } from 'react';
import { useCrisisAlchemy } from '@/lib/hooks/useAgentV2';
import type { CrisisAlchemyResult } from '@/lib/api/agentV2Client';

interface CrisisAlchemyModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile?: {
    spike?: string;
    primary_project?: string;
    profile_id?: string;
  };
}

const CRISIS_TYPES = [
  { id: 'rejection', label: 'Rejection/Setback', description: 'Program, award, or application rejection' },
  { id: 'exclusion', label: 'Exclusion', description: 'Left out of a group or activity' },
  { id: 'creative_block', label: 'Creative Block', description: "Can't write or make progress" },
  { id: 'comparison', label: 'Comparison', description: 'Feeling inadequate vs peers' },
  { id: 'overwhelm', label: 'Overwhelm', description: 'Too much to do' },
  { id: 'deadline_panic', label: 'Deadline Panic', description: 'Important deadline approaching' },
];

export function CrisisAlchemyModal({ isOpen, onClose, studentProfile }: CrisisAlchemyModalProps) {
  const [step, setStep] = useState<'input' | 'response'>('input');
  const [crisisType, setCrisisType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState<CrisisAlchemyResult | null>(null);

  const crisisAlchemy = useCrisisAlchemy();

  const handleSubmit = async () => {
    if (!description.trim()) return;

    try {
      const result = await crisisAlchemy.mutateAsync({
        crisis_type: crisisType || undefined,
        crisis_description: description,
        student_profile: studentProfile || { spike: 'general' },
      });
      setResponse(result);
      setStep('response');
    } catch (error) {
      console.error('Crisis alchemy failed:', error);
    }
  };

  const handleClose = () => {
    setStep('input');
    setCrisisType('');
    setDescription('');
    setResponse(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Crisis Alchemy
            </h2>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white text-xl"
            >
              x
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Transform setbacks into opportunities
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'input' ? (
            <div className="space-y-6">
              {/* Crisis Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of crisis? (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CRISIS_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setCrisisType(type.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        crisisType === type.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What happened? Tell me everything.
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="I got rejected from Google CSSI and now I feel like I'm not good enough..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || crisisAlchemy.isPending}
                className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {crisisAlchemy.isPending ? 'Processing...' : 'Get Help'}
              </button>
            </div>
          ) : response ? (
            <div className="space-y-6">
              {/* Transformation Badge */}
              <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-4 flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-sm text-red-600 font-medium">From</div>
                  <div className="text-red-700">{response.transformation.from}</div>
                </div>
                <div className="text-2xl px-4">-&gt;</div>
                <div className="text-center flex-1">
                  <div className="text-sm text-green-600 font-medium">To</div>
                  <div className="text-green-700">{response.transformation.to}</div>
                </div>
              </div>

              {/* 4 Steps */}
              <div className="space-y-4">
                {/* Step 1: Validate */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Step 1: Validate
                  </div>
                  <p className="text-gray-700 mt-1">{response.response.validation}</p>
                </div>

                {/* Step 2: Act */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
                    Step 2: Micro-Action (2 min)
                  </div>
                  <p className="text-gray-700 mt-1">{response.response.micro_action}</p>
                </div>

                {/* Step 3: Reframe */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                    Step 3: Reframe
                  </div>
                  <p className="text-gray-700 mt-1">{response.response.reframe}</p>
                </div>

                {/* Step 4: Create (Pivot) */}
                <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                    Step 4: Your Pivot Activity
                  </div>
                  <div className="mt-2">
                    <h4 className="font-semibold text-green-800">
                      {response.response.pivot_activity.name}
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      {response.response.pivot_activity.description}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {response.response.pivot_activity.steps.map((stepItem, i) => (
                        <li key={i} className="text-sm text-green-600 flex items-start gap-2">
                          <span className="font-semibold">{i + 1}.</span>
                          {stepItem}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 text-sm font-medium text-green-800 bg-green-100 px-3 py-2 rounded">
                      {response.response.pivot_activity.impact}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Got it!
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CrisisAlchemyModal;
