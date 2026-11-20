import React from 'react';
import ModalCoupon from './modalCoupon';
import HoldOrderButton from './holdOn';

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  itemDiscounts: number; // Added item-level discounts
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

  // Calculate the total discount (item-level + order-level)
  const totalDiscount = discount + itemDiscounts;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button
          className="px-6 py-3 flex items-center text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="ri-coupon-3-line mr-2 text-xl"></i>Add Coupon
        </button>
        <ModalCoupon
          open={isModalOpen}
          setOpen={setIsModalOpen}
          onApplyCoupon={(amount) => setDiscount(amount)}
        />
      </div>

      <div className="w-full flex justify-between items-end">
        <HoldOrderButton />
        <div className="w-1/2">
          <div className="w-full flex justify-end">
            <div className="w-96 bg-gray-50 p-4 space-y-3">
              <div className="w-full flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Subtotal</span>
                <p className="font-medium text-lg text-gray-800">
                  ${subtotal.toFixed(2)}
                </p>
              </div>

              {/* Show item discounts if any */}
              {itemDiscounts > 0 && (
                <div className="w-full flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">
                    Item Discounts
                  </span>
                  <p className="font-medium text-red-500 text-lg">
                    -${itemDiscounts.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Show coupon discount if any */}
              {discount > 0 && (
                <div className="w-full flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">
                    Coupon Discount
                  </span>
                  <p className="font-medium text-red-500 text-lg">
                    -${discount.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Show total discount row only if there are discounts */}
              {totalDiscount > 0 && (
                <div className="w-full flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">
                    Total Discount
                  </span>
                  <p className="font-medium text-red-500 text-lg">
                    -${totalDiscount.toFixed(2)}
                  </p>
                </div>
              )}

              <div className="w-full flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Tax</span>
                <p className="font-medium text-lg text-gray-800">
                  ${tax.toFixed(2)}
                </p>
              </div>
              <div className="w-full flex justify-between py-3 bg-green-50 px-3">
                <span className="font-medium text-gray-800">Total</span>
                <p className="font-medium text-xl text-green-700">
                  ${total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
