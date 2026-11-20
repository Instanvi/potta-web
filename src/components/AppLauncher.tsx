'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { AppLauncherIcons } from './AppLauncherIcons';

interface AppItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const AppLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use only the urlRouters array from navbar with custom icons
  const apps: AppItem[] = [
    // {
    //   value: '',
    //   label: 'Home',
    //   icon: AppLauncherIcons.home,
    // },
    {
      value: 'account_payables',
      label: 'AP',
      icon: AppLauncherIcons.payables,
    },
    {
      value: 'account_receivables',
      label: 'AR',
      icon: AppLauncherIcons.receivables,
    },
    {
      value: 'treasury',
      label: 'Treasury',
      icon: AppLauncherIcons.treasury,
    },
    {
      value: 'payroll',
      label: 'Payroll',
      icon: AppLauncherIcons.payroll,
    },
    {
      value: 'pos',
      label: 'Trade',
      icon: AppLauncherIcons.pos,
    },
    {
      value: 'accounting',
      label: 'Accounting',
      icon: AppLauncherIcons.accounting,
    },
    {
      value: 'reports/dashboard',
      label: 'FP & A',
      icon: AppLauncherIcons.reports,
    },
    // {
    //   value: 'settings',
    //   label: 'Settings',
    //   icon: AppLauncherIcons.settings,
    // },
  ];

  // Check if current path matches app path
  const isCurrentApp = (appValue: string) => {
    if (appValue === '' && pathname === '/') return true;
    if (appValue !== '' && pathname.startsWith(`/${appValue}`)) return true;
    return false;
  };

  // Get current active app
  const getCurrentApp = () => {
    return apps.find((app) => isCurrentApp(app.value)) || apps[0];
  };

  const handleAppClick = (app: AppItem) => {
    const path = app.value === '' ? '/' : `/${app.value}`;
    router.push(path);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, app: AppItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAppClick(app);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentApp = getCurrentApp();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* App Launcher Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-1 py-0.5 rounded-full border border-gray-200 hover:bg-[#F3FBFB] transition-all duration-200 group"
        aria-label="Open app launcher"
      >
        {/* Current App Icon */}
        <div
          className={`flex items-center justify-center ${
            currentApp.value === '' ? 'w-8 h-2' : 'w-10 h-10'
          }`}
        >
          {currentApp.icon}
        </div>

        {/* Current App Name */}
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
          {currentApp.label}
        </span>

        {/* Chevron Icon */}
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* App Launcher Dropdown */}
      <div
        className={`absolute right-0 top-full mt-2 bg-white shadow-md border border-gray-100 overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
        style={{ minWidth: '360px' }}
      >
        {/* Apps Grid */}
        <div className="p-3">
          <div className="grid grid-cols-4 gap-1">
            {apps.map((app) => {
              const isActive = isCurrentApp(app.value);
              return (
                <button
                  key={app.value}
                  onClick={() => handleAppClick(app)}
                  onKeyDown={(e) => handleKeyDown(e, app)}
                  className={`group flex gap-0.5 flex-col items-center p-4 transition-all duration-200 !focus:outline-none !focus:ring-0 !focus:border-0 `}
                  tabIndex={0}
                  aria-label={`Open ${app.label}`}
                >
                  {/* App Icon */}
                  <div
                    className={`grid place-content-center group-hover:scale-[1.05] transition-transform duration-200 focus:outline-none focus:ring-0 focus:border-0 w-[3.3em] h-[3.3em]
                      `}
                  >
                    {app.icon}
                  </div>

                  {/* App Name */}
                  <span
                    className={`text-sm text-center transition-colors font-medium duration-200 ${
                      isActive
                        ? 'text-green-700 font-medium'
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}
                  >
                    {app.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 bg-green-800 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLauncher;
