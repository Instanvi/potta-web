import type { Metadata } from 'next';
import './globals.css';
import 'remixicon/fonts/remixicon.css';
import 'react-accessible-accordion/dist/fancy-example.css';

import { AppProviders } from '@potta/components/providers/AppProviders';
import NextTopLoader from 'nextjs-toploader';

import { Inter } from 'next/font/google';

// Same family as the hub (instanvi-auth-frontend). Variable font: every weight 100–900 is available.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Potta',
  description: 'Potta App',
  icons: {
    icon: '/icons/Potta.svg',
    shortcut: '/icons/Potta.svg',
    apple: '/icons/Potta.svg',
  },
};

import { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-[var(--main-bg)] antialiased">
        <NextTopLoader
          color="#0b5d1e"
          height={2}
          showSpinner={false}
          crawlSpeed={150}
          speed={200}
          shadow={false}
        />
        <Suspense fallback={null}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
      </body>
    </html>
  );
}
