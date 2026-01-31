'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface LoadingInsightProps {
  messages: string[];
  interval?: number;
}

export function LoadingInsight({ messages, interval = 2500 }: LoadingInsightProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  if (messages.length === 0) return null;

  return (
    <div className="relative h-20 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <p
            className="text-sm text-center max-w-lg px-6 leading-relaxed"
            style={{ color: BRAND_COLORS.textSecondary }}
          >
            {messages[currentIndex]}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default LoadingInsight;
