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

  const fmt = (n: number) => `${n.toFixed(2)} XAF`;

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

      <div className="flex items-end justify-between gap-4">
        <HoldOrderButton />
        <div className="ml-auto w-[280px] max-w-full space-y-0 text-sm">
          <div className="mb-2 flex items-center justify-between py-1">
            <span className="text-gray-600">Sub-Total</span>
            <span className="font-semibold text-gray-800">{fmt(subtotal)}</span>
          </div>
          <div className="mb-2 border-b border-[var(--pos-border)]" />

          <div className="mb-2 flex items-center justify-between py-1">
            <span className="text-gray-600">Discounts</span>
            <span className="font-semibold text-[var(--pos-discount)]">
              {totalDiscount > 0 ? `-${fmt(totalDiscount)}` : fmt(0)}
            </span>
          </div>
          <div className="mb-2 border-b border-[var(--pos-border)]" />

          <div className="mb-2 flex items-center justify-between py-1">
            <span className="text-gray-600">Tax</span>
            <span className="font-semibold text-gray-800">{fmt(tax)}</span>
          </div>
          <div className="mb-2 border-b border-[var(--pos-border)]" />

          <div className="flex items-center justify-between bg-[#e8f5e8] px-2 py-2.5">
            <span className="font-medium text-gray-900">Total</span>
            <span className="text-base font-bold text-[var(--pos-green)]">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
