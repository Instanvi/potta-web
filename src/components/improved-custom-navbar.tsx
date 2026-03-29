'use client';
import React, { useState, useContext } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Inbox,
  Bell,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ContextData } from './providers/DataProvider';
import { menuStructure } from './navbarLinks';
import { useSession, signOut } from 'next-auth/react';


export type MenuItem = {
  title: string;
  children?: MenuItem[];
  href?: string;
};

// Helper to slugify titles for hrefs
const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const ImprovedCustomNavbar = () => {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const context = useContext(ContextData);
  console.log(user?.user?.user);
  const isHome = pathname === '/';

  return (
    <nav className="flex gap-6 items-center px-6 py-4 bg-white sticky top-0 left-0 z-30 w-full shadow-sm border-b border-gray-100">
      {/* Logo */}
      <Link
        href="/"
        className="font-bold cursor-pointer text-xl text-black flex-shrink-0"
      >
        <img
          src="/images/pottaLogo.svg"
          alt="Potta Logo"
          className="h-8 w-auto"
        />
      </Link>

      {/* Main Navigation Menu */}
      <ul className="flex space-x-1 flex-1 text-[15px]">
        {menuStructure.map((menu: MenuItem, index: number) => (
          <li
            key={index}
            className="relative cursor-pointer group"
            onMouseEnter={() => setActiveMenu(index)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="flex items-center px-4 py-2.5 text-black font-medium text-[15px]  hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
              {menu.children ? (
                menu.title
              ) : menu.href ? (
                <Link href={menu.href} className="w-full h-full block">
                  {menu.title}
                </Link>
              ) : (
                menu.title
              )}
              {Array.isArray(menu.children) && menu.children.length > 0 && (
                <ChevronDown className="h-4 w-4 ml-1.5 font-medium inline align-middle transition-transform duration-200 group-hover:rotate-180" />
              )}
            </div>

            {Array.isArray(menu.children) && menu.children.length > 0 && (
              <div
                className={`absolute left-0 top-[61px] z-50 
                bg-white min-w-64  shadow-sm border border-gray-200
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                transition-all duration-300 ease-in-out
                transform origin-top scale-y-0 group-hover:scale-y-100
                backdrop-blur-sm
                ${
                  activeMenu === index ? 'opacity-100 visible scale-y-100' : ''
                }`}
              >
                <div className="p-2">
                  {menu.children.map((child: MenuItem, childIndex: number) => (
                    <div key={childIndex} className="relative group/child">
                      <div className="px-3 py-2.5 hover:bg-gray-50 flex justify-between items-center text-black cursor-pointer  transition-colors duration-200">
                        <span className="flex justify-between w-full whitespace-nowrap items-center text-[14px] font-medium">
                          {child.children ? (
                            child.title
                          ) : child.href ? (
                            <Link
                              href={child.href}
                              className="w-full h-full block hover:text-green-600"
                            >
                              {child.title}
                            </Link>
                          ) : (
                            child.title
                          )}
                          {child.children && (
                            <ChevronRight className="h-4 w-4 ml-2 inline align-middle transition-transform duration-200 group-hover/child:translate-x-0.5" />
                          )}
                        </span>
                      </div>
                      {child.children && (
                        <div
                          className="
                            absolute left-full top-0 
                            bg-white min-w-64  shadow-sm border border-gray-200
                            opacity-0 invisible
                            group-hover/child:opacity-100 group-hover/child:visible
                            transition-all duration-300 ease-in-out
                            transform origin-top scale-y-0 group-hover/child:scale-y-100
                            backdrop-blur-sm
                          "
                        >
                          <div className="p-2">
                            {(() => {
                              const hasGreatGrandchildren = child.children.some(
                                (gc) => gc.children && gc.children.length > 0
                              );
                              if (hasGreatGrandchildren) {
                                // No scroll wrapper if any grandchild has children
                                return child.children.map(
                                  (
                                    grandchild: MenuItem,
                                    grandchildIndex: number
                                  ) => (
                                    <div
                                      key={grandchildIndex}
                                      className="relative group/grandchild"
                                    >
                                      <div className="px-3 py-2.5 whitespace-nowrap hover:bg-gray-50 flex justify-between items-center text-black cursor-pointer  transition-colors duration-200">
                                        <span className="flex justify-between w-full items-center text-[15px] font-medium">
                                          {grandchild.children ? (
                                            grandchild.title
                                          ) : grandchild.href ? (
                                            <Link
                                              href={grandchild.href}
                                              className="w-full h-full block hover:text-green-600"
                                            >
                                              {grandchild.title}
                                            </Link>
                                          ) : (
                                            grandchild.title
                                          )}
                                          {grandchild.children && (
                                            <ChevronRight className="h-4 w-4 ml-2 inline align-middle transition-transform duration-200 group-hover/grandchild:translate-x-0.5" />
                                          )}
                                        </span>
                                      </div>
                                      {grandchild.children && (
                                        <div
                                          className="
                                          absolute left-full top-0 
                                          bg-white min-w-64 max-h-[70vh] overflow-y-auto  shadow-sm border border-gray-200
                                          opacity-0 invisible
                                          group-hover/grandchild:opacity-100 group-hover/grandchild:visible
                                          transition-all duration-300 ease-in-out
                                          transform origin-top scale-y-0 group-hover/grandchild:scale-y-100
                                          backdrop-blur-sm
                                        "
                                        >
                                          <div className="p-2">
                                            {grandchild.children.map(
                                              (
                                                greatGrandchild: MenuItem,
                                                greatGrandchildIndex: number
                                              ) => (
                                                <div
                                                  key={greatGrandchildIndex}
                                                  className="px-3 py-2.5 whitespace-nowrap hover:bg-gray-50 flex justify-between items-center text-black cursor-pointer  transition-colors duration-200"
                                                >
                                                  <span className="flex justify-between w-full items-center text-[14px] font-medium">
                                                    {greatGrandchild.children ? (
                                                      greatGrandchild.title
                                                    ) : greatGrandchild.href ? (
                                                      <Link
                                                        href={
                                                          greatGrandchild.href
                                                        }
                                                        className="w-full h-full block hover:text-green-600"
                                                      >
                                                        {greatGrandchild.title}
                                                      </Link>
                                                    ) : (
                                                      greatGrandchild.title
                                                    )}
                                                    {greatGrandchild.children && (
                                                      <ChevronRight className="h-4 w-4 ml-2 inline align-middle" />
                                                    )}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                );
                              } else {
                                // Scroll wrapper for normal grandchildren
                                return (
                                  <div className="max-h-[70vh] overflow-y-auto">
                                    {child.children.map(
                                      (
                                        grandchild: MenuItem,
                                        grandchildIndex: number
                                      ) => (
                                        <div
                                          key={grandchildIndex}
                                          className="relative group/grandchild"
                                        >
                                          <div className="px-3 py-2.5 whitespace-nowrap hover:bg-gray-50 flex justify-between items-center text-black cursor-pointer  transition-colors duration-200">
                                            <span className="flex justify-between w-full items-center text-[14px] font-medium">
                                              {grandchild.children ? (
                                                grandchild.title
                                              ) : grandchild.href ? (
                                                <Link
                                                  href={grandchild.href}
                                                  className="w-full h-full block hover:text-green-600"
                                                >
                                                  {grandchild.title}
                                                </Link>
                                              ) : (
                                                grandchild.title
                                              )}
                                              {grandchild.children && (
                                                <ChevronRight className="h-4 w-4 ml-2 inline align-middle transition-transform duration-200 group-hover/grandchild:translate-x-0.5" />
                                              )}
                                            </span>
                                          </div>
                                          {grandchild.children && (
                                            <div
                                              className="
                                              absolute left-full top-0 
                                              bg-white min-w-64 max-h-[70vh] overflow-y-auto  shadow-sm border border-gray-200
                                              opacity-0 invisible
                                              group-hover/grandchild:opacity-100 group-hover/grandchild:visible
                                              transition-all duration-300 ease-in-out
                                              transform origin-top scale-y-0 group-hover/grandchild:scale-y-100
                                              backdrop-blur-sm
                                            "
                                            >
                                              <div className="p-2">
                                                {grandchild.children.map(
                                                  (
                                                    greatGrandchild: MenuItem,
                                                    greatGrandchildIndex: number
                                                  ) => (
                                                    <div
                                                      key={greatGrandchildIndex}
                                                      className="px-3 py-2.5 whitespace-nowrap hover:bg-gray-50 flex justify-between items-center text-black cursor-pointer  transition-colors duration-200"
                                                    >
                                                      <span className="flex justify-between w-full items-center text-[14px] font-medium">
                                                        {greatGrandchild.children ? (
                                                          greatGrandchild.title
                                                        ) : greatGrandchild.href ? (
                                                          <Link
                                                            href={
                                                              greatGrandchild.href
                                                            }
                                                            className="w-full h-full block hover:text-green-600"
                                                          >
                                                            {
                                                              greatGrandchild.title
                                                            }
                                                          </Link>
                                                        ) : (
                                                          greatGrandchild.title
                                                        )}
                                                        {greatGrandchild.children && (
                                                          <ChevronRight className="h-4 w-4 ml-2 inline align-middle" />
                                                        )}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Right side - Actions and User Menu */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="p-2.5 rounded-full transition-all duration-200 relative hover:bg-gray-50 group">
          <Bell
            size={20}
            className="text-gray-600 group-hover:text-gray-800 transition-colors"
          />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        {/* Inbox */}
        <button className="p-2.5 rounded-full transition-all duration-200 hover:bg-gray-50 group">
          <Inbox
            size={20}
            className="text-gray-600 group-hover:text-gray-800 transition-colors"
          />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-50 transition-all duration-200 group"
          >
            {user?.branch?.organization?.logo ? (
              <img
                src={user.branch.organization.logo}
                // alt={user.branch.organization.name || 'Org Logo'}
                className="h-8 w-8 rounded-full object-cover border border-gray-200 bg-white"
              />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-gray-600 transition-transform duration-200 group-hover:rotate-180" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white  shadow-sm border border-gray-200 z-50 backdrop-blur-sm">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user?.firstName || user?.user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.user?.email || ''}
                  </p>
                </div>
                <button className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50  transition-colors duration-200">
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  Profile
                </button>
                <Link
                  href="/settings"
                  className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50  transition-colors duration-200"
                >
                  <Settings className="h-4 w-4 mr-3 text-gray-500" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to sign out?')) {
                      signOut();
                    }
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50  transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ImprovedCustomNavbar;
