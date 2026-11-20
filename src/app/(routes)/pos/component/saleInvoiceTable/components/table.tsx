'use client';
import React, { useEffect, useContext } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { ContextData } from '@potta/components/providers/DataProvider';
import OrderSummary from './orderSummary';
import { computeLine, computeTotals, lineDiscount, type SaleLineItem } from '@potta/app/(routes)/pos/utils/sale';

type Row = { row: { original: LineItem } };

type LineItem = SaleLineItem & { stock?: number | null };

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
    const items: LineItem[] = Array.isArray(context?.data) ? context.data : [];
    const totals = computeTotals(items, context?.orderSummary?.discount || 0);
    context?.setOrderSummary?.({
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      itemDiscounts: totals.itemDiscounts,
      total: totals.total,
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
            if (newQuantity < 1) return item;
            if (item.stock != null && newQuantity > item.stock) return item;
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      });
    }
  };

  const calculateItemDiscount = (item: LineItem): number => lineDiscount(item);

  const columns = [
    {
      accessorKey: 'description',
      header: 'Name',
      cell: ({ row: { original } }: Row) => original.description,
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row: { original } }: Row) => (
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
      cell: ({ row: { original } }: Row) => {
        const price = Number(original.unitPrice);
        return isNaN(price) ? '0.00' : price.toFixed(2);
      },
    },
    {
      accessorKey: 'discount',
      header: 'Discount',
      cell: ({ row: { original } }: Row) => {
        const discount = calculateItemDiscount(original);
        return isNaN(discount) ? '0.00' : discount.toFixed(2);
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row: { original } }: Row) => `${computeLine(original).total.toFixed(2)} XAF`,
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row: { original } }: Row) => (
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
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Cart Items
            </h3>
            <div className="">
              <DataGrid<LineItem>
                columns={columns as ColumnDef<LineItem>[]}
                data={Array.isArray(context?.data) ? context.data : []}
                showPagination={false}
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
