'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore, useStudentStore } from '@/lib/store';
import { IvylevelLogo } from '@/components/IvylevelLogo';
import {
  Rocket,
  RotateCcw,
  Sparkles,
  Target,
  Brain,
  Zap,
  GraduationCap,
  TrendingUp,
  Users,
  ChevronRight,
  Play,
  CheckCircle,
} from 'lucide-react';
import { CollegeLogo } from '@/components/ui/CollegeLogo';

// ============================================
// School Preview Data with Ivylevel Branding
// ============================================

const SCHOOL_PREVIEWS = [
  { name: 'Harvard', schoolId: 'HARVARD', rate: '3.4%' },
  { name: 'Stanford', schoolId: 'STANFORD', rate: '3.7%' },
  { name: 'MIT', schoolId: 'MIT', rate: '3.9%' },
  { name: 'Yale', schoolId: 'YALE', rate: '4.5%' },
];

const FEATURES = [
  {
    icon: Target,
    title: '6 Assessment Frames',
    description: 'Deep-dive into academics, activities, and aspirations',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Your Digital Twin Fleet simulates real outcomes',
  },
  {
    icon: Zap,
    title: 'Strategic Power-Ups',
    description: 'Personalized recommendations to boost your odds',
  },
];

// ============================================
// Animated Counter Component
// ============================================

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// ============================================
// Floating Orbs Background Component
// ============================================

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary coral orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-30 animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(254, 74, 34, 0.4) 0%, transparent 70%)',
          left: '-10%',
          top: '10%',
        }}
      />
      {/* Secondary burgundy orb */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 animate-float-medium"
        style={{
          background: 'radial-gradient(circle, rgba(100, 20, 50, 0.3) 0%, transparent 70%)',
          right: '-5%',
          top: '40%',
        }}
      />
      {/* Light accent orb */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-40 animate-float-fast"
        style={{
          background: 'radial-gradient(circle, rgba(255, 229, 223, 0.6) 0%, transparent 70%)',
          left: '60%',
          bottom: '10%',
        }}
      />
      {/* Small accent orb */}
      <div
        className="absolute w-[200px] h-[200px] rounded-full opacity-30 animate-float-medium"
        style={{
          background: 'radial-gradient(circle, rgba(254, 74, 34, 0.3) 0%, transparent 70%)',
          left: '30%',
          top: '5%',
        }}
      />
    </div>
  );
}

// ============================================
// School Glass Card Component
// ============================================

function SchoolCard({ name, schoolId, rate }: { name: string; schoolId: string; rate: string }) {
  return (
    <div className="group relative cursor-pointer">
      <div
        className="relative w-32 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 px-2 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 4px 16px rgba(100, 20, 50, 0.08)',
        }}
      >
        <CollegeLogo schoolId={schoolId} size={28} />
        <span className="text-[10px] text-[#6b7280]">{rate}</span>
      </div>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

function StatCard({ icon: Icon, value, suffix = '', label, color }: {
  icon: typeof GraduationCap;
  value: number;
  suffix?: string;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div
        className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="text-3xl font-bold" style={{ color: '#641432' }}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-sm text-[#6b7280] mt-1">{label}</div>
    </div>
  );
}

// ============================================
// Main Quest Entry Page
// ============================================

export default function QuestPage() {
  const router = useRouter();
  const currentFrame = useSessionStore((s) => s.current_frame);
  const resetSession = useSessionStore((s) => s.resetSession);
  const resetProfile = useStudentStore((s) => s.resetProfile);
  const studentName = useStudentStore((s) => s.profile.identity.name);

  const hasProgress = currentFrame > 1 || studentName.length > 0;

  const handleStartFresh = () => {
    resetSession();
    resetProfile();
    router.push('/quest/1');
  };

  const handleContinue = () => {
    router.push(`/quest/${Math.max(1, currentFrame)}`);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFE5DF 0%, #F5E8E5 50%, #FFF8F6 100%)',
      }}
    >
      {/* Background Elements */}
      <FloatingOrbs />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo & Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          {/* Ivylevel Logo */}
          <div className="flex justify-center mb-6">
            <IvylevelLogo size="lg" className="animate-pulse-subtle" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight" style={{ color: '#641432' }}>
            IvyQuest
          </h1>

          <p className="text-xl md:text-2xl mb-3 animate-fade-in delay-200" style={{ color: '#6b7280' }}>
            Your Path to Ivy+
          </p>

          <p className="text-base max-w-md mx-auto animate-fade-in delay-300" style={{ color: '#9ca3af' }}>
            Discover your unique strengths and build your Ivy-ready profile
          </p>
        </div>

        {/* School Preview Strip */}
        <div className="flex justify-center gap-4 mb-10 animate-fade-in-up delay-400">
          {SCHOOL_PREVIEWS.map((school) => (
            <SchoolCard key={school.name} {...school} />
          ))}
        </div>

        {/* Main Action Card */}
        <div className="w-full max-w-md mb-12 animate-scale-in delay-500">
          <div
            className="relative p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 60px rgba(100, 20, 50, 0.12)',
            }}
          >
            {hasProgress ? (
              <div>
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#16a34a15' }}
                  >
                    <Users className="w-8 h-8" style={{ color: '#16a34a' }} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#641432' }}>
                    Welcome back{studentName ? `, ${studentName}` : ''}!
                  </h2>
                  <p style={{ color: '#6b7280' }}>
                    Your progress is saved at Frame {currentFrame}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    style={{
                      background: 'linear-gradient(135deg, #FE4A22, #FF6B47)',
                      boxShadow: '0 4px 12px rgba(254, 74, 34, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(254, 74, 34, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(254, 74, 34, 0.3)';
                    }}
                  >
                    <Play className="w-5 h-5" />
                    Continue Your Quest
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleStartFresh}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#641432',
                      border: '2px solid #641432',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#64143210';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Fresh
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#641432' }}>
                    Ready to discover your chances?
                  </h2>
                  <p className="leading-relaxed" style={{ color: '#6b7280' }}>
                    Build your <span style={{ color: '#FF4A23', fontWeight: 600 }}>Digital Twin Fleet</span> and
                    get personalized admission insights.
                  </p>
                </div>

                <button
                  onClick={handleStartFresh}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-xl text-white font-bold text-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group"
                  style={{
                    background: 'linear-gradient(135deg, #FE4A22, #FF6B47)',
                    boxShadow: '0 4px 16px rgba(254, 74, 34, 0.35)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(254, 74, 34, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(254, 74, 34, 0.35)';
                  }}
                >
                  <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Begin Your Quest
                  <span className="animate-slide-right">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </button>

                <div className="flex items-center justify-center gap-4 mt-5 text-sm" style={{ color: '#9ca3af' }}>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    10-15 minutes
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d1d5db' }} />
                  <span style={{ color: '#16a34a', fontWeight: 500 }}>100% Free</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-3xl grid md:grid-cols-3 gap-5 mb-12 animate-fade-in-up delay-600">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(100, 20, 50, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(100, 20, 50, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(100, 20, 50, 0.06)';
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #FF4A23, #FF6B47)',
                  }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#641432' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-10 animate-fade-in delay-700">
          <StatCard icon={GraduationCap} value={94} suffix="%" label="Success Rate" color="#16a34a" />
          <div className="w-px h-16" style={{ backgroundColor: '#e5e7eb' }} />
          <StatCard icon={Users} value={500} suffix="+" label="Students Coached" color="#FF4A23" />
          <div className="w-px h-16" style={{ backgroundColor: '#e5e7eb' }} />
          <StatCard icon={Target} value={8} label="Target Schools" color="#641432" />
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm animate-fade-in delay-1000" style={{ color: '#9ca3af' }}>
          Powered by Ivylevel AI • Built for ambitious students
        </p>
      </div>
    </div>
  );
}
