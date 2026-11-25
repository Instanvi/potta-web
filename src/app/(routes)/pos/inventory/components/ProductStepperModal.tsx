import React, { useState, useEffect } from 'react';
import Slideover from '@potta/components/slideover';
import CreateProductForm from './CreateProductForm';
import ProductUploadStep from './ProductUploadStep';
import ProductSelectionStep from './ProductSelectionStep';
import Button from '@potta/components/button';
import useCreateProduct from '../_hooks/useCreateProduct';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../utils/sale';

interface ProductStepperModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onComplete?: () => void;
  productType?: 'INVENTORY' | 'NON_INVENTORY' | 'ASSEMBLY' | 'SIMPLEGROUPS';
}

const ProductStepperModal: React.FC<ProductStepperModalProps> = ({
  open,
  setOpen,
  onComplete,
  productType = 'INVENTORY',
}) => {
  const [active, setActive] = useState<
    'create' | 'components' | 'confirm' | 'upload'
  >('create');
  const [productId, setProductId] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [tempProductData, setTempProductData] = useState<any>(null);
  const mutation = useCreateProduct();

  // Reset modal state when closed
  const handleClose = () => {
    setOpen(false);
    // Reset state after a short delay to ensure modal closes properly
    setTimeout(() => {
      setActive('create');
      setProductId(null);
      setProductData(null);
      setTempProductData(null);
    }, 300);
  };

  // Reset state when productType changes
  useEffect(() => {
    setActive('create');
    setProductId(null);
    setProductData(null);
    setTempProductData(null);
  }, [productType]);

  // Get structure based on product type
  const getStructure = () => {
    switch (productType) {
      case 'ASSEMBLY':
        return 'ASSEMBLY';
      case 'SIMPLEGROUPS':
        return 'SIMPLEGROUPS';
      default:
        return 'SIMPLE';
    }
  };

  const getIsNonInventory = () => {
    return productType === 'NON_INVENTORY';
  };

  // For assembly and group products, store temp data and go to components step
  const handleProductCreated = (id: string, data: any) => {
    if (productType === 'ASSEMBLY' || productType === 'SIMPLEGROUPS') {
      // Store the form data temporarily and go to components step
      setTempProductData(data);
      setActive('components');
    } else {
      // For regular products, create immediately
      setProductId(id);
      setProductData(data);
      setActive('confirm');
    }
  };

  // After components selection, create the product with components
  const handleComponentsComplete = (components: any[]) => {
    // Create the product with the stored data and components
    const finalProductData = {
      ...tempProductData,
      components: components,
    };


    // Call the create product API with components
    mutation.mutate(finalProductData, {
      onSuccess: (response) => {
        const createdProductId =
          response?.data?.uuid ??
          response?.uuid ??
          response?.data?.id ??
          response?.id;
        if (!createdProductId) {
          toast.error('Product created but no product ID was returned.');
          return;
        }
        toast.success(`"${finalProductData?.name ?? 'Item'}" created`);
        setProductId(createdProductId);
        setProductData(finalProductData);
        setActive('confirm');
      },
      onError: (error) => {
        toast.error(`Could not create the item: ${apiErrorMessage(error)}`);
      },
    });
  };

  // Confirmation step: ask if user wants to upload images
  const handleConfirm = (upload: boolean) => {
    if (upload) {
      setActive('upload');
    } else {
      handleClose();
      if (onComplete) onComplete();
    }
  };

  // After upload, close modal
  const handleUploadComplete = () => {
    handleClose();
    if (onComplete) onComplete();
  };

  const getStepTitle = () => {
    switch (productType) {
      case 'ASSEMBLY':
        return 'New assembly';
      case 'SIMPLEGROUPS':
        return 'New group';
      case 'NON_INVENTORY':
        return 'New non-inventory item';
      default:
        return 'New inventory item';
    }
  };

  const getStepDescription = (step: string) => {
    switch (step) {
      case 'create':
        return 'Create Product';
      case 'components':
        return productType === 'ASSEMBLY'
          ? 'Assembly Products'
          : 'Group Products';
      case 'confirm':
        return 'Upload Images';
      default:
        return '';
    }
  };

  // Check if upload step should be enabled
  const isUploadStepEnabled = () => {
    return productId !== null;
  };

  return (
    <Slideover
      open={open}
      setOpen={handleClose}
      edit={true}
      title={getStepTitle()}
      noPanelScroll
      sliderContentClass="!mt-0 !justify-start !px-0 min-h-0"
    >
      <div className="flex h-full min-h-0 w-full flex-col">
        <div className="flex shrink-0 gap-6 border-b border-black/[0.08] px-6 text-sm">
          <button
            type="button"
            onClick={() => setActive('create')}
            className={`border-b-2 py-3 ${
              active === 'create'
                ? 'border-green-700 font-medium text-green-700'
                : 'border-transparent text-foreground'
            }`}
          >
            Details
          </button>
          {(productType === 'ASSEMBLY' || productType === 'SIMPLEGROUPS') && (
            <button
              type="button"
              onClick={() => setActive('components')}
              className={`border-b-2 py-3 ${
                ['components', 'confirm', 'upload'].includes(active)
                  ? 'border-green-700 font-medium text-green-700'
                  : 'border-transparent text-foreground'
              }`}
            >
              {productType === 'ASSEMBLY' ? 'Components' : 'Group items'}
            </button>
          )}
          <button
            type="button"
            disabled={!isUploadStepEnabled()}
            onClick={() => {
              if (isUploadStepEnabled()) setActive('confirm');
            }}
            className={`border-b-2 py-3 ${
              ['confirm', 'upload'].includes(active)
                ? 'border-green-700 font-medium text-green-700'
                : 'border-transparent text-foreground'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Images
          </button>
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {active === 'create' && (
            <CreateProductForm
              productType={productType === 'NON_INVENTORY' ? 'NON_INVENTORY' : 'INVENTORY'}
              structure={getStructure()}
              isNonInventory={getIsNonInventory()}
              onProductCreated={handleProductCreated}
              onCancel={handleClose}
              key={`${productType}-${active}`}
            />
          )}

          {active === 'components' && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ProductSelectionStep
                productId="temp"
                productType={productType as 'ASSEMBLY' | 'SIMPLEGROUPS'}
                onComplete={handleComponentsComplete}
                onBack={() => setActive('create')}
                productData={tempProductData}
              />
            </div>
          )}

          {active === 'confirm' && productId && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8">
              <h2 className="mb-4 text-lg font-medium">Item created</h2>
              <p className="mb-6 text-gray-600">
                Would you like to add images to your product? This is optional.
              </p>
              <div className="flex gap-4">
                <Button
                  type="button"
                  text={'Add Images'}
                  onClick={() => handleConfirm(true)}
                />
                <Button
                  type="button"
                  text={'Skip & Finish'}
                  theme="gray"
                  onClick={() => handleConfirm(false)}
                />
              </div>
            </div>
          )}

          {active === 'upload' && productId && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ProductUploadStep
                productId={productId}
                onComplete={handleUploadComplete}
              />
            </div>
          )}
        </div>
      </div>
    </Slideover>
  );
};

export default ProductStepperModal;
