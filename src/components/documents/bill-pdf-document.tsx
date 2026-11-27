import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PdfSeller } from '@/lib/org-to-seller';
import { readStoredDocumentTemplate, type DocumentTemplateId } from './document-templates';
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

export type BillPdfLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount: number;
  lineTotal: number;
};

export type BillPdfSeller = PdfSeller;

export type BillPdfVendor = {
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type BillPdfProps = {
  title: string;
  billNumber?: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  paymentMethod: string;
  expenseAccountCode?: string;
  notes?: string;
  seller: BillPdfSeller;
  vendor: BillPdfVendor | null;
  lines: BillPdfLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  accent?: string;
  draft?: boolean;
  template?: DocumentTemplateId;
};

const LINE_COLUMNS = [
  { header: 'Description', width: '42%' },
  { header: 'Qty', width: '12%', align: 'right' as const },
  { header: 'Unit price', width: '18%', align: 'right' as const },
  { header: 'Tax %', width: '10%', align: 'right' as const },
  { header: 'Amount', width: '18%', align: 'right' as const },
];

const meta = StyleSheet.create({
  box: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f6f8f7',
  },
  item: {
    width: '48%',
    marginBottom: 4,
    marginRight: 8,
  },
  label: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
});

export function BillPdfDocument({
  title,
  billNumber,
  issueDate,
  dueDate,
  currency,
  paymentMethod,
  expenseAccountCode,
  notes,
  seller,
  vendor,
  lines,
  subtotal,
  discount,
  tax,
  total,
  accent = PDF_ACCENT,
  draft = true,
  template = readStoredDocumentTemplate(),
}: BillPdfProps) {
  const money = (value: number) => formatPdfMoney(value, currency);
  const subtitle = [billNumber || title, draft ? 'Draft' : ''].filter(Boolean).join('  ·  ');
  const totalRows = [
    { label: 'Subtotal', amount: money(subtotal) },
    ...(discount > 0 ? [{ label: 'Discounts', amount: `−${money(discount)}` }] : []),
    { label: 'VAT', amount: money(tax) },
  ];

  return (
    <Document
      title={title}
      author={seller.name || 'Potta'}
      subject={billNumber ? `Bill ${billNumber}` : 'Vendor bill'}
    >
      <Page size="A4" style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title="Bill"
          subtitle={subtitle}
          accent={accent}
          template={template}
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
              name={vendor?.name || 'Select a vendor'}
              email={vendor?.email}
              phone={vendor?.phone}
            />
          </View>

          <View style={meta.box}>
            <View style={meta.item}>
              <Text style={meta.label}>Payment method</Text>
              <Text style={meta.value}>{paymentMethod || '—'}</Text>
            </View>
            {expenseAccountCode ? (
              <View style={meta.item}>
                <Text style={meta.label}>Expense account</Text>
                <Text style={meta.value}>{expenseAccountCode}</Text>
              </View>
            ) : null}
            <View style={meta.item}>
              <Text style={meta.label}>Balance due</Text>
              <Text style={[meta.value, { color: accent }]}>{money(total)}</Text>
            </View>
          </View>

          <LineItemsTable
            template={template}
            accent={accent}
            columns={LINE_COLUMNS}
            rows={lines.map((line) => [
              line.description,
              String(line.quantity),
              money(line.unitPrice),
              Number(line.taxRate || 0).toFixed(2),
              money(line.lineTotal),
            ])}
          />

          <TotalsBlock template={template} accent={accent} rows={totalRows} total={money(total)} />

          <NotesSection items={[{ label: 'Message on bill', value: notes }]} />
        </View>
        <DocumentFooter sellerName={seller.name || 'Bill'} />
      </Page>
    </Document>
  );
}
