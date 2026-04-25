import Button from '@potta/components/button';
import React from 'react';

interface DeleteProps {
  accountId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onDelete?: () => void;
}

const CustomDeleteModal: React.FC<DeleteProps> = ({
  accountId,
  open,
  setOpen,
  onDelete,
}) => {
  // Custom z-index and overlay
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-[1049]"
        onClick={() => setOpen(false)}
      />
      <div className="relative bg-white p-8 max-w-md w-full z-[1050]">
        <h2 className="text-lg font-medium mb-4">Delete Bank Account</h2>
        <p className="mb-6">
          Are you sure you want to delete this bank account? This action cannot
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              if (onDelete) onDelete();
            }}
            type="button"
            text="Delete"
            theme="red"
          />
          <Button
            text="Cancel"
            type="button"
            theme="gray"
            color={true}
            onClick={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomDeleteModal;
