'use client';

import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

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
  const [replaceConfirm, setReplaceConfirm] = useState<HoldOrder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const applyOrder = (order: HoldOrder) => {
    context?.setData(order.items);
    setReplaceConfirm(null);
  };

  const handleSelectOrder = (order: HoldOrder) => {
    if (context?.data && context.data.length > 0) {
      setReplaceConfirm(order);
      return;
    }
    applyOrder(order);
  };

  const handleDeleteOrder = (orderId: string) => {
    const updatedOrders = heldOrders.filter((o) => o.id !== orderId);
    localStorage.setItem('heldOrders', JSON.stringify(updatedOrders));
    setHeldOrders(updatedOrders);
    setDeleteConfirmId(null);
  };

  return (
    <>
      <div className="flex h-full items-center bg-[var(--pos-green)] px-2">
        <button
          type="button"
          className="mr-2 flex h-12 w-12 shrink-0 items-center justify-center text-white"
          aria-label="Menu"
          tabIndex={-1}
        >
          <i className="ri-menu-line text-2xl" />
        </button>

        {heldOrders.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-white/80">
            No held orders
          </div>
        ) : (
          <div className="flex flex-1 gap-3 overflow-x-auto py-2 no-scrollbar">
            {heldOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => handleSelectOrder(order)}
                className="flex min-w-fit cursor-pointer items-center gap-4 bg-[var(--pos-held-chip)] px-4 py-3 text-black transition-colors hover:bg-[#8ae74d]"
              >
                <span className="text-sm font-medium">ID:{order.id}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(order.id);
                  }}
                  className="hover:text-white"
                  aria-label="Delete held order"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(replaceConfirm)}
        onOpenChange={(open) => {
          if (!open) setReplaceConfirm(null);
        }}
        title="Replace current cart?"
        description="Selecting this held order will replace the items currently in the cart."
        confirmText="Replace cart"
        destructive={false}
        onConfirm={() => {
          if (replaceConfirm) applyOrder(replaceConfirm);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
        title="Delete held order?"
        description="This removes the held order from this device."
        confirmText="Delete"
        destructive
        onConfirm={() => {
          if (deleteConfirmId) handleDeleteOrder(deleteConfirmId);
        }}
      />
    </>
  );
};

export default HeldOrders;
