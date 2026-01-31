import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
          elevated: 'var(--background-elevated)',
          hover: 'var(--background-hover)',
          card: 'var(--background-card)',
          glass: 'var(--background-glass)',
          overlay: 'var(--background-overlay)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          standard: 'var(--border-standard)',
          focus: 'var(--border-focus)',
          glow: 'var(--border-glow)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
          inverse: 'var(--text-inverse)',
        },
        primary: {
          blue: 'var(--primary-blue)',
          'blue-hover': 'var(--primary-blue-hover)',
          'blue-glow': 'var(--primary-blue-glow)',
        },
        success: {
          green: 'var(--success-green)',
          'green-glow': 'var(--success-green-glow)',
        },
        warning: {
          amber: 'var(--warning-amber)',
          'amber-glow': 'var(--warning-amber-glow)',
        },
        error: {
          red: 'var(--error-red)',
          'red-glow': 'var(--error-red-glow)',
        },
        info: {
          cyan: 'var(--info-cyan)',
          'cyan-glow': 'var(--info-cyan-glow)',
        },
        school: {
          harvard: 'var(--school-harvard)',
          yale: 'var(--school-yale)',
          princeton: 'var(--school-princeton)',
          stanford: 'var(--school-stanford)',
          mit: 'var(--school-mit)',
          caltech: 'var(--school-caltech)',
          cmu: 'var(--school-cmu)',
          penn: 'var(--school-penn)',
          brown: 'var(--school-brown)',
          columbia: 'var(--school-columbia)',
          cornell: 'var(--school-cornell)',
          dartmouth: 'var(--school-dartmouth)',
          duke: 'var(--school-duke)',
          northwestern: 'var(--school-northwestern)',
          uchicago: 'var(--school-uchicago)',
          jhu: 'var(--school-jhu)',
          rice: 'var(--school-rice)',
          vanderbilt: 'var(--school-vanderbilt)',
          notredame: 'var(--school-notredame)',
          georgetown: 'var(--school-georgetown)',
          berkeley: 'var(--school-berkeley)',
          ucla: 'var(--school-ucla)',
          usc: 'var(--school-usc)',
        },
        gear: {
          rusty: 'var(--gear-rusty)',
          bronze: 'var(--gear-bronze)',
          iron: 'var(--gear-iron)',
          silver: 'var(--gear-silver)',
          gold: 'var(--gear-gold)',
          diamond: 'var(--gear-diamond)',
          legendary: 'var(--gear-legendary)',
          mythic: 'var(--gear-mythic)',
        },
        strength: {
          low: 'var(--strength-low)',
          medium: 'var(--strength-medium)',
          high: 'var(--strength-high)',
          elite: 'var(--strength-elite)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        hud: ['Orbitron', 'Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-blue': 'var(--shadow-glow-blue)',
        'glow-green': 'var(--shadow-glow-green)',
        'glow-amber': 'var(--shadow-glow-amber)',
        'glow-red': 'var(--shadow-glow-red)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0, 0, 0.2, 1)',
        'slide-down': 'slide-down 0.4s cubic-bezier(0, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.3s cubic-bezier(0, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spin-slow': 'spin-slow 8s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'score-count': 'score-count 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'gear-equip': 'gear-equip 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'mythic-pulse': 'mythic-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(74, 144, 217, 0)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(74, 144, 217, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        'score-count': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'gear-equip': {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '60%': { transform: 'scale(1.2) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'mythic-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 30px rgba(155, 89, 182, 0.6)',
          },
          '50%': {
            boxShadow: '0 0 50px rgba(155, 89, 182, 0.8)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'xp-gradient': 'linear-gradient(90deg, #4A90D9, #34D399)',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'overlay': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
        'hud': '800',
        'debug': '900',
        'max': '999',
      },
    },
  },
  plugins: [],
};

export default config;
