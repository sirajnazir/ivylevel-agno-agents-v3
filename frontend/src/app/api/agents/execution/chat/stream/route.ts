/**
 * IvyQuest v5.3 - Execution Agent: Streaming Chat
 * POST /api/agents/execution/chat/stream
 *
 * Server-Sent Events (SSE) endpoint for real-time chat responses.
 * Streams agent responses chunk by chunk for a ChatGPT/Claude-like experience.
 *
 * Request body:
 * - profile_id: string (required)
 * - message: string (required)
 * - context_type?: 'project' | 'crisis' | 'weekly_plan' | 'step' | 'general'
 * - context_id?: string
 * - thread_id?: string
 *
 * Response: Server-Sent Events stream
 * - data: {"content": "...", "done": false}
 * - data: {"content": "...", "done": true, "conversation_id": "..."}
 * - data: [DONE]
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

interface ChatRequest {
  profile_id: string;
  message: string;
  context_type?: 'project' | 'crisis' | 'weekly_plan' | 'step' | 'general' | 'nudge' | 'onboarding';
  context_id?: string;
  thread_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { profile_id, message, context_type, context_id, thread_id } = body;

    if (!profile_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'profile_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: 'message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store user message in conversations table
    const supabase = getSupabaseClient();
    const userMessageResult = await supabase
      .from('conversations')
      .insert({
        profile_id,
        agent_type: 'execution',
        thread_id: thread_id || null,
        role: 'user',
        content: message,
        context_type: context_type || 'general',
        context_id: context_id || null,
        is_proactive: false,
      })
      .select('id, thread_id')
      .single();

    // Use existing thread_id or create from user message
    const effectiveThreadId = thread_id || userMessageResult.data?.thread_id || userMessageResult.data?.id;

    // Check if backend has streaming endpoint, otherwise simulate
    const hasBackendStreaming = process.env.EXECUTION_STREAMING_ENABLED === 'true';

    if (hasBackendStreaming) {
      // Proxy to backend streaming endpoint (v5.3 API route)
      const backendResponse = await fetch(`${AGENT_SERVICE_URL}/api/execution/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id,
          message,
          context_type: context_type || 'general',
          context_id,
          thread_id: effectiveThreadId,
        }),
      });

      // Stream through the response
      return new Response(backendResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Fallback: Call non-streaming endpoint and simulate streaming
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call backend (non-streaming) - v5.3 API route
          const response = await fetch(`${AGENT_SERVICE_URL}/api/execution/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profile_id,
              message,
              context_type: context_type || 'general',
              context_id,
              thread_id: effectiveThreadId,
            }),
          });

          let assistantContent = '';

          if (response.ok) {
            const result = await response.json();
            assistantContent = result.response || result.message || 'I apologize, but I could not generate a response.';
          } else {
            // Generate a helpful fallback response
            assistantContent = generateFallbackResponse(message, context_type);
          }

          // Simulate streaming by sending chunks
          const words = assistantContent.split(' ');
          const chunkSize = 3; // Send 3 words at a time

          for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');

            const data = JSON.stringify({
              content: chunk,
              done: false,
            });

            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            // Small delay to simulate streaming
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          // Store assistant message in conversations table
          const assistantMessageResult = await supabase
            .from('conversations')
            .insert({
              profile_id,
              agent_type: 'execution',
              thread_id: effectiveThreadId,
              role: 'assistant',
              content: assistantContent,
              context_type: context_type || 'general',
              context_id: context_id || null,
              is_proactive: false,
            })
            .select('id')
            .single();

          // Send final message
          const finalData = JSON.stringify({
            content: '',
            done: true,
            conversation_id: assistantMessageResult.data?.id,
            thread_id: effectiveThreadId,
          });

          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[ExecutionChat] Stream error:', error);

          const errorData = JSON.stringify({
            error: 'Failed to generate response',
            done: true,
          });

          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('[ExecutionChat] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Generate a context-aware fallback response when backend is unavailable.
 */
function generateFallbackResponse(message: string, contextType?: string): string {
  const lowerMessage = message.toLowerCase();

  // Check for common intents
  if (lowerMessage.includes('stuck') || lowerMessage.includes('blocked') || lowerMessage.includes('help')) {
    return "I understand you're feeling stuck. Let's break this down into smaller steps. " +
           "First, can you tell me what specific obstacle is blocking your progress? " +
           "Sometimes identifying the exact blocker helps us find a path forward.";
  }

  if (lowerMessage.includes('deadline') || lowerMessage.includes('time') || lowerMessage.includes('behind')) {
    return "I hear that time pressure is a concern. Let's prioritize together. " +
           "What are your P0 (absolutely must do) items this week? " +
           "We can look at what might be pushed to P1 or P2.";
  }

  if (lowerMessage.includes('motivat') || lowerMessage.includes('tired') || lowerMessage.includes('overwhelm')) {
    return "It's completely normal to feel overwhelmed sometimes. Remember, progress over perfection. " +
           "What's ONE small thing you could do in the next 10 minutes that would give you a sense of accomplishment? " +
           "Sometimes that small win is all we need to build momentum.";
  }

  // Context-specific responses
  if (contextType === 'project') {
    return "I'm here to help you make progress on your project. " +
           "What aspect would you like to focus on today? " +
           "We could work on your next milestone, address any blockers, or plan your upcoming steps.";
  }

  if (contextType === 'crisis') {
    return "I can see you're dealing with a challenging situation. " +
           "First, take a breath - we'll work through this together. " +
           "Can you share more about what happened? Understanding the full picture helps us find the best path forward.";
  }

  if (contextType === 'weekly_plan') {
    return "Let's review your week and make sure you're set up for success. " +
           "What are your top 3 priorities this week? " +
           "I'll help you make sure they're realistic given your available time.";
  }

  // Default response
  return "I'm here to help you stay on track with your goals. " +
         "Whether it's working through a challenge, planning your week, or celebrating a win - I've got your back. " +
         "What would be most helpful to focus on right now?";
}
