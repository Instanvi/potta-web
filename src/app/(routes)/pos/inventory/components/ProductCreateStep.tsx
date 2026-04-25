import React from 'react';
import Input from '@potta/components/input';
import Checkbox from '@potta/components/checkbox';
import TextArea from '@potta/components/textArea';
import Button from '@potta/components/button';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Select from '@potta/components/select';
import Inventory from './slides/components/create_product/components/inventory';
import toast from 'react-hot-toast';
import { ProductPayload, productSchema } from '../_utils/validation';
import useGetAllProductCategories from '../_hooks/useGetAllProductCategories';
import useCreateProduct from '../_hooks/useCreateProduct';

interface ProductCreateStepProps {
  onSuccess: (productId: string) => void;
  onCancel: () => void;
}

const ProductCreateStep: React.FC<ProductCreateStepProps> = ({
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProductPayload>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      unitOfMeasure: undefined,
      cost: 0,
      sku: '',
      inventoryLevel: 0,
      salesPrice: 0,
      taxable: false,
      categoryId: '',
      images: [],
      type: 'INVENTORY', // Add default type for inventory products
    },
  });
  const mutation = useCreateProduct();
  const { data: categoriesData } = useGetAllProductCategories();
  const categoryOptions = (categoriesData?.data || []).map(
    (cat: { uuid: string; name: string }) => ({
      label: cat.name,
      value: cat.uuid,
    })
  );

  const onSubmit = async (formData: ProductPayload) => {
    try {
      if (
        !formData.name ||
        !formData.sku ||
        !formData.cost ||
        !formData.salesPrice
      ) {
        toast.error('Please fill in all required fields');
        return;
      }
      const selectedCategory =
        (categoriesData?.data || []).find(
          (cat: { uuid: string }) => cat.uuid === formData.categoryId
        ) || null;
      (formData as any).categoryId = selectedCategory
        ? selectedCategory.uuid
        : '';
      delete formData.taxRate;
      mutation.mutate(formData, {
        onSuccess: (data: any) => {
          const createdProductId =
            data?.data?.uuid ?? data?.uuid ?? data?.data?.id ?? data?.id;
          if (!createdProductId) {
            toast.error('Product created but no product ID was returned.');
            return;
          }
          toast.success('Product created successfully!');
          reset();
          onSuccess(createdProductId);
        },
        onError: () => {
          toast.error('Failed to create product');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative w-full max-w-6xl mx-auto p-8"
    >
      <h2 className="text-lg font-medium mb-4">Create Product</h2>
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
          <div className="mt-6 flex flex-col items-start ">
            <Checkbox
              label="Taxable"
              name="taxable"
              control={control}
              errors={errors.taxable}
            />
          </div>
        </div>
      </div>
      <div className="mt-12 pb-10">
        <div className="flex ">
          <div
            className={`px-4 py-2 bg-green-50 border-b-2 border-green-500 text-green-500`}
          >
            <p>Inventory</p>
          </div>
        </div>
        <div className="mt-8">
          <Inventory control={control} register={register} errors={errors} />
        </div>
      </div>
      <div className="flex-grow" />
      <div className="text-center md:text-right md:flex space-x-4 mt-8 justify-end">
        <Button
          text={'Cancel'}
          type={'button'}
          onClick={onCancel}
          theme="danger"
        />
        <Button
          text={'Add Item'}
          type={'submit'}
          isLoading={mutation.isPending}
        />
      </div>
    </form>
  );
};

export default ProductCreateStep;
