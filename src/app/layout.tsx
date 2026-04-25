import type { Metadata } from 'next';
import './globals.css';
import 'remixicon/fonts/remixicon.css';
import 'react-accessible-accordion/dist/fancy-example.css';

import { AppProviders } from '@potta/components/providers/AppProviders';

import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600'],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans bg-[#F8F9FA] antialiased`}
      >
        <Suspense fallback={null}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
      </body>
    </html>
  );
}
