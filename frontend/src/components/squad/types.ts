import { AgentDataState, AgentStatus, ExecutionKit } from '@/lib/types/agentState';
import { CrewId } from '@/lib/constants/agents';

export type KaiState = 'idle' | 'speaking' | 'listening' | 'thinking' | 'approving' | 'concerned' | 'impressed' | 'celebrating';

export interface IvyCoachAvatarProps {
    state: KaiState;
    message?: string;
    size?: 'sm' | 'md' | 'lg';

    // Dynamic positioning
    context?: 'center-stage' | 'coach-corner' | 'sidebar';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';

    className?: string;
    onStateChange?: (newState: IvyCoachAvatarProps['state']) => void;
}

export interface SquadAssemblyAnimationProps {
    agentStates: AgentDataState;
    currentStep?: string;
    kaiMessage?: string;
    onComplete?: () => void;
    onSkip?: () => void;
    showSkipButton?: boolean;
}

export interface AgentSatelliteProps {
    agentId: CrewId;
    status: AgentStatus;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    currentStep?: string;
    onStatusChange?: (status: AgentStatus) => void;
}

export interface ExecutionKitCardProps {
    kit: ExecutionKit;
    onSelect?: (kitId: string) => void;
    isSelected?: boolean;
    className?: string;
}
