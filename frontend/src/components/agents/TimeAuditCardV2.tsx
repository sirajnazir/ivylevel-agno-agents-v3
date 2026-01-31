'use client';

import { useState } from 'react';
import { useTimeAudit } from '@/lib/hooks/useAgentV2';
import type { TimeAuditResult } from '@/lib/api/agentV2Client';

export function TimeAuditCardV2() {
  const [result, setResult] = useState<TimeAuditResult | null>(null);
  const [inputs, setInputs] = useState({
    sleep_hours: 56,
    school_hours: 35,
    fixed_commitments: 20,
    social_media_hours: 14,
  });

  const timeAudit = useTimeAudit();

  const handleRun = async () => {
    try {
      const data = await timeAudit.mutateAsync(inputs);
      setResult(data);
    } catch (error) {
      console.error('Time audit failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            168-Hour Framework
          </h3>
          <p className="text-sm text-gray-600">
            &quot;Do you know how many hours are in a week?&quot;
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Sleep (hours/week)</label>
          <input
            type="number"
            value={inputs.sleep_hours}
            onChange={(e) => setInputs(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">School (hours/week)</label>
          <input
            type="number"
            value={inputs.school_hours}
            onChange={(e) => setInputs(prev => ({ ...prev, school_hours: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Social Media (hours/week)</label>
          <input
            type="number"
            value={inputs.social_media_hours}
            onChange={(e) => setInputs(prev => ({ ...prev, social_media_hours: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Fixed Commitments (hours/week)</label>
          <input
            type="number"
            value={inputs.fixed_commitments}
            onChange={(e) => setInputs(prev => ({ ...prev, fixed_commitments: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={timeAudit.isPending}
        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
      >
        {timeAudit.isPending ? 'Calculating...' : 'Calculate Available Time'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">168</div>
              <div className="text-xs text-blue-600">Total Hours</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {Math.max(0, result.audit.passion_hours_available).toFixed(0)}
              </div>
              <div className="text-xs text-green-600">Passion Hours</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">
                +{result.audit.social_media?.hours_recovered?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-yellow-600">Hours Recovered</div>
            </div>
          </div>

          {/* Daily Passion Hours */}
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-700">
              {Math.max(0, result.audit.daily_passion_hours).toFixed(1)}
            </div>
            <div className="text-sm text-green-600">
              hours per day for passion projects
            </div>
          </div>

          {/* Efficiency Hacks */}
          {result.efficiency_hacks && result.efficiency_hacks.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                Efficiency Hacks
              </h4>
              <div className="space-y-2">
                {result.efficiency_hacks.slice(0, 4).map((hack, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-gray-800">{hack.hack}:</span>{' '}
                    <span className="text-gray-600">{hack.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TimeAuditCardV2;
