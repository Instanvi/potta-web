import React, { createContext, useContext, useState } from 'react';
import { Product } from './types';

interface InventoryContextType {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  filters: {
    search: string;
    productType: string;
    sort: string;
  };
  setFilters: (filters: {
    search: string;
    productType: string;
    sort: string;
  }) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    productType: 'ALL',
    sort: 'createdAt:ASC',
  });

  return (
    <InventoryContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        filters,
        setFilters,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
