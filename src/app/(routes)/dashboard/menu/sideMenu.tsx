'use client';

import React, { FC, Fragment, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Updated import
import { Dialog, Transition } from '@headlessui/react';

import { LargeSideMenuItem } from './sideMenuItem';
import SmallSideMenuItem from './sideMenuItem';
import { ContextData } from '@potta/components/providers/DataProvider';

interface Link {
  text: string;
  icon: string;
  href: string;
}

interface SideMenuProps {}

const SideMenu: FC<SideMenuProps> = () => {
  const context = useContext(ContextData);
  const pathname = usePathname(); // Use usePathname

  useEffect(() => {
    const res: string[] = pathname.split('/');
    const pageName: string = res[2] === undefined ? 'dashboard' : res[2];
    context?.setLinks(pageName);
  }, [pathname, context]);

  const links: Link[] = [
    { text: 'dashboard', icon: 'ri-contrast-fill', href: '/dashboard/' },
    { text: 'terminals', icon: 'ri-user-6-fill', href: '/dashboard/terminals' },
    {
      text: 'collections',
      icon: 'ri-funds-box-line',
      href: '/dashboard/payouts',
    },
    {
      text: 'payouts',
      icon: 'ri-funds-box-line rotate-180 transform scale-x-[-1]',
      href: '/dashboard/payouts',
    },
    {
      text: 'accounts',
      icon: 'ri-pass-valid-line',
      href: '/dashboard/accounts',
    },
    {
      text: 'invoicing',
      icon: 'ri-file-list-2-line',
      href: '/dashboard/invoicing',
    },
    { text: 'cards', icon: 'ri-bank-card-line', href: '/dashboard/cards' },
    { text: 'vouchers', icon: 'ri-coupon-2-line', href: '/dashboard/vouchers' },
    { text: 'reports', icon: 'ri-bar-chart-line', href: '/dashboard/reports' },
  ];

  const adminLinks: Link[] = [
    { text: 'admin', icon: 'ri-bar-chart-line', href: '/dashboard/admin' },
    {
      text: 'settings',
      icon: 'ri-settings-3-line',
      href: '/dashboard/settings',
    },
  ];

  return (
    <aside className="hidden lg:fixed h-screen lg:flex lg:flex-col">
      <nav className="flex flex-col h-full overflow-x-hidden gap-y-5 overflow-y-auto border-r border-gray-200 bg-green-50 items-center pb-4 w-14">
        <div className="flex my-3 bg-white rounded-full h-10 w-10 justify-evenly items-center">
          <img src={`/images/pottaLogo.svg`} alt="" />
        </div>
        <ul role="list" className="flex flex-1 flex-col grow gap-6">
          {links.map((link, index) => (
            <SmallSideMenuItem
              key={index}
              href={link.href}
              icon={link.icon}
              active={context?.link === link.text}
              text={link.text}
            />
          ))}
          <div className="flex flex-col gap-6 mt-auto">
            {adminLinks.map((link, index) => (
              <SmallSideMenuItem
                key={index}
                href={link.href}
                icon={link.icon}
                active={context?.link === link.text}
                text={link.text}
              />
            ))}
          </div>
        </ul>
      </nav>

      <Transition.Root show={context?.sidebarOpen ?? false} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20 lg:hidden"
          onClose={context?.setSidebarOpen || (() => {})} // Fallback function
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => context?.setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <i className="ri-close-line text-2xl"></i>
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex overflow-x-hidden grow flex-col gap-y-5 overflow-y-auto border-r w-full border-gray-200 bg-green-50 pb-4">
                  <div className="flex h-16 px-8 shrink-0 items-center">
                    <div className="flex mx-2 bg-white rounded-full h-10 w-10 justify-evenly items-center">
                      <img src={`/images/pottaLogo.svg`} alt="" />
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col">
                      <li className="flex flex-col grow">
                        <ul role="list" className="space-y-1">
                          {links.map((link, index) => (
                            <LargeSideMenuItem
                              key={index}
                              text={link.text}
                              href={link.href}
                              icon={link.icon}
                              active={context?.link === link.text}
                            />
                          ))}
                        </ul>
                      </li>
                      <div className="flex flex-col">
                        {adminLinks.map((link, index) => (
                          <LargeSideMenuItem
                            key={index}
                            text={link.text}
                            href={link.href}
                            icon={link.icon}
                            active={false}
                          />
                        ))}
                      </div>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </aside>
  );
};

export default SideMenu;
