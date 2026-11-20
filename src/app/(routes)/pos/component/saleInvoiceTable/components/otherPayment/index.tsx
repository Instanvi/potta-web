import React, { useContext, useState } from 'react';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import OrderSummary from '../orderSummary';
import CustomerPicker from '../CustomerPicker';
import { useCheckout } from '../useCheckout';
import type { PaymentMethod } from '@potta/app/(routes)/pos/utils/sale';

type Option = { id: string; method: PaymentMethod; label: string; icons: string[]; hint: string; referenceLabel: string };

const OPTIONS: Option[] = [
  { id: 'mtn', method: 'MOBILE_MONEY', label: 'MTN Mobile Money', icons: ['/icons/mtn.svg'], hint: 'Dial *126# to pay', referenceLabel: 'Phone number or transaction ID' },
  { id: 'orange', method: 'MOBILE_MONEY', label: 'Orange Money', icons: ['/icons/om.svg'], hint: 'Dial #150*62# to pay', referenceLabel: 'Phone number or transaction ID' },
  { id: 'card', method: 'CREDIT_CARD', label: 'Visa / Mastercard', icons: ['/icons/visas.svg', '/icons/master.svg'], hint: 'Charge the card on the terminal', referenceLabel: 'Terminal approval code' },
  { id: 'bank', method: 'BANK_TRANSFER', label: 'Bank transfer', icons: [], hint: 'Confirm the transfer was received', referenceLabel: 'Transfer reference' },
  { id: 'credit', method: 'CREDIT', label: 'On account (credit)', icons: [], hint: "The total is added to the customer's balance", referenceLabel: 'Note (optional)' },
];

const OtherPayment = () => {
  const context = useContext(ContextData);
  const { totals, checkout, printer, isPending, items, canSell } = useCheckout();
  const [selected, setSelected] = useState<Option>(OPTIONS[0]);
  const [reference, setReference] = useState('');
  const [customerId, setCustomerId] = useState('');

  const needsCustomer = selected.method === 'CREDIT';
  const canSubmit = canSell && items.length > 0 && totals.total > 0 && !isPending && (!needsCustomer || Boolean(customerId));

  const handleComplete = async () => {
    const ok = await checkout({
      paymentMethod: selected.method,
      customerId,
      reference: reference.trim() ? `${selected.label}: ${reference.trim()}` : selected.label,
    });
    if (ok) {
      setReference('');
      setCustomerId('');
    }
  };

  return (
    <div className="p-8 h-full bg-white">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-gray-800 mb-2">Other Payment Methods</h3>
        <p className="text-gray-600">Select how the customer pays</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option)}
              className={`w-full p-4 flex items-center space-x-3 border transition-colors ${
                selected.id === option.id ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {option.icons.length > 0 ? (
                option.icons.map((src) => <img key={src} src={src} alt="" className="w-8 h-8" />)
              ) : (
                <i className={`text-2xl ${option.method === 'CREDIT' ? 'ri-user-shared-line' : 'ri-bank-line'}`}></i>
              )}
              <p className="font-medium text-gray-800">{option.label}</p>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 p-6 space-y-4">
          <p className="text-gray-600">{selected.hint}</p>
          <div className="space-y-1">
            <label htmlFor="pos-reference" className="block text-sm font-medium text-gray-700">
              {selected.referenceLabel}
            </label>
            <input
              id="pos-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <CustomerPicker value={customerId} onChange={setCustomerId} required={needsCustomer} />
          <div className="w-full flex justify-between py-3 bg-green-50 px-3">
            <span className="font-medium text-gray-800">Amount due</span>
            <p className="font-medium text-xl text-green-700">{totals.total.toFixed(2)} XAF</p>
          </div>
          <Button
            width="full"
            type="button"
            text={isPending ? 'Processing...' : `Complete with ${selected.label}`}
            onClick={handleComplete}
            disabled={!canSubmit}
          />
        </div>
      </div>

      <OrderSummary
        subtotal={context?.orderSummary?.subtotal || 0}
        discount={context?.orderSummary?.discount || 0}
        tax={context?.orderSummary?.tax || 0}
        itemDiscounts={context?.orderSummary?.itemDiscounts || 0}
        total={context?.orderSummary?.total || 0}
        setDiscount={(newDiscount: number) => context?.setOrderSummary?.((prev) => ({ ...prev, discount: newDiscount }))}
      />
      {printer.getIframeElement()}
    </div>
  );
};
export default OtherPayment;
