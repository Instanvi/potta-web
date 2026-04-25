'use client';
import React, { FC, useState, useContext, Fragment } from 'react';
import Modal from '@potta/components/modal';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';


interface IModalInvoice {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const ModalInvoice: FC<IModalInvoice> = ({open,setOpen}) => {


  return (

    <Transition  show={open} as={Fragment}>
      <Dialog className="relative z-40" open={open} onClose={()=>setOpen(false)} >
      {/*<Dialog as="div" className="relative z-40" onClose={setOpen}>*/}
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
                className={`relative transform overflow-hidden rounded-[2px] bg-transparent text-left transition-all w-1/2`}
              >
                {/*<DialogBackdrop className="fixed inset-0 bg-black/30" />*/}
                <div className=" bg-white transform overflow-hidden rounded-[2px] pt-4">
                  {/*<div*/}
                  {/*  className={`flex  px-4 py-2`}*/}
                  {/*>*/}
                  {/*  {<h1 className="text-xl font-medium ml-10">{"Invoice Modal"}</h1>}*/}
                  {/*  <div*/}
                  {/*    className="text-3xl cursor-pointer flex justify-end"*/}
                  {/*    onClick={() => {*/}
                  {/*      setOpen(false);*/}
                  {/*    }}*/}
                  {/*  >*/}
                  {/*    <i className="ri-close-line text-gray-700 text-2xl"></i>*/}
                  {/*  </div>*/}
                  {/*</div>*/}
                  <div className=" my-5  p-24">
                    <div className="grid grid-cols-2 gap-10  ">
                      <div className="flex space-x-2">
                        <div>
                          <img src="/icons/invoiceVector.svg" className="h-14 w-14" alt="" />
                        </div>
                        <div className="w-1/2">
                          <p className="text-md font-medium">Invoice </p>
                          <p className="text-sm text-gray-500">
                            A document issued by a seller to buyer which indicate the
                            quantity and cost of the purchase{' '}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2  ">
                        <div>
                          <img src="/icons/budgetVector.svg" className="h-10 w-10" alt="" />
                        </div>
                        <div className="w-1/2">
                          <p className="text-md font-medium">Budget:</p>
                          <p className="text-sm text-gray-500">
                            Plan and allocate finance for future expenses{' '}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div>
                          <img src="/icons/invoiceVector.svg" className="h-12 w-12" alt="" />
                        </div>
                        <div className="w-1/2">
                          <p className="text-md font-medium">Proforma Invoice:</p>
                          <p className="text-sm text-gray-500">
                            A Premilary bill of sale send in advance of shipment or delivery
                            of goods{' '}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div>
                          <img
                            src="/icons/paymentInvoiceVector.svg"
                            className="h-10 w-10"
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="text-md font-medium">Prepayment invoicement:</p>
                          <p className="text-sm text-gray-500">
                            Record advancement payment{' '}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div>
                          <img src="/icons/purchaseOrderVector.svg" className="h-14 w-14" alt="" />
                        </div>
                        <div className="w-1/2">
                          <p className="text-md font-medium">Purchase Order:</p>
                          <p className="text-sm text-gray-500">
                            Create a purchase order for a seller indicating proposed goods
                            an services price and quality{' '}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div>
                          <img src="/icons/creditNoteVector.svg" className="h-10 w-10" alt="" />
                        </div>
                        <div >
                          <p className="text-md font-medium">Credit Note:</p>
                          <p className="text-sm text-gray-500">
                            Issue Credit against future purchase{' '}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>


    // </Modal>
  );
};

export default ModalInvoice;
