'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import Input from '@potta/components/input';
import Button from '@potta/components/button';
import {
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
} from '../hooks';
import type { OrgPaymentMethod } from '../utils/api';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: OrgPaymentMethod | null;
  onCreated?: (method: OrgPaymentMethod) => void;
};

const PaymentMethodSheet = ({ open, onOpenChange, editing, onCreated }: Props) => {
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setCode(editing?.code ?? '');
    setDescription(editing?.description ?? '');
  }, [open, editing]);

  const saving = createMutation.isPending || updateMutation.isPending;

  const submit = async () => {
    if (!name.trim()) return;
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.uuid,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          ...(!editing.isSystem && code.trim()
            ? { code: code.trim().toUpperCase() }
            : {}),
        },
      });
      onOpenChange(false);
      return;
    }
    const created = await createMutation.mutateAsync({
      name: name.trim(),
      code: code.trim() ? code.trim().toUpperCase() : undefined,
      description: description.trim() || undefined,
    });
    onCreated?.(created);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit payment method' : 'Add payment method'}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-1 flex-col gap-4">
          <Input
            type="text"
            label="Name"
            name="name"
            value={name}
            onchange={(e: any) => setName(e.target.value)}
            placeholder="e.g. Wave"
          />
          <Input
            type="text"
            label="Code"
            name="code"
            value={code}
            onchange={(e: any) => setCode(e.target.value.toUpperCase())}
            placeholder="Auto from name if empty"
            disabled={!!editing?.isSystem}
          />
          <Input
            type="text"
            label="Description"
            name="description"
            value={description}
            onchange={(e: any) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <SheetFooter className="mt-auto gap-2 sm:justify-end">
          <Button
            type="button"
            text="Cancel"
            theme="outline"
            onClick={() => onOpenChange(false)}
          />
          <Button
            type="button"
            text={editing ? 'Save' : 'Create'}
            onClick={submit}
            isLoading={saving}
            disabled={saving || !name.trim()}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentMethodSheet;
