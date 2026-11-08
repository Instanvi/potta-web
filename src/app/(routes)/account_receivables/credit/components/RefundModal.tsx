'use client';
import { useEffect, useState } from 'react';
import Modal from '@potta/components/modal';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import { useRefundCreditNote } from '../_hooks';
import { CreditNote, REFUND_METHODS, RefundMethod } from '../_utils/types';

interface Props {
  creditNote: CreditNote | null;
  onClose: () => void;
}

const RefundModal = ({ creditNote, onClose }: Props) => {
  const refund = useRefundCreditNote();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<RefundMethod>('CASH');
  const [bankDetails, setBankDetails] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (creditNote) {
      setAmount(String(Number(creditNote.creditAmount) || ''));
      setMethod('CASH');
      setBankDetails('');
      setDescription('');
    }
  }, [creditNote]);

  const max = Number(creditNote?.creditAmount ?? 0);
  const value = Number(amount);
  const invalid = !value || value <= 0 || value > max;

  const submit = () => {
    if (!creditNote || invalid) return;
    refund.mutate(
      {
        id: creditNote.uuid,
        data: {
          refundAmount: value,
          refundMethod: method,
          bankDetails:
            method === 'BANK_TRANSFER' && bankDetails.trim()
              ? bankDetails.trim()
              : undefined,
          description: description.trim() || undefined,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      open={!!creditNote}
      setOpen={(open) => !open && onClose()}
      title={`Refund ${creditNote?.creditNoteId ?? ''}`}
      width="max-w-lg"
    >
      <div className="px-6 pb-6 space-y-4">
        <Input
          type="number"
          name="refundAmount"
          label={`Amount (max ${max.toLocaleString()})`}
          value={amount}
          onchange={(e) => setAmount(e.target.value)}
          min={0}
          max={max}
          errors={
            amount && invalid
              ? { message: `Enter an amount between 0.01 and ${max}` }
              : undefined
          }
        />
        <Select
          label="Refund method"
          options={REFUND_METHODS}
          selectedValue={method}
          onChange={(v: RefundMethod) => setMethod(v)}
          bg="bg-white"
        />
        {method === 'BANK_TRANSFER' && (
          <Input
            type="text"
            name="bankDetails"
            label="Bank details"
            placeholder="Account number, bank name"
            value={bankDetails}
            onchange={(e) => setBankDetails(e.target.value)}
          />
        )}
        <Input
          type="text"
          name="description"
          label="Description (optional)"
          value={description}
          onchange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
          <Button
            text="Process refund"
            type="button"
            onClick={submit}
            isLoading={refund.isPending}
            disabled={invalid || refund.isPending}
          />
        </div>
      </div>
    </Modal>
  );
};

export default RefundModal;
