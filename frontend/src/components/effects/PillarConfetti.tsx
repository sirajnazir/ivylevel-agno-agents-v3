'use client';

/**
 * Pillar Confetti - Celebration effect when a pillar reaches 100%
 *
 * Triggers animated confetti particles matching the pillar color
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  duration: number;
  delay: number;
}

interface PillarConfettiProps {
  /** Trigger confetti animation */
  trigger: boolean;
  /** Pillar color (hex) */
  color: string;
  /** Number of confetti particles */
  particleCount?: number;
}

export function PillarConfetti({
  trigger,
  color,
  particleCount = 50,
}: PillarConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      // Generate confetti particles
      const newParticles: ConfettiParticle[] = Array.from(
        { length: particleCount },
        (_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -20, // Start above viewport
          color: i % 3 === 0 ? color : i % 3 === 1 ? '#FFD700' : '#FFFFFF', // Mix pillar color with gold and white
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          delay: Math.random() * 0.5,
        })
      );

      setParticles(newParticles);
      setShow(true);

      // Clean up after animation
      const timeout = setTimeout(() => {
        setShow(false);
        setParticles([]);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [trigger, color, particleCount]);

  return (
    <AnimatePresence>
      {show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: particle.y,
                opacity: 1,
                rotate: particle.rotation,
                scale: particle.scale,
              }}
              animate={{
                y: window.innerHeight + 100,
                x: particle.x + (Math.random() - 0.5) * 200,
                rotate: particle.rotation + 360 * 2,
                opacity: [1, 1, 0.5, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeIn',
              }}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to detect pillar completion and trigger confetti
 */
export function usePillarCompletionConfetti(
  previousCompletion: number,
  currentCompletion: number
): boolean {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    // Trigger confetti when crossing 100% threshold
    if (previousCompletion < 100 && currentCompletion >= 100) {
      setTrigger(true);
      const timeout = setTimeout(() => setTrigger(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [previousCompletion, currentCompletion]);

  return trigger;
}
