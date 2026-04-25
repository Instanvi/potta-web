import React, { useState } from 'react';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import { useForm, Controller } from 'react-hook-form';
import Select from '@potta/components/select';
import toast from 'react-hot-toast';
import useGetAllProducts from '../../hooks/useGetAllProducts';

interface ProductSelectionStepProps {
  productId: string;
  productType: 'ASSEMBLY' | 'SIMPLEGROUPS';
  onComplete: (components: any[]) => void;
  onBack: () => void;
  productData?: any; // The product data from the previous step
}

interface Component {
  productId: string;
  quantity: number;
}

// Extended Product type with additional properties
interface ExtendedProduct {
  uuid: string;
  name: string;
  sku: string;
  cost: number;
  salesPrice: number;
  type: string;
  structure: string;
}

const ProductSelectionStep: React.FC<ProductSelectionStepProps> = ({
  productId,
  productType,
  onComplete,
  onBack,
  productData,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch available products with proper filtering
  const { data: productsData, isLoading: productsLoading } = useGetAllProducts({
    page: 1,
    limit: 1000, // Get more products for selection
    search: '',
  });

  const products = (productsData?.data || []) as unknown as ExtendedProduct[];

  // Filter products based on product type
  const getFilteredProducts = () => {
    let filtered = products.filter(
      (product: ExtendedProduct) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // For Assembly products, only show SIMPLE products as components
    if (productType === 'ASSEMBLY') {
      filtered = filtered.filter(
        (product: ExtendedProduct) =>
          product.structure === 'SIMPLE' && product.type === 'INVENTORY'
      );
    }

    // For Group products, show all product types
    if (productType === 'SIMPLEGROUPS') {
      // No additional filtering needed for groups
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const addComponent = (productId: string, quantity: number) => {
    const existingIndex = selectedProducts.findIndex(
      (p: Component) => p.productId === productId
    );

    if (existingIndex >= 0) {
      // Update existing component
      const updated = [...selectedProducts];
      updated[existingIndex].quantity = quantity;
      setSelectedProducts(updated);
    } else {
      // Add new component
      setSelectedProducts([...selectedProducts, { productId, quantity }]);
    }
  };

  const removeComponent = (productId: string) => {
    setSelectedProducts(
      selectedProducts.filter((p: Component) => p.productId !== productId)
    );
  };

  const onSubmit = async (data: any) => {
    if (selectedProducts.length === 0) {
      toast.error('Please add at least one component');
      return;
    }

    setIsLoading(true);
    try {
      // Pass the components back to the parent component
      onComplete(selectedProducts);
    } catch (error) {
      console.error('Error processing components:', error);
      toast.error('Failed to process components');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedProduct = (productId: string) => {
    return products.find((p: ExtendedProduct) => p.uuid === productId);
  };

  const getProductTypeBadge = (product: ExtendedProduct) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    if (product.structure === 'ASSEMBLY') {
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          Assembly
        </span>
      );
    }
    if (product.structure === 'SIMPLEGROUPS') {
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
          Group
        </span>
      );
    }
    if (product.type === 'NON_INVENTORY') {
      return (
        <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
          Non-Inventory
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>
        Inventory
      </span>
    );
  };

  // Check if a product is selected
  const isProductSelected = (productId: string) => {
    return selectedProducts.some((p: Component) => p.productId === productId);
  };

  // Get quantity for a selected product
  const getSelectedQuantity = (productId: string) => {
    const component = selectedProducts.find(
      (p: Component) => p.productId === productId
    );
    return component ? component.quantity : 1;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">
          {productType === 'ASSEMBLY' ? 'Assembly Products' : 'Group Products'}
        </h2>
        <Button type="button" text="Back" theme="gray" onClick={onBack} />
      </div>

      {/* Product Summary */}
      {productData && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Product Details:</h3>
          <p className="text-green-700 text-sm">
            <strong>Name:</strong> {productData.name} |<strong> SKU:</strong>{' '}
            {productData.sku} |<strong> Type:</strong>{' '}
            {productType === 'ASSEMBLY' ? 'Assembly' : 'Group'}
          </p>
        </div>
      )}

      {/* Selected Components Carousel */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-3">
            Selected Components ({selectedProducts.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {selectedProducts.map((component) => {
              const product = getSelectedProduct(component.productId);
              if (!product) return null;

              return (
                <div
                  key={component.productId}
                  className="flex-shrink-0 bg-white p-3 rounded-lg border border-blue-200 min-w-[200px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {product.name}
                    </h4>
                    <button
                      onClick={() => removeComponent(component.productId)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    SKU: {product.sku}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Qty: {component.quantity}
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      XAF{' '}
                      {(
                        product.salesPrice * component.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Products */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Available Products ({filteredProducts.length})
        </h3>

        <Input
          type="text"
          label="Search Products"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />

        {productsLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm
                ? 'No products found matching your search.'
                : 'No products available for selection.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map((product: ExtendedProduct) => {
              const isSelected = isProductSelected(product.uuid);
              const selectedQuantity = getSelectedQuantity(product.uuid);

              return (
                <div
                  key={product.uuid}
                  className={`border rounded-lg p-4 transition-colors ${
                    isSelected
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'hover:border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </p>
                      <div className="mt-1">{getProductTypeBadge(product)}</div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-medium text-gray-900">
                        XAF {product.salesPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cost: XAF {product.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mb-3 p-2 bg-green-100 rounded-md">
                      <p className="text-xs text-green-800 font-medium">
                        ✓ Selected (Qty: {selectedQuantity})
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Controller
                      name={`quantity_${product.uuid}`}
                      control={control}
                      defaultValue={selectedQuantity}
                      rules={{ min: 1, required: true }}
                      render={({ field }) => (
                        <Input
                          type="number"
                          name={`quantity_${product.uuid}`}
                          placeholder="Qty"
                          value={field.value}
                          onchange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = parseInt(e.target.value) || 1;
                            field.onChange(value);
                            addComponent(product.uuid, value);
                          }}
                          className="w-20"
                        />
                      )}
                    />
                    <Button
                      type="button"
                      text={isSelected ? 'Update' : 'Add'}
                      onClick={() => {
                        const quantity = selectedQuantity;
                        addComponent(product.uuid, quantity);
                        reset({ [`quantity_${product.uuid}`]: quantity });
                      }}
                      theme={isSelected ? 'lightGreen' : 'default'}
                      className="flex-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Product Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <div className="flex justify-end mx-auto">
          <Button
            text="Create Product"
            type="button"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={selectedProducts.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionStep;
