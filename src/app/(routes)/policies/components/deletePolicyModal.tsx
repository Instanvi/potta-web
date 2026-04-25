import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Policy } from '../utils/types';
import { Button } from '@potta/components/shadcn/button';
import toast from 'react-hot-toast';
import { useDeletePolicy } from '../hooks/policyHooks';

interface DeletePolicyModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  policy: Policy | null;
  onDelete?: () => void;
}

const DeletePolicyModal = ({
  open,
  setOpen,
  policy,
  onDelete,
}: DeletePolicyModalProps) => {
  const deletePolicy = useDeletePolicy();

  const handleDelete = async () => {
    if (!policy) return;

    try {
      await deletePolicy.mutateAsync(policy.uuid);
      toast.success('Policy deleted successfully');
      setOpen(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  if (!open || !policy) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Delete Policy</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex items-center gap-4 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">
            Are you sure you want to delete this policy? This action cannot be
            undone.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-medium">Policy Name:</p>
          <p>{policy.name}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deletePolicy.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePolicy.isPending}
          >
            {deletePolicy.isPending ? 'Deleting...' : 'Delete Policy'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeletePolicyModal;
