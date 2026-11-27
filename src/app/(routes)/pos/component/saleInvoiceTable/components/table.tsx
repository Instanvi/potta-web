'use client';
import React, { useEffect, useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import OrderSummary from './orderSummary';
import { computeLine, computeTotals, type SaleLineItem } from '@potta/app/(routes)/pos/utils/sale';

type LineItem = SaleLineItem & { stock?: number | null; modifiersText?: string };

const TableOPS = () => {
  const context = useContext(ContextData);
  const items: LineItem[] = Array.isArray(context?.data) ? context.data : [];

  const deleteItem = (key: string) => {
    if (!context?.data || !Array.isArray(context.data)) return;
    context.setData(
      context.data.filter((item: LineItem) => (item.lineKey ?? item.productId) !== key)
    );
  };

  useEffect(() => {
    const totals = computeTotals(items, context?.orderSummary?.discount || 0);
    context?.setOrderSummary?.({
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      itemDiscounts: totals.itemDiscounts,
      total: totals.total,
    });
  }, [context?.data, context?.orderSummary?.discount]);

  const handleQuantityChange = (key: string, change: number) => {
    if (!context?.data || !Array.isArray(context.data)) return;
    context.setData((prevData: LineItem[]) => {
      if (!Array.isArray(prevData)) return prevData;
      return prevData.map((item: LineItem) => {
        if ((item.lineKey ?? item.productId) !== key) return item;
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) return item;
        if (item.stock != null && newQuantity > item.stock) return item;
        return { ...item, quantity: newQuantity };
      });
    });
  };

  return (
    <div className="flex h-full flex-col justify-between bg-white">
      <div className="min-h-0 flex-1 overflow-auto p-2.5">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="h-[45px] bg-[var(--pos-green)] text-left text-white">
              <th className="px-3.5 font-bold">Name</th>
              <th className="px-2 font-bold">Quantity</th>
              <th className="px-2 font-bold">Price</th>
              <th className="px-2 font-bold">Total</th>
              <th className="w-[60px] px-1 font-bold" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Cart is empty
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const key = item.lineKey ?? item.productId;
                const line = computeLine(item);
                const price = Number(item.unitPrice);
                return (
                  <tr
                    key={key}
                    className="h-[54px] border-b border-[var(--pos-border)] text-[14px]"
                  >
                    <td className="px-3.5 py-2 align-middle">
                      <div className="truncate font-normal">{item.description}</div>
                      {item.modifiersText ? (
                        <div className="text-[11px] font-light text-[#666]">{item.modifiersText}</div>
                      ) : null}
                    </td>
                    <td className="px-2 align-middle">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(key, -1)}
                          disabled={item.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-red-600 text-sm font-bold text-white hover:bg-[#cc0000] disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="min-w-[25px] text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(key, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[darkgreen] text-sm font-bold text-white hover:bg-[#228b22]"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-2 align-middle">{isNaN(price) ? '0' : Math.round(price).toLocaleString()}</td>
                    <td className="px-2 align-middle font-semibold">
                      {Math.round(line.total).toLocaleString()}
                    </td>
                    <td className="px-1 align-middle">
                      <button
                        type="button"
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-red-500 hover:bg-[#ffe6e6]"
                        onClick={() => deleteItem(key)}
                        title="Delete item"
                      >
                        <i className="ri-delete-bin-line text-base" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="shrink-0 border-t border-[var(--pos-border-soft)] p-3">
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
