'use client';
import React, { FC } from 'react';
import Slider from '@potta/components/slideover';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface IModalInvoice {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ModalInvoice: FC<IModalInvoice> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();

  const invoiceTypes = [
    {
      title: 'Invoice',
      description: 'A document issued by the seller to a buyer which indicates the quantity and cost of the product purchased',
      image: '/images/invoice/invoice.svg',
      type: 'invoice',
      link: '/invoice/new?type=invoice' // Unique link for regular invoice
    },
    {
      title: 'Proforma Invoice',
      description: 'A preliminary bill of sale sent in advance of shipment or delivery of goods',
      image: '/images/invoice/budget.svg',
      type: 'proforma',
      link: '/invoice/new?type=proforma' // Unique link for proforma
    },
    {
      title: 'Prepayment Invoice',
      description: 'Record advanced payment',
      image: '/images/invoice/prepayment.svg',
      type: 'prepayment',
      link: '/invoice/new?type=prepayment' // Unique link for prepayment
    },
    {
      title: 'Purchase Order',
      description: 'Create a purchase order for a seller indicating proposed goods and services, price and quantity',
      image: '/images/invoice/purchase.svg',
      type: 'purchase-order',
      link: '/invoice/purchase-order' // Unique link for purchase order
    },
    {
      title: 'Credit Note',
      description: 'Issue credit against future purchases',
      image: '/images/invoice/credit note.svg',
      type: 'credit-note',
      link: '/invoice/credit' // Unique link for credit note
    },
  ];

  const handleInvoiceClick = (link: string) => {
    setIsOpen(false);
    router.push(link);
  };

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={false}
      title="Select Invoice Type"
      buttonText="customer"
    >
      <div className="h-[87vh] flex max-w-6xl flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-4 min-h-full">
            {invoiceTypes.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInvoiceClick(item.link)}
                className="flex bg-red-500 items-start justify-center space-x-4 p-4 rounded hover:shadow-md shadow-sm transition-all cursor-pointer
                         hover:bg-gray-50 active:bg-gray-100 h-full"
              >
                <div className="flex-shrink-0 relative w-16 h-16">
                  <img
                    src={item.image}
                    alt={item.title}
                    // fill
                    className="object-contain"
                    sizes="(max-width: 48px) 100vw"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slider>
  );
};

export default ModalInvoice;
