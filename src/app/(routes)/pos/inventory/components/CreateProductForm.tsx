import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Checkbox from '@potta/components/checkbox';
import TextArea from '@potta/components/textArea';
import Select from '@potta/components/select';
import { ProductPayload, productSchema } from '../_utils/validation';
import useCreateProduct from '../_hooks/useCreateProduct';
import { apiErrorMessage } from '../../utils/sale';
import {
  CategoryField,
  FieldHint,
  FormSection,
  MarginHint,
  TaxField,
  UNIT_OPTIONS,
  generateSku,
} from './fields/ItemFormFields';

interface CreateProductFormProps {
  productType?: 'INVENTORY' | 'NON_INVENTORY';
  structure?: 'SIMPLE' | 'ASSEMBLY' | 'SIMPLEGROUPS';
  isNonInventory?: boolean;
  onProductCreated?: (id: string, data: any) => void;
  onCancel?: () => void;
}

const STRUCTURE_COPY: Record<string, string> = {
  SIMPLE: 'A single product you buy or make and sell as is.',
  ASSEMBLY: 'Built from other items. You pick the components in the next step.',
  SIMPLEGROUPS: 'A set of items sold together. You pick the items in the next step.',
};

const CreateProductForm: React.FC<CreateProductFormProps> = ({
  productType = 'INVENTORY',
  structure = 'SIMPLE',
  isNonInventory = false,
  onProductCreated,
  onCancel,
}) => {
  const defaults: ProductPayload = {
    name: '',
    description: '',
    unitOfMeasure: 'Pieces',
    cost: 0,
    sku: '',
    inventoryLevel: 0,
    reorderPoint: 0,
    salesPrice: 0,
    taxable: false,
    categoryId: '',
    taxId: '',
    images: [],
    type: productType,
    structure,
    components: [],
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<ProductPayload>({ resolver: yupResolver(productSchema), defaultValues: defaults });

  useEffect(() => {
    reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType, structure, isNonInventory, reset]);

  const mutation = useCreateProduct();
  const taxable = watch('taxable');
  const [cost, salesPrice] = watch(['cost', 'salesPrice']);
  const needsComponents = structure === 'ASSEMBLY' || structure === 'SIMPLEGROUPS';

  const toPayload = (formData: ProductPayload) => {
    const { categoryId, taxId, components, ...rest } = formData;
    return {
      ...rest,
      sku: formData.sku?.trim() || generateSku(formData.name),
      ...(categoryId ? { categoryId } : {}),
      ...(formData.taxable && taxId ? { taxId } : {}),
      components: components ?? [],
      unitOfMeasure: formData.unitOfMeasure || 'Pieces',
      type: productType,
      structure,
      images: [],
      inventoryLevel: isNonInventory ? 0 : Number(formData.inventoryLevel ?? 0),
      reorderPoint: isNonInventory ? 0 : Number(formData.reorderPoint ?? 0),
    };
  };

  const onSubmit = (formData: ProductPayload) => {
    if (formData.taxable && !formData.taxId) {
      toast.error('Choose the tax to apply, or untick "Charge tax".');
      return;
    }
    const payload = toPayload(formData);
    if (needsComponents) {
      onProductCreated?.('', payload);
      return;
    }
    mutation.mutate(payload as ProductPayload, {
      onSuccess: (response) => {
        toast.success(`"${payload.name}" created`);
        reset(defaults);
        const id = response?.data?.uuid ?? response?.uuid ?? response?.data?.id ?? response?.id;
        if (!id) {
          toast.error('Item created but no id was returned.');
          return;
        }
        onProductCreated?.(id, payload);
      },
      onError: (error) => toast.error(`Could not create the item: ${apiErrorMessage(error)}`),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-full w-full flex-col">
      <div className="flex-1 space-y-4 p-6 pb-24">
        <p className="text-sm text-muted-foreground">{STRUCTURE_COPY[structure]}</p>

        <FormSection title="Basics" description="How the item is named and grouped.">
          <div className="md:col-span-2">
            <Input
              label="Item name"
              type="text"
              name="name"
              placeholder="e.g. Coca-Cola 33cl"
              register={register}
              errors={errors.name}
              required
            />
          </div>
          <div>
            <div className="flex items-end gap-2">
              <Input
                label="SKU / code"
                type="text"
                name="sku"
                placeholder="Leave empty to generate one"
                register={register}
                errors={errors.sku}
              />
              <button
                type="button"
                onClick={() => setValue('sku', generateSku(getValues('name') || ''), { shouldValidate: true })}
                className="mb-[1px] h-[42px] shrink-0 rounded-[2px] border border-input px-3 text-xs font-medium hover:bg-brand-subtle"
              >
                Generate
              </button>
            </div>
            <FieldHint>Unique code used on receipts, barcodes and stock counts.</FieldHint>
          </div>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <CategoryField value={field.value || ''} onChange={field.onChange} error={errors.categoryId?.message} />
            )}
          />
          <div>
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
                  required
                />
              )}
            />
            <FieldHint>The unit you count, buy and sell this item in.</FieldHint>
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
            <Input
              label="Cost price"
              type="number"
              name="cost"
              placeholder="0"
              register={register}
              errors={errors.cost}
              required
              min={0}
            />
            <FieldHint>What you pay per unit. Used for cost of goods sold.</FieldHint>
          </div>
          <div>
            <Input
              label="Selling price"
              type="number"
              name="salesPrice"
              placeholder="0"
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
                <Checkbox
                  id="create-taxable"
                  label="Charge tax on this item"
                  checked={!!field.value}
                  onChange={field.onChange}
                />
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

        {!isNonInventory && (
          <FormSection title="Stock" description="Opening quantity and when to restock.">
            <div>
              <Input
                label="Opening stock"
                type="number"
                name="inventoryLevel"
                placeholder="0"
                register={register}
                errors={errors.inventoryLevel}
                min={0}
              />
              <FieldHint>Quantity on hand today. Later changes go through Restock.</FieldHint>
            </div>
            <div>
              <Input
                label="Reorder point"
                type="number"
                name="reorderPoint"
                placeholder="0"
                register={register}
                errors={errors.reorderPoint}
                min={0}
              />
              <FieldHint>You are warned when stock falls to this level.</FieldHint>
            </div>
          </FormSection>
        )}
      </div>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
        {onCancel && <Button text="Cancel" type="button" theme="outline" onClick={onCancel} />}
        <Button
          text={structure === 'ASSEMBLY' ? 'Next: components' : structure === 'SIMPLEGROUPS' ? 'Next: group items' : 'Create item'}
          type="submit"
          isLoading={mutation.isPending}
        />
      </div>
    </form>
  );
};

export default CreateProductForm;
