'use client';
import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Product } from '../../utils/types';
import { posApi } from '../../utils/api';
import { isStockTracked, productToLine, type SaleLineItem } from '../../utils/sale';
import ProductChooser, { productNeedsChooser } from '@potta/components/product-lines/ProductChooser';
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
  const [chooserId, setChooserId] = useState<string | null>(null);
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

    const addLine = (line: SaleLineItem) => {
      context?.setData((prevData: LineItem[]) => {
        const key = line.lineKey ?? line.productId;
        const existingItem = prevData?.find((item) => (item.lineKey ?? item.productId) === key);
        if (existingItem) {
          if (itemToAdd.stock !== null && existingItem.quantity >= itemToAdd.stock) {
            toast.error(`Only ${itemToAdd.stock} ${itemToAdd.name} in stock`);
            return prevData;
          }
          return prevData.map((item) =>
            (item.lineKey ?? item.productId) === key ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        const lineItem: LineItem = { ...line, stock: itemToAdd.stock };
        return prevData?.length > 0 ? [...prevData, lineItem] : [lineItem];
      });
    };
    const product = products.find((p) => p.uuid === itemToAdd.id);
    if (product && productNeedsChooser(product)) {
      setChooserId(product.uuid);
      return;
    }
    addLine(itemToAdd.line);
  };

  const handleActive = (id: string) => {
    setActiveId(id);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMenus = menus.filter((item) => !activeId || item.category === activeId);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        Error loading products. Please try again.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[var(--pos-catalog-bg)] py-3">
      <div className="flex w-full gap-2 px-3">
        <div className="flex h-10 w-1/2 overflow-hidden border border-[var(--pos-border)] bg-white">
          <div className="flex w-10 shrink-0 items-center justify-center border-r border-[var(--pos-border)]">
            <i className="ri-search-line text-lg text-gray-600" />
          </div>
          <input
            id="search-input"
            name="search"
            type="text"
            placeholder="Search Items (F2)"
            value={searchTerm}
            onChange={handleSearch}
            className="h-full w-full border-0 bg-white px-3 text-sm outline-none focus:ring-0"
          />
        </div>
        <div className="flex h-10 w-1/2 overflow-hidden border border-[var(--pos-border)] bg-white">
          <div className="flex w-10 shrink-0 items-center justify-center border-r border-[var(--pos-border)]">
            <i className="ri-barcode-line text-lg text-gray-600" />
          </div>
          <input
            id="barcode-input"
            type="text"
            placeholder="Scan Barcode (F3)"
            name="barcode"
            value={barcodeInput}
            onChange={handleBarcodeInput}
            onKeyDown={handleBarcodeKeyDown}
            autoComplete="off"
            className="h-full w-full border-0 bg-white px-3 text-sm outline-none focus:ring-0"
          />
        </div>
      </div>

      <div className="my-2 w-full border-y border-[var(--pos-border-soft)] bg-[#fafafa] px-2 py-2">
        <div className="flex overflow-x-auto no-scrollbar">
          {selected.map((category) => {
            const active = activeId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleActive(category.id)}
                className={`mx-1.5 min-w-fit whitespace-nowrap rounded-[15px] px-3.5 py-1.5 text-xs transition-colors ${
                  active
                    ? 'bg-[var(--pos-green)] text-white'
                    : 'bg-[#c8f0d0] text-black/85 hover:bg-[var(--pos-green)] hover:text-white'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 w-full flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <PottaLoader />
        ) : (
          <div className="flex flex-wrap gap-3">
            {filteredMenus.map((menuItem) => (
              <div
                key={menuItem.id}
                onClick={() => addItem(menuItem)}
                className={`relative flex h-[220px] w-[200px] max-w-[200px] cursor-pointer flex-col items-center border border-[var(--pos-border)] bg-white transition-colors hover:border-[var(--pos-green)] hover:bg-[#e8f5e8] ${
                  isOutOfStock(menuItem) ? 'opacity-70' : ''
                }`}
              >
                <div className="flex h-[150px] w-full items-center justify-center overflow-hidden">
                  <img
                    width={140}
                    height={140}
                    src={menuItem.image || '/images/placeholder.png'}
                    alt={menuItem.name}
                    className="max-h-[140px] w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.png';
                    }}
                  />
                </div>
                <p className="mt-1 line-clamp-2 px-2 text-center text-[13px] font-normal text-gray-800">
                  {menuItem.name}
                </p>
                <div className="mt-auto pb-2 text-sm font-bold text-gray-800">
                  {menuItem.price.toFixed(2)} XAF
                </div>
                {menuItem.stock !== null && menuItem.stock > 0 && menuItem.stock <= 5 && (
                  <span className="absolute bottom-1 left-2 text-[11px] font-light text-[#ff4444]">
                    {menuItem.stock} left
                  </span>
                )}
                {isOutOfStock(menuItem) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="rounded bg-[var(--pos-oos)] px-2 py-1 text-xs font-semibold text-white">
                      Out of Stock
                    </span>
                  </div>
                )}
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
              className="h-9 border border-[var(--pos-border)] bg-white px-4 text-sm font-medium text-foreground hover:bg-[#e8f5e8] disabled:opacity-60"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
        {filteredMenus.length === 0 && searchTerm !== '' && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-500">No matching items found.</p>
          </div>
        )}
        {filteredMenus.length === 0 && searchTerm === '' && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-500">No items found.</p>
          </div>
        )}
      </div>
      <ProductChooser
        productId={chooserId}
        open={Boolean(chooserId)}
        onClose={() => setChooserId(null)}
        onConfirm={(line) => {
          context?.setData((prevData: LineItem[]) => {
            const key = line.lineKey ?? line.productId;
            const existing = prevData?.find((item) => (item.lineKey ?? item.productId) === key);
            if (existing) {
              return prevData.map((item) =>
                (item.lineKey ?? item.productId) === key ? { ...item, quantity: item.quantity + 1 } : item
              );
            }
            return prevData?.length > 0 ? [...prevData, line] : [line];
          });
        }}
      />
    </div>
  );
};

export default SaleInvoiceCard;
