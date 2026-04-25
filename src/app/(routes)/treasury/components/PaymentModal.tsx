'use client';
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import { usePayBill } from '../hooks/useBills';
import { Bill } from '../utils/bills-api';

interface PaymentModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedInvoice: Bill | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  setIsOpen,
  selectedInvoice,
}) => {
  // State for modal visibility to handle animations
  const [isVisible, setIsVisible] = useState(isOpen);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Pay bill mutation
  const payBillMutation = usePayBill();

  const paymentMethods = [
    {
      id: 'MTN_CAM',
      name: 'MTN Mobile Money',
      icon: (
        <img src="/icons/mtn.svg" alt="MTN Mobile Money" className="w-6 h-6" />
      ),
      description: 'Pay with MTN Mobile Money',
      color: 'bg-green-50 border-green-200 text-green-700',
      hoverColor: 'hover:bg-green-100',
    },
  ];

  // Update visibility when isOpen prop changes
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // Handle smooth closing
  const handleClose = () => {
    setIsVisible(false);
    // Delay actual closing to allow animation to complete
    setTimeout(() => {
      setIsOpen(false);
      setIsSuccess(false);
      setPaymentResult(null);
      setPaymentMethod('');
    }, 300); // Match this with the exit animation duration
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProcessing]);

  const handlePayment = async () => {
    if (!paymentMethod || !selectedInvoice) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        paymentProvider: paymentMethod,
        currency: selectedInvoice.currency || 'XAF',
        description: `Payment for ${selectedInvoice.invoiceType || 'bill'} ${
          selectedInvoice.invoiceNumber ||
          selectedInvoice.vendorInvoiceNumber ||
          selectedInvoice.invoiceId ||
          ''
        }`,
      };

      const result = await payBillMutation.mutateAsync({
        uuid: selectedInvoice.uuid,
        paymentData,
      });

      setPaymentResult(result);
      setIsProcessing(false);
      setIsSuccess(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      // Error is already handled by the mutation hook
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white w-full max-w-md h-screen overflow-y-auto shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-medium">
                {isSuccess ? 'Payment Successful' : 'Make Payment'}
              </h2>
              {!isSuccess && (
                <button
                  onClick={handleClose}
                  className="p-2"
                  disabled={isProcessing}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {isSuccess ? (
                // Success State
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Payment Completed Successfully
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Your payment of{' '}
                    {formatCurrency(selectedInvoice?.invoiceTotal || 0)} has
                    been processed.
                  </p>
                  {paymentResult?.transactionId && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Transaction ID:
                      </p>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        {paymentResult.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Payment Form
                <div className="space-y-6">
                  {/* Invoice Details */}
                  {selectedInvoice && (
                    <div className="bg-gray-50 p-4 ">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Bill Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Invoice:</span>
                          <span className="font-medium">
                            {selectedInvoice.invoiceNumber ||
                              selectedInvoice.vendorInvoiceNumber ||
                              selectedInvoice.invoiceId ||
                              '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vendor:</span>
                          <span className="font-medium">
                            {selectedInvoice.vendor?.name ||
                              selectedInvoice.customer?.name ||
                              'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(selectedInvoice.invoiceTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Currency:</span>
                          <span className="font-medium">
                            {selectedInvoice.currency || 'XAF'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Select Payment Method
                    </h3>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full p-4 border-2  flex items-center space-x-3 transition-colors ${
                            paymentMethod === method.id
                              ? `${method.color} border-current`
                              : 'border-gray-200 hover:border-gray-300'
                          } ${method.hoverColor}`}
                          disabled={isProcessing}
                        >
                          {method.icon}
                          <div className="text-left">
                            <div className="font-medium">{method.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  {paymentMethod && (
                    <div className="space-y-4">
                      {/* MTN Mobile Money Instructions */}
                      {paymentMethod === 'MTN_CAM' && (
                        <div className="p-4 bg-blue-50 ">
                          <h4 className="font-medium text-blue-900 mb-2">
                            MTN Mobile Money Payment Instructions
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>
                              • Your bill will be processed through MTN Mobile Money
                            </li>
                            <li>
                              • Payment will be initiated immediately after confirmation
                            </li>
                            <li>
                              • You will receive a confirmation once the payment is successful
                            </li>
                            <li>
                              • Transaction details will be sent to your registered contact
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons - fixed at bottom */}
                  {paymentMethod && (
                    <div className="pt-2 flex pb-2 justify-end sticky bottom-0 bg-white w-full mt-8">
                      <Button
                        text={isProcessing ? 'Processing...' : 'Pay Now'}
                        type="button"
                        onClick={handlePayment}
                        disabled={isProcessing}
                        icon={<CreditCard className="h-4 w-4" />}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
