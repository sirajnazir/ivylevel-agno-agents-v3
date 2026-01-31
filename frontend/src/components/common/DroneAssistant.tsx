'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '@/lib/constants/brand';

/**
 * DroneAssistant - Animated drone avatar with speech bubble
 *
 * This component displays the "Ivy" drone assistant with:
 * - Floating animated drone body with eye and propeller
 * - Animated side lights
 * - Speech bubble with contextual messages
 *
 * Design adapted from Grok v2.2 with Claude v2.2 brand colors
 */

interface DroneAssistantProps {
  /** The message to display in the speech bubble */
  message: string;
  /** Optional name for the drone (default: "Ivy") */
  name?: string;
  /** Optional className for custom styling */
  className?: string;
  /** Show compact version without full panel styling */
  compact?: boolean;
}

export function DroneAssistant({
  message,
  name = 'Ivy',
  className = '',
  compact = false,
}: DroneAssistantProps) {
  return (
    <div
      className={`h-full flex flex-col ${className}`}
      style={compact ? {} : {
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: 'clamp(24px, 5vw, 48px)',
      }}
    >
      {/* Drone and Speech Bubble Container */}
      <div className="flex flex-col items-center justify-center flex-1">
        {/* Animated Drone Avatar */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mb-8"
        >
          {/* Drone body */}
          <div
            className="w-28 h-18 md:w-36 md:h-24 rounded-full shadow-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${BRAND_COLORS.secondary}, #4a0f24)`,
            }}
          >
            {/* Eye - glowing coral */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 15px ${BRAND_COLORS.primary}`,
                  `0 0 30px ${BRAND_COLORS.primary}`,
                  `0 0 15px ${BRAND_COLORS.primary}`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full"
              style={{
                background: `linear-gradient(to bottom right, ${BRAND_COLORS.primary}, #e6391a)`,
              }}
            >
              {/* Eye highlight */}
              <div className="absolute top-2 left-2 w-3 h-3 bg-white/60 rounded-full" />
            </motion.div>

            {/* Propeller */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.1, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 md:w-28 h-1.5 bg-gray-600 rounded-full opacity-50"
            />
          </div>

          {/* Side lights */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-1/2 -left-3 w-4 h-4 rounded-full"
            style={{
              backgroundColor: BRAND_COLORS.success,
              boxShadow: `0 0 12px ${BRAND_COLORS.success}`,
            }}
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            className="absolute top-1/2 -right-3 w-4 h-4 rounded-full"
            style={{
              backgroundColor: BRAND_COLORS.primary,
              boxShadow: `0 0 12px ${BRAND_COLORS.primary}`,
            }}
          />
        </motion.div>

        {/* Drone Name */}
        <span
          className="font-bold text-xl mb-6"
          style={{ color: BRAND_COLORS.secondary }}
        >
          {name}
        </span>

        {/* Speech Bubble */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '16px',
            boxShadow: `0 10px 40px rgba(100, 20, 50, 0.25)`,
            padding: 'clamp(20px, 4vw, 32px)',
          }}
        >
          <p
            className="text-base md:text-lg leading-relaxed text-center"
            style={{ color: BRAND_COLORS.secondary }}
          >
            {message}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * DronePanel - Full panel version with coral gradient background
 * Use this for the right side of split layouts
 */
interface DronePanelProps extends DroneAssistantProps {
  /** Show the coral gradient background */
  showGradientBg?: boolean;
}

export function DronePanel({
  message,
  name = 'Ivy',
  className = '',
  showGradientBg = true,
}: DronePanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${className}`}
      style={showGradientBg ? {
        background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #FF6B47 50%, #FF8F6D 100%)`,
        minHeight: '400px',
      } : {
        background: 'rgba(255, 74, 35, 0.05)',
        border: `1px solid ${BRAND_COLORS.primary}20`,
        minHeight: '400px',
      }}
    >
      {/* Animated background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)
          `,
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-24 h-24 rounded-full hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
        }}
      />
      <motion.div
        animate={{ y: [0, 15, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-20 right-10 w-32 h-32 rounded-full hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(100,20,50,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Drone content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-8">
        {/* Animated Drone Avatar */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mb-8"
        >
          {/* Drone body */}
          <div
            className="w-28 h-18 md:w-36 md:h-24 rounded-full shadow-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${BRAND_COLORS.secondary}, #4a0f24)`,
            }}
          >
            {/* Eye */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 15px #FF4A23',
                  '0 0 30px #FF4A23',
                  '0 0 15px #FF4A23',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full"
              style={{
                background: `linear-gradient(to bottom right, ${BRAND_COLORS.primary}, #e6391a)`,
              }}
            >
              <div className="absolute top-2 left-2 w-3 h-3 bg-white/60 rounded-full" />
            </motion.div>

            {/* Propeller */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.1, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 md:w-28 h-1.5 bg-gray-600 rounded-full opacity-50"
            />
          </div>

          {/* Side lights */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-1/2 -left-3 w-4 h-4 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e]"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            className="absolute top-1/2 -right-3 w-4 h-4 rounded-full"
            style={{
              backgroundColor: BRAND_COLORS.primary,
              boxShadow: `0 0 12px ${BRAND_COLORS.primary}`,
            }}
          />
        </motion.div>

        {/* Drone Name */}
        <span className="text-white font-bold text-xl mb-6">{name}</span>

        {/* Speech Bubble */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(100, 20, 50, 0.25)',
            padding: 'clamp(20px, 4vw, 32px)',
          }}
        >
          <p
            className="text-base md:text-lg leading-relaxed text-center"
            style={{ color: BRAND_COLORS.secondary }}
          >
            {message}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default DroneAssistant;
