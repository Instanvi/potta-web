import React, { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';

const tabs = [
  { key: 'cart', label: 'Cart', icon: 'ri-shopping-cart-line' },
  { key: 'cash', label: 'Pay Cash', icon: 'ri-money-dollar-box-line' },
  { key: 'other', label: 'Other Method', icon: 'ri-wallet-3-line' },
  { key: 'calculate', label: 'Calculator', icon: 'ri-calculator-line' },
] as const;

const SaleInvoiceButons = () => {
  const context = useContext(ContextData);

  return (
    <div className="grid w-full grid-cols-4 gap-0.5">
      {tabs.map((tab) => {
        const active = context?.itemSelected === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => context?.setItemSelected(tab.key)}
            className={`flex h-20 flex-col items-center justify-center gap-1.5 transition-colors ${
              active
                ? 'bg-[#1E5B13] text-white'
                : 'bg-[#E6E6E6] text-black hover:bg-[#d9d9d9]'
            }`}
          >
            <i className={`${tab.icon} text-xl`} />
            <span className="text-sm font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
export default SaleInvoiceButons;
