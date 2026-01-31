import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { AnalyticsProvider } from '@/lib/analytics';
import { FeedbackProvider, ToastContainer } from '@/lib/feedback';
import { InsightsProvider } from '@/components/insights';
import { NotificationInsightCard } from '@/components/insights/NotificationInsightCard';
import { ClearStaleData } from '@/components/common/ClearStaleData';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IvyQuest v3.0 | College Admissions Assessment',
  description: 'Discover your Ivy+ Ready Score and build your path to elite universities.',
  keywords: ['college admissions', 'ivy league', 'assessment', 'college counseling'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} min-h-screen antialiased`}>
        {/* Clear stale localStorage on version changes */}
        <ClearStaleData />
        <QueryProvider>
        <AuthProvider>
          <AnalyticsProvider
            config={{
              enableTracking: true,
              trackInteractions: true,
              trackTiming: true,
            }}
          >
            <FeedbackProvider
              config={{
                maxToasts: 5,
              }}
            >
              <InsightsProvider>
                {/* Main Content - No dark wrapper */}
                <div className="relative min-h-screen">
                  {children}
                </div>
              </InsightsProvider>

              {/* Global toast container */}
              <ToastContainer />

              {/* Floating notification system */}
              <NotificationInsightCard />
            </FeedbackProvider>
          </AnalyticsProvider>
        </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
