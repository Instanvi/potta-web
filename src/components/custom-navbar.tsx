'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Inbox, Bell } from 'lucide-react';
import Link from 'next/link';
import { menuStructure } from './navbarLinks';

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

// Helper to build href recursively
const buildHref = (parents: string[], title: string) =>
  '/' + [...parents, slugify(title)].join('/');

const CustomNavbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);


  return (
    <nav className="flex gap-4 items-center p-4 bg-white sticky top-0 left-0 z-30 w-full shadow-sm">
      <div className="font-medium text-xl text-black">
        <img
          src="/images/pottaLogo.svg"
          alt="Potta Logo"
          className="h-8 w-auto"
        />
      </div>

      <ul className="flex space-x-2 flex-1 text-[15px]">
        {menuStructure.map((menu: MenuItem, index: number) => (
          <li
            key={index}
            className="relative cursor-pointer group px-2 py-2 text-black font-medium text-[15px]"
            onMouseEnter={() => setActiveMenu(index as any)}
            onMouseLeave={() => setActiveMenu(null)}
          >
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
              <ChevronDown className="h-4 w-4 ml-2 font-medium inline align-middle" />
            )}

            {Array.isArray(menu.children) && menu.children.length > 0 && (
              <div
                className={`absolute left-0 top-[58px] z-50 
                bg-white min-w-56
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                transition-all duration-300 ease-in-out
                transform origin-top scale-y-0 group-hover:scale-y-100
                border border-gray-200
                ${
                  activeMenu === index ? 'opacity-100 visible scale-y-100' : ''
                }`}
              >
                {menu.children.map((child: MenuItem, childIndex: number) => (
                  <div key={childIndex} className="relative group/child">
                    <div className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center text-black cursor-pointer">
                      <span className="flex justify-between w-full whitespace-nowrap items-center text-[14px]">
                        {child.children ? (
                          child.title
                        ) : child.href ? (
                          <Link
                            href={child.href}
                            className="w-full h-full block"
                          >
                            {child.title}
                          </Link>
                        ) : (
                          child.title
                        )}
                        {child.children && (
                          <ChevronRight className="h-4 w-4 ml-2 inline align-middle" />
                        )}
                      </span>
                    </div>
                    {child.children && (
                      <div
                        className="
                          absolute left-full top-0 
                          bg-white min-w-56
                          opacity-0 invisible
                          group-hover/child:opacity-100 group-hover/child:visible
                          transition-all duration-300 ease-in-out
                          transform origin-top scale-y-0 group-hover/child:scale-y-100
                          border border-gray-200
                        "
                      >
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
                                  <div className="px-4 py-2 whitespace-nowrap hover:bg-gray-100 flex justify-between items-center text-black cursor-pointer">
                                    <span className="flex justify-between w-full items-center text-[15px]">
                                      {grandchild.children ? (
                                        grandchild.title
                                      ) : grandchild.href ? (
                                        <Link
                                          href={grandchild.href}
                                          className="w-full h-full block"
                                        >
                                          {grandchild.title}
                                        </Link>
                                      ) : (
                                        grandchild.title
                                      )}
                                      {grandchild.children && (
                                        <ChevronRight className="h-4 w-4 ml-2 inline align-middle" />
                                      )}
                                    </span>
                                  </div>
                                  {grandchild.children && (
                                    <div
                                      className="
                                      absolute left-full top-0 
                                      bg-white min-w-56 max-h-[70vh] overflow-y-auto
                                      opacity-0 invisible
                                      group-hover/grandchild:opacity-100 group-hover/grandchild:visible
                                      transition-all duration-300 ease-in-out
                                      transform origin-top scale-y-0 group-hover/grandchild:scale-y-100
                                      border border-gray-200
                                    "
                                    >
                                      {grandchild.children.map(
                                        (
                                          greatGrandchild: MenuItem,
                                          greatGrandchildIndex: number
                                        ) => (
                                          <div
                                            key={greatGrandchildIndex}
                                            className="px-4 py-2 whitespace-nowrap hover:bg-gray-100 flex justify-between items-center text-black cursor-pointer"
                                          >
                                            <span className="flex justify-between w-full items-center text-[14px]">
                                              {greatGrandchild.children ? (
                                                greatGrandchild.title
                                              ) : greatGrandchild.href ? (
                                                <Link
                                                  href={greatGrandchild.href}
                                                  className="w-full h-full block"
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
                                      <div className="px-4 py-2 whitespace-nowrap hover:bg-gray-100 flex justify-between items-center text-black cursor-pointer">
                                        <span className="flex justify-between w-full items-center text-[14px]">
                                          {grandchild.children ? (
                                            grandchild.title
                                          ) : grandchild.href ? (
                                            <Link
                                              href={grandchild.href}
                                              className="w-full h-full block"
                                            >
                                              {grandchild.title}
                                            </Link>
                                          ) : (
                                            grandchild.title
                                          )}
                                          {grandchild.children && (
                                            <ChevronRight className="h-4 w-4 ml-2 inline align-middle" />
                                          )}
                                        </span>
                                      </div>
                                      {grandchild.children && (
                                        <div
                                          className="
                                          absolute left-full top-0 
                                          bg-white min-w-56 max-h-[70vh] overflow-y-auto
                                          opacity-0 invisible
                                          group-hover/grandchild:opacity-100 group-hover/grandchild:visible
                                          transition-all duration-300 ease-in-out
                                          transform origin-top scale-y-0 group-hover/grandchild:scale-y-100
                                          border border-gray-200
                                        "
                                        >
                                          {grandchild.children.map(
                                            (
                                              greatGrandchild: MenuItem,
                                              greatGrandchildIndex: number
                                            ) => (
                                              <div
                                                key={greatGrandchildIndex}
                                                className="px-4 py-2 whitespace-nowrap hover:bg-gray-100 flex justify-between items-center text-black cursor-pointer"
                                              >
                                                <span className="flex justify-between w-full items-center text-[14px]">
                                                  {greatGrandchild.children ? (
                                                    greatGrandchild.title
                                                  ) : greatGrandchild.href ? (
                                                    <Link
                                                      href={
                                                        greatGrandchild.href
                                                      }
                                                      className="w-full h-full block"
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
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 rounded-full transition-colors">
          <Inbox size={20} className="text-gray-600 hover:text-gray-800" />
        </button>
        <button className="p-2 rounded-full transition-colors">
          <Bell size={20} className="text-gray-600 hover:text-gray-800" />
        </button>
      </div>
    </nav>
  );
};

export default CustomNavbar;
