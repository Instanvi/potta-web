'use client';
import React, { useEffect, useContext } from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { ContextData } from '@potta/components/providers/DataProvider';
import OrderSummary from './orderSummary';

// Import or define the LineItem type
export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'NONE';

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

const TableOPS = () => {
  const context = useContext(ContextData);

  const deleteItem = (productId: string) => {
    if (context?.data && Array.isArray(context.data)) {
      context.setData(
        context.data.filter((item: LineItem) => item.productId !== productId)
      );
    }
  };

  const calculateTotalPrice = () => {
    if (
      !context?.data ||
      !Array.isArray(context.data) ||
      context.data.length === 0
    ) {
      // Initialize with zeros if data is not available or empty
      context?.setOrderSummary?.({
        subtotal: 0,
        tax: 0,
        discount: context?.orderSummary?.discount || 0,
        itemDiscounts: 0,
        total: 0,
      });
      return;
    }

    const calculatedSubtotal = context.data.reduce(
      (acc: number, item: LineItem) => {
        const price = Number(item.unitPrice);
        const quantity = Number(item.quantity);
        return acc + price * quantity;
      },
      0
    );

    // Calculate tax based on each item's tax rate
    const calculatedTax = context.data.reduce((acc: number, item: LineItem) => {
      const price = Number(item.unitPrice);
      const quantity = Number(item.quantity);
      const taxRate = Number(item.taxRate) / 100; // Assuming taxRate is stored as percentage
      return acc + price * quantity * taxRate;
    }, 0);

    // Calculate item discounts
    const itemDiscounts = context.data.reduce((acc: number, item: LineItem) => {
      const price = Number(item.unitPrice);
      const quantity = Number(item.quantity);
      const discountRate = Number(item.discountRate || 0);

      let discount = 0;
      if (item.discountType === 'PERCENTAGE') {
        discount = price * quantity * (discountRate / 100);
        // Apply discount cap if needed
        if (item.discountCap > 0 && discount > item.discountCap) {
          discount = item.discountCap;
        }
      } else if (item.discountType === 'FIXED') {
        discount = discountRate * quantity;
      }

      return acc + discount;
    }, 0);

    // Calculate final total with current order-level discount from context
    const orderDiscount = context.orderSummary?.discount || 0;
    const totalDiscount = itemDiscounts + orderDiscount;
    const calculatedTotal = calculatedSubtotal + calculatedTax - totalDiscount;

    // Update order summary in context
    context?.setOrderSummary?.({
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      discount: orderDiscount,
      itemDiscounts: itemDiscounts,
      total: calculatedTotal,
    });
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [context?.data, context?.orderSummary?.discount]);

  const handleQuantityChange = (productId: string, change: number) => {
    if (context?.data && Array.isArray(context.data)) {
      context.setData((prevData: LineItem[]) => {
        if (!Array.isArray(prevData)) return prevData;

        return prevData.map((item: LineItem) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + change;
            if (newQuantity < 1) {
              alert('Minimum quantity is 1');
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      });
    }
  };

  const calculateItemDiscount = (item: LineItem): number => {
    const price = Number(item.unitPrice);
    const quantity = Number(item.quantity);
    const discountRate = Number(item.discountRate || 0);

    if (item.discountType === 'NONE') return 0;

    let discount = 0;
    if (item.discountType === 'PERCENTAGE') {
      discount = price * quantity * (discountRate / 100);
      // Apply discount cap if needed
      if (item.discountCap > 0 && discount > item.discountCap) {
        discount = item.discountCap;
      }
    } else if (item.discountType === 'FIXED') {
      discount = discountRate * quantity;
    }

    return discount;
  };

  const columns = [
    {
      accessorKey: 'description',
      header: 'Name',
      cell: ({ row: { original } }) => original.description,
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row: { original } }) => (
        <div className="flex space-x-1 items-center">
          <button
            onClick={() => handleQuantityChange(original.productId, -1)}
            disabled={original.quantity <= 1}
            className="h-[20px] bg-red-500 border-red-500 px-2 items-center border text-white flex justify-center w-[20px]"
          >
            <i className="ri-subtract-line text-lg"></i>
          </button>
          <input
            type="text"
            value={original.quantity}
            readOnly
            className="h-[26px] w-[40px] text-base bg-slate-300 outline-none pl-2"
          />
          <button
            onClick={() => handleQuantityChange(original.productId, 1)}
            className="h-[20px] bg-green-800 border-green-800 px-2 text-white border-y border-r w-[20px] items-center flex justify-center"
          >
            <i className="ri-add-line text-lg"></i>
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: 'Price',
      cell: ({ row: { original } }) => {
        const price = Number(original.unitPrice);
        return isNaN(price) ? '0.00' : `$${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'discount',
      header: 'Discount',
      cell: ({ row: { original } }) => {
        const discount = calculateItemDiscount(original);
        return isNaN(discount) ? '0.00' : `$${discount.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row: { original } }) => {
        const price = Number(original.unitPrice);
        const quantity = Number(original.quantity);
        const discount = calculateItemDiscount(original);
        const taxAmount = price * quantity * (original.taxRate / 100);

        if (isNaN(price) || isNaN(quantity)) {
          return '$0.00';
        }

        const subtotal = price * quantity + taxAmount - discount;
        return `$${subtotal.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row: { original } }) => (
        <button
          className="text-red-500 hover:text-red-400"
          onClick={() => deleteItem(original.productId)}
        >
          <i className="ri-delete-bin-line text-xl"></i>
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="mt-2 flex flex-col justify-between bg-white h-full">
        <div className=" p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cart Items
            </h3>
            <div className="">
              <DataGrid
                showHeight={true}
                columns={columns}
                data={Array.isArray(context?.data) ? context.data : []}
              />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 p-4">
          <OrderSummary
            subtotal={context?.orderSummary?.subtotal || 0}
            discount={context?.orderSummary?.discount || 0}
            itemDiscounts={context?.orderSummary?.itemDiscounts || 0}
            tax={context?.orderSummary?.tax || 0}
            total={context?.orderSummary?.total || 0}
            setDiscount={(newDiscount: number) => {
              if (context?.setOrderSummary) {
                context.setOrderSummary((prev) => ({
                  ...prev,
                  discount: newDiscount,
                  total:
                    prev.subtotal +
                    prev.tax -
                    (prev.itemDiscounts + newDiscount),
                }));
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TableOPS;
