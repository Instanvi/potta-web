import React, { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';

const TABS = [
  { key: 'cart', label: 'Cart', icon: 'ri-shopping-cart-line' },
  { key: 'cash', label: 'Pay Cash', icon: 'ri-money-dollar-box-line' },
  { key: 'other', label: 'Other Method', icon: 'ri-wallet-3-line' },
  { key: 'calculate', label: 'Calculator', icon: 'ri-calculator-line' },
] as const;

const SaleInvoiceButons = () => {
  const context = useContext(ContextData);

  return (
    <div className="grid w-full grid-cols-4 gap-0.5">
      {TABS.map((tab, index) => {
        const selected = context?.itemSelected === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => context?.setItemSelected(tab.key)}
            className={`flex h-20 flex-col items-center justify-center gap-1 text-sm font-semibold transition-colors ${
              index > 0 ? 'ml-0.5' : ''
            } ${
              selected
                ? 'bg-[var(--pos-green)] text-white'
                : 'bg-[var(--pos-tab-idle)] text-black hover:bg-[#d9d9d9]'
            }`}
          >
            <i className={`${tab.icon} text-xl leading-none`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SaleInvoiceButons;
