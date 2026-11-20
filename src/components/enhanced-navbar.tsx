'use client';

import React, { useState, useContext } from 'react';
import {
  ChevronDown,
  Inbox,
  Bell,
  Menu,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ContextData } from './providers/DataProvider';
import { signOutWithAuthApi } from '@/lib/auth-sign-out';

// --- Constants ---

const SIDEBAR_OPTIONS = [
  { value: 'default', label: 'Default Sidebar' },
  { value: 'payments', label: 'Payments Sidebar' },
  { value: 'expenses', label: 'Expenses Sidebar' },
  { value: 'invoice', label: 'Invoice Sidebar' },
  { value: 'pos', label: 'POS Sidebar' },
  { value: 'payroll', label: 'Payroll Sidebar' },
  { value: 'accounts', label: 'Accounts Sidebar' },
  { value: 'reports', label: 'Reports Sidebar' },
];

const NAV_LINKS = [
  { href: '/payments', label: 'Payments' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/account_receivables', label: 'Invoice' },
  { href: '/pos', label: 'POS' },
  { href: '/payroll', label: 'Payroll' },
];

// --- Helpers ---

const getPageTitle = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length === 0) return 'Dashboard';

  const lastSegment = pathSegments[pathSegments.length - 1];
  return (
    lastSegment.charAt(0).toUpperCase() +
    lastSegment.slice(1).replace(/-/g, ' ')
  );
};

// --- Sub-components ---

const NavItem = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link
    href={href}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {label}
  </Link>
);

const SidebarSwitcher = ({ 
  isOpen, 
  onToggle, 
  onSelect, 
  activeSidebar 
}: { 
  isOpen: boolean; 
  onToggle: () => void; 
  onSelect: (value: string) => void;
  activeSidebar?: string;
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
    >
      <span>Sidebar</span>
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    {isOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="py-1">
          {SIDEBAR_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                activeSidebar === option.value
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

const UserMenu = ({ 
  isOpen, 
  onToggle 
}: { 
  isOpen: boolean; 
  onToggle: () => void;
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
    >
      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
        <User className="h-4 w-4 text-white" />
      </div>
      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    {isOpen && (
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <p className="text-sm font-medium text-gray-900">Signed in as</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">user@example.com</p>
        </div>
        <div className="py-1">
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <User className="h-4 w-4 mr-3 text-gray-400" />
            Profile
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Settings className="h-4 w-4 mr-3 text-gray-400" />
            Settings
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) {
                void signOutWithAuthApi();
              }
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </button>
        </div>
      </div>
    )}
  </div>
);

// --- Main Component ---

const EnhancedNavbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const pathname = usePathname();
  const context = useContext(ContextData);

  const handleSidebarChange = (value: string) => {
    context?.setActiveSidebar(value);
    setShowSidebarMenu(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Logo and Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => context?.setToggle(!context?.toggle)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all border border-transparent active:scale-95"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center group transition-transform active:scale-95">
              <img
                src="/images/pottaLogo.svg"
                alt="Potta Logo"
                className="h-8 w-auto group-hover:opacity-80 transition-opacity"
              />
            </Link>

            <div className="hidden md:flex items-center ml-2 pl-4 border-l border-gray-200 h-6">
              <h1 className="text-lg font-medium text-gray-800 tracking-tight">
                {getPageTitle(pathname)}
              </h1>
            </div>
          </div>

          {/* Center - Navigation Menu (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <NavItem 
                key={link.href} 
                {...link} 
                active={pathname.startsWith(link.href)} 
              />
            ))}
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <SidebarSwitcher 
              isOpen={showSidebarMenu}
              onToggle={() => setShowSidebarMenu(!showSidebarMenu)}
              onSelect={handleSidebarChange}
              activeSidebar={context?.activeSidebar}
            />

            <div className="flex items-center space-x-1">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative active:scale-95">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors active:scale-95">
                <Inbox className="h-5 w-5" />
              </button>
            </div>

            <UserMenu 
              isOpen={showUserMenu}
              onToggle={() => setShowUserMenu(!showUserMenu)}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu (simplified) */}
      <div className="lg:hidden border-t border-gray-100 bg-white overflow-x-auto scrollbar-hide">
        <div className="px-4 py-2 flex space-x-2">
          {NAV_LINKS.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                pathname.startsWith(link.href) 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default EnhancedNavbar;
