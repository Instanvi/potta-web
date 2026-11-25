'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo } from 'react';
import useGetOneCustomer from '@potta/app/(routes)/customers/hooks/useGetOneCustomer';
import useGetOneVendor from '@potta/app/(routes)/vendors/hooks/useGetOneVendor';
import {
  GenericDocumentPdf,
  type GenericDocumentPdfLine,
} from '@/components/documents/generic-document-pdf';
import {
  customerSnapshot,
  vendorSnapshot,
  type PartySnapshot,
} from '@/components/books/selected-party';
import type { BooksField } from '@/components/books/books-form-fields';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-main-bg text-sm text-muted-foreground">
        Loading PDF preview…
      </div>
    ),
  },
);

function linesFromValue(raw: string | undefined): GenericDocumentPdfLine[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => ({
      description: row?.description ? String(row.description) : undefined,
      quantity: Number(row?.quantity) || 0,
      unitPrice: Number(row?.unitPrice) || 0,
      totalAmount: Number.isFinite(Number(row?.totalAmount))
        ? Number(row.totalAmount)
        : undefined,
    }));
  } catch {
    return [];
  }
}

function partyFields(party: PartySnapshot | null): { label: string; value: string }[] {
  if (!party) return [];
  const rows: { label: string; value: string }[] = [{ label: party.kind, value: party.name }];
  if (party.email) rows.push({ label: 'Email', value: party.email });
  if (party.phone) rows.push({ label: 'Phone', value: party.phone });
  if (party.contactPerson) rows.push({ label: 'Contact', value: party.contactPerson });
  if (party.addressLines.length) {
    rows.push({ label: 'Address', value: party.addressLines.join(', ') });
  }
  if (party.taxId) rows.push({ label: 'Tax ID', value: party.taxId });
  return rows;
}

function detailFields(
  fields: BooksField[],
  values: Record<string, string>,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  for (const field of fields) {
    if (field.type === 'lines' || field.type === 'customer' || field.type === 'vendor') continue;
    const raw = (values[field.key] ?? '').trim();
    if (!raw || raw === 'false') continue;
    if (field.type === 'checkbox' || field.type === 'boolean') {
      rows.push({ label: field.label, value: 'Yes' });
      continue;
    }
    rows.push({ label: field.label, value: raw });
  }
  return rows;
}

export function BooksDocumentPreview({
  title,
  fields,
  values,
  onRegisterDownload,
}: {
  title: string;
  fields: BooksField[];
  values: Record<string, string>;
  onRegisterDownload?: (download: () => Promise<void>) => void;
}) {
  const { data: org } = useOrganizationProfile();
  const customerId = values.customerId ?? '';
  const vendorId = values.vendorId ?? '';
  const customerQuery = useGetOneCustomer(customerId);
  const vendorQuery = useGetOneVendor(vendorId);

  const seller = useMemo(() => orgToSeller(org), [org]);
  const customer = useMemo(
    () => (customerId && customerQuery.data ? customerSnapshot(customerQuery.data) : null),
    [customerId, customerQuery.data],
  );
  const vendor = useMemo(
    () => (vendorId && vendorQuery.data ? vendorSnapshot(vendorQuery.data) : null),
    [vendorId, vendorQuery.data],
  );
  const currency = values.currency?.trim() || 'XAF';
  const linesValue = values.lines ?? '';

  const documentNode = useMemo(
    () => (
      <GenericDocumentPdf
        title={title}
        subtitle={title}
        seller={seller}
        fields={[...partyFields(customer), ...partyFields(vendor), ...detailFields(fields, values)]}
        lines={linesFromValue(linesValue)}
        currency={currency}
      />
    ),
    [title, seller, customer, vendor, fields, values, linesValue, currency],
  );

  const download = useCallback(async () => {
    const filename = title.trim().toLowerCase().replace(/\s+/g, '-') || 'document';
    await downloadReactPdf(documentNode, `${filename}-draft`);
  }, [documentNode, title]);

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
