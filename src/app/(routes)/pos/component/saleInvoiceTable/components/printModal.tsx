'use client';
import React from 'react';
import Modal from '@potta/components/modal';

interface PrintModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: {
    items: any[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
}

const ModalPrint: React.FC<PrintModalProps> = ({ open, setOpen, data }) => {
  const handlePrint = () => {
    window.print();
    setOpen(false);
  };

  return (
    <Modal
      width="w-[800px]"
      open={open}
      setOpen={setOpen}
      title="Print Receipt"
    >
      <div className="p-6" id="printable-content">
        <h2 className="text-2xl font-medium mb-4">Receipt</h2>
        <div className="mb-6">
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p>Time: {new Date().toLocaleTimeString()}</p>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left">Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td>{item.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">${item.price.toFixed(2)}</td>
                <td className="text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${data.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Discount:</span>
              <span>-${data.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax:</span>
              <span>${data.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Total:</span>
              <span>${data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-3 flex justify-end">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handlePrint}
        >
          Print Receipt
        </button>
      </div>
    </Modal>
  );
};

export default ModalPrint;
