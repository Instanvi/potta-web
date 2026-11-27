import Button from '@potta/components/button';
import React, { useState } from 'react';
import HoldOrderButton from '../holdOn';
import CustomerPicker from '../CustomerPicker';
import { useCheckout } from '../useCheckout';
import { ReceiptPrinterFormatSelect } from '../../../print/ReceiptPrinterFormatSelect';

type Props = {
  customerId: string;
  onCustomerChange: (customerId: string) => void;
};

const PayCash = ({ customerId, onCustomerChange }: Props) => {
  const { totals, checkout, reprint, lastOrder, printer, isPending, items, canSell } = useCheckout();
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [error, setError] = useState('');

  const total = totals.total;
  const change = cashAmount === 0 ? 0 : cashAmount - total;

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCashAmount(isNaN(value) ? 0 : value);
  };

  const handleComplete = async () => {
    if (cashAmount < total) {
      setError('Cash amount must be greater than or equal to the total');
      return;
    }
    setError('');
    const ok = await checkout({ paymentMethod: 'CASH', customerId, cashTendered: cashAmount });
    if (ok) {
      setCashAmount(0);
      onCustomerChange('');
    }
  };

  return (
    <div className="h-full bg-white p-4">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-medium text-gray-800">Cash Payment</h3>
        <div className="flex flex-wrap items-end gap-3">
          <ReceiptPrinterFormatSelect printer={printer} />
          {lastOrder && (
            <button
              type="button"
              onClick={reprint}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <i className="ri-printer-line w-4 h-4" />
              Reprint Last Receipt
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4 bg-gray-50 p-6">
            <div>
              <h4 className="mb-4 text-lg font-medium text-gray-800">Enter Cash Amount</h4>
              <input
                id="cash_amount"
                placeholder="00.00"
                type="number"
                name="cashAmount"
                value={cashAmount || ''}
                onChange={handleCashInput}
                className="w-full border border-gray-300 px-4 py-3 text-lg font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
              {error ? <small className="mt-2 block text-red-500">{error}</small> : null}
            </div>
            <CustomerPicker value={customerId} onChange={onCustomerChange} />
          </div>

          <HoldOrderButton />
        </div>

        <div className="bg-gray-50 p-6">
          <h4 className="mb-4 text-lg font-medium text-gray-800">Payment Summary</h4>
          <div className="space-y-4">
            <div className="flex w-full justify-between border-b border-gray-200 py-3">
              <span className="font-medium text-gray-600">Total</span>
              <p className="text-lg font-medium text-gray-800">{total.toFixed(2)} XAF</p>
            </div>
            <div className="flex w-full justify-between border-b border-gray-200 py-3">
              <span className="font-medium text-gray-600">Cash Amount</span>
              <p className="text-lg font-medium text-gray-800">{cashAmount.toFixed(2)} XAF</p>
            </div>
            <div className="flex w-full justify-between bg-green-50 px-3 py-3">
              <span className="font-medium text-gray-800">Change</span>
              <p
                className={`text-xl font-medium ${change < 0 ? 'text-red-500' : 'text-green-700'}`}
              >
                {change.toFixed(2)} XAF
              </p>
            </div>
            <div className="mt-6 w-full">
              <Button
                width="full"
                text={isPending ? 'Processing...' : 'Complete Payment'}
                type="button"
                onClick={handleComplete}
                disabled={
                  !canSell || items.length === 0 || total <= 0 || cashAmount < total || isPending
                }
              />
            </div>
          </div>
        </div>
      </div>

      {printer.getIframeElement()}
    </div>
  );
};

export default PayCash;
