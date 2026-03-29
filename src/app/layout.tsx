import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import 'remixicon/fonts/remixicon.css';
import 'react-accessible-accordion/dist/fancy-example.css';

import { AppProviders } from '@potta/components/providers/AppProviders';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#F8F9FA] antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
