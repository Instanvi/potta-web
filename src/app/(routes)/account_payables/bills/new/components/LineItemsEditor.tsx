'use client';
import { Control, FieldErrors, UseFormRegister, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Trash } from '@phosphor-icons/react';
import { formatMoney } from '../../../utils/format';
import { BillFormValues, lineTotals } from '../validations/billValidation';

export const DEFAULT_TAX_RATE = 19.25;

export const emptyLine = () => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: DEFAULT_TAX_RATE,
  discountAmount: 0,
});

interface Props {
  control: Control<BillFormValues>;
  register: UseFormRegister<BillFormValues>;
  errors: FieldErrors<BillFormValues>;
  currency: string;
}

const cellInput =
  'w-full border border-gray-200 px-2 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500';

const LineItemsEditor = ({ control, register, errors, currency }: Props) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const lines = useWatch({ control, name: 'lineItems' }) ?? [];
  const lineErrors = errors.lineItems;

  return (
    <div>
      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="w-24 px-3 py-2 font-medium">Qty</th>
              <th className="w-36 px-3 py-2 font-medium">Unit price</th>
              <th className="w-24 px-3 py-2 font-medium">Tax %</th>
              <th className="w-32 px-3 py-2 font-medium">Discount</th>
              <th className="w-36 px-3 py-2 text-right font-medium">Line total</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const err = Array.isArray(lineErrors) ? lineErrors[index] : undefined;
              const totals = lineTotals(lines[index] ?? {});
              return (
                <tr key={field.id} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-2">
                    <input
                      {...register(`lineItems.${index}.description`)}
                      placeholder="Item or service"
                      className={`${cellInput} ${err?.description ? 'border-red-500' : ''}`}
                    />
                    {err?.description && <small className="text-red-500">{err.description.message}</small>}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="any"
                      min={0}
                      {...register(`lineItems.${index}.quantity`)}
                      className={`${cellInput} ${err?.quantity ? 'border-red-500' : ''}`}
                    />
                    {err?.quantity && <small className="text-red-500">{err.quantity.message}</small>}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="any"
                      min={0}
                      {...register(`lineItems.${index}.unitPrice`)}
                      className={`${cellInput} ${err?.unitPrice ? 'border-red-500' : ''}`}
                    />
                    {err?.unitPrice && <small className="text-red-500">{err.unitPrice.message}</small>}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="any"
                      min={0}
                      max={100}
                      {...register(`lineItems.${index}.taxRate`)}
                      className={`${cellInput} ${err?.taxRate ? 'border-red-500' : ''}`}
                    />
                    {err?.taxRate && <small className="text-red-500">{err.taxRate.message}</small>}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="any"
                      min={0}
                      {...register(`lineItems.${index}.discountAmount`)}
                      className={`${cellInput} ${err?.discountAmount ? 'border-red-500' : ''}`}
                    />
                    {err?.discountAmount && (
                      <small className="text-red-500">{err.discountAmount.message}</small>
                    )}
                  </td>
                  <td className="px-3 py-2 pt-4 text-right font-medium text-gray-900">
                    {formatMoney(totals.total, currency)}
                    {totals.tax > 0 && (
                      <span className="block text-xs font-normal text-gray-400">
                        incl. {formatMoney(totals.tax, currency)} tax
                      </span>
                    )}
                  </td>
                  <td className="px-1 py-2 pt-3">
                    <button
                      type="button"
                      title="Remove line"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                      className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!Array.isArray(lineErrors) && lineErrors?.message && (
        <p className="mt-1 text-sm text-red-500">{lineErrors.message}</p>
      )}
      <button
        type="button"
        onClick={() => append(emptyLine())}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
      >
        <Plus size={16} weight="bold" /> Add line
      </button>
    </div>
  );
};

export default LineItemsEditor;
