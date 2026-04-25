import React, { useState, Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

interface InvoiceType {
  value: string;
  description: string;
  icon: string;
}

const NewInvoice: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  const invoiceType: InvoiceType[] = [
    {
      value: "Invoice",
      description: "A document issued by the seller to a buyer which indicates the quantity and cost of the product purchased",
      icon: "/images/invoicing/invoicing.svg",
    },
    {
      value: "Proforma Invoice",
      description: "A preliminary bill of sale sent in advance of shipment or delivery of goods",
      icon: "/images/invoicing/invoicing.svg",
    },
    {
      value: "Prepayment Invoice",
      description: "Record advanced payment",
      icon: "/images/invoicing/prepayment.svg",
    },
    {
      value: "Purchase Order",
      description: "Create a purchase order for a seller indicating proposed goods and services, price and quantity",
      icon: "/images/invoicing/purchase.svg",
    },
    {
      value: "Budget",
      description: "Plan and allocate finances for future expenses",
      icon: "/images/invoicing/budget.svg",
    },
    {
      value: "Credit Note",
      description: "Issue credit against future purchases",
      icon: "/images/invoicing/credit note.svg",
    },
  ];

  return (
    <div>
      <div onClick={() => setOpen(true)} className="flex items-center gap-2 cursor-pointer text-white bg-[#154406] rounded-[2px] py-2.5 px-6">
        <i className="ri-file-add-line text-lg"></i>
        Create new invoice
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={setOpen}>
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

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-none px-4 pb-4 pt-5 text-left transition-all w-4/5 md:w-4/5 lg:w-3/5">
                  <div className=" bg-white transform overflow-hidden rounded-lg py-4 pb-8">
                    <div className="flex flex-col pb-2 px-4">
                      <center><h1 className="text-xl font-medium">Select Invoicing type</h1></center>
                      <div
                        className="text-3xl cursor-pointer flex justify-end"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        <i className="ri-close-line text-gray-700 text-xl -mt-8"></i>
                      </div>

                      <div className="w-4/5 grid grid-cols-2 items-center mx-auto gap-6 mt-8">
                        {invoiceType.map((invoice, index) => (
                          <a key={index} href={"/dashboard/invoicing/addInvoice"} className="outline-none min-h-[100px] h-full">
                            <div className="flex h-full w-full hover:bg-gray-100 rounded-lg cursor-pointer gap-3 p-2">
                              {/* <i className="ri-file-line text-3xl"></i> */}
                              <img src={invoice.icon} alt={invoice.icon} className="h-10 w-auto" />
                              <div className="">
                                <span className="font-medium">{invoice.value}</span>
                                <p>{invoice.description}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
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

export default NewInvoice;
