/**
 * Custom Minimalistic Icons for Ivylevel
 *
 * Design System: Stroke-based icons with consistent styling
 * - Stroke width: 1.5-2px
 * - Default color: #292D32 (dark charcoal from original design)
 * - Style: Clean, simple, professional - matching Frame 1 aesthetic
 */

import React from 'react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const defaultProps = {
  size: 24,
  color: BRAND_COLORS.iconPrimary,
  strokeWidth: 1.5,
};

/**
 * AI/Bot Icon - Sparkle design representing AI intelligence
 */
export const IconAI: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 16L19.75 18.5L22 19L19.75 19.5L19 22L18.25 19.5L16 19L18.25 18.5L19 16Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Clock/Time Icon - Simple circular clock
 */
export const IconClock: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M12 7V12L15 14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Energy/Lightning Icon - Minimal lightning bolt
 */
export const IconEnergy: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 2L4 14H11L10 22L19 10H12L13 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Sun/Productivity Icon - Sunrise rays
 */
export const IconSun: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Target/Goal Icon - Concentric circles with center dot
 */
export const IconTarget: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <circle
      cx="12"
      cy="12"
      r="2"
      fill={color}
    />
  </svg>
);

/**
 * Trophy/Achievement Icon - Clean trophy outline
 */
export const IconTrophy: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 21H16M12 17V21M6 4H18V8C18 11.31 15.31 14 12 14C8.69 14 6 11.31 6 8V4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6H4C4 8.21 5.79 10 8 10M18 6H20C20 8.21 18.21 10 16 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Book/Study Icon - Open book outline
 */
export const IconBook: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6.25C12 6.25 12 4 9.5 4C7 4 4 5 4 5V18C4 18 7 17 9.5 17C12 17 12 18.25 12 18.25M12 6.25C12 6.25 12 4 14.5 4C17 4 20 5 20 5V18C20 18 17 17 14.5 17C12 17 12 18.25 12 18.25M12 6.25V18.25"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Rocket/Progress Icon - Simple rocket silhouette
 */
export const IconRocket: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C12 2 8 6 8 12C8 14 8.5 15.5 9 17L7 19L5 21L8 20L10 18C11 18.5 12 18.5 12 18.5C12 18.5 13 18.5 14 18L16 20L19 21L17 19L15 17C15.5 15.5 16 14 16 12C16 6 12 2 12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="10"
      r="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
  </svg>
);

/**
 * Star Icon - Clean star outline
 */
export const IconStar: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L14.39 8.26L21 9.27L16.5 13.97L17.77 21L12 17.77L6.23 21L7.5 13.97L3 9.27L9.61 8.26L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Lightbulb/Ideas Icon - Simple bulb outline
 */
export const IconLightbulb: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.69 2 6 4.69 6 8C6 10.22 7.21 12.15 9 13.19V15C9 15.55 9.45 16 10 16H14C14.55 16 15 15.55 15 15V13.19C16.79 12.15 18 10.22 18 8C18 4.69 15.31 2 12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 19H14M10 22H14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Check/Success Icon - Clean checkmark in circle
 */
export const IconCheck: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M8 12L11 15L16 9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * X/Close Icon - Clean X in circle
 */
export const IconClose: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M9 9L15 15M15 9L9 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Info Icon - i in circle
 */
export const IconInfo: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M12 16V12M12 8H12.01"
      stroke={color}
      strokeWidth={strokeWidth + 0.5}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * User/Person Icon - Simple person outline
 */
export const IconUser: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M4 21V19C4 16.79 5.79 15 8 15H16C18.21 15 20 16.79 20 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Brain Icon - For cognitive/thinking concepts
 */
export const IconBrain: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4C9.24 4 7 6.24 7 9C7 10.85 7.96 12.47 9.41 13.34L9 14C8.63 14.74 8.63 15.5 9 16.22C9.5 17.17 10.5 17.67 11.5 17.5L12 20M12 4C14.76 4 17 6.24 17 9C17 10.85 16.04 12.47 14.59 13.34L15 14C15.37 14.74 15.37 15.5 15 16.22C14.5 17.17 13.5 17.67 12.5 17.5L12 20M12 4V8M7 9C5.34 9 4 10.34 4 12C4 13.66 5.34 15 7 15M17 9C18.66 9 20 10.34 20 12C20 13.66 18.66 15 17 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Heart Icon - For passion/love concepts
 */
export const IconHeart: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6C10.83 4.92 9.28 4 7.5 4C4.42 4 2 6.42 2 9.5C2 14 7 18 12 21C17 18 22 14 22 9.5C22 6.42 19.58 4 16.5 4C14.72 4 13.17 4.92 12 6Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Chart/Analytics Icon - Simple bar chart
 */
export const IconChart: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 20H20M4 20V4M4 20L8 16L12 18L16 12L20 14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Compass/Direction Icon - For guidance/navigation
 */
export const IconCompass: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M16 8L14 14L8 16L10 10L16 8Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Shield Icon - For protection/safety concepts
 */
export const IconShield: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3L4 7V12C4 16.42 7.4 20.46 12 21.5C16.6 20.46 20 16.42 20 12V7L12 3Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Puzzle Icon - For strategic thinking
 */
export const IconPuzzle: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 8H17V6C17 4.9 16.1 4 15 4H9C7.9 4 7 4.9 7 6V8H4C2.9 8 2 8.9 2 10V14C2 15.1 2.9 16 4 16H7V18C7 19.1 7.9 20 9 20H15C16.1 20 17 19.1 17 18V16H20C21.1 16 22 15.1 22 14V10C22 8.9 21.1 8 20 8Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

/**
 * Graduate Cap Icon - For education/academics
 */
export const IconGraduate: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L2 9L12 14L22 9L12 4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 11V16C6 16 8 19 12 19C16 19 18 16 18 16V11"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 9V15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Award/Medal Icon - For achievements/recognition
 */
export const IconAward: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="9"
      r="5"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M9 13.5L8 22L12 19L16 22L15 13.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Trend Up Icon - For growth/improvement
 */
export const IconTrendUp: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 17L9 11L13 15L21 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 7H21V11"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Message/Chat Icon - For communication
 */
export const IconMessage: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 12C21 16.97 16.97 21 12 21C10.36 21 8.83 20.53 7.5 19.72L3 21L4.28 16.5C3.47 15.17 3 13.64 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12H8.01M12 12H12.01M16 12H16.01"
      stroke={color}
      strokeWidth={strokeWidth + 0.5}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Calendar Icon - For scheduling/dates
 */
export const IconCalendar: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M3 9H21M8 2V5M16 2V5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Refresh/Sync Icon - For updates/synchronization
 */
export const IconRefresh: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12C3 7.03 7.03 3 12 3C15.53 3 18.59 5.11 20 8.12M21 12C21 16.97 16.97 21 12 21C8.47 21 5.41 18.89 4 15.88"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M16 8L20 8L20 4M8 16L4 16L4 20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Settings/Gear Icon - For configuration
 */
export const IconSettings: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Layers Icon - For organization/levels
 */
export const IconLayers: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Microscope Icon - For research/science
 */
export const IconMicroscope: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 16V21M8 21H16M14 4L10 8M6 21C6 18.79 7.79 17 10 17H14C16.21 17 18 18.79 18 21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9" r="5" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="12" cy="9" r="2" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

/**
 * Crown Icon - For leadership
 */
export const IconCrown: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 17L4 7L8 10L12 4L16 10L20 7L22 17H2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 21H20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Palette Icon - For creativity/art
 */
export const IconPalette: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C12.83 22 13.5 21.33 13.5 20.5C13.5 20.12 13.36 19.78 13.11 19.52C12.87 19.26 12.73 18.92 12.73 18.55C12.73 17.72 13.4 17.05 14.23 17.05H16C19.31 17.05 22 14.36 22 11.05C22 5.98 17.52 2 12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6.5" cy="11.5" r="1.5" fill={color} />
    <circle cx="9.5" cy="7.5" r="1.5" fill={color} />
    <circle cx="14.5" cy="7.5" r="1.5" fill={color} />
    <circle cx="17.5" cy="11.5" r="1.5" fill={color} />
  </svg>
);

/**
 * Briefcase Icon - For business/entrepreneurship
 */
export const IconBriefcase: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M12 11V15M2 12H22"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Globe Icon - For exploration/global
 */
export const IconGlobe: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <path
      d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Flame Icon - For passion/spike
 */
export const IconFlame: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C16.42 22 20 18.42 20 14C20 9 16 5 12 2C12 7 8 10 8 14C8 18.42 11.58 22 12 22Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 22C10.34 22 9 20.21 9 18C9 15.79 10 14 12 12C14 14 15 15.79 15 18C15 20.21 13.66 22 12 22Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Medal Icon - For awards/recognition
 */
export const IconMedal: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="14" r="6" stroke={color} strokeWidth={strokeWidth} />
    <path
      d="M9 8V2H15V8M12 8V10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12V16M10 14H14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * School Icon - For education/high school
 */
export const IconSchool: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3L2 9L12 15L22 9L12 3Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 9V15L12 21L22 15V9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Wand Icon - For AI/magic
 */
export const IconWand: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 4L20 9L9 20L4 15L15 4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7L17 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M3 21L6 18M18 3L21 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Pen/Write Icon - For writing capabilities
 */
export const IconPen: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 3C17.94 2.06 19.44 2.06 20.38 3C21.32 3.94 21.32 5.44 20.38 6.38L8 18.76L3 20L4.24 15L17 3Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 5L19 9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Microphone Icon - For public speaking
 */
export const IconMicrophone: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="9"
      y="2"
      width="6"
      height="12"
      rx="3"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M5 10V11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11V10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M12 18V22M8 22H16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Wrench Icon - For technical/building
 */
export const IconWrench: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.7 6.3C14.24 6.76 13.94 7.37 13.86 8.02C13.78 8.67 13.92 9.33 14.26 9.89L4.5 19.65C4.04 20.11 4.04 20.86 4.5 21.32C4.96 21.78 5.71 21.78 6.17 21.32L15.93 11.56C16.49 11.9 17.15 12.04 17.8 11.96C18.45 11.88 19.06 11.58 19.52 11.12C20.32 10.32 20.55 9.14 20.1 8.08L18 10.18L16 10L15.82 8L17.92 5.9C16.86 5.45 15.68 5.68 14.88 6.48"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Users/Network Icon - For networking/connecting
 */
export const IconUsers: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="7" r="3" stroke={color} strokeWidth={strokeWidth} />
    <path
      d="M3 21V19C3 16.79 4.79 15 7 15H11C13.21 15 15 16.79 15 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <circle cx="17" cy="7" r="3" stroke={color} strokeWidth={strokeWidth} />
    <path
      d="M17 15C19.21 15 21 16.79 21 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Bar Chart Icon - For data analysis
 */
export const IconBarChart: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 20V10M12 20V4M20 20V14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Moon Icon - For night owl/evening
 */
export const IconMoon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 12.79C20.44 14.15 19.51 15.32 18.31 16.18C17.11 17.04 15.69 17.55 14.22 17.65C12.75 17.75 11.28 17.43 9.98 16.73C8.68 16.03 7.61 14.98 6.89 13.69C6.17 12.4 5.83 10.93 5.91 9.46C5.99 7.99 6.48 6.56 7.33 5.35C8.18 4.14 9.35 3.2 10.71 2.63C12.07 2.06 13.56 1.88 15 2.12C14.09 3.13 13.55 4.42 13.43 5.79C13.31 7.16 13.63 8.53 14.34 9.7C15.05 10.87 16.11 11.78 17.37 12.3C18.63 12.82 20.02 12.93 21.35 12.6L21 12.79Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Balance/Scale Icon - For flexibility/balance
 */
export const IconBalance: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2V22M2 12H22"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M5 7L7 10H3L5 7ZM19 7L21 10H17L19 7Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 10C3 11.1 3.9 12 5 12C6.1 12 7 11.1 7 10M17 10C17 11.1 17.9 12 19 12C20.1 12 21 11.1 21 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M5 7H19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Checklist Icon - For systematic/organized
 */
export const IconChecklist: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 5H7C5.9 5 5 5.9 5 7V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V7C19 5.9 18.1 5 17 5H15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <rect
      x="9"
      y="3"
      width="6"
      height="4"
      rx="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M9 12L11 14L15 10M9 17H15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Export all icons
export const Icons = {
  AI: IconAI,
  Clock: IconClock,
  Energy: IconEnergy,
  Sun: IconSun,
  Target: IconTarget,
  Trophy: IconTrophy,
  Book: IconBook,
  Rocket: IconRocket,
  Star: IconStar,
  Lightbulb: IconLightbulb,
  Check: IconCheck,
  Close: IconClose,
  Info: IconInfo,
  User: IconUser,
  Brain: IconBrain,
  Heart: IconHeart,
  Chart: IconChart,
  Compass: IconCompass,
  Shield: IconShield,
  Puzzle: IconPuzzle,
  Graduate: IconGraduate,
  Award: IconAward,
  TrendUp: IconTrendUp,
  Message: IconMessage,
  Calendar: IconCalendar,
  Refresh: IconRefresh,
  Settings: IconSettings,
  Layers: IconLayers,
  Microscope: IconMicroscope,
  Crown: IconCrown,
  Palette: IconPalette,
  Briefcase: IconBriefcase,
  Globe: IconGlobe,
  Flame: IconFlame,
  Medal: IconMedal,
  School: IconSchool,
  Wand: IconWand,
  Pen: IconPen,
  Microphone: IconMicrophone,
  Wrench: IconWrench,
  Users: IconUsers,
  BarChart: IconBarChart,
  Moon: IconMoon,
  Balance: IconBalance,
  Checklist: IconChecklist,
};

/**
 * Icon name to component mapping for dynamic rendering
 */
export type IconName = keyof typeof Icons;

/**
 * Get icon component by name
 */
export function getIcon(name: IconName): React.FC<IconProps> {
  return Icons[name];
}

/**
 * Frame icon mapping - maps frame IDs to icon names
 */
export const FRAME_ICONS: Record<number, IconName> = {
  1: 'Rocket',
  2: 'Chart',
  3: 'Layers',
  4: 'Settings',
  5: 'Target',
  6: 'Energy',
};

/**
 * Get icon component for a frame
 */
export function getFrameIcon(frameId: number): React.FC<IconProps> | null {
  const iconName = FRAME_ICONS[frameId];
  return iconName ? Icons[iconName] : null;
}

export default Icons;
