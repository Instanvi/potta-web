import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface RightSideModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  width?: string; // Tailwind max-width class or custom width
}

const RightSideModal: React.FC<RightSideModalProps> = ({
  open,
  setOpen,
  title,
  children,
  width,
}) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel
                className={`absolute right-0 top-0 h-full w-full ${
                  width ? width : 'max-w-xl'
                } bg-white shadow-xl flex flex-col`}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h2 className="text-lg font-medium">{title}</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default RightSideModal;
