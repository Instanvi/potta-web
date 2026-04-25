'use client';
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Eye, Send, CheckCircle, XCircle, Mail } from 'lucide-react';
import type { ProcurementItem } from '../page';

interface ProcurementActionSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  item: ProcurementItem | null;
  onViewDetails: () => void;
  onSubmit: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onCreateRFQ: (id: string) => void;
  onSendRFQ: (id: string) => void;
  onCloseRFQ: (id: string) => void;
}

const ProcurementActionSidebar: React.FC<ProcurementActionSidebarProps> = ({
  open,
  setOpen,
  item,
  onViewDetails,
  onSubmit,
  onApprove,
  onReject,
  onCreateRFQ,
  onSendRFQ,
  onCloseRFQ,
}) => {
  if (!item) return null;

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

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
              <Dialog.Panel className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Actions
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-2">
                    {/* View Details - Always available */}
                    <button
                      onClick={() => handleAction(onViewDetails)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                      <span>View Details</span>
                    </button>

                    {/* Spend Request Actions */}
                    {item.type === 'SPEND_REQUEST' && (
                      <>
                        {item.status === 'DRAFT' && (
                          <button
                            onClick={() => handleAction(() => onSubmit(item.id))}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                          >
                            <Send className="w-5 h-5 text-gray-600" />
                            <span>Submit for Approval</span>
                          </button>
                        )}

                        {item.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleAction(() => onApprove(item.id))}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                            >
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleAction(() => onReject(item.id))}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                            >
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {item.status === 'APPROVED' && (
                          <button
                            onClick={() => handleAction(() => onCreateRFQ(item.id))}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                          >
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span>Create RFQ</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* RFQ Actions */}
                    {item.type === 'RFQ' && (
                      <>
                        {(item.status === 'DRAFT' ||
                          item.status === 'RESPONSES_RECEIVED') && (
                          <button
                            onClick={() => handleAction(() => onSendRFQ(item.id))}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                          >
                            <Send className="w-5 h-5 text-gray-600" />
                            <span>Send to Vendors</span>
                          </button>
                        )}

                        {item.status === 'SENT' && (
                          <button
                            onClick={() => handleAction(() => onCloseRFQ(item.id))}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                          >
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span>Close RFQ</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ProcurementActionSidebar;


