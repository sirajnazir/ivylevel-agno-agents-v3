/**
 * NCWITStrategyCard - NCWIT competition strategy and essay coaching
 * v13.0 - Identity multipliers, vulnerability angles, and Jenny coaching
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Loader2, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { agentV2Api, type NCWITStrategyResult } from '@/lib/api/agentV2Client';
import { useProfileId } from '@/lib/store/useSessionStore';

interface NCWITStrategyCardProps {
  studentData?: {
    identity?: string[];
    experiences?: string[];
    spike?: string;
    is_first_gen?: boolean;
    is_new_to_school?: boolean;
  };
}

export function NCWITStrategyCard({ studentData }: NCWITStrategyCardProps) {
  const profileId = useProfileId();
  const [strategy, setStrategy] = useState<NCWITStrategyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeEssay, setActiveEssay] = useState<1 | 2>(1);

  const loadStrategy = async () => {
    if (!profileId) {
      setError('No profile ID available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await agentV2Api.getNCWITStrategy({
        profile_id: profileId,
        student_data: studentData,
      });
      setStrategy(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate strategy');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      loadStrategy();
    }
  }, [profileId, studentData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: BRAND_COLORS.borderLight }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer"
        style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}
          >
            <Trophy size={20} style={{ color: '#ca8a04' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              NCWIT Strategy
            </h3>
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Competition essay strategy and coaching
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              loadStrategy();
            }}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: BRAND_COLORS.textMuted }} />
            ) : (
              <RefreshCw size={18} style={{ color: BRAND_COLORS.textMuted }} />
            )}
          </button>
          {isExpanded ? (
            <ChevronUp size={20} style={{ color: BRAND_COLORS.textMuted }} />
          ) : (
            <ChevronDown size={20} style={{ color: BRAND_COLORS.textMuted }} />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-5">
          {/* Error State */}
          {error && (
            <div
              className="p-4 rounded-lg text-sm"
              style={{ backgroundColor: BRAND_COLORS.bgError, color: BRAND_COLORS.error }}
            >
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !strategy && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-3" style={{ color: '#ca8a04' }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Analyzing your competitive edge...
              </p>
            </div>
          )}

          {/* Content */}
          {strategy && !isLoading && (
            <>
              {/* Identity Multipliers */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} style={{ color: '#ca8a04' }} />
                  <span className="font-semibold text-sm" style={{ color: BRAND_COLORS.textHeading }}>
                    YOUR IDENTITY MULTIPLIERS
                  </span>
                </div>

                {strategy.strategy?.identity_multiplier_text && (
                  <p
                    className="text-sm font-medium mb-3 p-2 rounded"
                    style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#92400e' }}
                  >
                    🎯 {strategy.strategy.identity_multiplier_text}
                  </p>
                )}

                {strategy.strategy?.identity_layers && strategy.strategy.identity_layers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      Identity Layers:
                    </span>
                    <ul className="space-y-1">
                      {strategy.strategy.identity_layers.map((layer, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start gap-2"
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <span>•</span>
                          {layer}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Vulnerability Angles */}
              {strategy.strategy?.vulnerability_angles && strategy.strategy.vulnerability_angles.length > 0 && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: BRAND_COLORS.textMuted }}>
                    Vulnerability Angles
                  </span>
                  <div className="mt-2 space-y-2">
                    {strategy.strategy.vulnerability_angles.map((angle, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border-l-3 text-sm"
                        style={{
                          backgroundColor: 'rgba(100, 20, 50, 0.02)',
                          borderLeft: `3px solid ${BRAND_COLORS.secondary}`,
                          color: BRAND_COLORS.textPrimary,
                        }}
                      >
                        ✨ &ldquo;{angle}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Essay Structure Tabs */}
              {strategy.strategy?.essay_structure && (
                <div>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setActiveEssay(1)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeEssay === 1 ? 'text-white' : ''
                      }`}
                      style={{
                        backgroundColor: activeEssay === 1 ? '#ca8a04' : 'rgba(234, 179, 8, 0.1)',
                        color: activeEssay === 1 ? 'white' : BRAND_COLORS.textPrimary,
                      }}
                    >
                      <FileText size={14} className="inline mr-1" />
                      Essay 1
                    </button>
                    <button
                      onClick={() => setActiveEssay(2)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeEssay === 2 ? 'text-white' : ''
                      }`}
                      style={{
                        backgroundColor: activeEssay === 2 ? '#ca8a04' : 'rgba(234, 179, 8, 0.1)',
                        color: activeEssay === 2 ? 'white' : BRAND_COLORS.textPrimary,
                      }}
                    >
                      <FileText size={14} className="inline mr-1" />
                      Essay 2
                    </button>
                  </div>

                  {activeEssay === 1 && strategy.strategy.essay_structure.question_1 && (
                    <EssayGuide
                      title="Essay 1"
                      prompt={strategy.strategy.essay_structure.question_1.prompt}
                      wordLimit={strategy.strategy.essay_structure.question_1.word_limit}
                      strategy={strategy.strategy.essay_structure.question_1.strategy}
                      structure={strategy.strategy.essay_structure.question_1.structure}
                    />
                  )}

                  {activeEssay === 2 && strategy.strategy.essay_structure.question_2 && (
                    <EssayGuide
                      title="Essay 2"
                      prompt={strategy.strategy.essay_structure.question_2.prompt}
                      wordLimit={strategy.strategy.essay_structure.question_2.word_limit}
                      strategy={strategy.strategy.essay_structure.question_2.strategy}
                    />
                  )}
                </div>
              )}

              {/* Jenny Coaching */}
              {strategy.strategy?.jenny_coaching_script && (
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: 'rgba(255, 74, 35, 0.03)',
                    borderColor: BRAND_COLORS.primary,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎤</span>
                    <span className="font-semibold text-sm" style={{ color: BRAND_COLORS.textHeading }}>
                      Jenny&apos;s Coaching
                    </span>
                  </div>
                  <p className="text-sm italic" style={{ color: BRAND_COLORS.textPrimary }}>
                    &ldquo;{strategy.strategy.jenny_coaching_script}&rdquo;
                  </p>
                </div>
              )}

              {/* Vulnerability Formula */}
              {strategy.vulnerability_formula && (
                <div
                  className="p-3 rounded-lg text-sm text-center"
                  style={{
                    backgroundColor: 'rgba(100, 20, 50, 0.05)',
                    color: BRAND_COLORS.secondary,
                  }}
                >
                  <span className="font-medium">Vulnerability Formula:</span>
                  <br />
                  {strategy.vulnerability_formula}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!strategy && !isLoading && !error && (
            <div className="py-8 text-center">
              <Trophy size={40} className="mx-auto mb-3" style={{ color: BRAND_COLORS.textMuted }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Complete your profile to get personalized NCWIT strategy
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface EssayGuideProps {
  title: string;
  prompt: string;
  wordLimit: number;
  strategy: string;
  structure?: string[];
}

function EssayGuide({ title, prompt, wordLimit, strategy, structure }: EssayGuideProps) {
  return (
    <div className="space-y-3">
      <div
        className="p-3 rounded-lg"
        style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: BRAND_COLORS.textMuted }}>
            {title}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#92400e' }}
          >
            {wordLimit} words
          </span>
        </div>
        <p className="text-sm italic" style={{ color: BRAND_COLORS.textPrimary }}>
          {prompt}
        </p>
      </div>

      <div>
        <span className="text-xs font-medium" style={{ color: BRAND_COLORS.textMuted }}>
          Strategy:
        </span>
        <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textPrimary }}>
          {strategy}
        </p>
      </div>

      {structure && structure.length > 0 && (
        <div>
          <span className="text-xs font-medium" style={{ color: BRAND_COLORS.textMuted }}>
            Structure:
          </span>
          <ol className="mt-1 space-y-1">
            {structure.map((step, idx) => (
              <li
                key={idx}
                className="text-sm flex items-start gap-2"
                style={{ color: BRAND_COLORS.textPrimary }}
              >
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#92400e' }}
                >
                  {idx + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default NCWITStrategyCard;
