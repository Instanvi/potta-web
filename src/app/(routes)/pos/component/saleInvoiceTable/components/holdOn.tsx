import React, { useContext } from 'react';
import { toast } from 'sonner';
import { ContextData } from '@potta/components/providers/DataProvider';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface HoldOrder {
  id: string;
  items: CartItem[];
  timestamp: string;
  total: number;
}

const HoldOrderButton: React.FC = () => {
  const context = useContext(ContextData);

  const handleHold = () => {
    if (!context?.data || context?.data.length === 0) {
      toast.info('No items to hold');
      return;
    }

    const existingOrders: HoldOrder[] = JSON.parse(localStorage.getItem('heldOrders') || '[]');
    const nextOrderNum = existingOrders.length + 1;
    const formattedId = nextOrderNum.toString().padStart(6, '0');

    const newHoldOrder: HoldOrder = {
      id: formattedId,
      items: context.data,
      timestamp: new Date().toISOString(),
      total: context.data.reduce(
        (sum: number, item: CartItem) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    };

    const updatedOrders = [...existingOrders, newHoldOrder];
    localStorage.setItem('heldOrders', JSON.stringify(updatedOrders));
    context.setData([]);
    window.dispatchEvent(new Event('storage'));
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
