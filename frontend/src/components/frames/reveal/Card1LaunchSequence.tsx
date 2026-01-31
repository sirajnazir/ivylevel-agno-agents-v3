'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SquadAssemblyAnimation } from '@/components/squad';
import { useAgentStates, useSquadStore, useStudentStore } from '@/lib/store';
import { startSquadAssembly } from '@/lib/api/agentAPI';
import { useFrame4Store } from '@/lib/store/useFrame4Store';

interface Card1LaunchSequenceProps {
  onComplete: () => void;
}

export function Card1LaunchSequence({ onComplete }: Card1LaunchSequenceProps) {
  const agentStates = useAgentStates();
  const resetSquad = useSquadStore((s) => s.resetSquad);
  const { hasSeenLaunch } = useFrame4Store();
  const profile = useStudentStore((s) => s.profile);

  useEffect(() => {
    if (hasSeenLaunch) {
      // Skip to completion if already seen
      onComplete();
      return;
    }

    // Reset and start squad assembly with real student ID (UUID)
    resetSquad();
    startSquadAssembly(profile.student_id);

    // Log start
    console.log('[Squad Assembly] Starting with student_id:', profile.student_id);
  }, [hasSeenLaunch, resetSquad, onComplete, profile.student_id]);

  const handleComplete = () => {
    console.log('[Squad Assembly] Complete! Transitioning to scores...');
    onComplete();
  };

  const handleSkip = () => {
    console.log('[Squad Assembly] Skipped by user');
    onComplete();
  };

  return (
    <SquadAssemblyAnimation
      agentStates={agentStates}
      onComplete={handleComplete}
      onSkip={handleSkip}
      showSkipButton={true}
    />
  );
}

export default Card1LaunchSequence;
