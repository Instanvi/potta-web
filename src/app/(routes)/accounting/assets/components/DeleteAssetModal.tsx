import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from '@potta/components/shadcn/dialog';
import Button from '@potta/components/button';
import { useDeleteAsset } from '../hooks/useDeleteAsset';
import toast from 'react-hot-toast';

const DeleteAssetModal = ({
  open,
  setOpen,
  assetId,
  onDeleted,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  assetId: string;
  onDeleted?: () => void;
}) => {
  const [error, setError] = useState('');
  const deleteAsset = useDeleteAsset();
  const loading = deleteAsset.isPending;

  const handleDelete = async () => {
    setError('');
    try {
      await deleteAsset.mutateAsync(assetId);
      toast.success('Asset deleted successfully!');
      if (onDeleted) onDeleted();
      setOpen(false);
    } catch (err) {
      setError('Failed to delete asset');
      toast.error('Failed to delete asset.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Custom overlay with blur */}
      <DialogOverlay className="backdrop-blur-[2px]" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Asset</DialogTitle>
        </DialogHeader>
        <div className="text-red-600 font-medium mb-4">
          Are you sure you want to delete this asset? This action cannot be
          undone.
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <DialogFooter>
          <Button
            text="Delete"
            type="button"
            onClick={handleDelete}
            isLoading={loading}
            disabled={loading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAssetModal;
