/**
 * Entry Portal
 * 
 * Landing page where users select their role (Student, Coach, Admin)
 * before proceeding to login. Adapted from original frontend.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { USER_ROLES, type UserRole } from '@/types/auth';

// =============================================================================
// ROLE CARDS
// =============================================================================

interface RoleCardProps {
  role: UserRole;
  isSelected: boolean;
  onSelect: () => void;
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; description: string }> = {
  student: {
    label: 'Student',
    color: '#db2777', // Pink-600
    description: 'Start your journey to elite college admission',
  },
  coach: {
    label: 'Coach',
    color: '#7c3aed', // Violet-600
    description: 'Guide students and manage portfolios',
  },
  admin: {
    label: 'Administrator',
    color: '#2563eb', // Blue-600
    description: 'System administration and settings',
  },
  parent: {
    label: 'Parent',
    color: '#059669', // Emerald-600
    description: 'Monitor progress (Read Only)',
  }
};

function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  const config = ROLE_CONFIG[role];

  const icons: Record<UserRole, React.ReactNode> = {
    student: <GraduationCap className="w-10 h-10" />,
    coach: <Users className="w-10 h-10" />,
    admin: <Shield className="w-10 h-10" />,
    parent: <Users className="w-10 h-10" />, // Reusing users icon for parent
  };

  const features: Record<UserRole, string[]> = {
    student: [
      'Complete comprehensive assessment',
      'View personalized Ivy+ Ready Score',
      'Access AI-powered game plan',
      'Track progress over time',
    ],
    coach: [
      'Manage student portfolios',
      'Schedule coaching sessions',
      'Access coaching intelligence',
      'Generate progress reports',
    ],
    admin: [
      'User management & analytics',
      'System configuration',
      'Billing & subscriptions',
      'Audit logs & security',
    ],
    parent: [
      'View student progress',
      'Access billing & payments',
      'View read-only game plan',
      'Receive weekly reports',
    ]
  };

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full p-6 rounded-2xl text-left transition-all duration-300
        ${isSelected
          ? 'bg-white shadow-xl ring-2 ring-offset-2'
          : 'bg-white/80 hover:bg-white shadow-lg'
        }
      `}
      style={
        isSelected ? { ['--tw-ring-color' as string]: config.color } : undefined
      }
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <CheckCircle
            className="w-6 h-6"
            style={{ color: config.color }}
            fill={config.color}
            stroke="white"
          />
        </motion.div>
      )}

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        {icons[role]}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{config.label}</h3>

      {/* Description */}
      <p className="text-gray-600 mb-4">{config.description}</p>

      {/* Features */}
      <ul className="space-y-2">
        {features[role].map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

// =============================================================================
// ENTRY PORTAL
// =============================================================================

export function EntryPortal() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/auth/login?role=${selectedRole}`);
    }
  };

  const handleSignup = () => {
    if (selectedRole) {
      router.push(`/auth/signup?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full filter blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              IvyQuest
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to IvyQuest
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered platform for elite college admissions.
            Select how you'll be using IvyQuest today.
          </p>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <RoleCard
            role="student"
            isSelected={selectedRole === 'student'}
            onSelect={() => setSelectedRole('student')}
          />
          <RoleCard
            role="coach"
            isSelected={selectedRole === 'coach'}
            onSelect={() => setSelectedRole('coach')}
          />
          <RoleCard
            role="admin"
            isSelected={selectedRole === 'admin'}
            onSelect={() => setSelectedRole('admin')}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedRole ? 1 : 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            Sign In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleSignup}
            disabled={!selectedRole}
            className="px-8 py-4 text-gray-700 text-lg font-semibold hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Account
          </button>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 mt-8"
        >
          {selectedRole
            ? `Selected: ${ROLE_CONFIG[selectedRole].label}. Click Sign In to continue.`
            : 'Select your role above to continue'
          }
        </motion.p>
      </div>
    </div>
  );
}

export default EntryPortal;
