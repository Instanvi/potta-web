'use client';
import React, { useContext, useEffect, useState } from 'react';
import { catalogApi } from '../../../_utils/api';
import Input from '@potta/components/input';

import Slider from '@potta/components/slideover';
import { SingleValue } from 'react-select';
import Select from '@potta/components/select';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@potta/components/button';

import { ContextData } from '@potta/components/providers/DataProvider';

import { toast } from 'sonner';
import Text from '@potta/components/textDisplay';

import useGetOneProduct from '../../../_hooks/useGetOneProduct';
import MyDropzone from '@potta/components/dropzone';
import { productImageUrls } from '../../../_utils/images';
import PayManagedNotice from '../../PayManagedNotice';

interface ProductDetailsProps {
  productId: string;
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}
const ViewProductSlider: React.FC<ProductDetailsProps> = ({
  productId,
  open: controlledOpen, // Renamed to avoid naming conflict
  setOpen: setControlledOpen,
}) => {
  const context = useContext(ContextData);
  const { data, isLoading, error, refetch } = useGetOneProduct(productId);

  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);
  const [tab, setTab] = useState('overview');
  const [movements, setMovements] = useState<any[]>([]);


  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  useEffect(() => {
    if (isOpen && productId) {
      refetch();
      catalogApi.productMovements(productId, { limit: 20 }).then((res) => setMovements(res.data ?? res ?? []));
    }
  }, [productId, refetch, isOpen]);

  const imageUrls = productImageUrls(data);

  return (
    <Slider
      open={isOpen} // Use controlled or local state
      setOpen={setIsOpen} // Use controlled or local setter
      edit={false}
      title={'Item Details'}
      buttonText="view vendor"
    >
      {isLoading && (
        <div className="flex justify-center items-center py-10 h-screen">
          Loading
        </div>
      )}

      {error && (
        <p className="text-red-600 text-center">
          Error fetching vendor details: {error.message}
        </p>
      )}

      {!data ||
        (Object.keys(data).length === 0 && (
          <p className="text-gray-500 text-center">No Item data available.</p>
        ))}

      {data && (
        <div className="relative h-screen place-items-center w-full max-w-4xl">
          {data.payProductId && (
            <PayManagedNotice
              payProductId={data.payProductId}
              lastSynced={data.lastSynced}
              className="mb-4 w-full"
            />
          )}
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            {['overview', 'variations', 'units', 'modifiers', 'bundle', 'movements', 'cost'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-[2px] px-3 py-1 capitalize ${tab === id ? 'bg-primary text-white' : 'bg-muted'}`}
              >
                {id === 'units' ? 'Units and packages' : id === 'movements' ? 'Stock movements' : id === 'cost' ? 'Cost history' : id}
              </button>
            ))}
          </div>
          {tab !== 'overview' ? (
            <div className="w-full space-y-2 text-sm">
              {tab === 'variations' &&
                (data.variations ?? []).map((v: any) => (
                  <div key={v.uuid} className="border p-3">
                    {v.name || v.sku} · {v.inventoryLevel} in stock · {v.salesPrice}
                  </div>
                ))}
              {tab === 'units' && (
                <>
                  {(data.unitAssignments ?? []).map((a: any) => (
                    <div key={a.uuid} className="border p-3">
                      {a.unit?.name} ({a.unit?.symbol})
                    </div>
                  ))}
                  {[...(data.packagePrices ?? []), ...(data.variationPackagePrices ?? [])].map((p: any) => (
                    <div key={p.uuid} className="border p-3">
                      {p.packageName}: {p.unitsPerPackage} @ {p.packagePrice}
                    </div>
                  ))}
                </>
              )}
              {tab === 'modifiers' &&
                [...(data.modifiers ?? []), ...(data.orgModifiers ?? [])].map((m: any) => (
                  <div key={m.uuid} className="border p-3">
                    {m.name} +{m.price}
                  </div>
                ))}
              {tab === 'bundle' &&
                (data.componentLinks ?? data.components ?? []).map((c: any, i: number) => (
                  <div key={i} className="border p-3">
                    {c.component?.name || c.product?.name || c.productId} × {c.quantity}
                  </div>
                ))}
              {tab === 'movements' &&
                movements.map((m) => (
                  <div key={m.uuid} className="border p-3">
                    {m.reason} {m.quantity} → {m.balanceAfter}
                  </div>
                ))}
              {tab === 'cost' &&
                movements
                  .filter((m) => m.reason === 'RESTOCK' || m.unitCost != null)
                  .map((m) => (
                    <div key={`c-${m.uuid}`} className="border p-3">
                      {m.createdAt}: {m.unitCost}
                    </div>
                  ))}
            </div>
          ) : (
          <>
          {/* Header */}
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Name" value={data.name} height />
            <Text name="Status" value={data.status} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Cost" value={data.cost} height />
            <Text
              name="Category"
              value={
                data.category && typeof data.category === 'object'
                  ? data.category.name
                  : ''
              }
              height
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Description" value={data.description} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="" className="mb-3 text-gray-900 font-medium">
                Images
              </label>
              {imageUrls.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Product image ${idx + 1}`}
                      className="h-20 w-20 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="w-full gap-3">
              <Text name="SKU" value={data.sku} height />
            </div>
            {data.taxable && (
              <Text name="Tax Rate" value={data.taxRate} height />
            )}
            <Text name="Cost" value={data.cost} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text
              name="Unit of Measurement"
              value={data.unitOfMeasure}
              height
            />

            <Text name="Inventory Level" value={data.inventoryLevel} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Created At" value={data.createdAt} height />
          </div>

          {/* Assembly/Group Components Section */}
          {(data.structure === 'ASSEMBLY' ||
            data.structure === 'SIMPLEGROUPS') &&
            data.components &&
            data.components.length > 0 && (
              <div className="w-full mt-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {data.structure === 'ASSEMBLY'
                      ? 'Assembly Components'
                      : 'Group Items'}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      {data.structure === 'ASSEMBLY'
                        ? 'Components that make up this assembly (consumed when sold):'
                        : 'Items included in this group (sold together as a bundle):'}
                    </p>
                    <div className="space-y-3">
                      {data.components.map((component: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-md border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {component.product?.name ||
                                  `Product ID: ${component.productId}`}
                              </h4>
                              {component.product?.sku && (
                                <p className="text-sm text-gray-500">
                                  SKU: {component.product.sku}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                Quantity: {component.quantity}
                              </div>
                              {component.product?.salesPrice && (
                                <div className="text-sm text-gray-500">
                                  XAF{' '}
                                  {component.product.salesPrice.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </>
          )}
          {/* <div className="text-center md:text-right mt-4 md:flex md:justify-end space-x-4">
            <Button
              text="Cancel"
              type="button"
              theme="gray"
              color={true}
              onClick={() => setIsSliderOpen(false)}
            />
          </div> */}
        </div>
      )}
    </Slider>
  );
};

export default ViewProductSlider;
