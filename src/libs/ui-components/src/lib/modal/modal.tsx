import { FC, ReactNode } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

type Props = {
  title: string;
  width?: string;
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
}

const Modal: FC<Props> = (props) => {
  const { title, isOpen, width, children, onClose } = props;

  return (
    <Transition show={isOpen}>
      <Dialog className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className={`relative transform overflow-hidden rounded-0 bg-white pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full  ${width === "xl" ? "max-w-xl" : width === "sm" ? "max-w-sm" : "max-w-2xl"}`}>
                <div>
                  <div className="pb-2 px-6 flex justify-between items-center border-b">
                    <h3 className='text-3xl capitalize'>{title}</h3>
                    <div className='cursor-pointer -mt-2' onClick={onClose} >
                      <i className="ri-close-line text-2xl -mt-2"></i>
                    </div>
                  </div>
                  <div className='p-5'>
                    {children}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
export default Modal;