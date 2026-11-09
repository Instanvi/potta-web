'use client';
import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Product } from '../../utils/types';
import { posApi } from '../../utils/api';
import { isStockTracked, productToLine, type SaleLineItem } from '../../utils/sale';
import { toast } from 'sonner';
import PottaLoader from '@potta/components/pottaloader';
import { productImageUrl } from '../../inventory/_utils/images';

type LineItem = SaleLineItem & { stock?: number | null };

const PAGE_SIZE = 50;

const categoryName = (category: unknown): string =>
  typeof category === 'object' && category !== null
    ? (category as { name: string }).name
    : ((category as string) ?? 'Uncategorized');

interface MenuItem {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  sku?: string;
  /** null when the product is not stock-tracked (non-inventory, services). */
  stock: number | null;
  line: SaleLineItem;
}

const toMenuItem = (product: Product): MenuItem => ({
  id: product.uuid,
  name: product.name,
  image: productImageUrl(product as any),
  category: categoryName(product.category),
  price: Number(product.salesPrice),
  sku: product.sku,
  stock: isStockTracked(product) ? Number(product.inventoryLevel ?? 0) : null,
  line: productToLine(product),
});

interface Category {
  id: string;
  name: string;
}

const SaleInvoiceCard = () => {
  const [selected, setSelected] = useState<Category[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const barcodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingLookup = useRef<string | null>(null);

  const context = useContext(ContextData);

  const {
    data: productPages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['get-all-product', 'pos-grid', searchTerm],
    queryFn: ({ pageParam }) =>
      posApi.getAll({
        limit: PAGE_SIZE,
        page: pageParam,
        search: searchTerm,
        sortBy: 'updatedAt',
        sortOrder: 'DESC',
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last?.meta && last.meta.currentPage < last.meta.totalPages ? last.meta.currentPage + 1 : undefined,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const products = useMemo(() => productPages?.pages.flatMap((p) => p?.data ?? []) ?? [], [productPages]);
  const menus: MenuItem[] = products.map(toMenuItem);

  // Extract unique categories from products
  useEffect(() => {
    const categories = Array.from(new Set(products.map((product) => categoryName(product.category)))).map(
      (name) => ({ id: name, name })
    );
    setSelected([{ id: '', name: 'All' }, ...categories]);
  }, [products]);

  useEffect(
    () => () => {
      if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
    },
    []
  );

  /** Codes not in the loaded pages are looked up on the server by sku. */
  const lookupBarcode = async (code: string, notifyMissing: boolean) => {
    if (pendingLookup.current === code) return;
    pendingLookup.current = code;
    try {
      const res = await posApi.getAll({ page: 1, limit: 5, search: code });
      const product = res?.data?.find((p) => p.sku === code);
      if (product) {
        addItem(toMenuItem(product));
        setBarcodeInput((current) => (current === code ? '' : current));
      } else if (notifyMissing) {
        toast.error(`No product with code ${code}`);
      }
    } catch {
      if (notifyMissing) toast.error('Could not look up that code. Please try again.');
    } finally {
      pendingLookup.current = null;
    }
  };

  const matchLoaded = (code: string) => {
    const item = menus.find((item) => item.sku === code);
    if (item) {
      addItem(item);
      setBarcodeInput('');
    }
    return !!item;
  };

  // Handle barcode scanner input
  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeInput(value);
    if (barcodeTimer.current) clearTimeout(barcodeTimer.current);

    const code = value.trim();
    if (code.length >= 8 && !matchLoaded(code)) {
      barcodeTimer.current = setTimeout(() => lookupBarcode(code, false), 300);
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
    const code = barcodeInput.trim();
    if (code && !matchLoaded(code)) lookupBarcode(code, true);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchTerm('');
        setBarcodeInput('');
      }
      if (e.key === 'F2') {
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'F3') {
        document.getElementById('barcode-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const isOutOfStock = (item: MenuItem) => item.stock !== null && item.stock <= 0;

  const addItem = (itemToAdd: MenuItem) => {
    if (isOutOfStock(itemToAdd)) {
      toast.error(`${itemToAdd.name} is out of stock`);
      return;
    }

    context?.setData((prevData: LineItem[]) => {
      const existingItem = prevData?.find(
        (item) => item.productId === itemToAdd.id
      );

      if (existingItem) {
        if (itemToAdd.stock !== null && existingItem.quantity >= itemToAdd.stock) {
          toast.error(`Only ${itemToAdd.stock} ${itemToAdd.name} in stock`);
          return prevData;
        }
        return prevData.map((item) =>
          item.productId === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const lineItem: LineItem = { ...itemToAdd.line, stock: itemToAdd.stock };

      return prevData?.length > 0 ? [...prevData, lineItem] : [lineItem];
    });
  };

  const handleActive = (id: string) => {
    setActiveId(id);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter menu items based on active category
  const filteredMenus = menus.filter((item) => !activeId || item.category === activeId);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Error loading products. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 h-full py-3">
      {/* Search Section */}
      <div className="flex w-full px-3 space-x-2">
        <div className="w-[50%] flex -mt-2">
          <div className="bg-white mt-2 justify-center items-center border-y border-[#E5E7EB] border-l w-12 flex ">
            <i className="ri-search-line text-2xl"></i>
          </div>
          <input
            id="search-input"
            name="search"
            type="text"
            placeholder="Search Items (F2)"
            value={searchTerm}
            onChange={handleSearch}
            className={`w-full py-2 px-4 border border-gray-200 rounded-[2px] outline-none mt-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
   `}
          />
        </div>
        <div className="w-[50%] flex -mt-2">
          <div className="bg-white mt-2 justify-center items-center border-y border-[#E5E7EB] border-l w-12 flex">
            <i className="ri-barcode-line text-2xl"></i>
          </div>
          <input
            type="text"
            placeholder="Scan Barcode (F3)"
            name="barcode"
            value={barcodeInput}
            onChange={handleBarcodeInput}
            onKeyDown={handleBarcodeKeyDown}
            autoComplete="off"
            className={`w-full py-2 px-4 border border-gray-200 rounded-[2px] outline-none mt-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
   `}
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full my-2 py-2 border-y">
        <div className="flex overflow-x-auto no-scrollbar">
          {selected.map((category) => (
            <button
              key={category.id}
              onClick={() => handleActive(category.id)}
              className={`${
                activeId === category.id
                  ? 'bg-[#0f6a2b] text-white'
                  : 'bg-[#66e58f] text-black/85'
              } rounded-full border border-black/5 px-3.5 py-1.5 text-sm font-normal hover:bg-[#0f6a2b] hover:text-white mx-2 min-w-fit whitespace-nowrap`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="mt-2 w-full">
        <div className="w-full h-[80vh] p-3 overflow-y-auto">
          {isLoading ? (
            <PottaLoader />
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredMenus.map((menuItem) => (
                <div
                  key={menuItem.id}
                  onClick={() => addItem(menuItem)}
                  className={`bg-white hover:border-green-100 hover:bg-green-300 hover:border cursor-pointer h-48 items-center flex flex-col justify-center relative max-w-48  ${
                    isOutOfStock(menuItem) ? 'opacity-50' : ''
                  }`}
                >
                  <img
                    width={100}
                    height={100}
                    src={menuItem.image || '/images/placeholder.png'}
                    alt={menuItem.name}
                    className="h-32 w-auto mt-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.png'; // Fallback image path
                    }}
                  />
                  <p className=" text-gray-500 font-normal">{menuItem.name}</p>
                  {isOutOfStock(menuItem) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white">
                      Out of Stock
                    </div>
                  )}
                  <div className=" text-lg font-medium text-gray-700">
                    {menuItem.price.toFixed(2)} XAF
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && hasNextPage && (
            <div className="flex justify-center py-4">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="h-9 rounded-[2px] border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
          {filteredMenus.length === 0 && searchTerm !== '' && !isLoading && (
            <div className="flex justify-center items-center h-full">
              <p className="text-center text-gray-500">
                No matching items found.
              </p>
            </div>
          )}
          {filteredMenus.length === 0 && searchTerm === '' && !isLoading && (
            <div className="flex justify-center items-center h-full">
              <p className="text-center text-gray-500">No items found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleInvoiceCard;
