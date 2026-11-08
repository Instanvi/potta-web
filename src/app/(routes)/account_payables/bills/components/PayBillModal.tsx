'use client';
import { useEffect, useState } from 'react';
import Modal from '@potta/components/modal';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import { formatMoney } from '../../utils/format';
import { usePayBill } from '../hooks';
import { BILL_PAYMENT_METHODS, Bill, PaymentMethod } from '../utils/types';

interface Props {
  bill: Bill | null;
  onClose: () => void;
}

const PayBillModal = ({ bill, onClose }: Props) => {
  const pay = usePayBill();
  const total = Number(bill?.invoiceTotal ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!bill) return;
    const preferred = BILL_PAYMENT_METHODS.find((m) => m.value === bill.paymentMethod);
    setPaymentMethod(preferred?.value ?? 'BANK_TRANSFER');
    setPaymentReference('');
    setAmount(String(Number(bill.invoiceTotal ?? 0)));
  }, [bill]);

  const amountNumber = Number(amount);
  const amountError =
    amount === '' || !Number.isFinite(amountNumber)
      ? 'Enter the amount paid'
      : Math.abs(amountNumber - total) > 0.01
      ? `Bills are settled in full: the amount must equal ${formatMoney(total, bill?.currency)}`
      : undefined;

  return (
    <Modal
      open={!!bill}
      setOpen={(value) => !value && onClose()}
      title={`Record payment · ${bill?.code ?? ''}`}
      width="max-w-lg"
    >
      <div className="space-y-4 px-6 pb-6">
        <p className="text-sm text-gray-600">
          Records a payment made outside Potta (bank, cash, mobile money) and settles the vendor payable
          in the books.
        </p>
        <Select
          label="Payment method"
          options={BILL_PAYMENT_METHODS}
          selectedValue={paymentMethod}
          onChange={(v: PaymentMethod) => setPaymentMethod(v)}
          bg="bg-white"
        />
        <Input
          type="text"
          name="paymentReference"
          label="Reference"
          placeholder="Bank transfer ID, receipt number..."
          value={paymentReference}
          onchange={(e) => setPaymentReference(e.target.value)}
        />
        <Input
          type="number"
          name="amount"
          label={`Amount (${bill?.currency ?? 'XAF'})`}
          value={amount}
          min={0}
          onchange={(e) => setAmount(e.target.value)}
          errors={amountError}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
          <Button
            text="Record payment"
            type="button"
            isLoading={pay.isPending}
            disabled={pay.isPending || !!amountError}
            onClick={() =>
              bill &&
              pay.mutate(
                {
                  id: bill.uuid,
                  data: {
                    paymentMethod,
                    amount: amountNumber,
                    paymentReference: paymentReference.trim() || undefined,
                  },
                },
                { onSuccess: onClose }
              )
            }
          />
        </div>
      </div>
    </Modal>
  );
};

export default PayBillModal;
