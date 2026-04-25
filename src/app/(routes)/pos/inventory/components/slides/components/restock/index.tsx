import React, { useState, ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '@potta/components/input';
import Button from '@potta/components/button';
import { Product } from '../../../../_utils/types';
import Slider from '@potta/components/slideover';
import SearchableSelect from '@potta/components/searchableSelect';
import useGetAllProducts from '../../../../_hooks/useGetAllProducts';
import useRestockProduct from '../../../../_hooks/useRestockProduct';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { Option } from '@potta/components/searchableSelect';

const restockSchema = yup.object().shape({
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1')
    .typeError('Must be a number'),
  productId: yup.string().required('Product is required'),
});

type RestockFormData = {
  quantity: number;
  productId: string;
};

interface RestockModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const RestockModal: React.FC<RestockModalProps> = ({ open, setOpen }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data: products } = useGetAllProducts({ limit: 100, page: 1 });
  const restockMutation = useRestockProduct();
  const context = useContext(ContextData);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RestockFormData>({
    resolver: yupResolver(restockSchema),
    defaultValues: {
      quantity: 0,
      productId: '',
    },
  });

  const onSubmit = async (data: RestockFormData) => {
    if (!selectedProduct) {
      console.log('Missing required data:', {
        selectedProduct,
        userId: context?.users?.uuid || '73a5fc80-3de0-4f70-a35c-8bb93f07b1a1',
      });
      return;
    }

    try {
      console.log('Submitting restock with data:', {
        productId: selectedProduct.uuid,
        quantity: data.quantity,
        userId: context?.users?.uuid || '73a5fc80-3de0-4f70-a35c-8bb93f07b1a1',
      });

      setIsSubmitting(true);
      const result = await restockMutation.mutateAsync({
        productId: selectedProduct.uuid,
        quantity: data.quantity,
        userId: context?.users?.uuid || '73a5fc80-3de0-4f70-a35c-8bb93f07b1a1',
      });

      console.log('Restock successful:', result);
      toast.success('Product restocked successfully!');
      reset();
      setOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error restocking product:', error);
      toast.error('Failed to restock product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      edit={true}
      buttonText={'Restock Product'}
      title={'Restock Product'}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative h-screen w-full max-w-4xl"
      >
        <div className="space-y-4 p-4">
          <div>
            <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Select Product"
                  options={
                    products?.data.map((product) => ({
                      value: product.uuid,
                      label: product.name,
                    })) || []
                  }
                  selectedValue={field.value}
                  onChange={(value: string) => {
                    field.onChange(value);
                    const product = products?.data.find(
                      (p) => p.uuid === value
                    );
                    setSelectedProduct(product || null);
                  }}
                  error={errors.productId?.message}
                />
              )}
            />
          </div>

          {selectedProduct && (
            <div className="bg-gray-50  rounded-lg space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Product Details
                </p>
                <p className="text-sm text-gray-500">
                  Name: {selectedProduct.name}
                </p>
                <p className="text-sm text-gray-500">
                  SKU: {selectedProduct.sku}
                </p>
                <p className="text-sm text-gray-500">
                  Current Stock: {selectedProduct.inventoryLevel}
                </p>
              </div>

              <div>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Quantity to Add"
                      type="number"
                      name="quantity"
                      placeholder="Enter quantity"
                      value={field.value}
                      onchange={(e: ChangeEvent<HTMLInputElement>) => {
                        const value =
                          e.target.value === '' ? '' : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                      errors={errors.quantity}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-grow" />
        <div className="text-center md:text-right md:flex space-x-4 fixed bottom-0 left-0 right-0 justify-center bg-white  border-t">
          <div className="flex gap-2 w-full p-4 justify-end">
            <Button
              text={isSubmitting ? 'Restocking...' : 'Restock'}
              type="submit"
              isLoading={isSubmitting}
              disabled={!selectedProduct}
            />
          </div>
        </div>
      </form>
    </Slider>
  );
};

export default RestockModal;
