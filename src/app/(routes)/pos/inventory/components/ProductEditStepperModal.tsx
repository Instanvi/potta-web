import React, { useState } from 'react';
import Slideover from '@potta/components/slideover';
import EditProduct from './slides/components/update_product';
import ProductUploadStep from './ProductUploadStep';

interface ProductEditStepperModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: any;
  productId: string;
  onComplete?: () => void;
}

const ProductEditStepperModal: React.FC<ProductEditStepperModalProps> = ({
  open,
  setOpen,
  product,
  productId,
  onComplete,
}) => {
  const [active, setActive] = useState<'edit' | 'upload'>('edit');

  // After product edit, go to upload step
  const handleProductEdited = () => {
    setActive('upload');
  };

  // After upload, close modal
  const handleUploadComplete = () => {
    setOpen(false);
    if (onComplete) onComplete();
  };

  return (
    <Slideover open={open} setOpen={setOpen} edit={true} title="Edit Product">
      <div className="w-full flex min-h-[60vh]">
        {/* Stepper */}
        <div className="w-[12%] space-y-7 border-r">
          <div onClick={() => setActive('edit')}>
            <p
              className={`whitespace-nowrap ${
                active === 'edit' && 'text-green-700 font-medium'
              } cursor-pointer text-left`}
            >
              Edit Product
            </p>
          </div>
          <div onClick={() => setActive('upload')}>
            <p
              className={`whitespace-nowrap ${
                active === 'upload' && 'text-green-700 font-medium'
              } cursor-pointer text-left`}
            >
              Upload Images
            </p>
          </div>
        </div>
        {/* Content */}
        <div className="w-full overflow-auto">
          {/* Show loading or placeholder if product is not available */}
          {!product ? (
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <>
              {active === 'edit' && (
                <EditProduct
                  product={product}
                  productId={productId}
                  onSuccess={handleProductEdited}
                />
              )}
              {active === 'upload' && (
                <ProductUploadStep
                  productId={productId}
                  onComplete={handleUploadComplete}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Slideover>
  );
};

export default ProductEditStepperModal;
