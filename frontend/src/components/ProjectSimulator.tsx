'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Target, Trophy, Users } from 'lucide-react';
import { ivyApi, type ProjectOption } from '@/lib/api';
import { useStudentStore } from '@/lib/store/useStudentStore';
import { useResultsStore } from '@/lib/store/useResultsStore';

export function ProjectSimulator() {
    const studentProfile = useStudentStore((s) => s.profile);
    const assessmentResults = useResultsStore((s) => s.results);

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<ProjectOption[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const response = await ivyApi.simulateProjects(studentProfile, assessmentResults);
            setOptions(response.options);
            if (response.recommended_option_id) {
                setSelectedId(response.recommended_option_id);
            }
        } catch (err) {
            console.error("Simulation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const getBoostColor = (boost: number) => {
        if (boost >= 8) return 'text-green-600';
        if (boost >= 5) return 'text-blue-600';
        return 'text-amber-600';
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Project Simulator</h2>
                    <p className="text-sm text-gray-500">AI-generated trajectories based on the Variance Law</p>
                </div>
                <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Target className="w-4 h-4" />}
                    {options.length > 0 ? 'Regenerate' : 'Run Simulation'}
                </button>
            </div>

            {options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {options.map((option) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedId === option.id
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-100 hover:border-gray-200'
                                }`}
                            onClick={() => setSelectedId(option.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-white text-gray-600 border border-gray-100">
                                    {option.category}
                                </span>
                                <span className={`text-sm font-bold ${getBoostColor(option.predicted_boost)}`}>
                                    +{option.predicted_boost} pts
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1">{option.name}</h3>
                            <div className="text-xs text-indigo-600 font-medium mb-3">{option.difficulty}</div>

                            <div className="space-y-2">
                                {option.steps.slice(0, 3).map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                        <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
