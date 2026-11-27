'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useDocumentLetterhead } from '@/hooks/use-document-letterhead';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { PdfPreview } from '@/components/documents/pdf-preview';
import { downloadReactPdf } from '@/lib/download-react-pdf';
import { orgToSeller } from '@/lib/org-to-seller';

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
    if (
      field.type === 'lines' ||
      field.type === 'attachments' ||
      field.type === 'customer' ||
      field.type === 'vendor' ||
      field.type === 'purchaseOrder' ||
      field.type === 'salesOrder' ||
      field.type === 'invoice' ||
      field.type === 'bill' ||
      field.type === 'estimate'
    ) {
      continue;
    }
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
  const { prefs: letterhead } = useDocumentLetterhead();
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

  const previewProps = useMemo(
    () => ({
      title,
      subtitle: title,
      seller,
      fields: [...partyFields(customer), ...partyFields(vendor), ...detailFields(fields, values)],
      lines: linesFromValue(linesValue),
      currency,
      accent: letterhead.accent,
      template: letterhead.template,
    }),
    [title, seller, customer, vendor, fields, values, linesValue, currency, letterhead.accent, letterhead.template],
  );

  /** Hold last stable props so typing does not rebuild the PDF every keystroke. */
  const [stableProps, setStableProps] = useState(previewProps);
  useEffect(() => {
    const handle = window.setTimeout(() => setStableProps(previewProps), 500);
    return () => window.clearTimeout(handle);
  }, [previewProps]);

  const documentNode = useMemo(
    () => <GenericDocumentPdf {...stableProps} />,
    [stableProps],
  );

  const download = useCallback(async () => {
    const filename = title.trim().toLowerCase().replace(/\s+/g, '-') || 'document';
    await downloadReactPdf(<GenericDocumentPdf {...previewProps} />, `${filename}-draft`);
  }, [previewProps, title]);

  useEffect(() => {
    onRegisterDownload?.(download);
  }, [download, onRegisterDownload]);

  return <PdfPreview document={documentNode} />;
}
