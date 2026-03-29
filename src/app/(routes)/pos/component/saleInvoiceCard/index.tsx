'use client';
import Input from '@potta/components/input';
import React, { useState, useContext, useEffect } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Filter, Product } from '../../utils/types';
import useGetAllProducts from '../../hooks/useGetAllProducts';
import Image from 'next/image';
import PottaLoader from '@potta/components/pottaloader';
import { documentsApi } from '../../inventory/_utils/api';

// LineItem interface as provided
export type DiscountType = 'FlatRate' | 'Percentage' | 'PercentageWithCap';

export type LineItem = {
  description: string;
  quantity: number;
  discountCap: number;
  discountType: DiscountType;
  unitPrice: number;
  taxRate: number;
  discountRate?: number;
  productId: string;
};

// Convert API Product type to MenuItem type
const convertProductToMenuItem = (product: Product): MenuItem => ({
  id: product.uuid,
  name: product.name,
  image: product.images || '/images/placeholder.png',
  tax: product.taxRate,
  category:
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : product.category,
  quantity: 0,
  price: product.salesPrice,
  sku: product.sku,
  stock: product.inventoryLevel,
});

interface MenuItem {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  price: number;
  sku?: string;
  stock?: number;
  tax: number;
}

interface Category {
  id: string;
  name: string;
}

const SaleInvoiceCard = () => {
  const [selected, setSelected] = useState<Category[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrls, setImageUrls] = useState<{ [productId: string]: string }>(
    {}
  );

  const context = useContext(ContextData);

  // Setup filter for API
  const filter: Filter = {
    limit: 50, // Adjust based on your needs
    page: currentPage,
    search: searchTerm,
    sortBy: 'updatedAt',
    sortOrder: 'DESC',
  };

  // Fetch products using the hook
  const { data: productData, isLoading, error } = useGetAllProducts(filter);

  // Fetch signed URLs for product images
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!productData?.data) return;
      // Collect all document IDs for products with images
      const docIdMap: { [productId: string]: string } = {};
      productData.data.forEach((product: any) => {
        if (
          Array.isArray(product.documents) &&
          product.documents.length > 0 &&
          product.documents[0]?.uuid
        ) {
          docIdMap[product.uuid] = product.documents[0].uuid;
        }
      });
      const docIds = Object.values(docIdMap);
      if (docIds.length === 0) return;
      try {
        const res = await documentsApi.bulkDownload(docIds);
        // Map productId to signed URL
        const urlMap: { [productId: string]: string } = {};
        let i = 0;
        for (const [productId, docId] of Object.entries(docIdMap)) {
          urlMap[productId] = res.urls[i] || '';
          i++;
        }
        setImageUrls(urlMap);
      } catch (e) {
        // ignore
      }
    };
    fetchSignedUrls();
  }, [productData?.data]);

  // Convert API products to MenuItems
  const menus =
    productData?.data.map((product: any) => ({
      id: product.uuid,
      name: product.name,
      image:
        imageUrls[product.uuid] || product.images || '/images/placeholder.png',
      tax: product.taxRate,
      category:
        typeof product.category === 'object' && product.category !== null
          ? product.category.name
          : product.category,
      quantity: 0,
      price: product.salesPrice,
      sku: product.sku,
      stock: product.inventoryLevel,
    })) || [];

  // Extract unique categories from products
  useEffect(() => {
    if (productData?.data) {
      const categories = Array.from(
        new Set(
          productData.data.map((product) =>
            typeof product.category === 'object' && product.category !== null
              ? product.category.name
              : product.category
          )
        )
      ).map((categoryName) => ({
        id: categoryName,
        name: categoryName,
      }));
      setSelected(categories);

      // Set first category as active if none selected
      if (!activeId && categories.length > 0) {
        setActiveId(categories[0].id);
      }
    }
  }, [productData?.data]);

  // Handle barcode scanner input
  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeInput(value);

    if (value.length >= 8) {
      const item = menus.find((item) => item.sku === value);
      if (item) {
        addItem(item);
        setBarcodeInput('');
      }
    }
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

  // Convert MenuItem to LineItem with the required fields
  const convertToLineItem = (menuItem: MenuItem): LineItem => ({
    description: menuItem.name,
    quantity: 1,
    discountCap: 0,
    discountType: 'FlatRate',
    unitPrice: menuItem.price,
    taxRate: menuItem.tax,
    discountRate: 0,
    productId: menuItem.id,
  });

  const addItem = (itemToAdd: MenuItem) => {
    if (itemToAdd.stock && itemToAdd.stock <= 0) {
      // You could add a toast notification here for out of stock items
      return;
    }

    context?.setData((prevData: LineItem[]) => {
      const existingItem = prevData?.find(
        (item) => item.productId === itemToAdd.id
      );

      if (existingItem) {
        if (itemToAdd.stock && existingItem.quantity >= itemToAdd.stock) {
          return prevData;
        }
        return prevData.map((item) =>
          item.productId === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Convert to LineItem when adding new item
      const lineItem = convertToLineItem(itemToAdd);

      return prevData?.length > 0 ? [...prevData, lineItem] : [lineItem];
    });
  };

  const handleActive = (id: string) => {
    setActiveId(id);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter menu items based on active category
  const filteredMenus = menus.filter(
    (item) =>
      !activeId ||
      item.category === selected.find((cat) => cat.id === activeId)?.name
  );

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
                activeId === category.id ? 'bg-green-700' : 'bg-green-400'
              } border py-2 text-base rounded-3xl px-4 hover:bg-green-700 text-white mx-2 min-w-fit whitespace-nowrap`}
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
                  onClick={() => menuItem.stock > 0 && addItem(menuItem)}
                  className={`bg-white hover:border-green-100 hover:bg-green-300 hover:border cursor-pointer h-48 items-center flex flex-col justify-center relative max-w-48  ${
                    menuItem.stock === 0 ? 'opacity-50' : ''
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
                  <p className=" text-gray-500 font-thin">{menuItem.name}</p>
                  {menuItem.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white">
                      Out of Stock
                    </div>
                  )}
                  <div className=" text-lg font-medium text-gray-700">
                    ${menuItem.price}
                  </div>
                </div>
              ))}
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
