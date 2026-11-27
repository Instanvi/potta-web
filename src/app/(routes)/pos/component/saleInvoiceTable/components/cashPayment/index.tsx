import Button from '@potta/components/button';
import React, { useState } from 'react';
import HoldOrderButton from '../holdOn';
import CustomerPicker from '../CustomerPicker';
import { useCheckout } from '../useCheckout';
import { ReceiptPrinterFormatSelect } from '../../../print/ReceiptPrinterFormatSelect';

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

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="h-full bg-white p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <ReceiptPrinterFormatSelect printer={printer} />
          {lastOrder && (
            <button
              type="button"
              onClick={reprint}
              className="flex items-center gap-2 border border-[var(--pos-border)] px-3 py-2 text-sm text-gray-700 hover:bg-[#f8f8f8]"
            >
              <i className="ri-printer-line" />
              Reprint Last Receipt
            </button>
          )}
        </div>
      </div>

      <p className="mb-2 text-sm font-medium">Enter Cash Amount</p>
      <input
        id="cash_amount"
        placeholder="00.00"
        type="number"
        name="cashAmount"
        value={cashAmount || ''}
        onChange={handleCashInput}
        className="mb-4 h-10 w-full border border-[var(--pos-border)] px-3 text-base outline-none focus:border-[var(--pos-green)]"
      />
      {error ? <small className="mb-3 block text-red-500">{error}</small> : null}

      <div className="mb-6">
        <CustomerPicker value={customerId} onChange={setCustomerId} />
      </div>

      <div className="mb-6 ml-auto w-full max-w-[370px]">
        <div className="mb-3 flex justify-between text-sm">
          <span className="font-medium">Total</span>
          <span className="font-bold">{fmt(total)}</span>
        </div>
        <div className="mb-3 border-b border-[var(--pos-border)]" />
        <div className="mb-3 flex justify-between text-sm">
          <span className="font-medium">Cash Amount</span>
          <span className="font-bold">{fmt(cashAmount)}</span>
        </div>
        <div className="mb-3 border-b border-[var(--pos-border)]" />
        <div className="mb-4 flex justify-between text-sm">
          <span className="font-medium">Change</span>
          <span className={`font-bold ${change < 0 ? 'text-[var(--pos-discount)]' : ''}`}>
            {fmt(change)}
          </span>
        </div>
        <Button
          width="full"
          text={isPending ? 'Processing...' : 'Complete'}
          type="button"
          onClick={handleComplete}
          disabled={!canSell || items.length === 0 || total <= 0 || cashAmount < total || isPending}
        />
      </div>

      <HoldOrderButton />
      {printer.getIframeElement()}
    </div>
  );
};

export default PayCash;
