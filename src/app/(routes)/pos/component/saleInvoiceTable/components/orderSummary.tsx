import React from 'react';
import ModalCoupon from './modalCoupon';
import HoldOrderButton from './holdOn';

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  itemDiscounts: number;
  tax: number;
  total: number;
  setDiscount: (amount: number) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  discount,
  itemDiscounts,
  tax,
  total,
  setDiscount,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const totalDiscount = discount + itemDiscounts;

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="inline-flex h-9 items-center border border-[var(--pos-coupon)] px-3 text-sm font-medium text-[var(--pos-coupon)] hover:bg-[#f5f0fa]"
        onClick={() => setIsModalOpen(true)}
      >
        <i className="ri-coupon-3-line mr-2 text-lg" />
        Add Coupon
      </button>
      <ModalCoupon
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onApplyCoupon={(amount) => setDiscount(amount)}
      />

      <div className="relative flex items-end justify-between gap-4">
        <HoldOrderButton />
        <div className="ml-auto w-[280px] max-w-full space-y-0">
          <div className="mb-3 flex justify-between text-sm">
            <span>Sub-Total</span>
            <span className="font-semibold">{fmt(subtotal)}</span>
          </div>
          <div className="mb-3 border-b border-[var(--pos-border)]" />

          <div className="mb-3 flex justify-between text-sm">
            <span>Discounts</span>
            <span className="font-semibold text-[var(--pos-discount)]">{fmt(totalDiscount)}</span>
          </div>
          <div className="mb-3 border-b border-[var(--pos-border)]" />

          <div className="mb-3 flex justify-between text-sm">
            <span>Tax</span>
            <span className="font-semibold">{fmt(tax)}</span>
          </div>
          <div className="mb-3 border-b border-[var(--pos-border)]" />

          <div className="flex justify-between text-base">
            <span className="font-medium">Total</span>
            <span className="font-bold">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
