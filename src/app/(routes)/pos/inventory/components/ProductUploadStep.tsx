import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import { Can } from '@/components/auth/can';
import useGetOneProduct from '../_hooks/useGetOneProduct';
import useUpdateProductImages from '../_hooks/useUpdateProductImages';
import { productImageUrls } from '../_utils/images';

interface ProductUploadStepProps {
  productId: string;
  onComplete: () => void;
}

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Product images are stored as URLs on the item (file uploads are not part of the Books backend). */
const ProductUploadStep: React.FC<ProductUploadStepProps> = ({
  productId,
  onComplete,
}) => {
  const { data: product } = useGetOneProduct(productId);
  const saveImages = useUpdateProductImages(productId);
  const [images, setImages] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImages(productImageUrls(product));
  }, [product]);

  const addImage = () => {
    const url = draft.trim();
    if (!isValidUrl(url)) {
      setError('Enter a valid https:// image URL.');
      return;
    }
    if (!images.includes(url)) setImages((prev) => [...prev, url]);
    setDraft('');
    setError(null);
  };

  const handleSave = () => {
    if (!productId || productId === 'temp-id' || productId === 'temp') {
      setError('Missing product ID. Please create the product first.');
      return;
    }
    saveImages.mutate(images, { onSuccess: onComplete });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-medium mb-1">Product Images</h2>
      <p className="text-sm text-gray-500 mb-4">
        Add links to images hosted online (for example a CDN or storefront URL).
      </p>
      <div className="flex items-end gap-2">
        <Input
          type="url"
          name="imageUrl"
          label="Image URL"
          placeholder="https://..."
          value={draft}
          onchange={(e) => setDraft(e.target.value)}
        />
        <Button text="Add" type="button" theme="outline" onClick={addImage} />
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative border">
              <Image
                src={url}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 object-cover"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-white/90 px-1 text-red-600"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
              >
                <i className="ri-close-line" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-4 mt-6">
        <Can resource="Item" action="update">
          <Button
            text="Save images"
            onClick={handleSave}
            isLoading={saveImages.isPending}
            disabled={saveImages.isPending}
            type="button"
          />
        </Can>
        <Button text="Finish" onClick={onComplete} theme="gray" type="button" />
      </div>
    </div>
  );
};

export default ProductUploadStep;
