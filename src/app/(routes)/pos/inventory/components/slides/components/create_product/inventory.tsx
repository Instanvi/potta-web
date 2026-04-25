import React, { useContext, useState, useRef } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Control, Controller } from 'react-hook-form';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import Input from '@potta/components/input';
import Checkbox from '@potta/components/checkbox';
import TextArea from '@potta/components/textArea';
import Slider from '@potta/components/slideover';
import { ProductPayload, productSchema } from '../../../../_utils/validation';
import useCreateProduct from '../../../../_hooks/useCreateProduct';
import useUploadImage from '../../../../_hooks/useUploadFile';
import toast from 'react-hot-toast';
import Inventory from './components/inventory';
import ImageUploader from '../../../imageUploader';
import { productApi } from '../../../../_utils/api';
import useGetAllProductCategories from '../../../../_hooks/useGetAllProductCategories';
import Select from '@potta/components/select';
import useGetAllProducts from '../../../../hooks/useGetAllProducts';

// Component Selector Component
const ComponentSelector: React.FC<{
  product: any;
  onAdd: (productId: string, quantity: number) => void;
  selectedComponents: any[];
}> = ({ product, onAdd, selectedComponents }) => {
  const [quantity, setQuantity] = useState(1);
  const isSelected = selectedComponents.some(
    (comp) => comp.productId === product.uuid
  );
  const selectedComponent = selectedComponents.find(
    (comp) => comp.productId === product.uuid
  );
  const currentQuantity = selectedComponent ? selectedComponent.quantity : 1;

  return (
    <div
      className={`border rounded-lg p-4 ${
        isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          <p className="text-sm font-medium text-gray-900">
            XAF {product.salesPrice?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            name={`quantity_${product.uuid}`}
            placeholder="Qty"
            value={isSelected ? currentQuantity : quantity}
            onchange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = parseInt(e.target.value) || 1;
              if (isSelected) {
                setQuantity(value);
              } else {
                setQuantity(value);
              }
            }}
            className="w-20"
          />
          <Button
            text={isSelected ? 'Update' : 'Add'}
            type="button"
            onClick={() => {
              const qty = isSelected ? currentQuantity : quantity;
              onAdd(product.uuid, qty);
              if (!isSelected) {
                setQuantity(1);
              }
            }}
            theme={isSelected ? 'lightGreen' : 'default'}
            className="px-3 py-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

interface CreateProductProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  productType?: 'INVENTORY' | 'NON_INVENTORY';
  structure?: 'SIMPLE' | 'ASSEMBLY' | 'SIMPLEGROUPS';
  isNonInventory?: boolean;
  onProductCreated?: (id: string, data: any) => void;
  onCancel?: () => void;
}

const CreateProduct: React.FC<CreateProductProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
  productType = 'INVENTORY',
  structure = 'SIMPLE',
  isNonInventory = false,
  onProductCreated,
  onCancel,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const [data, setData] = useState('inventory');
  const context = useContext(ContextData);
  const [isUploading, setIsUploading] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm<ProductPayload>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      unitOfMeasure: '',
      cost: 0,
      sku: '',
      inventoryLevel: isNonInventory ? 0 : 0,
      reorderPoint: 0,
      salesPrice: 0,
      taxable: false,
      categoryId: '',
      taxId: '',
      images: [],
      type: productType,
      structure: structure,
      components: [],
    },
  });

  const mutation = useCreateProduct();
  const taxable = watch('taxable');

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllProductCategories();
  const categoryOptions = (categoriesData?.data || []).map(
    (cat: { uuid: string; name: string }) => ({
      label: cat.name,
      value: cat.uuid,
    })
  );

  // Fetch available products for component selection
  const { data: productsData } = useGetAllProducts({
    page: 1,
    limit: 1000,
    search: '',
  });
  const availableProducts = (productsData?.data || []).filter(
    (product: any) => {
      if (structure === 'ASSEMBLY') {
        return product.structure === 'SIMPLE' && product.type === 'INVENTORY';
      }
      return true; // For groups, show all products
    }
  );

  const onSubmit = async (formData: ProductPayload) => {
    try {
      console.log('Form submitted with data:', formData);

      // Get images from form data
      const formImages = formData.images || [];
      const fileUrls = formImages.filter(
        (img) => img && img.startsWith('__file__:')
      );

      // Check if we have files to upload
      if (fileUrls.length > 0) {
        setIsUploading(true);

        try {
          // For now, we'll skip file upload since we need to convert object URLs back to files
          // You may need to implement a different approach for file handling
          console.log('Files selected:', fileUrls);
          formData.images = []; // Clear the file URLs for now
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setIsUploading(false);
          toast.error('Image upload failed. Please try again.');
          return;
        }

        setIsUploading(false);
      } else {
        formData.images = [];
      }

      // Validate required fields
      if (
        !formData.name ||
        !formData.sku ||
        !formData.cost ||
        !formData.salesPrice
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Ensure the payload has the correct structure
      const payload = {
        ...formData,
        type: productType,
        structure: structure,
        inventoryLevel: isNonInventory ? 0 : formData.inventoryLevel,
        components: selectedComponents,
      };

      console.log('Submitting product data:', payload);
      mutation.mutate(payload, {
        onSuccess: (response) => {
          toast.success('Product created successfully!');
          reset();
          const createdProductId =
            response?.data?.uuid ??
            response?.uuid ??
            response?.data?.id ??
            response?.id;

          if (onProductCreated) {
            if (!createdProductId) {
              toast.error('Product created but no product ID was returned.');
              return;
            }
            // Call the callback with the created product ID and data
            onProductCreated(createdProductId, payload);
          } else {
            setIsOpen(false);
          }
        },
        onError: (error) => {
          console.error('Product creation error:', error);
          toast.error('Failed to create product');
        },
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setIsUploading(false);
      toast.error('An unexpected error occurred');
    }
  };

  const addComponent = (productId: string, quantity: number) => {
    const existingIndex = selectedComponents.findIndex(
      (comp) => comp.productId === productId
    );

    if (existingIndex >= 0) {
      const updated = [...selectedComponents];
      updated[existingIndex].quantity = quantity;
      setSelectedComponents(updated);
    } else {
      const product = availableProducts.find((p: any) => p.uuid === productId);
      setSelectedComponents([
        ...selectedComponents,
        {
          productId,
          quantity,
          product,
        },
      ]);
    }
  };

  const removeComponent = (productId: string) => {
    setSelectedComponents(
      selectedComponents.filter((comp) => comp.productId !== productId)
    );
  };

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={true}
      buttonText={'Create Product'}
      title={
        structure === 'ASSEMBLY'
          ? 'Assembly Product'
          : structure === 'SIMPLEGROUPS'
          ? 'Group Product'
          : isNonInventory
          ? 'Non-Inventory Item'
          : 'Inventory Item'
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative h-screen w-full max-w-4xl"
      >
        {/* Form fields remain the same */}
        <div className="w-full">
          <Input
            label="Product Name"
            type="text"
            name="name"
            placeholder="Enter Product name"
            register={register}
            errors={errors.name}
            required
          />
        </div>
        <div className="w-full grid mt-5 grid-cols-2 gap-2">
          <div className="w-full">
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Category"
                  options={categoryOptions}
                  selectedValue={field.value || ''}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="categoryId"
                  required
                />
              )}
            />
          </div>
          <div className="w-full">
            <Input
              label="Cost"
              type="number"
              name="cost"
              placeholder="Enter Product Cost"
              register={register}
              errors={errors.cost}
              required
            />
          </div>
        </div>
        <div className="w-full mt-5">
          <TextArea
            label="Description"
            name="description"
            placeholder="Product Description.."
            register={register}
            errors={errors.description}
            height={true}
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <div>
            <div>
              <label htmlFor="" className="mb-3 text-gray-900 font-medium">
                Image
              </label>
              <ImageUploader control={control} name="images" />
            </div>
            <div className="mt-4">
              <Input
                type={'text'}
                label={'SKU'}
                placeholder="Enter SKU"
                name={'sku'}
                register={register}
                errors={errors.sku}
                required
              />
            </div>
            {taxable && (
              <div className="mt-4">
                <Input
                  type={'text'}
                  label={'Tax ID'}
                  placeholder="Enter Tax ID"
                  name={'taxId'}
                  register={register}
                  errors={errors.taxId}
                />
              </div>
            )}
          </div>
          <div className="w-full">
            <div className="mt-6">
              <Input
                type={'number'}
                label={'Sales Price'}
                placeholder="760"
                name={'salesPrice'}
                register={register}
                errors={errors.salesPrice}
                required
              />
            </div>
            <div className="mt-6">
              <Input
                type={'number'}
                label={'Reorder Point'}
                placeholder="50"
                name={'reorderPoint'}
                register={register}
                errors={errors.reorderPoint}
              />
            </div>
            <div className="mt-6 flex flex-col items-start ">
              <Controller
                name="taxable"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="taxable"
                    label="Taxable"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {!isNonInventory && structure === 'SIMPLE' && (
          <div className="mt-12 pb-20">
            <div className="flex ">
              <div
                onClick={() => setData('inventory')}
                className={`px-4 py-2 bg-green-50 cursor-pointer ${
                  data == 'inventory' &&
                  'border-b-2 border-green-500 text-green-500'
                }`}
              >
                <p>Inventory</p>
              </div>
            </div>
            <div className="mt-8">
              {data == 'inventory' && (
                <Inventory
                  control={control}
                  register={register}
                  errors={errors}
                />
              )}
            </div>
          </div>
        )}

        {(structure === 'ASSEMBLY' || structure === 'SIMPLEGROUPS') && (
          <div className="mt-12 pb-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {structure === 'ASSEMBLY'
                  ? 'Assembly Components'
                  : 'Group Components'}
              </h3>
              <Button
                type="button"
                text="Add Component"
                onClick={() => setShowComponentModal(true)}
                theme="lightBlue"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">
                {structure === 'ASSEMBLY'
                  ? 'Add the products that make up this assembly. Each component will be consumed when this product is sold.'
                  : 'Add the products that are included in this group. These products will be sold together as a bundle.'}
              </p>
            </div>

            {/* Selected Components Display */}
            {selectedComponents.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Selected Components ({selectedComponents.length})
                </h4>
                <div className="space-y-3">
                  {selectedComponents.map((component, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {component.product?.name ||
                              `Product ID: ${component.productId}`}
                          </h5>
                          {component.product?.sku && (
                            <p className="text-sm text-gray-500">
                              SKU: {component.product.sku}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            Qty: {component.quantity}
                          </span>
                          <button
                            onClick={() => removeComponent(component.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Component Selection Modal */}
        {showComponentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Select Components</h3>
                <button
                  onClick={() => setShowComponentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableProducts.map((product: any) => (
                  <ComponentSelector
                    key={product.uuid}
                    product={product}
                    onAdd={addComponent}
                    selectedComponents={selectedComponents}
                  />
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  text="Done"
                  type="button"
                  onClick={() => setShowComponentModal(false)}
                  theme="default"
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex-grow" />
        <div className="text-center md:text-right md:flex space-x-4 fixed bottom-0 left-0 right-0 justify-center bg-white p-4">
          <div className="flex gap-2 w-full max-w-4xl justify-between">
            <div>
              <Button
                text={'Add Item'}
                type={'submit'}
                isLoading={mutation.isPending || isUploading}
              />
            </div>
          </div>
        </div>
      </form>
    </Slider>
  );
};

export default CreateProduct;
