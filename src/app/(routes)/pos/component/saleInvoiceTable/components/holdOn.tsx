import React, { useContext } from 'react';
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
      alert('No items to hold');
      return;
    }

    // Get existing held orders and calculate next order number
    const existingOrders: HoldOrder[] = JSON.parse(localStorage.getItem('heldOrders') || '[]');
    const nextOrderNum = existingOrders.length + 1;

    // Format to 6 digits with leading zeros
    const formattedId = nextOrderNum.toString().padStart(6, '0');

    const newHoldOrder: HoldOrder = {
      id: formattedId,
      items: context.data,
      timestamp: new Date().toISOString(),
      total: context.data.reduce((sum: number, item: CartItem) =>
        sum + (Number(item.price) * Number(item.quantity)),
        0
      )
    };

    const updatedOrders = [...existingOrders, newHoldOrder];
    localStorage.setItem('heldOrders', JSON.stringify(updatedOrders));
    context.setData([]);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <button
      className='m-5 w-fit h-fit border rounded-full p-5 hover:bg-slate-300'
      onClick={handleHold}
      disabled={!context?.data || context.data.length === 0}
    >
       <img src="/icons/hold.svg" className=' cursor-pointer w-8 h-8' alt="" />
    </button>
  );
};

export default HoldOrderButton;
