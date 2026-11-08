import Button from '@potta/components/button';
import React, { useState } from 'react';
import HoldOrderButton from '../holdOn';
import CustomerPicker from '../CustomerPicker';
import { useCheckout } from '../useCheckout';

const PayCash = () => {
  const { totals, checkout, reprint, lastOrder, printer, isPending, items, canSell } = useCheckout();
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [customerId, setCustomerId] = useState('');
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
      setCustomerId('');
    }
  };

  return (
    <div className="p-4 h-full bg-white ">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-medium text-gray-800">Cash Payment</h3>
        {lastOrder && (
          <button
            onClick={reprint}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 transition-colors"
          >
            <i className="w-4 h-4 ri-printer-line"></i>
            Reprint Last Receipt
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 space-y-4">
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-4">Enter Cash Amount</h4>
              <input
                id="cash_amount"
                placeholder="00.00"
                type="number"
                name="cashAmount"
                value={cashAmount || ''}
                onChange={handleCashInput}
                className="w-full py-3 px-4 border border-gray-300 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium"
              />
              {error ? <small className="text-red-500 mt-2 block">{error}</small> : null}
            </div>
            <CustomerPicker value={customerId} onChange={setCustomerId} />
          </div>

          <HoldOrderButton />
        </div>

        <div className="bg-gray-50 p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Payment Summary</h4>
          <div className="space-y-4">
            <div className="w-full flex justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-600">Total</span>
              <p className="font-medium text-lg text-gray-800">{total.toFixed(2)} XAF</p>
            </div>
            <div className="w-full flex justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-600">Cash Amount</span>
              <p className="font-medium text-lg text-gray-800">{cashAmount.toFixed(2)} XAF</p>
            </div>
            <div className="w-full flex justify-between py-3 bg-green-50 px-3">
              <span className="font-medium text-gray-800">Change</span>
              <p className={`font-medium text-xl ${change < 0 ? 'text-red-500' : 'text-green-700'}`}>{change.toFixed(2)} XAF</p>
            </div>
            <div className="w-full mt-6">
              <Button
                width="full"
                text={isPending ? 'Processing...' : 'Complete Payment'}
                type="button"
                onClick={handleComplete}
                disabled={!canSell || items.length === 0 || total <= 0 || cashAmount < total || isPending}
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
