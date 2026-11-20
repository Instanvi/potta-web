import React, { useContext, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import Input from '@potta/components/input';
import Checkbox from '@potta/components/checkbox';
import TextArea from '@potta/components/textArea';
import Slider from '@potta/components/slideover';
import { BundlePayload, bundleSchema } from '../../../../_utils/validation';
import useCreateProduct from '../../../../_hooks/useCreateProduct';
import toast from 'react-hot-toast';
import Select from '@potta/components/select';
import useGetAllProducts from '../../../../_hooks/useGetAllProducts';
import useGetAllProductCategories from '../../../../_hooks/useGetAllProductCategories';
import { Plus, X, Package } from 'lucide-react';

interface CreateBundleProductProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

interface ComponentProduct {
  productId: string;
  quantity: number;
  productName?: string;
  productSku?: string;
}

const CreateBundleProduct: React.FC<CreateBundleProductProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const context = useContext(ContextData);
  const [components, setComponents] = useState<ComponentProduct[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BundlePayload>({
    resolver: yupResolver(bundleSchema),
    defaultValues: {
      name: '',
      description: '',
      unitOfMeasure: '',
      cost: 0,
      sku: '',
      inventoryLevel: 0,
      salesPrice: 0,
      taxable: false,
      categoryId: '',
      images: [],
      type: 'INVENTORY',
      structure: 'BUNDLE',
      reorderPoint: 0,
      components: [],
    },
  });

  const mutation = useCreateProduct();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllProductCategories();
  const { data: productsData, isLoading: productsLoading } = useGetAllProducts({
    page: 1,
    limit: 1000,
  });

  const categoryOptions = (categoriesData?.data || []).map(
    (cat: { uuid: string; name: string }) => ({
      label: cat.name,
      value: cat.uuid,
    })
  );

  const productOptions = (productsData?.data || []).map(
    (product: { uuid: string; name: string; sku: string }) => ({
      label: `${product.name} (${product.sku})`,
      value: product.uuid,
      productName: product.name,
      productSku: product.sku,
    })
  );

  const typeOptions = [
    { label: 'Inventory', value: 'INVENTORY' },
    { label: 'Non-Inventory', value: 'NON_INVENTORY' },
  ];

  const unitOptions = [
    { label: 'Piece', value: 'PIECE' },
    { label: 'Kilogram', value: 'KG' },
    { label: 'Liter', value: 'L' },
    { label: 'Meter', value: 'M' },
    { label: 'Plate', value: 'PLATE' },
    { label: 'Package', value: 'PACKAGE' },
    { label: 'Bundle', value: 'BUNDLE' },
  ];

  const addComponent = () => {
    const newComponent: ComponentProduct = {
      productId: '',
      quantity: 1,
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (index: number) => {
    const updatedComponents = components.filter((_, i) => i !== index);
    setComponents(updatedComponents);
    setValue('components', updatedComponents);
  };

  const updateComponent = (
    index: number,
    field: keyof ComponentProduct,
    value: any
  ) => {
    const updatedComponents = [...components];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };
    setComponents(updatedComponents);
    setValue('components', updatedComponents);
  };

  const calculateTotalCost = () => {
    let total = 0;
    components.forEach((component) => {
      const product = productsData?.data?.find(
        (p: any) => p.uuid === component.productId
      );
      if (product && component.quantity) {
        total += parseFloat(product.cost || '0') * component.quantity;
      }
    });
    return total;
  };

  const onSubmit = async (data: BundlePayload) => {
    try {
      // Calculate total cost from components
      const totalCost = calculateTotalCost();

      const payload = {
        ...data,
        cost: totalCost,
        components: components.map((comp) => ({
          productId: comp.productId,
          quantity: comp.quantity,
        })),
      };

      console.log('Bundle payload:', payload);

      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Bundle product created successfully!');
          reset();
          setComponents([]);
          setIsOpen(false);
        },
        onError: (error) => {
          console.error('Error creating bundle:', error);
          toast.error('Failed to create bundle product');
        },
      });
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast.error('An error occurred while creating the bundle');
    }
  };

  const watchedType = watch('type');

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={true}
      buttonText={'Create Bundle'}
      title={'Bundle Product'}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative h-screen w-full max-w-4xl overflow-y-auto"
      >
        <div className="space-y-6 p-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bundle Name"
                type="text"
                name="name"
                placeholder="Enter bundle name"
                register={register}
                errors={errors.name}
                required
              />

              <Input
                label="SKU"
                type="text"
                name="sku"
                placeholder="Enter SKU"
                register={register}
                errors={errors.sku}
                required
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Description"
                name="description"
                placeholder="Enter bundle description"
                register={register}
                errors={errors.description}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Type"
                    options={typeOptions}
                    selectedValue={field.value}
                    onChange={field.onChange}
                    errors={errors.type}
                  />
                )}
              />

              <Controller
                name="unitOfMeasure"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Unit of Measure"
                    options={unitOptions}
                    selectedValue={field.value}
                    onChange={field.onChange}
                    errors={errors.unitOfMeasure}
                  />
                )}
              />

              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Category"
                    options={categoryOptions}
                    selectedValue={field.value}
                    onChange={field.onChange}
                    errors={errors.categoryId}
                    isLoading={categoriesLoading}
                  />
                )}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-medium mb-4">Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Sales Price"
                type="number"
                name="salesPrice"
                placeholder="0.00"
                register={register}
                errors={errors.salesPrice}
                required
              />

              <div className="flex items-center space-x-2">
                <Checkbox label="Taxable" name="taxable" register={register} />
              </div>
            </div>

            {watchedType === 'INVENTORY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Inventory Level"
                  type="number"
                  name="inventoryLevel"
                  placeholder="0"
                  register={register}
                  errors={errors.inventoryLevel}
                />

                <Input
                  label="Reorder Point"
                  type="number"
                  name="reorderPoint"
                  placeholder="0"
                  register={register}
                  errors={errors.reorderPoint}
                />
              </div>
            )}
          </div>

          {/* Bundle Components */}
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Bundle Components</h3>
              <Button
                type="button"
                text="Add Component"
                icon={<Plus className="h-4 w-4" />}
                onClick={addComponent}
                theme="default"
              />
            </div>

            {components.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-12 w-12 mb-2" />
                <p>
                  No components added yet. Click "Add Component" to start
                  building your bundle.
                </p>
              </div>
            )}

            {components.map((component, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 mb-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Component {index + 1}</h4>
                  <Button
                    type="button"
                    icon={<X className="h-4 w-4" />}
                    onClick={() => removeComponent(index)}
                    theme="default"
                    className="text-red-600 hover:text-red-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Product"
                    options={productOptions}
                    selectedValue={component.productId}
                    onChange={(value) =>
                      updateComponent(index, 'productId', value)
                    }
                    isLoading={productsLoading}
                  />

                  <Input
                    label="Quantity"
                    type="number"
                    placeholder="1"
                    value={component.quantity}
                    onChange={(e) =>
                      updateComponent(
                        index,
                        'quantity',
                        parseInt(e.target.value) || 1
                      )
                    }
                    min="1"
                  />
                </div>

                {component.productId && (
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      const product = productsData?.data?.find(
                        (p: any) => p.uuid === component.productId
                      );
                      return product ? (
                        <div>
                          <p>
                            <strong>Product:</strong> {product.name}
                          </p>
                          <p>
                            <strong>Cost:</strong> ${product.cost || '0.00'}
                          </p>
                          <p>
                            <strong>Total Cost:</strong> $
                            {((product.cost || 0) * component.quantity).toFixed(
                              2
                            )}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ))}

            {components.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Bundle Summary
                </h4>
                <p>
                  <strong>Total Components:</strong> {components.length}
                </p>
                <p>
                  <strong>Estimated Total Cost:</strong> $
                  {calculateTotalCost().toFixed(2)}
                </p>
                <p>
                  <strong>Bundle Type:</strong> {watchedType}
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              text="Cancel"
              onClick={() => setIsOpen(false)}
              theme="default"
            />
            <Button
              type="submit"
              text="Create Bundle"
              theme="default"
              disabled={mutation.isPending || components.length === 0}
            />
          </div>
        </div>
      </form>
    </Slider>
  );
};

export default CreateBundleProduct;
