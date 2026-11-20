'use client';
import { ReactNode } from 'react';
import Modal from '@potta/components/modal';
import Button from '@potta/components/button';

interface Props {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  danger,
  isLoading,
  onConfirm,
  onClose,
}: Props) => (
  <Modal
    open={open}
    setOpen={(value) => !value && onClose()}
    title={title}
    width="max-w-md"
  >
    <div className="px-6 pb-6">
      <div className="text-sm text-gray-600">{message}</div>
      <div className="flex justify-end gap-2 mt-6">
        <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
        <Button
          text={confirmText}
          type="button"
          theme={danger ? 'danger' : 'default'}
          onClick={onConfirm}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;
