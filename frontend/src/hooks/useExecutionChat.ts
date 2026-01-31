export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export function useExecutionChat(profileId: string | null) {
    return {
        messages: [] as ChatMessage[],
        sendMessage: async (content: string, options?: any) => { },
        isLoading: false,
        isTyping: false,
        isStreaming: false,
        error: null,
        clearMessages: () => { },
        isLoadingHistory: false,
    };
}
