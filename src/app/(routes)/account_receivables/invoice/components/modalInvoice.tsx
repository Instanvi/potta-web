'use client';
import { ContextData } from '@potta/components/providers/DataProvider';
import Modal from '@potta/components/modal';
import { FC, useContext, useState } from 'react';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

interface IInvoiceModal {
  open:boolean,
  onClose:()=>void
}
const InvoiceModal: FC<IInvoiceModal> = ({open,onClose}) => {


  return (
    <>
      <Dialog open={open} as="div" className="relative z-10 focus:outline-none" onClose={onClose}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <DialogTitle as="h3" className="text-base/7 font-medium text-white">
                Add New Budget
              </DialogTitle>
              <div className="w-full -mt-20 flex">
                <div className="bg-[#EBF0F0]   w-[35%]">
                  <div className="h-8 pl-5 mt-10 border-b w-full">
                    <h3>Invoice for UI Design</h3>
                  </div>
                  <div className="mt-5 p-5">
                    <p className="text-gray-600">Send to </p>
                    <h3 className="text-2xl mt-1 font-semibold">Apple Inc.</h3>
                    <div className="mt-3 space-y-2 flex-col">
                      <p>Department 98</p>
                      <p>44-46 Morningside Road</p>
                      <p>Edinburg</p>
                      <p>Scodland</p>
                      <p>EH10 4BF</p>
                      <p>marketing@apple.com</p>
                    </div>

                    <div className="mt-10">
                      <h3 className="text-gray-600">Invoice id</h3>
                      <p>Inv 001</p>
                    </div>

                    <div className="mt-10">
                      <h3 className="text-gray-600">Send On</h3>
                      <p>22 May 2022, 2:15 AM</p>
                    </div>

                    <div className="mt-10">
                      <h3 className="text-gray-600">Due On</h3>
                      <p>20 Jul 2022, 1:00 AM</p>
                    </div>
                    <div className="mt-5 pt-5 border-t w-full  flex space-x-2">
                      <i className="ri-printer-fill"></i>
                      <p>Print</p>
                    </div>
                  </div>
                </div>
                <div className="w-[65%]">
                  <div className="h-8 mt-10 border-b w-full">
                    <h3></h3>
                  </div>
                  <div className="mt-2 p-4">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Rate</th>
                        <th className="px-4 py-2 text-left">Qty</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr className="border-b border-dashed">
                        <td className="px-4 py-2 font-bold">Marketing Materials</td>
                        <td className="px-4 py-2">$50</td>
                        <td className="px-4 py-2">150</td>
                        <td className="px-4 py-2">$7,500</td>
                      </tr>
                      <tr className="border-b border-dashed">
                        <td className="px-4 py-2 font-bold">Website Design</td>
                        <td className="px-4 py-2">$50</td>
                        <td className="px-4 py-2">150</td>
                        <td className="px-4 py-2">$7,500</td>
                      </tr>
                      <tr className="border-b border-dashed">
                        <td className="px-4 py-2 font-bold">Mobile App</td>
                        <td className="px-4 py-2">$50</td>
                        <td className="px-4 py-2">150</td>
                        <td className="px-4 py-2">$7,500</td>
                      </tr>
                      <tr className="border-b border-dashed">
                        <td className="px-4 py-2 font-bold">Printing Equipment</td>
                        <td className="px-4 py-2">$50</td>
                        <td className="px-4 py-2">150</td>
                        <td className="px-4 py-2">$7,500</td>
                      </tr>
                      </tbody>
                    </table>
                    <div className="mt-[26vh]">
                      <div className="flex justify-end">
                        <div className="flex space-x-10">
                          <div className="flex-col space-y-5">
                            <p className="text-gray-600">Subtotal : </p>
                            <p className="text-gray-600">Tax 10% : </p>
                          </div>
                          <div className="flex-col space-y-5">
                            <p className="text-gray-600"> $10,450</p>
                            <p className="text-gray-600">$1,045 </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex border-t mt-8 pt-2 justify-between">
                        <div>
                          <button className="text-green-700 bg-green-200 rounded-full py-1.5 px-2 text-xs">
                            Paid
                          </button>
                        </div>
                        <div className="flex justify-end ">
                          <div className="flex space-x-10">
                            <p>Total : </p>
                            <h4 className="text-2xl font-semibold">$11,547</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    {/*<Modal*/}
    {/*  open={open}*/}

    {/*  width="3/3"*/}
    {/*  icon={<i className="ri-add-line"></i>}*/}
    {/*  title=""*/}
    {/*  text="Add New Budget"*/}
    {/*>*/}
    {/* */}
    {/*</Modal>*/}
    </>
  );
};

export default InvoiceModal;
