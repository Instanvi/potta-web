import React, { useContext, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Control, Controller } from 'react-hook-form';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import Input from '@potta/components/input';
import Checkbox from '@potta/components/checkbox';
import TextArea from '@potta/components/textArea';
import { ProductPayload, productSchema } from '../_utils/validation';
import useCreateProduct from '../_hooks/useCreateProduct';
import toast from 'react-hot-toast';
import Inventory from './slides/components/create_product/components/inventory';
import useGetAllProductCategories from '../_hooks/useGetAllProductCategories';
import Select from '@potta/components/select';

interface CreateProductFormProps {
  productType?: 'INVENTORY' | 'NON_INVENTORY';
  structure?: 'SIMPLE' | 'ASSEMBLY' | 'SIMPLEGROUPS';
  isNonInventory?: boolean;
  onProductCreated?: (id: string, data: any) => void;
  onCancel?: () => void;
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({
  productType = 'INVENTORY',
  structure = 'SIMPLE',
  isNonInventory = false,
  onProductCreated,
  onCancel,
}) => {
  const [data, setData] = useState('inventory');
  const context = useContext(ContextData);
  const [isUploading, setIsUploading] = useState(false);

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

  // Reset form when productType or structure changes
  useEffect(() => {
    reset({
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
    });
    setData('inventory');
  }, [productType, structure, isNonInventory, reset]);

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
      }

      // Ensure the payload has the correct structure
      const payload = {
        ...formData,
        type: productType,
        structure: structure,
        inventoryLevel: isNonInventory ? 0 : formData.inventoryLevel,
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

  return (
    <div className="p-6 flex justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-4xl"
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
            <div className="mt-6">
              <Input
                type={'text'}
                label={'Unit of Measure'}
                placeholder="KG, LITERS, PIECES"
                name={'unitOfMeasure'}
                register={register}
                errors={errors.unitOfMeasure}
                required
              />
            </div>
            <div className="mt-6">
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

        <div className="flex-grow" />
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
          <div className="flex justify-end mx-auto">
            <Button
              text={
                structure === 'ASSEMBLY'
                  ? 'Next: Assembly Products'
                  : structure === 'SIMPLEGROUPS'
                  ? 'Next: Group Products'
                  : 'Add Item'
              }
              type={
                structure === 'ASSEMBLY' || structure === 'SIMPLEGROUPS'
                  ? 'button'
                  : 'submit'
              }
              onClick={
                structure === 'ASSEMBLY' || structure === 'SIMPLEGROUPS'
                  ? () => {
                      // For assembly/group products, validate form and go to next step
                      handleSubmit((data) => {
                        // Store the form data and trigger next step
                        if (onProductCreated) {
                          // ID is not available yet; stepper should create product later.
                          onProductCreated('', data);
                        }
                      })();
                    }
                  : undefined
              }
              isLoading={mutation.isPending || isUploading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
