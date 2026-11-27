import React, { useContext } from 'react';
import { toast } from 'sonner';
import { ContextData } from '@potta/components/providers/DataProvider';
import { buildHeldOrder, readHeldOrders, writeHeldOrders } from '../../../utils/heldOrders';
import type { SaleLineItem } from '../../../utils/sale';

const HoldOrderButton: React.FC = () => {
  const context = useContext(ContextData);

  const handleHold = () => {
    const items: SaleLineItem[] = Array.isArray(context?.data) ? context.data : [];
    if (items.length === 0) {
      toast.info('No items to hold');
      return;
    }

    const existing = readHeldOrders();
    writeHeldOrders([...existing, buildHeldOrder(items)]);
    context?.setData([]);
    toast.success('Order held');
  };

  return (
    <button
      type="button"
      className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-[#EEEEEE] bg-white shadow-sm hover:bg-[#F8F8F8] disabled:cursor-not-allowed disabled:opacity-40"
      onClick={handleHold}
      disabled={!context?.data || context.data.length === 0}
      aria-label="Hold order"
      title="Hold order"
    >
      <img src="/icons/hold.svg" className="h-[25px] w-[25px]" alt="" />
    </button>
  );
};

export default HoldOrderButton;
