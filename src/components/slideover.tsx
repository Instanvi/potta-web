'use client';
import { ReactNode, useState, FC, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './button';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface props {
  children: ReactNode;
  edit: boolean;
  buttonText?: string;
  title: string;
  onOpen?: () => void;
  open?: boolean; // Made optional
  setOpen?: (value: boolean) => void; // Made optional
  closeButton?: boolean;
  noPanelScroll?: boolean;
  sliderClass?: string;
  sliderContentClass?: string;
  tabs?: Tab[];
  defaultTab?: string;
}

const Slider: FC<props> = ({
  children,
  edit,
  buttonText,
  title,
  onOpen,
  open: externalOpen,
  setOpen: externalSetOpen,
  closeButton,
  sliderClass,
  noPanelScroll,
  sliderContentClass,
  tabs,
  defaultTab,
}) => {
  // Internal state for when open/setOpen aren't provided
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    defaultTab || (tabs && tabs.length > 0 ? tabs[0].id : '')
  );

  // Determine if we're in controlled or uncontrolled mode
  const isControlled =
    externalOpen !== undefined && externalSetOpen !== undefined;

  // Use either the external or internal state
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? externalSetOpen : setInternalOpen;

  useEffect(() => {
    if (open && onOpen) {
      onOpen(); // Call the onOpen callback when slider opens
    }
  }, [open, onOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div className="">
      <div>
        {buttonText == 'card' && (
          <Button
            text={'New Card'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'ussd' && (
          <Button
            text={'New USSD'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'agent' && (
          <Button
            text={'New Agent'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'page' && (
          <Button
            text={'New Page'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'benefits' && (
          <Button
            text={'New Benefits'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'New Sales Receipt' && (
          <Button
            text={'New Sales Receipt'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'New Schedules' && (
          <Button
            text={'New Policy'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'vendor' && (
          <Button
            text={'Create New Vendor'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'journal' && (
          <Button
            text={'New Journal Entry'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'assets' && (
          <Button
            text={'Create Asset'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'deductions' && (
          <Button
            text={'New Deduction'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'payslips' && (
          <Button
            text={'Create Payslip'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
        {buttonText == 'spend-program' && (
          <Button
            text={'New Spend Program'}
            onClick={handleToggle}
            type={'button'}
            icon={<i className="ri-file-add-line"></i>}
          />
        )}
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50 overflow-x-hidden"
      >
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-x-0 top-0 flex max-h-full bg-gray-500 bg-opacity-75 transition-opacity justify-center">
              <DialogPanel
                transition
                className="pointer-events-auto border-b max-w-screen h-screen w-full transform transition duration-500 ease-in-out data-[closed]:-translate-y-full sm:duration-500"
                style={noPanelScroll ? { overflowY: 'visible' } : {}}
              >
                <div
                  className={`flex h-full flex-col bg-white py-6 ${tabs && "!py-0"}  ${
                    noPanelScroll ? '' : ' overflow-y-auto'
                  } ${sliderClass}`}
                >
                  <div className="flex justify-center items-center ">
                    <div
                      className={`flex px-4 w-full  border-b justify-between ${
                        tabs ? 'py-2' : 'py-4'
                      }`}
                    >
                      <div className="flex-1 flex gap-10 items-end">
                        <DialogTitle className="text-xl !font-medium text-gray-900">
                          {title}
                        </DialogTitle>
                        {/* Tabs */}
                        {tabs && tabs.length > 0 && (
                          <div className="flex w-fit mt-4">
                            {tabs.map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4  text-gray-500 duration-500 ease-in-out ${
                                  activeTab === tab.id &&
                                  'border-b-2 border-[#154406] text-[#154406] font-medium'
                                } cursor-pointer flex items-center`}
                              >
                                <p>{tab.label}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex h-7 items-center">
                        {!closeButton && (
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="relative rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={` mt-6 flex-1 px-4 sm:px-6 overflow-y-auto flex custom-scrollbar justify-center ${sliderContentClass}`}
                  >
                    {tabs && tabs.length > 0
                      ? tabs.find((tab) => tab.id === activeTab)?.content ||
                        children
                      : children}
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Slider;
