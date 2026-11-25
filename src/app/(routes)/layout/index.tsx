'use client';
import ImprovedCustomNavbar from '../../../components/improved-custom-navbar';
import Sidebars from '@potta/app/sidebar';
import Navbar from './navbar';
import { Suspense, useContext } from 'react';
import { ContextData } from '../../../components/providers/DataProvider';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const context = useContext(ContextData);
  const useSidebar = context?.layoutMode === 'sidebar';
  // Keep a stable content offset: rail only (56) vs rail + links panel (264).
  // Dashboards/Home use the same shell as every other module — no top-nav swap.
  const contentPad = useSidebar
    ? context?.toggle
      ? 'w-full pl-14'
      : 'w-full pl-[264px]'
    : 'w-full';

  return (
    <div className="relative flex h-screen min-h-0 w-full overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1">
        <div className="z-10 flex min-h-0 min-w-0 flex-1">
          {useSidebar && (
            <div className="fixed z-50">
              <Suspense fallback={null}>
                <Sidebars />
              </Suspense>
            </div>
          )}

          <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${contentPad}`}>
            <div className="relative mx-0 flex min-h-0 min-w-0 flex-1 flex-col">
              {useSidebar ? (
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
              ) : (
                <ImprovedCustomNavbar />
              )}
              <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--main-bg)]">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
