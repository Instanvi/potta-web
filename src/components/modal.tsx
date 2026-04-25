import React, { Fragment, ReactNode, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import Button from './button';

type Props = {
  title?: string;
  width?: string;
  children: ReactNode;
  text?: string;
  icon?: any;
  open: boolean;
  setOpen: (value: boolean) => void;
  button?: boolean;
};

const Modal: React.FC<Props> = ({
  title,
  children,
  width,
  text,
  icon,
  open,
  setOpen,
  button,
}) => {
  return (
    <div>
      {button &&
        <Button
          theme="red"
          height={true}
          width="full"
          text={text}
          type={'submit'}
          icon={icon}
          onClick={() => setOpen(false)}
        />
}

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={() => setOpen(false)} open={open}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className={`relative transform overflow-hidden rounded-[2px] bg-transparent text-left transition-all ${
                    width ? width : 'w-screen'
                  }`}
                >
                  <div className=" bg-white transform overflow-hidden rounded-[2px] pt-4">
                    <div
                      className={`flex ${
                        title ? 'justify-between ' : 'justify-end'
                      } px-4 py-2`}
                    >
                      {title && (
                        <h1 className="text-xl font-medium ">{title}</h1>
                      )}
                    </div>
                    {children}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default Modal;
