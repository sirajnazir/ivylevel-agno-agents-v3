'use client';

import { useState } from 'react';
import {
  useAgentV2Health,
  useJennyTechniques,
  useTimeAudit,
  useWeeklyPlan,
  useAwardsPortfolio,
  useNCWITStrategy,
  useCrisisAlchemy,
  useJennyVoiceValidation,
} from '@/lib/hooks/useAgentV2';

interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
}

export function V2TestPanel() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  // Hooks
  const health = useAgentV2Health();
  const techniques = useJennyTechniques();
  const timeAudit = useTimeAudit();
  const weeklyPlan = useWeeklyPlan();
  const awardsPortfolio = useAwardsPortfolio();
  const ncwitStrategy = useNCWITStrategy();
  const crisisAlchemy = useCrisisAlchemy();
  const voiceValidation = useJennyVoiceValidation();

  const tests = [
    {
      id: 'health',
      name: 'Health Check',
      description: 'Verify backend is running',
      run: async () => ({ status: health.data?.status, version: health.data?.version }),
    },
    {
      id: 'techniques',
      name: 'Jenny Techniques',
      description: 'Load coaching techniques',
      run: async () => techniques.data,
    },
    {
      id: 'timeAudit',
      name: '168-Hour Time Audit',
      description: 'Calculate available passion hours',
      run: async () => {
        return await timeAudit.mutateAsync({
          sleep_hours: 56,
          school_hours: 35,
          fixed_commitments: 20,
          social_media_hours: 14,
        });
      },
    },
    {
      id: 'weeklyPlan',
      name: 'Weekly Plan (P0/P1/P2)',
      description: 'Generate prioritized weekly plan',
      run: async () => {
        return await weeklyPlan.mutateAsync({
          profile_id: 'aced8a24-388d-4fa1-af5c-0aa708a418ca',
          tasks: [
            { id: '1', name: 'NCWIT Application', priority: 'P0', estimated_hours: 3, category: 'awards' },
            { id: '2', name: 'Code Project Update', priority: 'P1', estimated_hours: 2, category: 'projects' },
            { id: '3', name: 'SAT Practice', priority: 'P2', estimated_hours: 1, category: 'test_prep' },
          ],
          available_hours: 26,
        });
      },
    },
    {
      id: 'awardsPortfolio',
      name: '2-2-1 Awards Portfolio',
      description: 'Build balanced awards portfolio',
      run: async () => {
        return await awardsPortfolio.mutateAsync({
          profile_id: 'aced8a24-388d-4fa1-af5c-0aa708a418ca',
        });
      },
    },
    {
      id: 'ncwit',
      name: 'NCWIT Strategy',
      description: 'Get specialized NCWIT coaching',
      run: async () => {
        return await ncwitStrategy.mutateAsync({
          profile_id: 'aced8a24-388d-4fa1-af5c-0aa708a418ca',
          student_data: {
            identity: ['female', 'south asian', 'muslim', 'first-generation'],
            spike: 'CS',
            is_first_gen: true,
            experiences: ['only girl in CS class', 'idea dismissed in hackathon'],
          },
        });
      },
    },
    {
      id: 'crisis',
      name: 'Crisis Alchemy',
      description: 'Test 4-step crisis protocol',
      run: async () => {
        return await crisisAlchemy.mutateAsync({
          profile_id: 'aced8a24-388d-4fa1-af5c-0aa708a418ca',
          crisis_description: "I got rejected from Google CSSI and feel like I'm not good enough for CS.",
          student_data: {
            spike: 'CS',
            primary_project: 'AI Ethics Education App',
          },
        });
      },
    },
    {
      id: 'voicePass',
      name: 'Jenny Voice (Should Pass)',
      description: 'Validate compliant response',
      run: async () => {
        return await voiceValidation.mutateAsync(
          "Great question! I love your thinking here. Let's figure out a plan together. What do you think about starting with the NCWIT application first? Does that make sense?"
        );
      },
    },
    {
      id: 'voiceFail',
      name: 'Jenny Voice (Should Fail)',
      description: 'Validate non-compliant response',
      run: async () => {
        return await voiceValidation.mutateAsync(
          "You should have done this earlier, but unfortunately you need to work harder. However, I told you this before."
        );
      },
    },
  ];

  const runTest = async (test: typeof tests[0]) => {
    setActiveTest(test.id);
    const startTime = Date.now();

    try {
      const data = await test.run();
      setResults(prev => ({
        ...prev,
        [test.id]: {
          success: true,
          data,
          duration: Date.now() - startTime,
        },
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [test.id]: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
        },
      }));
    }

    setActiveTest(null);
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const passedCount = Object.values(results).filter(r => r.success).length;
  const failedCount = Object.values(results).filter(r => !r.success).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                IvyQuest v2.0 Test Panel
              </h1>
              <p className="text-gray-600 mt-1">
                Manual verification of Jenny coaching intelligence
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={activeTest !== null}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeTest ? 'Running...' : 'Run All Tests'}
            </button>
          </div>

          {/* Backend Status */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                health.isLoading ? 'bg-yellow-400 animate-pulse' :
                health.data?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                Backend: {health.isLoading ? 'Checking...' : health.data?.status || 'Unavailable'}
              </span>
            </div>
            {health.data?.version && (
              <span className="text-sm text-gray-500">
                v{health.data.version}
              </span>
            )}
          </div>

          {/* Summary */}
          {Object.keys(results).length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {Object.keys(results).length}
                </div>
                <div className="text-xs text-gray-500">Tests Run</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {passedCount}
                </div>
                <div className="text-xs text-green-600">Passed</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {failedCount}
                </div>
                <div className="text-xs text-red-600">Failed</div>
              </div>
            </div>
          )}
        </div>

        {/* Test Cards */}
        <div className="space-y-3">
          {tests.map(test => {
            const result = results[test.id];
            const isExpanded = expandedResults.has(test.id);

            return (
              <div
                key={test.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {test.name}
                        </h3>
                        {result?.duration && (
                          <span className="text-xs text-gray-400">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {test.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {result && (
                        <button
                          onClick={() => toggleExpanded(test.id)}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? 'Hide' : 'Show'}
                        </button>
                      )}
                      <button
                        onClick={() => runTest(test)}
                        disabled={activeTest === test.id}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTest === test.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : result?.success === true
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : result?.success === false
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {activeTest === test.id
                          ? 'Running...'
                          : result?.success === true
                          ? 'Passed'
                          : result?.success === false
                          ? 'Failed'
                          : 'Run Test'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Result */}
                {result && isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    {result.success ? (
                      <pre className="text-xs overflow-auto max-h-80 bg-white p-3 rounded border">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        {result.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Backend URL: {process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:8000'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default V2TestPanel;
