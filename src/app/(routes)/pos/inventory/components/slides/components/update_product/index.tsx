import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as yup from 'yup';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Checkbox from '@potta/components/checkbox';
import Select from '@potta/components/select';
import TextArea from '@potta/components/textArea';
import { UpdateProductSchema } from '../../../../_utils/validation';
import useUpdateProduct from '../../../../_hooks/useUpdateProduct';
import { productImageUrls } from '../../../../_utils/images';
import { apiErrorMessage } from '../../../../../utils/sale';
import {
  CategoryField,
  FieldHint,
  FormSection,
  MarginHint,
  STATUS_OPTIONS,
  TaxField,
  UNIT_OPTIONS,
} from '../../../fields/ItemFormFields';

type UpdateProductForm = yup.InferType<typeof UpdateProductSchema>;

const toForm = (product: any): UpdateProductForm => ({
  name: product?.name ?? '',
  description: product?.description ?? '',
  unitOfMeasure: product?.unitOfMeasure ?? 'Pieces',
  cost: Number(product?.cost ?? 0),
  sku: product?.sku ?? '',
  inventoryLevel: Number(product?.inventoryLevel ?? 0),
  reorderPoint: Number(product?.reorderPoint ?? 0),
  salesPrice: Number(product?.salesPrice ?? 0),
  taxable: !!product?.taxable,
  categoryId: product?.category?.uuid ?? product?.categoryId ?? '',
  taxId: product?.tax?.uuid ?? product?.taxId ?? '',
  images: productImageUrls(product),
  status: product?.status ?? 'enabled',
  type: product?.type === 'NON_INVENTORY' ? 'NON_INVENTORY' : 'INVENTORY',
});

interface EditProductProps {
  product: any;
  productId: string;
  onSuccess?: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({ product, productId, onSuccess }) => {
  const [images, setImages] = useState<string[]>(productImageUrls(product));
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<UpdateProductForm>({
    resolver: yupResolver(UpdateProductSchema),
    defaultValues: toForm(product),
  });

  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  const mutation = useUpdateProduct(productId);
  const taxable = watch('taxable');
  const [cost, salesPrice] = watch(['cost', 'salesPrice']);
  const isInventory = watch('type') !== 'NON_INVENTORY';

  const statusOptions = STATUS_OPTIONS.some((o) => o.value === product?.status) || !product?.status
    ? STATUS_OPTIONS
    : [...STATUS_OPTIONS, { label: String(product.status), value: String(product.status) }];

  const onSubmit = (data: UpdateProductForm) => {
    if (data.taxable && !data.taxId) {
      toast.error('Choose the tax to apply, or untick "Charge tax".');
      return;
    }
    const { categoryId, taxId, ...rest } = data;
    const payload = {
      ...rest,
      ...(categoryId ? { categoryId } : {}),
      ...(data.taxable && taxId ? { taxId } : {}),
      images,
      status: data.status || 'enabled',
    };
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`"${data.name}" updated`);
        onSuccess?.();
      },
      onError: (error) => toast.error(`Could not update the item: ${apiErrorMessage(error)}`),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-full w-full flex-col">
      <div className="flex-1 space-y-4 p-6 pb-24">
        <FormSection title="Basics" description="How the item is named and grouped.">
          <div className="md:col-span-2">
            <Input label="Item name" type="text" name="name" register={register} errors={errors.name} required />
          </div>
          <div>
            <Input label="SKU / code" type="text" name="sku" register={register} errors={errors.sku} required />
            <FieldHint>Unique code used on receipts, barcodes and stock counts.</FieldHint>
          </div>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <CategoryField value={field.value || ''} onChange={field.onChange} error={errors.categoryId?.message} />
            )}
          />
          <Controller
            name="unitOfMeasure"
            control={control}
            render={({ field }) => (
              <Select
                label="Unit of measure"
                options={UNIT_OPTIONS}
                selectedValue={field.value || 'Pieces'}
                onChange={field.onChange}
                bg="bg-white"
                name="unitOfMeasure"
              />
            )}
          />
          <div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  options={statusOptions}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="status"
                  required
                />
              )}
            />
            <FieldHint>Disabled items stay in the books but cannot be sold.</FieldHint>
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Description"
              name="description"
              placeholder="Optional details shown on invoices and receipts"
              register={register}
              errors={errors.description}
              height
            />
          </div>
        </FormSection>

        <FormSection title="Pricing and tax" description="What the item costs you and what customers pay.">
          <div>
            <Input label="Cost price" type="number" name="cost" register={register} errors={errors.cost} required min={0} />
            <FieldHint>What you pay per unit. Used for cost of goods sold.</FieldHint>
          </div>
          <div>
            <Input
              label="Selling price"
              type="number"
              name="salesPrice"
              register={register}
              errors={errors.salesPrice}
              required
              min={0}
            />
            <MarginHint cost={cost} price={salesPrice} />
          </div>
          <div className="md:col-span-2">
            <Controller
              name="taxable"
              control={control}
              render={({ field }) => (
                <Checkbox id="edit-taxable" label="Charge tax on this item" checked={!!field.value} onChange={field.onChange} />
              )}
            />
          </div>
          {taxable && (
            <Controller
              name="taxId"
              control={control}
              render={({ field }) => (
                <TaxField value={field.value || ''} onChange={field.onChange} error={errors.taxId?.message} />
              )}
            />
          )}
        </FormSection>

        {isInventory && (
          <FormSection title="Stock" description="Quantity on hand and when to restock.">
            <div>
              <Input
                label="Stock on hand"
                type="number"
                name="inventoryLevel"
                register={register}
                errors={errors.inventoryLevel}
                min={0}
              />
              <FieldHint>To record a purchase, use Restock so the cost is tracked.</FieldHint>
            </div>
            <div>
              <Input
                label="Reorder point"
                type="number"
                name="reorderPoint"
                register={register}
                errors={errors.reorderPoint}
                min={0}
              />
              <FieldHint>You are warned when stock falls to this level.</FieldHint>
            </div>
          </FormSection>
        )}

        {images.length > 0 && (
          <section className="rounded-[2px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="mb-3 text-sm font-semibold">Images</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={url + idx} className="relative">
                  <Image
                    src={url}
                    width={160}
                    height={160}
                    alt={`Item image ${idx + 1}`}
                    className="h-20 w-20 border object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove image"
                    className="absolute right-1 top-1 rounded-full bg-white/90 px-1 text-red-500"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              ))}
            </div>
            <FieldHint>Add more images in the next step.</FieldHint>
          </section>
        )}
      </div>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
        <Button
          text="Reset"
          type="button"
          theme="outline"
          disabled={!isDirty}
          onClick={() => {
            reset(toForm(product));
            setImages(productImageUrls(product));
          }}
        />
        <Button text="Save changes" type="submit" isLoading={mutation.isPending} />
      </div>
    </form>
  );
};

export default EditProduct;
