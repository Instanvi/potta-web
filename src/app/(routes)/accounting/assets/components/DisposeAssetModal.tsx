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
import { useDisposeAsset } from '../hooks/useDisposeAsset';
import { DateInput } from '@potta/components/customDatePicker';
import Input from '@potta/components/input';
import toast from 'react-hot-toast';

const DisposeAssetModal = ({
  open,
  setOpen,
  assetId,
  onDisposed,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  assetId: string;
  onDisposed?: () => void;
}) => {
  // Set disposal date to today by default, and do not show to user
  const today = new Date();
  const [disposalDate] = useState<Date>(today);
  const [salePrice, setSalePrice] = useState('');
  const [error, setError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [loading, setLoading] = useState(false);
  const disposeAsset = useDisposeAsset();

  const handleDispose = async () => {
    setError('');
    setPriceError('');
    if (!salePrice || isNaN(Number(salePrice))) {
      setPriceError('Sale price is required and must be a number');
      return;
    }
    setLoading(true);
    try {
      await disposeAsset.mutateAsync({
        id: assetId,
        disposal_date: disposalDate.toISOString().slice(0, 10),
        sale_price: Number(salePrice),
      });
      toast.success('Asset disposed successfully!');
      if (onDisposed) onDisposed();
      setOpen(false);
    } catch (err) {
      setError('Failed to dispose asset');
      toast.error('Failed to dispose asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="backdrop-blur-sm" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispose Asset</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            label="Sale Price"
            name="sale_price"
            type="number"
            value={salePrice}
            onchange={(e) => setSalePrice(e.target.value)}
            required
            errors={priceError}
            disabled={loading}
            min={0}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button
            text="Dispose"
            type="button"
            onClick={handleDispose}
            isLoading={loading}
            disabled={loading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisposeAssetModal;
