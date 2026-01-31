'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { inputLogger } from '@/lib/trace';
import { Mic, MicOff, StopCircle, Loader2, X } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface VoiceInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  showCharCount?: boolean;
  voicePrompt?: string;
  onTranscriptionComplete?: (transcript: string, confidence: number) => void;
  frameId?: number;
}

type RecordingState = 'idle' | 'requesting' | 'recording' | 'processing' | 'error';

// ============================================
// Voice Recognition Hook
// ============================================

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isSupported,
    recognition: recognitionRef.current,
  };
}

// ============================================
// VoiceInput Component
// ============================================

export function VoiceInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Type or click the microphone to speak...",
  hint,
  error,
  disabled = false,
  className,
  maxLength,
  minRows = 3,
  maxRows = 8,
  showCharCount = false,
  voicePrompt = "I'm listening...",
  onTranscriptionComplete,
  frameId,
}: VoiceInputProps) {
  const { isSupported, recognition } = useSpeechRecognition();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = minRows * 24; // Approximate line height
      const maxHeight = maxRows * 24;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [value, minRows, maxRows]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!recognition || disabled || recordingState === 'recording') return;

    setRecordingState('requesting');
    setInterimTranscript('');
    setRecordingDuration(0);
    startTimeRef.current = Date.now();

    // Set up event handlers
    recognition.onstart = () => {
      setRecordingState('recording');
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        const newValue = value + (value ? ' ' : '') + finalTranscript;
        onChange(newValue);

        const confidence = event.results[event.results.length - 1][0].confidence;
        const duration = Date.now() - startTimeRef.current;

        inputLogger.logVoiceInput(id, finalTranscript, confidence, duration);
        onTranscriptionComplete?.(finalTranscript, confidence);
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setRecordingState('error');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Reset after showing error
      setTimeout(() => {
        setRecordingState('idle');
      }, 2000);
    };

    recognition.onend = () => {
      setRecordingState('idle');
      setInterimTranscript('');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setRecordingState('error');
    }
  }, [recognition, disabled, recordingState, value, onChange, id, onTranscriptionComplete]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognition && recordingState === 'recording') {
      recognition.stop();
    }
  }, [recognition, recordingState]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (recordingState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recordingState, startRecording, stopRecording]);

  // Clear input
  const clearInput = useCallback(() => {
    onChange('');
  }, [onChange]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isRecording = recordingState === 'recording';

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-text-secondary">{label}</label>
          {showCharCount && maxLength && (
            <span
              className={cn(
                'text-xs font-mono',
                value.length > maxLength * 0.9 ? 'text-warning-amber' : 'text-text-muted',
                value.length >= maxLength && 'text-error-red'
              )}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* Input Container */}
      <div
        className={cn(
          'relative rounded-xl border-2 transition-all duration-200',
          isRecording
            ? 'border-error-red bg-error-red/5'
            : error
              ? 'border-error-red bg-background-secondary'
              : 'border-border-subtle bg-background-secondary focus-within:border-primary-blue',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Recording Indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 border-b border-error-red/30 bg-error-red/10"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-3 h-3 rounded-full bg-error-red"
                />
                <span className="text-sm text-error-red font-medium">{voicePrompt}</span>
                <span className="text-xs font-mono text-error-red/70 ml-auto">
                  {formatDuration(recordingDuration)}
                </span>
              </div>

              {/* Interim transcript */}
              {interimTranscript && (
                <p className="mt-2 text-sm text-text-secondary italic">
                  "{interimTranscript}"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isRecording}
            maxLength={maxLength}
            rows={minRows}
            className={cn(
              'w-full px-4 py-3 pr-20 bg-transparent resize-none',
              'text-text-primary placeholder:text-text-muted',
              'focus:outline-none',
              'disabled:cursor-not-allowed'
            )}
          />

          {/* Action Buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Clear button */}
            {value && !isRecording && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={clearInput}
                disabled={disabled}
                className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-background-hover transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            {/* Voice button */}
            {isSupported && (
              <motion.button
                type="button"
                onClick={toggleRecording}
                disabled={disabled || recordingState === 'requesting' || recordingState === 'processing'}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  isRecording
                    ? 'bg-error-red text-white hover:bg-error-red/90'
                    : 'text-primary-blue hover:bg-primary-blue/10',
                  recordingState === 'error' && 'text-error-red'
                )}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {recordingState === 'requesting' || recordingState === 'processing' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : recordingState === 'error' ? (
                  <MicOff className="w-5 h-5" />
                ) : isRecording ? (
                  <StopCircle className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Voice not supported message */}
      {!isSupported && (
        <p className="mt-2 text-xs text-text-muted flex items-center gap-1">
          <MicOff className="w-3 h-3" />
          Voice input not supported in this browser
        </p>
      )}

      {/* Error/Hint */}
      {error && <p className="mt-2 text-sm text-error-red">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-text-muted">{hint}</p>}
    </div>
  );
}

// ============================================
// Brag Text Input - Specialized Voice Input
// ============================================

export function BragTextInput({
  value,
  onChange,
  ...props
}: Omit<VoiceInputProps, 'id' | 'label' | 'placeholder' | 'hint' | 'voicePrompt' | 'maxLength'>) {
  return (
    <VoiceInput
      id="brag_text"
      label="Tell us about your biggest achievements"
      placeholder="Share your proudest accomplishments, unique experiences, or what makes you stand out. You can type or use voice input..."
      hint="This helps us understand your unique story beyond grades and test scores. Be specific!"
      voicePrompt="Tell me about your achievements..."
      maxLength={2000}
      showCharCount
      minRows={4}
      maxRows={10}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

// ============================================
// Project Description Input
// ============================================

export function ProjectDescriptionInput({
  value,
  onChange,
  ...props
}: Omit<VoiceInputProps, 'id' | 'label' | 'placeholder' | 'hint' | 'voicePrompt' | 'maxLength'>) {
  return (
    <VoiceInput
      id="project_description"
      label="Describe your most impactful project"
      placeholder="What was the problem you solved? What was your role? What was the outcome or impact?"
      hint="Focus on measurable impact and your specific contributions."
      voicePrompt="Describe your project..."
      maxLength={1000}
      showCharCount
      minRows={3}
      maxRows={6}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export default VoiceInput;
