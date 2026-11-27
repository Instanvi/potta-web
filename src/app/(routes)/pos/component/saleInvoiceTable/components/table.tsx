'use client';
import React, { useEffect, useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import OrderSummary from './orderSummary';
import { computeLine, computeTotals, lineDiscount, type SaleLineItem } from '@potta/app/(routes)/pos/utils/sale';

type LineItem = SaleLineItem & { stock?: number | null };

const TableOPS = () => {
  const context = useContext(ContextData);
  const items: LineItem[] = Array.isArray(context?.data) ? context.data : [];

  const deleteItem = (productId: string) => {
    if (context?.data && Array.isArray(context.data)) {
      context.setData(context.data.filter((item: LineItem) => item.productId !== productId));
    }
  };

  const calculateTotalPrice = () => {
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

  const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="flex h-full flex-col justify-between bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        <div className="overflow-hidden border border-[#E0E0E0]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="h-[45px] bg-[#1E5B13] text-left text-white">
                <th className="px-3.5 font-bold">Name</th>
                <th className="px-2 font-bold">Quantity</th>
                <th className="px-2 font-bold">Price</th>
                <th className="px-2 font-bold">Total</th>
                <th className="w-[50px] px-1 font-bold" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3.5 py-8 text-center text-gray-500">
                    Cart is empty
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const line = computeLine(item);
                  const discount = lineDiscount(item);
                  return (
                    <tr
                      key={item.lineKey ?? item.productId}
                      className="h-[50px] border-b border-[#E0E0E0] bg-white"
                    >
                      <td className="px-3.5 py-2 align-middle">
                        <p className="line-clamp-2 text-sm text-gray-900">{item.description}</p>
                        {discount > 0 && (
                          <p className="text-[11px] text-[#666666]">
                            Disc: {formatAmount(discount)}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-2 align-middle">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, -1)}
                            disabled={item.quantity <= 1}
                            className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-red-600 text-sm font-bold text-white hover:bg-[#CC0000] disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="min-w-[25px] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#006400] text-sm font-bold text-white hover:bg-[#228B22]"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2 align-middle text-sm">
                        {formatAmount(Number(item.unitPrice) || 0)}
                      </td>
                      <td className="px-2 py-2 align-middle text-sm font-semibold">
                        {formatAmount(line.total)}
                      </td>
                      <td className="px-1 py-2 align-middle text-center">
                        <button
                          type="button"
                          className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-red-500 hover:bg-[#FFE6E6]"
                          onClick={() => deleteItem(item.productId)}
                          aria-label="Delete item"
                        >
                          <i className="ri-delete-bin-line text-lg" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="shrink-0 border-t border-[#E0E0E0] p-2.5">
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
                total: prev.subtotal + prev.tax - (prev.itemDiscounts + newDiscount),
              }));
            }
          }}
        />
      </div>
    </div>
  );
};

export default TableOPS;
