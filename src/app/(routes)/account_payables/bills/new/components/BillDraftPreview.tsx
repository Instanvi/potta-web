'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  BillPdfDocument,
  type BillPdfProps,
} from '@/components/documents/bill-pdf-document';
import {
  formatOrgAddress,
  orgDisplayName,
  useOrganizationProfile,
} from '@/hooks/use-organization-profile';
import { withDocumentAcronym } from '@potta/components/generated-number-field';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { formatDate } from '../../../../_shared/format';
import { paymentMethodLabel } from '../../utils/types';
import { BillFormValues, lineTotals } from '../validations/billValidation';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-main-bg text-sm text-muted-foreground">
        Loading PDF preview…
      </div>
    ),
  },
);

type VendorLite = { uuid: string; name: string; email?: string | null; phone?: string | null };

function buildPdfProps(input: {
  vendors: VendorLite[];
  vendorId?: string;
  billNo?: string;
  issueDate?: string;
  dueDate?: string;
  currency: string;
  paymentMethod?: string;
  expenseAccountCode?: string;
  notes?: string;
  lines: BillFormValues['lineItems'];
  sellerName: string;
  sellerEmail?: string | null;
  sellerPhone?: string | null;
  sellerAddress: string[];
  sellerLogo?: string | null;
  sellerReg?: string | null;
  sellerTax?: string | null;
}): BillPdfProps {
  const vendor = input.vendors.find((v) => v.uuid === input.vendorId) ?? null;
  const summary = (input.lines ?? []).reduce(
    (acc, line) => {
      const t = lineTotals(line ?? {});
      acc.subtotal += t.gross;
      acc.discount += t.discount;
      acc.tax += t.tax;
      acc.total += t.total;
      return acc;
    },
    { subtotal: 0, discount: 0, tax: 0, total: 0 },
  );

  const billNumber = input.billNo?.trim()
    ? withDocumentAcronym(input.billNo, 'BILL')
    : undefined;
  const title = billNumber ? `Bill ${billNumber}` : 'Draft bill';

  return {
    title,
    billNumber,
    issueDate: input.issueDate ? formatDate(input.issueDate) : '—',
    dueDate: input.dueDate ? formatDate(input.dueDate) : '—',
    currency: input.currency || 'XAF',
    paymentMethod: paymentMethodLabel(input.paymentMethod),
    expenseAccountCode: input.expenseAccountCode?.trim() || undefined,
    notes: input.notes,
    seller: {
      name: input.sellerName,
      email: input.sellerEmail,
      phone: input.sellerPhone,
      addressLines: input.sellerAddress,
      logoUrl: null,
      registrationNumber: input.sellerReg,
      taxId: input.sellerTax,
    },
    vendor: vendor
      ? { name: vendor.name, email: vendor.email, phone: vendor.phone }
      : null,
    lines: (input.lines ?? []).map((line) => {
      const t = lineTotals(line ?? {});
      return {
        description: line?.description?.trim() || 'Item or service',
        quantity: Number(line?.quantity || 0),
        unitPrice: Number(line?.unitPrice || 0),
        taxRate: Number(line?.taxRate || 0),
        discountAmount: Number(line?.discountAmount || 0),
        lineTotal: t.total,
      };
    }),
    subtotal: summary.subtotal,
    discount: summary.discount,
    tax: summary.tax,
    total: summary.total,
    draft: true,
  };
}

/** Live bill PDF preview (@react-pdf) driven by the create form. */
export default function BillDraftPreview({
  vendors = [],
  onRegisterDownload,
}: {
  vendors?: VendorLite[];
  /** Receives a stable download callback for the preview shell toolbar. */
  onRegisterDownload?: (download: () => Promise<void>) => void;
}) {
  const { control } = useFormContext<BillFormValues>();
  const { data: org } = useOrganizationProfile();

  const vendorId = useWatch({ control, name: 'vendorId' });
  const billNo = useWatch({ control, name: 'vendorInvoiceNumber' });
  const issueDate = useWatch({ control, name: 'issueDate' });
  const dueDate = useWatch({ control, name: 'dueDate' });
  const currency = useWatch({ control, name: 'currency' }) || 'XAF';
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const expenseAccountCode = useWatch({ control, name: 'expenseAccountCode' });
  const notes = useWatch({ control, name: 'notes' });
  const lines = useWatch({ control, name: 'lineItems' }) ?? [];

  const pdfProps = useMemo(
    () =>
      buildPdfProps({
        vendors,
        vendorId,
        billNo,
        issueDate,
        dueDate,
        currency,
        paymentMethod,
        expenseAccountCode,
        notes,
        lines,
        sellerName: orgDisplayName(org) || 'Your organization',
        sellerEmail: org?.businessEmail,
        sellerPhone: org?.businessPhone,
        sellerAddress: formatOrgAddress(org),
        sellerLogo: org?.logo,
        sellerReg: org?.registrationNumber,
        sellerTax: org?.taxIdentificationNumber,
      }),
    [
      vendors,
      vendorId,
      billNo,
      issueDate,
      dueDate,
      currency,
      paymentMethod,
      expenseAccountCode,
      notes,
      lines,
      org,
    ],
  );

  const documentNode = useMemo(() => <BillPdfDocument {...pdfProps} />, [pdfProps]);

  const download = useCallback(async () => {
    const filename = pdfProps.billNumber || 'BILL-draft';
    await downloadReactPdf(documentNode, filename);
  }, [documentNode, pdfProps.billNumber]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);

  return (
    <div className="h-full min-h-0 bg-main-bg">
      <PDFViewer
        width="100%"
        height="100%"
        showToolbar={false}
        className="h-full w-full border-0"
      >
        {documentNode}
      </PDFViewer>
    </div>
  );
}

export { buildPdfProps };
