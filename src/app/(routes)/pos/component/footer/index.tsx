'use client';

import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ContextData } from '@potta/components/providers/DataProvider';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {
  buildHeldOrder,
  readHeldOrders,
  subscribeHeldOrders,
  writeHeldOrders,
  type HeldOrder,
} from '../../utils/heldOrders';
import type { SaleLineItem } from '../../utils/sale';

const HeldOrders: React.FC = () => {
  const context = useContext(ContextData);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setHeldOrders(readHeldOrders());
    refresh();
    return subscribeHeldOrders(refresh);
  }, []);

  /** Desktop SwapWithWaitingTransaction: restore held order; park current cart if busy. */
  const handleSelectOrder = (order: HeldOrder) => {
    const currentItems: SaleLineItem[] = Array.isArray(context?.data) ? context.data : [];
    let next = heldOrders.filter((o) => o.id !== order.id);

    if (currentItems.length > 0) {
      next = [...next, buildHeldOrder(currentItems)];
    }

    writeHeldOrders(next);
    context?.setData(order.items);
    toast.success(currentItems.length > 0 ? 'Orders swapped' : 'Held order restored');
  };

  const handleDeleteOrder = (orderId: string) => {
    writeHeldOrders(heldOrders.filter((o) => o.id !== orderId));
    setDeleteConfirmId(null);
  };

  if (heldOrders.length === 0) {
    return (
      <div className="flex h-full items-center px-4 text-sm text-white/80">
        No held orders
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full items-center overflow-x-auto px-2">
        <div className="flex items-center">
          {heldOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleSelectOrder(order)}
              className="relative mr-[5px] flex h-[57px] w-[193px] shrink-0 cursor-pointer items-center bg-[#98FB98] pl-3 pr-12 text-black hover:brightness-95"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium">ID: {order.id}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(order.id);
                }}
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-[15px] font-bold hover:bg-red-500 hover:text-white"
                aria-label="Delete held order"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

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
