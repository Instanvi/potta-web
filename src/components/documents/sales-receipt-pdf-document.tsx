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

export type SalesReceiptPdfLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
};

export type SalesReceiptPdfSeller = PdfSeller;

export type SalesReceiptPdfCustomer = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type SalesReceiptPdfProps = {
  title: string;
  receiptNumber?: string;
  saleDate: string;
  currency: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  seller: SalesReceiptPdfSeller;
  customer: SalesReceiptPdfCustomer | null;
  lines: SalesReceiptPdfLine[];
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

export function SalesReceiptPdfDocument({
  title,
  receiptNumber,
  saleDate,
  currency,
  paymentMethod,
  paymentReference,
  notes,
  seller,
  customer,
  lines,
  subtotal,
  tax,
  total,
  accent = PDF_ACCENT,
  draft = true,
}: SalesReceiptPdfProps) {
  const money = (value: number) => formatPdfMoney(value, currency);
  const subtitle = [receiptNumber ? `#${receiptNumber}` : title, draft ? 'Draft' : '']
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Document
      title={title}
      author={seller.name || 'Potta'}
      subject={receiptNumber ? `Sales receipt ${receiptNumber}` : 'Sales receipt'}
    >
      <Page size="A4" style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title="Sales Receipt"
          subtitle={subtitle}
          accent={accent}
          meta={[
            { label: 'Sale date', value: saleDate },
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
              label="Customer"
              name={customer?.name || 'Select a customer'}
              email={customer?.email}
              phone={customer?.phone}
              lines={[customer?.address]}
            />
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
              { label: 'Notes', value: notes },
            ]}
          />
        </View>
        <DocumentFooter sellerName={seller.name} />
      </Page>
    </Document>
  );
}
