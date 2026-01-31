'use client';

import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';

/**
 * PillarCards - 2x2 grid of pillar score cards with 3-layer wave animations
 *
 * Matches Phoenix implementation exactly with animated SVG waves.
 * Pillars: Aptitude (star), Passion (heart), Service (users), Identity (fingerprint)
 */

// Pillar configuration matching Phoenix exactly
const PILLAR_CONFIG = {
  aptitude: {
    name: 'Aptitude',
    color: '#FFBB6D',
    bgLight: '#FFEBD3',
    boostBg: '#FFE6E0',
    boostPercent: 6,
  },
  passion: {
    name: 'Passion',
    color: '#FF6E6D',
    bgLight: '#FFD4D3',
    boostBg: '#FFD4D3',
    boostPercent: 7,
  },
  service: {
    name: 'Service',
    color: '#55AAAA',
    bgLight: '#CCE6E6',
    boostBg: '#CCE6E6',
    boostPercent: 8,
  },
  identity: {
    name: 'Identity',
    color: '#9698A6',
    bgLight: '#DFE0E4',
    boostBg: '#DFE0E4',
    boostPercent: 5,
  },
} as const;

interface PillarCardsProps {
  aptitude: number;
  passion: number;
  community: number; // Displayed as "Service"
  narrative: number; // Displayed as "Identity"
}

// Generate wave animation paths based on fill percent
// UNIVERSAL FIX: Sanitize inputs before generating path string
function generateWaveValues(baseY: number, amplitude: number = 10): string {
  // Sanitize inputs - default to safe values if invalid
  const safeY = (typeof baseY === 'number' && isFinite(baseY)) ? baseY : 50;
  const safeAmp = (typeof amplitude === 'number' && isFinite(amplitude)) ? amplitude : 10;

  return `
    M-30 ${safeY} Q15.75 ${safeY - safeAmp}, 46.75 ${safeY} T123.5 ${safeY} T200.25 ${safeY} T277 ${safeY} V107 H-30Z;
    M-30 ${safeY} Q15.75 ${safeY + safeAmp}, 46.75 ${safeY} T123.5 ${safeY + safeAmp} T200.25 ${safeY} T277 ${safeY + safeAmp} V107 H-30Z;
    M-30 ${safeY} Q15.75 ${safeY - safeAmp}, 46.75 ${safeY} T123.5 ${safeY} T200.25 ${safeY} T277 ${safeY} V107 H-30Z`;
}

// Helper to safely get the initial path for the d attribute
// UNIVERSAL FIX: Defensive guards for all invalid inputs (NaN, undefined, Infinity)
function getInitialWavePath(baseY: number): string {
  // Guard against invalid numeric values
  if (typeof baseY !== 'number' || isNaN(baseY) || !isFinite(baseY)) {
    return 'M0 0';
  }

  try {
    const values = generateWaveValues(baseY);
    if (!values || typeof values !== 'string') return 'M0 0';
    const firstPath = values.split(';')[0];
    if (!firstPath) return 'M0 0';
    const trimmed = firstPath.trim();
    // Validate path starts with moveto command
    if (!trimmed.startsWith('M') && !trimmed.startsWith('m')) return 'M0 0';
    return trimmed;
  } catch (e) {
    console.error('Error generating wave path:', e);
    return 'M0 0';
  }
}

// Aptitude Star SVG with 3-layer wave animation
function AptitudeIcon({ color, fillPercent, uniqueId }: { color: string; fillPercent: number; uniqueId: string }) {
  const fillY = 107 - (fillPercent * 0.9); // Calculate Y position based on fill

  return (
    <svg height="107" width="187" fill="none" viewBox="0 0 187 107" xmlns="http://www.w3.org/2000/svg">
      {/* Star shape background */}
      <path
        d="M121.686 64.5239C120.469 65.713 119.915 67.4234 120.206 69.0989L120.874 72.9689L124.173 92.0603C124.902 96.2793 120.476 99.5047 116.681 97.515L96.0304 86.6964C94.5239 85.9052 92.7241 85.9098 91.22 86.701L70.5954 97.5662C66.8049 99.5628 62.3694 96.3491 63.0911 92.1301L67.0051 69.1571C67.2915 67.4816 66.7327 65.7735 65.5103 64.5867L48.7974 48.3413C45.7286 45.3557 47.412 40.1453 51.6543 39.524L74.7213 36.1474C76.407 35.9007 77.8576 34.8419 78.6096 33.3153L88.9033 12.4088C90.7962 8.56677 96.2725 8.55978 98.1748 12.3971L108.52 33.2827C109.274 34.807 110.732 35.8612 112.413 36.1032L135.491 39.4263C139.734 40.036 141.431 45.244 138.364 48.2343L121.689 64.5192L121.686 64.5239Z"
        fill={PILLAR_CONFIG.aptitude.bgLight}
      />

      <defs>
        <clipPath id={`starClip-${uniqueId}`}>
          <path d="M121.686 64.5239C120.469 65.713 119.915 67.4234 120.206 69.0989L120.874 72.9689L124.173 92.0603C124.902 96.2793 120.476 99.5047 116.681 97.515L96.0304 86.6964C94.5239 85.9052 92.7241 85.9098 91.22 86.701L70.5954 97.5662C66.8049 99.5628 62.3694 96.3491 63.0911 92.1301L67.0051 69.1571C67.2915 67.4816 66.7327 65.7735 65.5103 64.5867L48.7974 48.3413C45.7286 45.3557 47.412 40.1453 51.6543 39.524L74.7213 36.1474C76.407 35.9007 77.8576 34.8419 78.6096 33.3153L88.9033 12.4088C90.7962 8.56677 96.2725 8.55978 98.1748 12.3971L108.52 33.2827C109.274 34.807 110.732 35.8612 112.413 36.1032L135.491 39.4263C139.734 40.036 141.431 45.244 138.364 48.2343L121.689 64.5192L121.686 64.5239Z" />
        </clipPath>
        <mask id={`fillMask-${uniqueId}`}>
          <rect x="0" y={fillY} width="187" height={107 - fillY} fill="white" />
        </mask>
      </defs>

      {/* 3-layer waves - with inline fallbacks */}
      <g clipPath={`url(#starClip-${uniqueId})`} mask={`url(#fillMask-${uniqueId})`}>
        <path fill={color} opacity="0.3" d={getInitialWavePath(fillY) || 'M0 0'}>
          <animate attributeName="d" dur="3s" repeatCount="indefinite" values={generateWaveValues(fillY) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.5" d={getInitialWavePath(fillY + 5) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-1s" repeatCount="indefinite" values={generateWaveValues(fillY + 5) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.7" d={getInitialWavePath(fillY + 10) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-2s" repeatCount="indefinite" values={generateWaveValues(fillY + 10) || 'M0 0'} />
        </path>
      </g>
    </svg>
  );
}

// Passion Heart SVG with 3-layer wave animation
function PassionIcon({ color, fillPercent, uniqueId }: { color: string; fillPercent: number; uniqueId: string }) {
  const fillY = 107 - (fillPercent * 0.9);

  return (
    <svg height="107" width="187" fill="none" viewBox="0 0 187 107" xmlns="http://www.w3.org/2000/svg">
      {/* Heart shape background */}
      <path
        d="M142.627 42.1816C142.464 45.0132 141.931 47.7854 141.099 50.4932C132.845 77.3165 94.9844 97.3182 93.4985 98.0954V98.1202C93.4985 98.1202 93.491 98.1152 93.4762 98.1078C93.4613 98.1128 93.4539 98.1202 93.4539 98.1202V98.0954C92.2429 97.4643 67.0865 84.1751 53.233 64.854C49.6866 59.9062 46.8832 54.5648 45.4072 48.9413C44.4513 45.3102 44.0575 41.5603 44.372 37.7238C47.2175 3.34389 82.265 4.14089 93.4762 19.4423C104.687 4.14089 139.735 3.34141 142.578 37.7214C142.702 39.2238 142.719 40.7089 142.627 42.1816Z"
        fill={PILLAR_CONFIG.passion.bgLight}
      />

      <defs>
        <clipPath id={`heartClip-${uniqueId}`}>
          <path d="M142.627 42.1816C142.464 45.0132 141.931 47.7854 141.099 50.4932C132.845 77.3165 94.9844 97.3182 93.4985 98.0954V98.1202C93.4985 98.1202 93.491 98.1152 93.4762 98.1078C93.4613 98.1128 93.4539 98.1202 93.4539 98.1202V98.0954C92.2429 97.4643 67.0865 84.1751 53.233 64.854C49.6866 59.9062 46.8832 54.5648 45.4072 48.9413C44.4513 45.3102 44.0575 41.5603 44.372 37.7238C47.2175 3.34389 82.265 4.14089 93.4762 19.4423C104.687 4.14089 139.735 3.34141 142.578 37.7214C142.702 39.2238 142.719 40.7089 142.627 42.1816Z" />
        </clipPath>
        <mask id={`passionMask-${uniqueId}`}>
          <rect x="0" y={fillY} width="187" height={107 - fillY} fill="white" />
        </mask>
      </defs>

      {/* 3-layer waves - with inline fallbacks */}
      <g clipPath={`url(#heartClip-${uniqueId})`} mask={`url(#passionMask-${uniqueId})`}>
        <path fill={color} opacity="0.3" d={getInitialWavePath(fillY) || 'M0 0'}>
          <animate attributeName="d" dur="3s" repeatCount="indefinite" values={generateWaveValues(fillY) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.5" d={getInitialWavePath(fillY + 5) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-1s" repeatCount="indefinite" values={generateWaveValues(fillY + 5) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.7" d={getInitialWavePath(fillY + 10) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-2s" repeatCount="indefinite" values={generateWaveValues(fillY + 10) || 'M0 0'} />
        </path>
      </g>
    </svg>
  );
}

// Service Users SVG with 3-layer wave animation
function ServiceIcon({ color, fillPercent, uniqueId }: { color: string; fillPercent: number; uniqueId: string }) {
  const fillY = 107 - (fillPercent * 0.85);

  return (
    <svg height="107" width="185" fill="none" viewBox="0 0 185 107" xmlns="http://www.w3.org/2000/svg">
      {/* Users shape background - multiple parts */}
      <path d="M133.489 34.8629C133.489 45.9405 124.503 54.9239 113.415 54.9239C107.822 54.9239 102.761 52.637 99.1178 48.9462C102.255 44.4116 104.09 38.9184 104.09 33.0032C104.09 28.0857 102.821 23.4572 100.588 19.4278C104.064 16.5367 108.536 14.7994 113.415 14.7994C124.501 14.7994 133.489 23.7802 133.489 34.8629Z" fill={PILLAR_CONFIG.service.bgLight} />
      <path d="M137.523 90.4507H118.236C118.765 87.6056 118.439 84.6239 117.225 81.8811C116.096 79.3387 114.72 76.94 113.12 74.7105C109.407 69.5066 104.505 65.2191 98.8314 62.0912C103.256 60.1791 108.2 59.114 113.417 59.114C127.782 59.114 140.08 67.2073 145.164 78.6803C145.566 79.5814 145.793 80.5064 145.865 81.415C146.246 86.0852 142.595 90.4483 137.526 90.4483L137.523 90.4507Z" fill={PILLAR_CONFIG.service.bgLight} />
      <path d="M75.9617 56.2773C88.8229 56.2773 99.2495 45.8565 99.2495 33.0024C99.2495 20.1474 88.8229 9.72656 75.9617 9.72656C63.1005 9.72656 52.6738 20.1474 52.6738 33.0024C52.6738 45.8565 63.1005 56.2773 75.9617 56.2773Z" fill={PILLAR_CONFIG.service.bgLight} />
      <path d="M103.93 97.4947H47.9958C40.9673 97.4947 36.2842 90.2666 39.1326 83.8445C41.3895 78.7523 44.8686 74.2358 49.2415 70.6001C56.2963 64.7232 65.6699 61.1421 75.9617 61.1421C89.2497 61.1421 101.011 67.1122 108.224 76.2804C110.059 78.6094 111.599 81.1484 112.793 83.8445C115.636 90.2666 110.958 97.4947 103.93 97.4947Z" fill={PILLAR_CONFIG.service.bgLight} />

      <defs>
        <clipPath id={`serviceClip-${uniqueId}`}>
          <path d="M133.489 34.8629C133.489 45.9405 124.503 54.9239 113.415 54.9239C107.822 54.9239 102.761 52.637 99.1178 48.9462C102.255 44.4116 104.09 38.9184 104.09 33.0032C104.09 28.0857 102.821 23.4572 100.588 19.4278C104.064 16.5367 108.536 14.7994 113.415 14.7994C124.501 14.7994 133.489 23.7802 133.489 34.8629Z" />
          <path d="M137.523 90.4507H118.236C118.765 87.6056 118.439 84.6239 117.225 81.8811C116.096 79.3387 114.72 76.94 113.12 74.7105C109.407 69.5066 104.505 65.2191 98.8314 62.0912C103.256 60.1791 108.2 59.114 113.417 59.114C127.782 59.114 140.08 67.2073 145.164 78.6803C145.566 79.5814 145.793 80.5064 145.865 81.415C146.246 86.0852 142.595 90.4483 137.526 90.4483L137.523 90.4507Z" />
          <path d="M75.9617 56.2773C88.8229 56.2773 99.2495 45.8565 99.2495 33.0024C99.2495 20.1474 88.8229 9.72656 75.9617 9.72656C63.1005 9.72656 52.6738 20.1474 52.6738 33.0024C52.6738 45.8565 63.1005 56.2773 75.9617 56.2773Z" />
          <path d="M103.93 97.4947H47.9958C40.9673 97.4947 36.2842 90.2666 39.1326 83.8445C41.3895 78.7523 44.8686 74.2358 49.2415 70.6001C56.2963 64.7232 65.6699 61.1421 75.9617 61.1421C89.2497 61.1421 101.011 67.1122 108.224 76.2804C110.059 78.6094 111.599 81.1484 112.793 83.8445C115.636 90.2666 110.958 97.4947 103.93 97.4947Z" />
        </clipPath>
        <mask id={`serviceMask-${uniqueId}`}>
          <rect x="0" y={fillY} width="185" height={107 - fillY} fill="white" />
        </mask>
      </defs>

      {/* 3-layer waves - with inline fallbacks */}
      <g clipPath={`url(#serviceClip-${uniqueId})`} mask={`url(#serviceMask-${uniqueId})`}>
        <path fill={color} opacity="0.3" d={getInitialWavePath(fillY) || 'M0 0'}>
          <animate attributeName="d" dur="3s" repeatCount="indefinite" values={generateWaveValues(fillY) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.5" d={getInitialWavePath(fillY + 5) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-1s" repeatCount="indefinite" values={generateWaveValues(fillY + 5) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.7" d={getInitialWavePath(fillY + 10) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-2s" repeatCount="indefinite" values={generateWaveValues(fillY + 10) || 'M0 0'} />
        </path>
      </g>
    </svg>
  );
}

// Identity Fingerprint SVG with 3-layer wave animation (exact Phoenix paths)
function IdentityIcon({ color, fillPercent, uniqueId }: { color: string; fillPercent: number; uniqueId: string }) {
  const fillY = 90 - (fillPercent * 0.85);

  return (
    <svg width="80" height="89" viewBox="0 0 80 89" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fingerprint shape background paths (#DFE0E4) */}
      <path d="M79.5113 39.7328V59.3149C79.5113 60.9074 78.2168 62.2012 76.6234 62.2012C75.0301 62.2012 73.7356 60.9074 73.7356 59.3149V39.6123C73.6705 20.9409 58.4505 5.77248 39.7544 5.77248C22.4396 5.77248 8.10661 18.7847 6.03355 35.5383C5.8624 36.914 5.77563 38.3138 5.77563 39.7328V50.5695C5.77563 52.1644 4.48358 53.4557 2.88781 53.4557C1.29204 53.4557 0 52.1644 0 50.5695V39.7328C0 38.8414 0.0289261 37.9548 0.0891893 37.0778C1.45837 16.4019 18.7274 0 39.7544 0C60.7815 0 78.8556 17.1753 79.4944 38.5306C79.5064 38.9305 79.5113 39.3305 79.5113 39.7328Z" fill={PILLAR_CONFIG.identity.bgLight} />
      <path d="M59.2082 19.9746C58.2054 21.2129 56.3878 21.4033 55.1464 20.3986C50.7978 16.8763 45.3115 14.9369 39.7046 14.9369C27.5748 14.9369 17.4699 23.7739 15.4981 35.3454C15.2691 36.6897 15.1485 38.0726 15.1485 39.482V39.6434C15.1437 39.6892 14.893 44.245 14.893 48.372C14.893 53.6795 14.2108 61.3264 8.31228 66.4098C7.7675 66.8796 7.09497 67.1085 6.42725 67.1085C5.61731 67.1085 4.80979 66.7688 4.23849 66.1087C3.19714 64.8993 3.33213 63.0779 4.53981 62.0371C8.59672 58.5413 9.1174 52.8989 9.1174 48.372C9.1174 44.3366 9.33917 40.0554 9.37532 39.4025C9.37774 37.9546 9.4838 36.5283 9.68628 35.1334C11.8003 20.4685 24.458 9.16443 39.7046 9.16443C46.6324 9.16443 53.4084 11.5616 58.7839 15.9151C60.0229 16.9173 60.2133 18.7362 59.2082 19.9746Z" fill={PILLAR_CONFIG.identity.bgLight} />
      <path d="M70.0367 59.2643C70.0319 63.266 69.3112 67.0654 67.8962 70.5563C67.4406 71.6766 66.3607 72.3584 65.2181 72.3584C64.8565 72.3584 64.4901 72.291 64.1357 72.1464C62.6557 71.5489 61.9446 69.8649 62.5424 68.388C63.6802 65.5861 64.2563 62.5144 64.2611 59.2571C64.2635 56.195 64.2635 49.3335 64.2611 44.5585V39.4847C64.2611 34.8228 62.9498 30.2887 60.4693 26.3737C59.616 25.027 60.0162 23.2441 61.3636 22.3913C62.7111 21.5384 64.4949 21.9383 65.3482 23.2851C68.4144 28.1252 70.0367 33.7266 70.0367 39.4822V41.1783C70.0391 45.2162 70.0415 55.3445 70.0367 59.2643Z" fill={PILLAR_CONFIG.identity.bgLight} />
      <path d="M60.5625 39.2319V54.7497C60.5625 60.8064 59.6971 66.6705 57.9905 72.1779C56.0066 78.5744 53.2393 83.6723 49.7682 87.3343C49.2017 87.9318 48.4375 88.233 47.6734 88.233C46.9599 88.233 46.244 87.9703 45.6847 87.4427C44.5277 86.3465 44.4795 84.5179 45.5762 83.3615C48.4327 80.35 50.7541 76.011 52.4728 70.4698C54.0083 65.5165 54.7869 60.2258 54.7869 54.7497V39.2319C54.7869 35.194 53.2128 31.3947 50.3539 28.535C47.524 25.709 43.7611 24.1357 39.762 24.1068H39.6608C35.7461 24.1068 32.0194 25.668 29.1581 28.5085C26.4993 31.1466 24.865 34.6809 24.5709 38.3525C24.5396 38.7501 24.5227 39.15 24.5227 39.5499V43.5155C24.5227 45.1104 23.2282 46.4017 21.6349 46.4017C20.0415 46.4017 18.7471 45.1104 18.7471 43.5155V39.5499C18.7471 38.3814 18.8459 37.2202 19.0436 36.0734C19.7812 31.7031 21.8952 27.5809 25.0868 24.4128C29.04 20.4906 34.2106 18.3344 39.6584 18.3344H39.803C45.328 18.3729 50.5251 20.546 54.4398 24.4538C58.3882 28.4049 60.5625 33.6521 60.5625 39.2319Z" fill={PILLAR_CONFIG.identity.bgLight} />
      <path d="M51.0905 38.9785C51.0905 40.5734 49.7985 41.8647 48.2027 41.8647C46.607 41.8647 45.3149 40.5734 45.3149 38.9785C45.3149 37.3836 44.7195 36.0224 43.6396 34.943C42.5597 33.8637 41.0796 33.2542 39.5345 33.2735C36.4225 33.3072 33.8914 35.9645 33.8914 39.1977V56.2068C33.8914 60.6373 32.9224 64.9787 31.088 68.7636C28.9715 73.1339 26.0162 76.4587 22.3016 78.6462C21.8412 78.9185 21.3374 79.0486 20.8384 79.0486C19.8501 79.0486 18.8859 78.5402 18.3484 77.6271C17.5384 76.2539 17.994 74.4831 19.368 73.6736C22.0847 72.0739 24.2783 69.5755 25.8909 66.2484C27.3469 63.2441 28.1158 59.77 28.1158 56.2068V39.1977C28.1158 32.8181 33.2093 27.5708 39.4694 27.501C42.5959 27.4697 45.5222 28.6574 47.7255 30.8594C49.8949 33.0301 51.0905 35.914 51.0905 38.9785Z" fill={PILLAR_CONFIG.identity.bgLight} />
      <path d="M51.5339 47.4232V51.2828C51.5339 52.8753 50.2395 54.169 48.6461 54.169C47.0528 54.169 45.7583 52.8753 45.7583 51.2828V47.4232C45.7583 45.8307 47.0503 44.537 48.6461 44.537C50.2419 44.537 51.5339 45.8307 51.5339 47.4232Z" fill={PILLAR_CONFIG.identity.bgLight} />
      <path d="M42.6701 38.8797C42.6701 39.2049 42.6652 44.245 42.605 48.8731C42.5712 51.4365 42.5206 53.8698 42.4411 55.3105C42.053 62.4081 40.9248 71.3631 35.5855 77.6681C35.0142 78.3426 34.1995 78.6896 33.3799 78.6896C32.7194 78.6896 32.0565 78.4655 31.5141 78.0078C30.2968 76.9766 30.145 75.1577 31.1767 73.9386C35.4047 68.9443 36.3352 61.1914 36.6727 54.9949C36.7691 53.241 36.8221 49.8031 36.8535 46.553C36.892 42.6116 36.8944 38.9423 36.8944 38.8773C36.8944 37.2824 38.1865 35.991 39.7823 35.991C40.5801 35.991 41.3033 36.3163 41.824 36.8391C42.3471 37.3595 42.6701 38.0822 42.6701 38.8797Z" fill={PILLAR_CONFIG.identity.bgLight} />

      {/* 3 accent paths at bottom - the missing vectors (#9698A6) */}
      <path d="M18.0365 70.7709C16.366 72.5778 14.546 73.9968 12.6224 74.987C12.2006 75.2063 11.7474 75.3099 11.3014 75.3099C10.2553 75.3099 9.24527 74.7389 8.73182 73.7439C8.00143 72.3272 8.56068 70.5878 9.97807 69.8578C11.299 69.176 12.5814 68.1665 13.7915 66.8559C16.9879 63.3939 18.7476 58.7489 18.7476 53.7739V52.4801C18.7476 50.8852 20.0396 49.5939 21.6354 49.5939C23.2311 49.5939 24.5232 50.8852 24.5232 52.4801V53.7739C24.5232 60.2041 22.2187 66.2392 18.0365 70.7709Z" fill={color} />
      <path d="M51.4306 60.0861C51.4041 60.792 50.6447 77.471 38.1654 88.0257C37.6231 88.4835 36.9602 88.7075 36.3021 88.7075C35.4825 88.7075 34.6678 88.3606 34.0965 87.686C33.0648 86.4694 33.2166 84.648 34.4339 83.6193C44.9294 74.7413 45.6525 60.0138 45.6574 59.8668C45.7224 58.2767 47.0627 57.0336 48.6561 57.0986C50.247 57.1589 51.4884 58.496 51.4306 60.0861Z" fill={color} />
      <path d="M64.8534 78.3092C64.6991 78.7549 63.2914 82.7229 61.8957 84.8237C61.3413 85.6621 60.4229 86.1151 59.4876 86.1151C58.9404 86.1151 58.386 85.9585 57.8942 85.6332C56.566 84.7515 56.202 82.9614 57.0843 81.6315C57.834 80.5016 58.9042 77.8249 59.4032 76.4035C59.9287 74.9002 61.5775 74.1075 63.0817 74.6327C64.5883 75.1604 65.3813 76.8059 64.8534 78.3092Z" fill={color} />

      <defs>
        <clipPath id={`identityClip-${uniqueId}`}>
          <path d="M79.5113 39.7328V59.3149C79.5113 60.9074 78.2168 62.2012 76.6234 62.2012C75.0301 62.2012 73.7356 60.9074 73.7356 59.3149V39.6123C73.6705 20.9409 58.4505 5.77248 39.7544 5.77248C22.4396 5.77248 8.10661 18.7847 6.03355 35.5383C5.8624 36.914 5.77563 38.3138 5.77563 39.7328V50.5695C5.77563 52.1644 4.48358 53.4557 2.88781 53.4557C1.29204 53.4557 0 52.1644 0 50.5695V39.7328C0 38.8414 0.0289261 37.9548 0.0891893 37.0778C1.45837 16.4019 18.7274 0 39.7544 0C60.7815 0 78.8556 17.1753 79.4944 38.5306C79.5064 38.9305 79.5113 39.3305 79.5113 39.7328Z" />
          <path d="M59.2082 19.9746C58.2054 21.2129 56.3878 21.4033 55.1464 20.3986C50.7978 16.8763 45.3115 14.9369 39.7046 14.9369C27.5748 14.9369 17.4699 23.7739 15.4981 35.3454C15.2691 36.6897 15.1485 38.0726 15.1485 39.482V39.6434C15.1437 39.6892 14.893 44.245 14.893 48.372C14.893 53.6795 14.2108 61.3264 8.31228 66.4098C7.7675 66.8796 7.09497 67.1085 6.42725 67.1085C5.61731 67.1085 4.80979 66.7688 4.23849 66.1087C3.19714 64.8993 3.33213 63.0779 4.53981 62.0371C8.59672 58.5413 9.1174 52.8989 9.1174 48.372C9.1174 44.3366 9.33917 40.0554 9.37532 39.4025C9.37774 37.9546 9.4838 36.5283 9.68628 35.1334C11.8003 20.4685 24.458 9.16443 39.7046 9.16443C46.6324 9.16443 53.4084 11.5616 58.7839 15.9151C60.0229 16.9173 60.2133 18.7362 59.2082 19.9746Z" />
          <path d="M70.0367 59.2643C70.0319 63.266 69.3112 67.0654 67.8962 70.5563C67.4406 71.6766 66.3607 72.3584 65.2181 72.3584C64.8565 72.3584 64.4901 72.291 64.1357 72.1464C62.6557 71.5489 61.9446 69.8649 62.5424 68.388C63.6802 65.5861 64.2563 62.5144 64.2611 59.2571C64.2635 56.195 64.2635 49.3335 64.2611 44.5585V39.4847C64.2611 34.8228 62.9498 30.2887 60.4693 26.3737C59.616 25.027 60.0162 23.2441 61.3636 22.3913C62.7111 21.5384 64.4949 21.9383 65.3482 23.2851C68.4144 28.1252 70.0367 33.7266 70.0367 39.4822V41.1783C70.0391 45.2162 70.0415 55.3445 70.0367 59.2643Z" />
          <path d="M60.5625 39.2319V54.7497C60.5625 60.8064 59.6971 66.6705 57.9905 72.1779C56.0066 78.5744 53.2393 83.6723 49.7682 87.3343C49.2017 87.9318 48.4375 88.233 47.6734 88.233C46.9599 88.233 46.244 87.9703 45.6847 87.4427C44.5277 86.3465 44.4795 84.5179 45.5762 83.3615C48.4327 80.35 50.7541 76.011 52.4728 70.4698C54.0083 65.5165 54.7869 60.2258 54.7869 54.7497V39.2319C54.7869 35.194 53.2128 31.3947 50.3539 28.535C47.524 25.709 43.7611 24.1357 39.762 24.1068H39.6608C35.7461 24.1068 32.0194 25.668 29.1581 28.5085C26.4993 31.1466 24.865 34.6809 24.5709 38.3525C24.5396 38.7501 24.5227 39.15 24.5227 39.5499V43.5155C24.5227 45.1104 23.2282 46.4017 21.6349 46.4017C20.0415 46.4017 18.7471 45.1104 18.7471 43.5155V39.5499C18.7471 38.3814 18.8459 37.2202 19.0436 36.0734C19.7812 31.7031 21.8952 27.5809 25.0868 24.4128C29.04 20.4906 34.2106 18.3344 39.6584 18.3344H39.803C45.328 18.3729 50.5251 20.546 54.4398 24.4538C58.3882 28.4049 60.5625 33.6521 60.5625 39.2319Z" />
          <path d="M51.0905 38.9785C51.0905 40.5734 49.7985 41.8647 48.2027 41.8647C46.607 41.8647 45.3149 40.5734 45.3149 38.9785C45.3149 37.3836 44.7195 36.0224 43.6396 34.943C42.5597 33.8637 41.0796 33.2542 39.5345 33.2735C36.4225 33.3072 33.8914 35.9645 33.8914 39.1977V56.2068C33.8914 60.6373 32.9224 64.9787 31.088 68.7636C28.9715 73.1339 26.0162 76.4587 22.3016 78.6462C21.8412 78.9185 21.3374 79.0486 20.8384 79.0486C19.8501 79.0486 18.8859 78.5402 18.3484 77.6271C17.5384 76.2539 17.994 74.4831 19.368 73.6736C22.0847 72.0739 24.2783 69.5755 25.8909 66.2484C27.3469 63.2441 28.1158 59.77 28.1158 56.2068V39.1977C28.1158 32.8181 33.2093 27.5708 39.4694 27.501C42.5959 27.4697 45.5222 28.6574 47.7255 30.8594C49.8949 33.0301 51.0905 35.914 51.0905 38.9785Z" />
          <path d="M51.5339 47.4232V51.2828C51.5339 52.8753 50.2395 54.169 48.6461 54.169C47.0528 54.169 45.7583 52.8753 45.7583 51.2828V47.4232C45.7583 45.8307 47.0503 44.537 48.6461 44.537C50.2419 44.537 51.5339 45.8307 51.5339 47.4232Z" />
          <path d="M42.6701 38.8797C42.6701 39.2049 42.6652 44.245 42.605 48.8731C42.5712 51.4365 42.5206 53.8698 42.4411 55.3105C42.053 62.4081 40.9248 71.3631 35.5855 77.6681C35.0142 78.3426 34.1995 78.6896 33.3799 78.6896C32.7194 78.6896 32.0565 78.4655 31.5141 78.0078C30.2968 76.9766 30.145 75.1577 31.1767 73.9386C35.4047 68.9443 36.3352 61.1914 36.6727 54.9949C36.7691 53.241 36.8221 49.8031 36.8535 46.553C36.892 42.6116 36.8944 38.9423 36.8944 38.8773C36.8944 37.2824 38.1865 35.991 39.7823 35.991C40.5801 35.991 41.3033 36.3163 41.824 36.8391C42.3471 37.3595 42.6701 38.0822 42.6701 38.8797Z" />
          {/* Include the 3 accent paths in clip for wave effect */}
          <path d="M18.0365 70.7709C16.366 72.5778 14.546 73.9968 12.6224 74.987C12.2006 75.2063 11.7474 75.3099 11.3014 75.3099C10.2553 75.3099 9.24527 74.7389 8.73182 73.7439C8.00143 72.3272 8.56068 70.5878 9.97807 69.8578C11.299 69.176 12.5814 68.1665 13.7915 66.8559C16.9879 63.3939 18.7476 58.7489 18.7476 53.7739V52.4801C18.7476 50.8852 20.0396 49.5939 21.6354 49.5939C23.2311 49.5939 24.5232 50.8852 24.5232 52.4801V53.7739C24.5232 60.2041 22.2187 66.2392 18.0365 70.7709Z" />
          <path d="M51.4306 60.0861C51.4041 60.792 50.6447 77.471 38.1654 88.0257C37.6231 88.4835 36.9602 88.7075 36.3021 88.7075C35.4825 88.7075 34.6678 88.3606 34.0965 87.686C33.0648 86.4694 33.2166 84.648 34.4339 83.6193C44.9294 74.7413 45.6525 60.0138 45.6574 59.8668C45.7224 58.2767 47.0627 57.0336 48.6561 57.0986C50.247 57.1589 51.4884 58.496 51.4306 60.0861Z" />
          <path d="M64.8534 78.3092C64.6991 78.7549 63.2914 82.7229 61.8957 84.8237C61.3413 85.6621 60.4229 86.1151 59.4876 86.1151C58.9404 86.1151 58.386 85.9585 57.8942 85.6332C56.566 84.7515 56.202 82.9614 57.0843 81.6315C57.834 80.5016 58.9042 77.8249 59.4032 76.4035C59.9287 74.9002 61.5775 74.1075 63.0817 74.6327C64.5883 75.1604 65.3813 76.8059 64.8534 78.3092Z" />
        </clipPath>
        <mask id={`identityMask-${uniqueId}`}>
          <rect x="0" y={fillY} width="80" height={89 - fillY} fill="white" />
        </mask>
      </defs>

      {/* 3-layer waves - with inline fallbacks */}
      <g clipPath={`url(#identityClip-${uniqueId})`} mask={`url(#identityMask-${uniqueId})`}>
        <path fill={color} opacity="0.3" d={getInitialWavePath(fillY) || 'M0 0'}>
          <animate attributeName="d" dur="3s" repeatCount="indefinite" values={generateWaveValues(fillY) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.5" d={getInitialWavePath(fillY + 5) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-1s" repeatCount="indefinite" values={generateWaveValues(fillY + 5) || 'M0 0'} />
        </path>
        <path fill={color} opacity="0.7" d={getInitialWavePath(fillY + 10) || 'M0 0'}>
          <animate attributeName="d" dur="3s" begin="-2s" repeatCount="indefinite" values={generateWaveValues(fillY + 10) || 'M0 0'} />
        </path>
      </g>
    </svg>
  );
}

// Single pillar card component
function PillarCard({
  name,
  score,
  color,
  boostBg,
  boostPercent,
  uniqueId,
  IconComponent,
}: {
  name: string;
  score: number;
  color: string;
  boostBg: string;
  boostPercent: number;
  uniqueId: string;
  IconComponent: React.ComponentType<{ color: string; fillPercent: number; uniqueId: string }>;
}) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        border: '1px solid #f4f3f2',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 8px',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#020202',
            letterSpacing: '-0.01em',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {name}
        </span>
        <div
          style={{
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: 'white',
            backgroundColor: color,
          }}
        >
          {Math.round(score)}%
        </div>
      </div>

      {/* Icon with wave animation */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 90,
          padding: '4px 0',
        }}
      >
        <div style={{ transform: 'scale(0.85)' }}>
          <IconComponent color={color} fillPercent={score} uniqueId={uniqueId} />
        </div>
      </div>

      {/* Footer - Boost available with proper padding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0 10px 12px',
          padding: '8px 10px',
          borderRadius: 8,
          backgroundColor: boostBg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 6,
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp style={{ width: 14, height: 14, color }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#475569' }}>
            Boost available
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>+{boostPercent}%</span>
          <ArrowRight style={{ width: 14, height: 14, color }} />
        </div>
      </div>
    </div>
  );
}

export const PillarCards: React.FC<PillarCardsProps> = ({
  aptitude,
  passion,
  community,
  narrative,
}) => {
  const pillars = [
    { key: 'aptitude', score: Math.max(0, Math.min(100, aptitude || 0)), IconComponent: AptitudeIcon, ...PILLAR_CONFIG.aptitude },
    { key: 'passion', score: Math.max(0, Math.min(100, passion || 0)), IconComponent: PassionIcon, ...PILLAR_CONFIG.passion },
    { key: 'service', score: Math.max(0, Math.min(100, community || 0)), IconComponent: ServiceIcon, ...PILLAR_CONFIG.service },
    { key: 'identity', score: Math.max(0, Math.min(100, narrative || 0)), IconComponent: IdentityIcon, ...PILLAR_CONFIG.identity },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 14,
        height: '100%',
        width: '100%',
      }}
    >
      {pillars.map((pillar) => (
        <PillarCard
          key={pillar.key}
          name={pillar.name}
          score={pillar.score}
          color={pillar.color}
          boostBg={pillar.boostBg}
          boostPercent={pillar.boostPercent}
          uniqueId={pillar.key}
          IconComponent={pillar.IconComponent}
        />
      ))}
    </div>
  );
};

export default PillarCards;
