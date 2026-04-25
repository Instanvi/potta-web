'use client';
import ImprovedCustomNavbar from '../../../components/improved-custom-navbar';
import Sidebars from '@potta/app/sidebar';
import Navbar from './navbar';
import { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ContextData } from '../../../components/providers/DataProvider';
import { Toaster } from 'sonner';
import ChatAI from '../../../app/chatai';
import React from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isReports = pathname.startsWith('/reports');
  const context = useContext(ContextData);

  const toggleChatAI = () => {
    setShow(!show);
  };

  // Determine if sidebar should be forced
  const forceSidebar = isReports;
  const isSettingsPolicies = pathname.startsWith('/settings/policies');
  const useSidebar = forceSidebar || context?.layoutMode === 'sidebar';

  return (
    <div className="relative flex h-screen min-h-0 w-full overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 transition-all duration-500 ease-in-out">
        <div className="z-10 flex min-h-0 min-w-0 flex-1">
          {/* Sidebar - always show but collapsed when ChatAI is open */}
          {useSidebar && (
            <div className="fixed z-50">
              <Sidebars />
            </div>
          )}

          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col duration-500 ease-in-out ${
              useSidebar
                ? context?.toggle
                  ? 'w-full pl-[72px]' // collapsed rail (~65px) + border
                  : isSettingsPolicies || isReports
                  ? 'w-full pl-[180px]' // 180px section sidebars
                  : 'w-full pl-[200px]' // expanded default (200px sidebars)
                : 'w-full'
            }`}
          >
            <div className="relative mx-0 flex min-h-0 min-w-0 flex-1 flex-col">
              {/* Navigation Bar */}
              {/* {!isHome && ( */}
              <>
                {useSidebar && <Navbar showChatAI={show} />}
                {!useSidebar && <ImprovedCustomNavbar />}
              </>
              {/* )} */}

              <Toaster position="top-center" />
              <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* ChatAI Sidebar */}
      <div
        className={`${
          show ? 'w-[600px]' : 'w-0'
        } fixed right-0 top-0 z-50 h-full overflow-hidden transition-all duration-500 ease-in-out`}
      >
        <ChatAI onClose={toggleChatAI} />
      </div>

      {/* Right app rail: aligned column + chat toggle */}
      <div
        className={`flex h-screen w-14 shrink-0 flex-col items-center border-l border-slate-100 bg-white ${
          show ? 'fixed' : ''
        } right-0 top-0 z-40`}
      >
        <div className="flex w-full flex-col items-center gap-0.5 pt-12">
          {(
            [
              { src: '/icons/instanvi.svg', alt: 'Instanvi' },
              { src: '/icons/talk.svg', alt: 'Messages' },
              { src: '/icons/Tribu.svg', alt: 'Tribu' },
              { src: '/icons/Potta.svg', alt: 'Potta' },
            ] as const
          ).map(({ src, alt }) => (
            <div
              key={src}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md hover:bg-slate-100"
            >
              <img src={src} alt={alt} width={20} height={20} className="shrink-0" />
            </div>
          ))}
        </div>
        <div className="min-h-0 flex-1" aria-hidden />
        <div className="flex w-full justify-center pb-6">
          <button
            type="button"
            onClick={toggleChatAI}
            className="flex h-9 w-9 shrink-0 items-center justify-center bg-green-700 text-white shadow-sm hover:bg-green-800"
            aria-label={show ? 'Close assistant' : 'Open assistant'}
          >
            {show ? (
              <i className="ri-subtract-line text-lg leading-none" />
            ) : (
              <i className="ri-add-line text-lg leading-none" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
