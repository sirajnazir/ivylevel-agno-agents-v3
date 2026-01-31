/**
 * AIChatInterface Component
 * Floating conversational AI chat interface.
 * MERGED from existing spec - optional enhancement.
 * @version 10.0
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useChatAgent, ChatMessage } from '@/lib/hooks/useAgentAPI';
import { getFeatureFlags } from '@/lib/config/featureFlags';

interface AIChatInterfaceProps {
  defaultOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

export function AIChatInterface({ 
  defaultOpen = false,
  position = 'bottom-right' 
}: AIChatInterfaceProps) {
  const flags = getFeatureFlags();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatAgent = useChatAgent();

  // Don't render if AI chat is disabled
  if (!flags.aiChat) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || chatAgent.loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const result = await chatAgent.invoke({
      message: input.trim(),
      history: messages,
    });

    if (result.success && result.data) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.data.response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I couldn\'t process that request. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-6' 
    : 'left-6';

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`fixed bottom-6 ${positionClasses} w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-transform hover:scale-105`}
        style={{
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryLight})`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X size={24} color="white" />
        ) : (
          <MessageCircle size={24} color="white" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 500,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 ${positionClasses} w-96 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden`}
            style={{
              backgroundColor: BRAND_COLORS.bgPrimary,
              border: `1px solid ${BRAND_COLORS.borderLight}`,
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              style={{
                borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
                background: `linear-gradient(135deg, ${BRAND_COLORS.primaryBg}, white)`,
              }}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLORS.primary }}
                >
                  <Sparkles size={20} color="white" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                    IvyQuest Assistant
                  </h3>
                  <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                    Powered by v10.0 Agents
                  </p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Minimize2 size={18} style={{ color: BRAND_COLORS.textMuted }} />
              </button>
            </div>

            {/* Messages - Hidden when minimized */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Sparkles 
                        size={32} 
                        style={{ color: BRAND_COLORS.textMuted }} 
                        className="mx-auto mb-3" 
                      />
                      <p style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
                        Ask me anything about your college application journey!
                      </p>
                      <div className="mt-4 space-y-2">
                        {SUGGESTED_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInput(prompt);
                              inputRef.current?.focus();
                            }}
                            className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                            style={{ color: BRAND_COLORS.textSecondary }}
                          >
                            "{prompt}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message, idx) => (
                    <MessageBubble key={idx} message={message} />
                  ))}

                  {chatAgent.loading && (
                    <div className="flex justify-start">
                      <div
                        className="rounded-2xl px-4 py-3"
                        style={{ backgroundColor: BRAND_COLORS.bgPill }}
                      >
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                  className="p-4"
                  style={{ borderTop: `1px solid ${BRAND_COLORS.borderLight}` }}
                >
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 rounded-full outline-none text-sm"
                      style={{
                        backgroundColor: BRAND_COLORS.bgPill,
                        color: BRAND_COLORS.textPrimary,
                      }}
                      disabled={chatAgent.loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || chatAgent.loading}
                      className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity"
                      style={{ backgroundColor: BRAND_COLORS.primary }}
                    >
                      {chatAgent.loading ? (
                        <Loader2 size={18} color="white" className="animate-spin" />
                      ) : (
                        <Send size={18} color="white" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
        style={{
          backgroundColor: isUser ? BRAND_COLORS.primary : BRAND_COLORS.bgPill,
          color: isUser ? 'white' : BRAND_COLORS.textPrimary,
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

const SUGGESTED_PROMPTS = [
  "What should I focus on this week?",
  "How can I improve my extracurriculars?",
  "Help me brainstorm essay topics",
];

export default AIChatInterface;
