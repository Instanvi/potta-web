import { Document, Page, View } from '@react-pdf/renderer';
import type { PdfSeller } from '@/lib/org-to-seller';
import {
  DocumentFooter,
  LetterheadHeader,
  LineItemsTable,
  NotesSection,
  PDF_ACCENT,
  PartyBlock,
  TotalsBlock,
  formatPdfMoney,
  pdfShellStyles as shell,
} from './pdf-shell';

export type PurchaseOrderPdfLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
};

export type PurchaseOrderPdfVendor = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
};

export type PurchaseOrderPdfProps = {
  title: string;
  orderDate: string;
  requiredDate: string;
  currency: string;
  paymentMethod?: string;
  paymentTerms?: string;
  notes?: string;
  shippingAddress?: string;
  seller: PdfSeller;
  vendor: PurchaseOrderPdfVendor | null;
  lines: PurchaseOrderPdfLine[];
  subtotal: number;
  tax: number;
  total: number;
  accent?: string;
  draft?: boolean;
};

const LINE_COLUMNS = [
  { header: 'Item', width: '42%' },
  { header: 'Qty', width: '12%', align: 'right' as const },
  { header: 'Unit price', width: '18%', align: 'right' as const },
  { header: 'Tax %', width: '10%', align: 'right' as const },
  { header: 'Total', width: '18%', align: 'right' as const },
];

export function PurchaseOrderPdfDocument({
  title,
  orderDate,
  requiredDate,
  currency,
  paymentMethod,
  paymentTerms,
  notes,
  shippingAddress,
  seller,
  vendor,
  lines,
  subtotal,
  tax,
  total,
  accent = PDF_ACCENT,
  draft = true,
}: PurchaseOrderPdfProps) {
  const money = (value: number) => formatPdfMoney(value, currency);
  const shipLines = (shippingAddress || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Document title={title} author={seller.name || 'Potta'} subject="Purchase order">
      <Page size="A4" style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title="Purchase Order"
          subtitle={draft ? 'Draft' : undefined}
          accent={accent}
          meta={[
            { label: 'Order', value: orderDate },
            { label: 'Required', value: requiredDate },
            { label: 'Currency', value: currency },
          ]}
        />
        <View style={shell.body}>
          <View style={shell.parties}>
            <PartyBlock
              label="Vendor"
              name={vendor?.name || 'Select a vendor'}
              email={vendor?.email}
              phone={vendor?.phone}
              lines={[
                vendor?.address,
                vendor?.contactPerson ? `Contact: ${vendor.contactPerson}` : null,
              ]}
            />
            {shipLines.length > 0 ? (
              <PartyBlock label="Ship to" name={shipLines[0]} lines={shipLines.slice(1)} />
            ) : (
              <PartyBlock label="Ship to" name="No shipping address specified" />
            )}
          </View>

          <LineItemsTable
            columns={LINE_COLUMNS}
            rows={lines.map((line) => [
              line.description,
              String(line.quantity),
              money(line.unitPrice),
              String(line.taxRate || 0),
              money(line.lineTotal),
            ])}
          />

          <TotalsBlock
            accent={accent}
            rows={[
              { label: 'Subtotal', amount: money(subtotal) },
              { label: 'Tax', amount: money(tax) },
            ]}
            total={money(total)}
          />

          <NotesSection
            items={[
              { label: 'Payment method', value: paymentMethod },
              { label: 'Payment terms', value: paymentTerms },
              { label: 'Notes', value: notes },
            ]}
          />
        </View>
        <DocumentFooter sellerName={seller.name} />
      </Page>
    </Document>
  );
}
