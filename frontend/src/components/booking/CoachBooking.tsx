'use client';

/**
 * Coach Booking Component
 *
 * Allows users to schedule a consultation with a coach via Calendly.
 * Pre-fills student context for personalized preparation.
 *
 * @version 1.0.0
 */

import { useState } from 'react';
import { useStudentStore } from '@/lib/store/useStudentStore';
import {
  generateCalendlyURL,
  openCalendlyPopup,
  isPopupBlocked,
  validateEmail,
} from '@/lib/utils/calendly';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { Calendar, Check, Mail, AlertCircle, ExternalLink } from 'lucide-react';

const CALENDLY_BASE_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || '';

interface CoachBookingProps {
  compact?: boolean;
}

export default function CoachBooking({ compact = false }: CoachBookingProps) {
  const { profile } = useStudentStore();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSchedule = async () => {
    // Validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!CALENDLY_BASE_URL) {
      setError('Booking system not configured. Please contact support.');
      console.error('NEXT_PUBLIC_CALENDLY_URL not set in environment variables');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Generate Calendly URL with student context
      const calendlyURL = generateCalendlyURL(CALENDLY_BASE_URL, {
        name: profile.identity?.name || 'Student',
        grade: typeof profile.identity?.grade === 'number' ? profile.identity.grade : 9,
        email: email,
        archetype: profile.classification?.archetype || 'Explorer',
        tier: profile.classification?.tier || 'fresh-start',
        completeness: profile.completeness?.score || 0,
      });

      // Open Calendly in popup
      const popup = openCalendlyPopup(calendlyURL);

      // Check if popup was blocked
      if (isPopupBlocked(popup)) {
        setError('Popup was blocked. Please allow popups and try again.');
        setIsSubmitting(false);
        return;
      }

      // Show success state
      setShowSuccess(true);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Error opening booking window. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(22, 163, 74, 0.08)',
          border: '2px solid #22c55e',
          borderRadius: 16,
          padding: compact ? 20 : 32,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            backgroundColor: '#22c55e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Check size={32} color="white" />
        </div>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#166534',
            marginBottom: 8,
          }}
        >
          Booking Window Opened!
        </h3>
        <p
          style={{
            fontSize: 14,
            color: '#166534',
            marginBottom: 16,
          }}
        >
          Complete your booking in the popup window. You'll receive an email confirmation with your
          game plan attached.
        </p>
        <button
          onClick={() => setShowSuccess(false)}
          style={{
            fontSize: 13,
            color: '#166534',
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Didn't see the popup? Click here to try again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: `2px solid ${BRAND_COLORS.borderLight}`,
        borderRadius: 16,
        padding: compact ? 20 : 32,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: compact ? 16 : 24 }}>
        <div
          style={{
            width: 64,
            height: 64,
            backgroundColor: BRAND_COLORS.primaryBg,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Calendar size={28} color={BRAND_COLORS.primary} />
        </div>
        <h3
          style={{
            fontSize: compact ? 18 : 22,
            fontWeight: 700,
            color: BRAND_COLORS.textHeading,
            marginBottom: 8,
          }}
        >
          Schedule Your Coach Call
        </h3>
        <p style={{ fontSize: 14, color: BRAND_COLORS.textPrimary }}>
          Get personalized guidance on your game plan
        </p>
        <p style={{ fontSize: 12, color: BRAND_COLORS.textMuted, marginTop: 4 }}>
          (30 min, free consultation)
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid #dc2626',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: BRAND_COLORS.textPrimary,
            marginBottom: 8,
          }}
        >
          Your Email <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <Mail
            size={18}
            color={BRAND_COLORS.textMuted}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="student@email.com"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: `1px solid ${BRAND_COLORS.borderLight}`,
              borderRadius: 8,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleSchedule}
        disabled={isSubmitting || !email}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '14px 24px',
          backgroundColor: BRAND_COLORS.primary,
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: isSubmitting || !email ? 'not-allowed' : 'pointer',
          opacity: isSubmitting || !email ? 0.6 : 1,
        }}
      >
        <Calendar size={18} />
        {isSubmitting ? 'Opening Booking...' : 'Schedule Now'}
        <ExternalLink size={16} />
      </button>

      <p
        style={{
          fontSize: 11,
          color: BRAND_COLORS.textMuted,
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        We'll pre-fill your information so coaches can prepare.
        <br />
        Your game plan will be attached to the calendar invite.
      </p>
    </div>
  );
}
