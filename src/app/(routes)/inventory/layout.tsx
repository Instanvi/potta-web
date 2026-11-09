'use client';
import React, { ReactNode } from 'react';
import { InventoryProvider } from '../pos/inventory/_utils/context';

/** Inventory module: products and categories share the inventory filter/selection context. */
export default function InventoryLayout({ children }: { children: ReactNode }) {
  return (
    <InventoryProvider>
      <div className="h-screen w-full overflow-hidden">{children}</div>
    </InventoryProvider>
  );
}
