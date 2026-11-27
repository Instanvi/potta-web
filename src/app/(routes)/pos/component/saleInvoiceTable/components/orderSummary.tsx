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

const formatAmount = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="flex h-9 items-center border border-[#7844B9] bg-transparent px-3 text-sm font-medium text-[#7844B9] transition-colors hover:bg-[#7844B9] hover:text-white"
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
        <div className="w-[280px] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-800">Sub-Total</span>
            <p className="text-sm font-semibold text-gray-900">{formatAmount(subtotal)}</p>
          </div>
          <div className="border-b border-[#E0E0E0]" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-800">Discounts</span>
            <p className="text-sm font-semibold text-[#DC2626]">{formatAmount(totalDiscount)}</p>
          </div>
          <div className="border-b border-[#E0E0E0]" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-800">Tax</span>
            <p className="text-sm font-semibold text-gray-900">{formatAmount(tax)}</p>
          </div>
          <div className="border-b border-[#E0E0E0]" />

          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <p className="text-base font-bold text-gray-900">{formatAmount(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
