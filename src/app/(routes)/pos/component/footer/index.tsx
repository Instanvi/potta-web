// components/HeldOrders.tsx
import React, { useContext, useEffect, useState } from 'react';
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

const HeldOrders: React.FC = () => {
  const context = useContext(ContextData);
  const [heldOrders, setHeldOrders] = useState<HoldOrder[]>([]);

  useEffect(() => {
    const loadHeldOrders = () => {
      const orders = JSON.parse(localStorage.getItem('heldOrders') || '[]');
      setHeldOrders(orders);
    };

    loadHeldOrders();
    window.addEventListener('storage', loadHeldOrders);

    return () => {
      window.removeEventListener('storage', loadHeldOrders);
    };
  }, []);

  const handleSelectOrder = (order: HoldOrder) => {
    if (context?.data && context.data.length > 0) {
      if (!confirm('Current cart will be replaced. Continue?')) {
        return;
      }
    }
    context?.setData(order.items);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to delete this held order?')) {
      return;
    }

    const updatedOrders = heldOrders.filter(o => o.id !== orderId);
    localStorage.setItem('heldOrders', JSON.stringify(updatedOrders));
    setHeldOrders(updatedOrders);
  };

  if (heldOrders.length === 0) {
    return (
      <div className="h-20 bg-[#005D1F]  flex items-center justify-center text-white">
        No held orders
      </div>
    );
  }

  return (
    <div className="h-20 bg-[#005D1F] p-2">
      <div className="flex gap-4 overflow-x-auto">
        {heldOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => handleSelectOrder(order)}
            className="flex items-center gap-8 min-w-fit px-4 py-3 bg-[#A0E86F] text-black hover:bg-[#8ae74d] transition-colors cursor-pointer"
          >
            <button

              className=""
            >
              ID:{order.id}
            </button>
            <button
              onClick={(e:any) =>{
                e.stopPropagation(); // Prevent the click event from bubbling up to the parent div
                handleDeleteOrder(order.id)
              } }
              className=" hover:text-white"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeldOrders;
