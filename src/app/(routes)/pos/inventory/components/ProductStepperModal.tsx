import React, { useState, useEffect } from 'react';
import Slideover from '@potta/components/slideover';
import CreateProductForm from './CreateProductForm';
import ProductUploadStep from './ProductUploadStep';
import ProductSelectionStep from './ProductSelectionStep';
import Button from '@potta/components/button';
import useCreateProduct from '../_hooks/useCreateProduct';
import toast from 'react-hot-toast';

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

    console.log('Creating product with components:', finalProductData);

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
        toast.success('Product created successfully!');
        setProductId(createdProductId);
        setProductData(finalProductData);
        setActive('confirm');
      },
      onError: (error) => {
        console.error('Product creation error:', error);
        toast.error('Failed to create product');
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
        return 'Assembly Product';
      case 'SIMPLEGROUPS':
        return 'Group Product';
      case 'NON_INVENTORY':
        return 'Non-Inventory Item';
      default:
        return 'Inventory Item';
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
    >
      <div className="w-full flex min-h-[60vh]">
        {/* Stepper */}
        <div className="w-[12%] space-y-7 border-r">
          <div onClick={() => setActive('create')}>
            <p
              className={`whitespace-nowrap ${
                active === 'create' && 'text-green-700 font-medium'
              } cursor-pointer text-left`}
            >
              Create Product
            </p>
          </div>

          {(productType === 'ASSEMBLY' || productType === 'SIMPLEGROUPS') && (
            <div onClick={() => setActive('components')}>
              <p
                className={`whitespace-nowrap ${
                  ['components', 'confirm', 'upload'].includes(active) &&
                  'text-green-700 font-medium'
                } cursor-pointer text-left`}
              >
                {productType === 'ASSEMBLY'
                  ? 'Assemble Products'
                  : 'Group Products'}
              </p>
            </div>
          )}

          <div
            onClick={() => {
              if (isUploadStepEnabled()) {
                setActive('confirm');
              }
            }}
          >
            <p
              className={`whitespace-nowrap ${
                ['confirm', 'upload'].includes(active) &&
                'text-green-700 font-medium'
              } cursor-pointer text-left ${
                !isUploadStepEnabled() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Upload Images
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="w-full overflow-y-auto h-[calc(70vh)] pt-0 relative flex flex-col">
          <div className="w-full overflow-auto">
            {active === 'create' && (
              <CreateProductForm
                productType="INVENTORY"
                structure={getStructure()}
                isNonInventory={getIsNonInventory()}
                onProductCreated={handleProductCreated}
                onCancel={handleClose}
                key={`${productType}-${active}`} // Force re-render when productType changes
              />
            )}

            {active === 'components' && (
              <ProductSelectionStep
                productId="temp"
                productType={productType as 'ASSEMBLY' | 'SIMPLEGROUPS'}
                onComplete={handleComponentsComplete}
                onBack={() => setActive('create')}
                productData={tempProductData}
              />
            )}

            {active === 'confirm' && productId && (
              <div className="p-8 flex flex-col items-center justify-center">
                <h2 className="text-lg font-medium mb-4">
                  Product Created Successfully!
                </h2>
                <p className="mb-6 text-gray-600">
                  Would you like to add images to your product? This is
                  optional.
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
              <ProductUploadStep
                productId={productId}
                onComplete={handleUploadComplete}
              />
            )}
          </div>
        </div>
      </div>
    </Slideover>
  );
};

export default ProductStepperModal;
