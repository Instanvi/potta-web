'use client';
import ImprovedCustomNavbar from '../../../components/improved-custom-navbar';
import Sidebars from '@potta/app/sidebar';
import Navbar from './navbar';
import { useContext } from 'react';
import { ContextData } from '../../../components/providers/DataProvider';
import { INSTANVI_APPS, SUPER_APP_URL } from '@/lib/constants/apps';
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
              useSidebar ? (context?.toggle ? 'w-full pl-[72px]' : 'w-full pl-[200px]') : 'w-full'
            }`}
          >
            <div className="relative mx-0 flex min-h-0 min-w-0 flex-1 flex-col">
              {useSidebar ? <Navbar /> : <ImprovedCustomNavbar />}
              <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">{children}</main>
            </div>
          </div>
        </div>
      </div>

      {/* Right rail: links to the other Instanvi apps */}
      <div className="flex h-screen w-14 shrink-0 flex-col items-center border-l border-slate-100 bg-white">
        <div className="flex w-full flex-col items-center gap-0.5 pt-12">
          <a
            href={SUPER_APP_URL}
            title="Instanvi"
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-slate-100"
          >
            <img src="/icons/instanvi.svg" alt="Instanvi" width={20} height={20} className="shrink-0" />
          </a>
          {INSTANVI_APPS.map((app) => (
            <a
              key={app.id}
              href={app.url}
              title={app.name}
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-slate-100"
            >
              <img src={app.logo} alt={app.name} width={20} height={20} className="shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
