'use client';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useCan } from '@/components/auth/can';
import { useCreateSalesReceipt } from '@potta/app/(routes)/pos/sales/hooks/useCreateReceipt';
import { ReceiptPrinter, type OrderData } from '../../print/receiptPrinter';
import {
  PAYMENT_METHODS,
  apiErrorMessage,
  buildSalePayload,
  computeTotals,
  type PaymentMethod,
  type SaleLineItem,
  type SaleTender,
} from '@potta/app/(routes)/pos/utils/sale';

const EMPTY_SUMMARY = { subtotal: 0, discount: 0, itemDiscounts: 0, tax: 0, total: 0 };

const paymentLabel = (method: PaymentMethod) => PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;

/** Till checkout shared by the cash and other-payment panels: posts the sale, prints, resets the cart. */
export function useCheckout() {
  const context = useContext(ContextData);
  const mutation = useCreateSalesReceipt();
  const { canAccess } = useCan();
  const canSell = canAccess('SalesReciept', 'create');
  const [printer] = useState(() => new ReceiptPrinter());
  const [lastOrder, setLastOrder] = useState<OrderData | null>(null);

  const items: SaleLineItem[] = Array.isArray(context?.data) ? context.data : [];
  const orderDiscount = context?.orderSummary?.discount || 0;
  const totals = computeTotals(items, orderDiscount);

  const checkout = async (input: {
    paymentMethod: PaymentMethod;
    payments?: SaleTender[];
    customerId?: string | null;
    reference?: string;
    cashTendered?: number;
  }) => {
    if (!canSell) {
      toast.error('You do not have permission to record sales');
      return false;
    }
    if (items.length === 0) {
      toast.error('Add items to the cart first');
      return false;
    }
    const payload = buildSalePayload({
      items,
      orderDiscount,
      paymentMethod: input.paymentMethod,
      payments: input.payments,
      customerId: input.customerId,
      reference: input.reference,
    });

    try {
      const receipt = await mutation.mutateAsync(payload);
      const total = Number(receipt?.totalAmount ?? totals.total);
      const cashAmount = input.cashTendered ?? total;
      const order: OrderData = {
        orderNumber: receipt?.receiptNumber ?? '',
        orderItems: items.map((i) => ({ quantity: i.quantity, name: i.description, price: Number(i.unitPrice) })),
        total,
        tax: Number(receipt?.taxAmount ?? totals.tax),
        discount: totals.discount + totals.itemDiscounts,
        cashAmount,
        change: Math.max(cashAmount - total, 0),
        paymentLabel: paymentLabel(input.paymentMethod),
        timestamp: new Date().toISOString(),
      };
      setLastOrder(order);
      context?.setData([]);
      context?.setOrderSummary?.(EMPTY_SUMMARY);
      toast.success(`Sale ${order.orderNumber} completed`);
      printer.printReceipt(order).catch(() => toast.error('Sale saved, but the receipt could not be printed'));
      return true;
    } catch (error) {
      toast.error(`Sale not saved: ${apiErrorMessage(error)}`);
      return false;
    }
  };

  const reprint = () => {
    if (!lastOrder) return toast.error('No previous order found to reprint');
    toast.promise(printer.printReceipt(lastOrder), {
      loading: 'Reprinting receipt...',
      success: 'Receipt reprinted',
      error: 'Failed to reprint receipt',
    });
  };

  return { items, totals, checkout, reprint, lastOrder, printer, canSell, isPending: mutation.isPending };
}
