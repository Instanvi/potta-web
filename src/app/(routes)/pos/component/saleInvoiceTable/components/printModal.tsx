'use client';
import React from 'react';
import Modal from '@potta/components/modal';
import { toast } from 'sonner';
import { SalesReceiptPdfDocument } from '@/components/documents/sales-receipt-pdf-document';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { orgToSeller } from '@/lib/org-to-seller';
import { printReactPdf } from '@/lib/print-react-pdf';

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
  currency?: string;
}

const ModalPrint: React.FC<PrintModalProps> = ({
  open,
  setOpen,
  data,
  currency = 'XAF',
}) => {
  const { data: org } = useOrganizationProfile();
  const [printing, setPrinting] = React.useState(false);

  // Prints the letterhead PDF receipt (react-pdf) instead of the browser page.
  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const now = new Date();
      await printReactPdf(
        <SalesReceiptPdfDocument
          title="POS receipt"
          saleDate={now.toLocaleString()}
          currency={currency}
          notes={data.discount > 0 ? `Discount applied: ${data.discount.toFixed(2)}` : undefined}
          seller={orgToSeller(org)}
          customer={null}
          lines={data.items.map((item) => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.price) || 0;
            return {
              description: item.name || 'Item',
              quantity,
              unitPrice,
              taxRate: Number(item.tax) || 0,
              lineTotal: unitPrice * quantity,
            };
          })}
          subtotal={data.subtotal}
          tax={data.tax}
          total={data.total}
          draft={false}
        />,
        `pos-receipt-${now.getTime()}`,
      );
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Could not print receipt');
    } finally {
      setPrinting(false);
    }
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
          disabled={printing}
          onClick={() => void handlePrint()}
        >
          {printing ? 'Preparing…' : 'Print Receipt'}
        </button>
      </div>
    </Modal>
  );
};

export default ModalPrint;
