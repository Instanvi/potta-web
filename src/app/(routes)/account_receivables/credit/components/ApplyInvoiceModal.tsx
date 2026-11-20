'use client';
import { useEffect, useState } from 'react';
import Modal from '@potta/components/modal';
import Button from '@potta/components/button';
import SearchSelect, { Option } from '@potta/components/search-select';
import { useApplyCreditNoteToInvoice, useCustomerInvoices } from '../_hooks';
import { CreditNote } from '../_utils/types';

interface Props {
  creditNote: CreditNote | null;
  onClose: () => void;
}

const ApplyInvoiceModal = ({ creditNote, onClose }: Props) => {
  const apply = useApplyCreditNoteToInvoice();
  const customerId = creditNote?.customer?.uuid ?? '';
  const { data, isLoading } = useCustomerInvoices(customerId);
  const [selected, setSelected] = useState<Option | null>(null);

  useEffect(() => setSelected(null), [creditNote]);

  const invoices: any[] = data?.data ?? [];
  const options: Option[] = invoices.map((inv) => ({
    value: inv.uuid,
    label: `${inv.invoiceNumber || inv.invoiceId || inv.code} · ${Number(
      inv.invoiceTotal ?? 0
    ).toLocaleString()} ${inv.currency ?? ''} · ${inv.status}`,
  }));

  const submit = () => {
    if (!creditNote || !selected) return;
    apply.mutate(
      { id: creditNote.uuid, invoiceId: String(selected.value) },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      open={!!creditNote}
      setOpen={(open) => !open && onClose()}
      title={`Apply ${creditNote?.creditNoteId ?? ''} to an invoice`}
      width="max-w-lg"
    >
      <div className="px-6 pb-6 space-y-4">
        {!customerId ? (
          <p className="text-sm text-gray-600">
            This credit note has no customer, so there are no invoices to apply
            it to.
          </p>
        ) : (
          <SearchSelect
            label="Invoice"
            options={options}
            value={selected}
            onChange={setSelected}
            isLoading={isLoading}
            placeholder={
              !isLoading && options.length === 0
                ? 'No invoices for this customer'
                : 'Select an invoice...'
            }
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
          <Button
            text="Apply"
            type="button"
            onClick={submit}
            isLoading={apply.isPending}
            disabled={!selected || apply.isPending}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ApplyInvoiceModal;
