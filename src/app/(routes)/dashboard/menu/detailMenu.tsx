'use client';

import React, {
  FC,
  ReactNode,
  useEffect,
  useRef,
  useContext,
  Fragment,
} from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { ContextData } from '@potta/components/providers/DataProvider';

interface DetailMenuProps {
  children: ReactNode;
  id: string; // Required prop
  title: string; // Required prop
  backLink: string; // Required prop
}

const DetailMenu: FC<DetailMenuProps> = ({ children, id, title, backLink }) => {
  const context = useContext(ContextData);
  const dashTop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(
      'dashTopHeight',
      dashTop.current?.clientHeight.toString() || '0'
    );
  }, []);

  function classNames(arg0: string, arg1: string): string | undefined {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="lg:pl-14 h-screen">
      <div
        ref={dashTop}
        className="sticky top-0 z-20 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm"
      >
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => context?.setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <i className="ri-menu-line text-xl"></i>
        </button>

        <div className="flex justify-between grow items-center">
          <div className="flex gap-4 items-center">
            <Link href={backLink}>
              <i className="ri-arrow-left-s-line text-xl"></i>
            </Link>
            <h1 className="text-xl font-bold">
              {title} {id}
            </h1>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="p-2 rounded-lg border flex justify-evenly items-center text-black">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <i className="ri-notification-2-line text-xl text-gray-500"></i>
              </button>
            </div>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="-m-1.5 flex items-center p-1.5">
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-50' : '',
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                        )}
                      >
                        Your profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-50' : '',
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                        )}
                      >
                        Sign Out
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      <main className="">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default DetailMenu;
