'use client';
import ImprovedCustomNavbar from '../../../components/improved-custom-navbar';
import Sidebars from '@potta/app/sidebar';
import Navbar from './navbar';
import { useContext } from 'react';
import { ContextData } from '../../../components/providers/DataProvider';
import React from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = false;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const context = useContext(ContextData);
  const useSidebar = context?.layoutMode === 'sidebar';

  return (
    <div className="relative flex h-screen min-h-0 w-full overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 transition-all duration-500 ease-in-out">
        <div className="z-10 flex min-h-0 min-w-0 flex-1">
          {useSidebar && (
            <div className="fixed z-50">
              <Sidebars />
            </div>
          )}

          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col duration-500 ease-in-out ${
              useSidebar ? (context?.toggle ? 'w-full pl-14' : 'w-full pl-[264px]') : 'w-full'
            }`}
          >
            <div className="relative mx-0 flex min-h-0 min-w-0 flex-1 flex-col">
              {useSidebar ? <Navbar /> : <ImprovedCustomNavbar />}
              <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
