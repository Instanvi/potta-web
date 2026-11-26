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

export type InvoicePdfLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
};

export type InvoicePdfSeller = PdfSeller;

export type InvoicePdfCustomer = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type InvoicePdfProps = {
  title: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentTerms?: string;
  notes?: string;
  shippingAddress?: string;
  seller: InvoicePdfSeller;
  customer: InvoicePdfCustomer | null;
  lines: InvoicePdfLine[];
  subtotal: number;
  tax: number;
  total: number;
  accent?: string;
  draft?: boolean;
};

const LINE_COLUMNS = [
  { header: 'Item', width: '42%' },
  { header: 'Qty', width: '12%', align: 'right' as const },
  { header: 'Price', width: '18%', align: 'right' as const },
  { header: 'Tax %', width: '10%', align: 'right' as const },
  { header: 'Total', width: '18%', align: 'right' as const },
];

export function InvoicePdfDocument({
  title,
  invoiceNumber,
  issueDate,
  dueDate,
  currency,
  paymentMethod,
  paymentReference,
  paymentTerms,
  notes,
  shippingAddress,
  seller,
  customer,
  lines,
  subtotal,
  tax,
  total,
  accent = PDF_ACCENT,
  draft = true,
}: InvoicePdfProps) {
  const money = (value: number) => formatPdfMoney(value, currency);
  const shipLines = (shippingAddress || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const subtitle = [invoiceNumber || title, draft ? 'Draft' : '']
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Document
      title={title}
      author={seller.name || 'Potta'}
      subject={invoiceNumber ? `Invoice ${invoiceNumber}` : 'Invoice'}
    >
      <Page size="A4" style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title={title || 'Invoice'}
          subtitle={subtitle}
          accent={accent}
          meta={[
            { label: 'Issue', value: issueDate },
            { label: 'Due', value: dueDate },
            { label: 'Currency', value: currency },
          ]}
        />
        <View style={shell.body}>
          <View style={shell.parties}>
            <PartyBlock
              label="From"
              name={seller.name || 'Your organization'}
              email={seller.email}
              phone={seller.phone}
              lines={[
                ...(seller.addressLines ?? []),
                seller.registrationNumber ? `Reg. ${seller.registrationNumber}` : null,
                seller.taxId ? `Tax ID ${seller.taxId}` : null,
              ]}
            />
            <PartyBlock
              label="Bill to"
              name={customer?.name || 'Select a customer'}
              email={customer?.email}
              phone={customer?.phone}
              lines={[customer?.address]}
            />
            {shipLines.length > 0 ? (
              <PartyBlock label="Ship to" name={shipLines[0]} lines={shipLines.slice(1)} />
            ) : null}
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
              { label: 'Payment reference', value: paymentReference },
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
