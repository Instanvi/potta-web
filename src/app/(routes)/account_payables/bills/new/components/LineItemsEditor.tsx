'use client';

import {
  Control,
  FieldErrors,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import {
  DocumentLine,
  DocumentLinesEditor,
  DEFAULT_LINE_TAX_RATE,
} from '@potta/components/product-lines/DocumentLinesEditor';
import { BillFormValues, BillLineFormValues } from '../validations/billValidation';

export const DEFAULT_TAX_RATE = DEFAULT_LINE_TAX_RATE;

export const emptyLine = (): BillLineFormValues => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: DEFAULT_TAX_RATE,
  discountAmount: 0,
});

interface Props {
  control: Control<BillFormValues>;
  errors: FieldErrors<BillFormValues>;
  currency: string;
}

const toDocumentLines = (lines: BillLineFormValues[]): DocumentLine[] =>
  lines.map((l) => ({
    productId: l.productId,
    description: l.description ?? '',
    quantity: Number(l.quantity) || 0,
    unitPrice: Number(l.unitPrice) || 0,
    taxRate: Number(l.taxRate) || 0,
    discountAmount: Number(l.discountAmount) || 0,
    variationId: l.variationId,
    packagePriceId: l.packagePriceId,
    unitId: l.unitId,
  }));

const fromDocumentLines = (lines: DocumentLine[]): BillLineFormValues[] =>
  lines.map((l) => ({
    productId: l.productId,
    description: l.description ?? '',
    quantity: Number(l.quantity) || 0,
    unitPrice: Number(l.unitPrice) || 0,
    taxRate: Number(l.taxRate) || DEFAULT_TAX_RATE,
    discountAmount: Number(l.discountAmount) || 0,
    variationId: l.variationId,
    packagePriceId: l.packagePriceId,
    unitId: l.unitId,
  }));

const LineItemsEditor = ({ control, errors }: Props) => {
  const { replace } = useFieldArray({ control, name: 'lineItems' });
  const lines = useWatch({ control, name: 'lineItems' }) ?? [];
  const lineErrors = errors.lineItems;

  return (
    <div className="space-y-3">
      <DocumentLinesEditor
        lines={toDocumentLines(lines)}
        onChange={(next) => replace(fromDocumentLines(next))}
        defaultTaxRate={DEFAULT_TAX_RATE}
      />
      {!Array.isArray(lineErrors) && lineErrors?.message ? (
        <p className="text-sm text-red-500">{lineErrors.message}</p>
      ) : null}
    </div>
  );
};

export default LineItemsEditor;
