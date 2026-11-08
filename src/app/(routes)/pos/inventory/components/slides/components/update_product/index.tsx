import Select from '@potta/components/select';
import React, { useState, useEffect } from 'react';
import Inventory from './components/inventory';
import { yupResolver } from '@hookform/resolvers/yup';

import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Checkbox from '@potta/components/checkbox';
import { Controller, useForm } from 'react-hook-form';
import { UpdateProductSchema } from '../../../../_utils/validation';
import { toast } from 'sonner';
import useUpdateProduct from '../../../../_hooks/useUpdateProduct';
import TextArea from '@potta/components/textArea';
import * as yup from 'yup';
import useGetAllProductCategories from '../../../../_hooks/useGetAllProductCategories';
import { ProductCategory } from '../../../../_utils/types';
import { productImageUrls } from '../../../../_utils/images';
import Image from 'next/image';

type UpdateProductForm = yup.InferType<typeof UpdateProductSchema>;

const emptyForm: UpdateProductForm = {
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
  status: 'disabled',
  type: 'INVENTORY',
};

const toForm = (product: any): UpdateProductForm =>
  product
    ? {
        name: product.name ?? '',
        description: product.description ?? '',
        unitOfMeasure: product.unitOfMeasure ?? '',
        cost: Number(product.cost ?? 0),
        sku: product.sku ?? '',
        inventoryLevel: Number(product.inventoryLevel ?? 0),
        salesPrice: Number(product.salesPrice ?? 0),
        taxable: !!product.taxable,
        categoryId: product.category?.uuid ?? product.categoryId ?? '',
        images: productImageUrls(product),
        status: product.status ?? 'disabled',
        type: product.type === 'NON_INVENTORY' ? 'NON_INVENTORY' : 'INVENTORY',
      }
    : emptyForm;

interface EditProductProps {
  product: any; // Existing product data
  productId: string; // ID of the product to be edited
  onSuccess?: () => void; // Called after successful update
}

const EditProduct: React.FC<EditProductProps> = ({
  product,
  productId,
  onSuccess,
}) => {
  const [data, setData] = useState('inventory');
  const [images, setImages] = useState<string[]>(productImageUrls(product));
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateProductForm>({
    resolver: yupResolver(UpdateProductSchema),
    defaultValues: toForm(product),
  });
  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const ProductStatusEnum = [
    { value: 'pending', label: 'Pending' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'complete', label: 'Complete' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'available', label: 'Available' },
    { value: 'expired', label: 'Expired' },
    { value: 'taken', label: 'Taken' },
  ];

  const mutation = useUpdateProduct(productId);
  const onSubmit = (data: UpdateProductForm) => {
    const payload = {
      ...data,
      categoryId: data.categoryId || undefined,
      images: images,
      status: data.status || 'disabled',
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Product Updated successfully!');
        reset();
        if (onSuccess) onSuccess();
      },
      onError: () => {
        toast.error('Failed to Update product');
      },
    });
  };

  const { data: categoriesData } = useGetAllProductCategories();
  const categoryOptions = (categoriesData?.data || []).map(
    (cat: ProductCategory) => ({
      label: cat.name,
      value: cat.uuid,
    })
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative w-full max-w-6xl mx-auto p-8 pt-3"
    >
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
                options={categoryOptions}
                selectedValue={String(field.value ?? '')}
                onChange={(val: string) => field.onChange(String(val))}
                bg="bg-white"
                name="Select Category"
                label="Category"
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
          {images.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <Image
                    src={url}
                    width={2000}
                    height={2000}
                    alt={`Product image ${idx + 1}`}
                    className="h-20 w-20 object-cover  border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded-full p-1 text-red-500 "
                    onClick={() => handleRemoveImage(idx)}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
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
        <div className="w-full">
          <Input
            type={'number'}
            label={'Sales Price'}
            placeholder="760"
            name={'salesPrice'}
            register={register}
            errors={errors.salesPrice}
            required
          />
          <div className="mt-6 flex flex-col items-start ">
            <Controller
              name="taxable"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="taxable"
                  label="Taxable"
                  checked={!!field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          {/* <div className="mt-6">
            <Input
              type={'number'}
              label={'Tax Rate'}
              placeholder="Enter tax rate"
              name={'taxRate'}
              register={register}
              errors={errors.taxRate}
            />
          </div> */}
        </div>
      </div>
      <div className="mt-5">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              options={ProductStatusEnum}
              selectedValue={field.value}
              onChange={field.onChange}
              bg="bg-white"
              name="Select Status"
              label="Status"
              required
            />
          )}
        />
      </div>
      <div className="mt-12">
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
        {data == 'inventory' && (
          <Inventory control={control} register={register} errors={errors} />
        )}
      </div>
      <div className="flex-grow" />
      <div className="text-center md:text-right  md:flex  space-x-4 mt-8 justify-center p-4">
        <div className="flex gap-2 w-full 
        w justify-between">
          <Button
            text="Cancel"
            type="button"
            theme="danger"
            onClick={() => {
              reset(toForm(product));
              setImages(productImageUrls(product));
            }}
          />
          <Button
            text={'Update Item'}
            type={'submit'}
            isLoading={mutation.isPending}
          />
        </div>
      </div>
    </form>
  );
};

export default EditProduct;
