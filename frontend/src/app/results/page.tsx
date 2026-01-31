'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResultsStore, useStudentStore } from '@/lib/store';
import { Trophy, RotateCcw, Sparkles, ArrowRight } from 'lucide-react';

/**
 * Results Page - Assessment Complete
 * Shows completion message and links to review results or start over
 */
export default function ResultsPage() {
  const router = useRouter();
  const results = useResultsStore((s) => s.results);
  const studentName = useStudentStore((s) => s.profile.identity.name);
  const clearResults = useResultsStore((s) => s.clearResults);

  // If no results, redirect to start
  useEffect(() => {
    if (!results) {
      router.replace('/quest');
    }
  }, [results, router]);

  if (!results) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FFE5DF 0%, #F5E8E5 50%, #FFF8F6 100%)' }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FF4A23] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#641432' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const ivyScore = results.ivy_ready_score?.total_score ?? 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FFE5DF 0%, #F5E8E5 50%, #FFF8F6 100%)' }}
    >
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FF4A23, #FF6B47)',
            boxShadow: '0 8px 32px rgba(254, 74, 34, 0.3)',
          }}
        >
          <Trophy className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: '#641432' }}
        >
          Quest Complete!
        </h1>

        <p className="text-lg mb-2" style={{ color: '#374151' }}>
          {studentName ? `Congratulations, ${studentName}!` : 'Congratulations!'}
        </p>

        <p className="mb-8" style={{ color: '#6b7280' }}>
          Your IvyQuest assessment is complete.
        </p>

        {/* Score Display */}
        <div
          className="p-6 rounded-2xl mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(100, 20, 50, 0.1)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: '#FF4A23' }} />
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Your Ivy+ Ready Score
            </span>
          </div>
          <div
            className="text-5xl font-bold"
            style={{ color: '#641432' }}
          >
            {ivyScore}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/quest/5')}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #FF4A23, #FF6B47)',
              boxShadow: '0 4px 16px rgba(254, 74, 34, 0.3)',
            }}
          >
            Review Your Results
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => router.push('/quest/6')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: 'rgba(255, 74, 35, 0.1)',
              color: '#FF4A23',
            }}
          >
            <Sparkles className="w-4 h-4" />
            View Power-Ups
          </button>

          <button
            onClick={() => {
              clearResults();
              router.push('/quest');
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
