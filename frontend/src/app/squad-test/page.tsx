'use client';

import { useEffect } from 'react';
import { SquadAssemblyAnimation } from '@/components/squad';
import { useAgentStates, useSquadStore } from '@/lib/store';
import { startSquadAssembly } from '@/lib/api/agentAPI';
import { useRouter } from 'next/navigation';

export default function SquadTestPage() {
    const agentStates = useAgentStates();
    const router = useRouter();
    const resetSquad = useSquadStore((s) => s.resetSquad);

    useEffect(() => {
        // Reset and start assembly on mount
        // TODO: Replace with real student_id from auth/session
        const testStudentId = 'test-student-uuid-12345';
        resetSquad();
        startSquadAssembly(testStudentId);

        console.log('[Squad Test] Starting with test student_id:', testStudentId);
    }, [resetSquad]);

    const handleComplete = () => {
        console.log('[Squad Assembly] Complete! Transitioning...');
        // In real implementation, navigate to Frame 5
        // router.push('/assessment?frame=5');
    };

    const handleSkip = () => {
        console.log('[Squad Assembly] Skipped');
        // router.push('/assessment?frame=5');
    };

    return (
        <div className="min-h-screen">
            <SquadAssemblyAnimation
                agentStates={agentStates}
                onComplete={handleComplete}
                onSkip={handleSkip}
                showSkipButton={true}
            />
        </div>
    );
}
