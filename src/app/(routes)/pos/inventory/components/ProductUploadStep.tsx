import React, { useState } from 'react';
import Button from '@potta/components/button';
import ImageUploader from './imageUploader';
import { useUploadProductImages } from '../_hooks/useUploadProductImages';
import toast from 'react-hot-toast';

interface ProductUploadStepProps {
  productId: string;
  onComplete: () => void;
}

const USER_ID = 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3e'; // TODO: Replace with real userId

const ProductUploadStep: React.FC<ProductUploadStepProps> = ({
  productId,
  onComplete,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadMutation = useUploadProductImages();

  const handleImageUpload = async () => {
    setUploadError(null);
    if (!productId || productId === 'temp-id' || productId === 'temp') {
      setUploadError('Missing product ID. Please create the product first.');
      return;
    }
    if (!selectedFiles.length) {
      setUploadError('Please select image(s) to upload.');
      return;
    }
    try {
      await uploadMutation.mutateAsync({
        productId,
        files: selectedFiles,
        userId: USER_ID,
        type: 'PRODUCT_IMAGE',
      });
      toast.success('Image(s) uploaded successfully!');
      setSelectedFiles([]);
      onComplete();
    } catch (e: any) {
      setUploadError(e.message || 'Failed to upload image(s).');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-medium mb-4">Upload Product Images</h2>
      <ImageUploader
        onFilesChange={setSelectedFiles}
        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] }}
        maxFiles={10}
        maxSize={5 * 1024 * 1024}
        multiple
      />
      {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
      <div className="flex gap-4 mt-6">
        <Button
          text={uploadMutation.isPending ? 'Uploading...' : 'Upload Image(s)'}
          onClick={handleImageUpload}
          isLoading={uploadMutation.isPending}
          disabled={uploadMutation.isPending}
          type="button"
        />
        <Button text="Finish" onClick={onComplete} theme="gray" type="button" />
      </div>
    </div>
  );
};

export default ProductUploadStep;
