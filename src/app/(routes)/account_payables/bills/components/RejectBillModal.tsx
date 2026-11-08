'use client';
import { useEffect, useState } from 'react';
import Modal from '@potta/components/modal';
import Button from '@potta/components/button';
import TextArea from '@potta/components/textArea';
import { useRejectBill } from '../hooks';
import { Bill } from '../utils/types';

interface Props {
  bill: Bill | null;
  onClose: () => void;
}

const RejectBillModal = ({ bill, onClose }: Props) => {
  const [reason, setReason] = useState('');
  const reject = useRejectBill();

  useEffect(() => {
    if (bill) setReason('');
  }, [bill]);

  return (
    <Modal
      open={!!bill}
      setOpen={(value) => !value && onClose()}
      title={`Reject bill ${bill?.code ?? ''}`}
      width="max-w-md"
    >
      <div className="px-6 pb-6">
        <p className="mb-4 text-sm text-gray-600">
          The bill is closed without posting anything to the books. The vendor can resubmit a corrected bill.
        </p>
        <TextArea
          name="reason"
          label="Reason"
          placeholder="e.g. Wrong quantities, missing delivery note"
          value={reason}
          onchange={(e) => setReason(e.target.value)}
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
          <Button
            text="Reject bill"
            type="button"
            theme="danger"
            isLoading={reject.isPending}
            disabled={reject.isPending}
            onClick={() =>
              bill &&
              reject.mutate(
                { id: bill.uuid, reason: reason.trim() || undefined },
                { onSuccess: onClose }
              )
            }
          />
        </div>
      </div>
    </Modal>
  );
};

export default RejectBillModal;
