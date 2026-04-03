'use client';
import ImprovedCustomNavbar from '../../../components/improved-custom-navbar';
import Sidebars from './sidebar';
import Navbar from './navbar';
import { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ContextData } from '../../../components/providers/DataProvider';
import { Toaster } from 'sonner';
import PottaLoader from '../../../components/pottaloader';
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

  console.log(context?.layoutMode);
  // Show loader until layout is loaded from localStorage
  if (!context?.isLayoutLoaded) {
    return (
      <div className="relative flex w-full h-screen bg-white">
        <PottaLoader size="lg" />
      </div>
    );
  }

  // Determine if sidebar should be forced
  const forceSidebar = isReports;
  const isSettingsPolicies = pathname.startsWith('/settings/policies');
  const useSidebar = forceSidebar || context?.layoutMode === 'sidebar';

  return (
    <div className="relative flex w-full h-screen">
      <div className="transition-all flex duration-500 ease-in-out w-full">
        <div className="w-full overflow-hidden z-10 flex">
          {/* Sidebar - always show but collapsed when ChatAI is open */}
          {useSidebar && (
            <div className="fixed z-50">
              <Sidebars />
            </div>
          )}

          <div
            className={`flex duration-500 ease-in-out ${
              useSidebar
                ? show || context?.toggle
                  ? 'flex w-full pl-[35px]' // When ChatAI is open OR sidebar is collapsed
                  : isSettingsPolicies || isReports
                  ? 'pl-[150px] w-full'
                  : 'pl-[170px] w-full'
                : 'w-full'
            }`}
          >
            <div className="w-full relative mx-0">
              {/* Navigation Bar */}
              {/* {!isHome && ( */}
              <>
                {useSidebar && <Navbar showChatAI={show} />}
                {!useSidebar && <ImprovedCustomNavbar />}
              </>
              {/* )} */}

              <Toaster position="top-center" />
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* ChatAI Sidebar */}
      <div
        className={`${
          show ? 'w-[600x]' : 'w-0'
        } transition-all duration-500 ease-in-out overflow-hidden  fixed right-0 top-0 h-full z-50`}
      >
        <ChatAI onClose={toggleChatAI} />
      </div>

      {/* ChatAI Toggle Button */}
      <div className={`w-[68px] ${show ? 'fixed' : ''} right-0`}>
        <div className={`bg-white h-screen flex justify-center`}>
          <div>
            <div className="">
              <div className="mt-12">
                <div className="cursor-pointer flex justify-center w-10 items-center hover:bg-gray-200 h-10">
                  <img
                    src={'/icons/instanvi.svg'}
                    alt="logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="cursor-pointer flex justify-center w-10 items-center hover:bg-gray-200 h-10">
                  <img
                    src={'/icons/talk.svg'}
                    alt="logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="cursor-pointer flex justify-center w-10 items-center hover:bg-gray-200 h-10">
                  <img
                    src={'/icons/Tribu.svg'}
                    alt="logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="cursor-pointer flex justify-center w-10 items-center hover:bg-gray-200 h-10">
                  <img
                    src={'/icons/Potta.svg'}
                    alt="logo"
                    width={16}
                    height={16}
                  />
                </div>
              </div>
            </div>
            <div className="mt-[30vh] ml-1.5">
              <button
                onClick={toggleChatAI}
                className="bg-green-700 text-white h-7 w-7 flex justify-center items-center"
              >
                {show ? (
                  <i className="ri-subtract-line text-lg"></i>
                ) : (
                  <i className="ri-add-line text-lg"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
