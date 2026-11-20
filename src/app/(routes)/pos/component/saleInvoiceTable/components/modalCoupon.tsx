import Button from '@potta/components/button'
import Input from '@potta/components/input'
import Modal from '@potta/components/modal'
import React, { useState } from 'react'
import toast from 'react-hot-toast';

interface CouponModalProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onApplyCoupon?: (amount: number) => void;
}

const ModalCoupon: React.FC<CouponModalProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
  onApplyCoupon
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  const handleApplyCoupon = () => {
    // Simple coupon validation - you can replace this with your actual coupon logic
    if (couponCode.trim() === '') {
      setError('Please enter a coupon code');
      return;
    }

    // Mock coupon validation - replace with your actual coupon validation logic
    const validCoupons: { [key: string]: number } = {
      'SAVE10': 10,
      'SAVE20': 20,
      'SAVE50': 50
    };

    const discountAmount = validCoupons[couponCode];
    if (discountAmount) {
      onApplyCoupon?.(discountAmount);
      toast.success(`Coupon applied: ${discountAmount}% off`);
      setIsOpen(false);
      setCouponCode('');
      setError('');
    } else {
      setError('Invalid coupon code');
    }
  };

  return (
    <Modal
      width='w-[600px]'
      open={isOpen}
      setOpen={setIsOpen}
      title='Add Coupon'
      text='Add Coupon'
    >
      <div className='mb-2 px-2 w-full flex flex-col justify-center'>
        <div className='w-full'>
          <Input
          name="coupon"
            type='text'
            value={couponCode}
            onchange={(e) => {
              setCouponCode(e.target.value);
              setError('');
            }}
            placeholder='Enter coupon code (e.g., SAVE10)'
            
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
      </div>
      <div className=' px-2 py-2.5 w-full flex justify-end'>
        <Button
          height={true}
          text='Apply'
          type='button'
          icon={<i className='ri-arrow-right-line text-xl'></i>}
          onClick={handleApplyCoupon}
        />
      </div>
    </Modal>
  )
}

export default ModalCoupon
