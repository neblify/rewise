import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Nunito, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { Footer } from './_components/landing/Footer';

import { DevTools } from './_components/DevTools';
import { MotionProvider } from './_components/MotionProvider';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ReWise - Smart Education Platform',
  description: 'ReWise - Smart Education Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
        variables: {
          colorPrimary: '#19b7cf',
          borderRadius: '1rem',
          fontFamily: 'Nunito, system-ui, sans-serif',
        },
      }}
    >
      <html lang="en">
        <body
          className={`${nunito.variable} ${jetbrainsMono.variable} antialiased`}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Skip to main content
          </a>
          <MotionProvider>
            {children}
          </MotionProvider>
          <DevTools />
          <Footer />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
