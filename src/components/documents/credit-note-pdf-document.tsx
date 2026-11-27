import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PdfSeller } from '@/lib/org-to-seller';
import { readStoredDocumentTemplate, type DocumentTemplateId } from './document-templates';
import {
  DocumentFooter,
  LetterheadHeader,
  PDF_ACCENT,
  PartyBlock,
  formatPdfMoney,
  pdfShellStyles as shell,
  templateTableHeaderColor,
  templateTableHeaderStyle,
} from './pdf-shell';

export type CreditNotePdfSeller = PdfSeller;

export type CreditNotePdfCustomer = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type CreditNotePdfLine = {
  description?: string;
  quantity: number;
  unitPrice: number;
  /** Tax percentage, e.g. 19.25. */
  taxRate?: number;
  total: number;
};

export type CreditNotePdfProps = {
  title: string;
  reference?: string;
  issueDate: string;
  currency: string;
  creditAmount: number;
  reason?: string;
  referenceInvoice?: string;
  invoiceDate?: string;
  notes?: string;
  seller: CreditNotePdfSeller;
  customer: CreditNotePdfCustomer | null;
  lineItems?: CreditNotePdfLine[];
  status?: string;
  accent?: string;
  draft?: boolean;
  template?: DocumentTemplateId;
};

const styles = StyleSheet.create({
  detailsBox: {
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailCell: {
    width: '50%',
    marginBottom: 12,
    paddingRight: 12,
  },
  detailLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
  },
  amountValue: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
  },
  colDesc: { flex: 3 },
  colQty: { width: 40 },
  colPrice: { width: 80 },
  colTax: { width: 44 },
  colTotal: { width: 80 },
  disclaimer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 1.5,
  },
});

export function CreditNotePdfDocument({
  title,
  reference,
  issueDate,
  currency,
  creditAmount,
  reason,
  referenceInvoice,
  invoiceDate,
  notes,
  seller,
  customer,
  lineItems = [],
  status,
  accent = PDF_ACCENT,
  draft = true,
  template = readStoredDocumentTemplate(),
}: CreditNotePdfProps) {
  const lines = lineItems.filter(
    (l) => Number(l.quantity) > 0 || Number(l.unitPrice) > 0 || Number(l.total) > 0,
  );
  const showTax = lines.some((l) => Number(l.taxRate) > 0);
  const subtitle = [reference ? `#${reference}` : title, draft ? 'Draft' : status]
    .filter(Boolean)
    .join('  ·  ');
  const headInk = templateTableHeaderColor(template);
  const th = headInk ? [shell.th, { color: headInk }] : shell.th;

  return (
    <Document
      title={title}
      author={seller.name || 'Potta'}
      subject={reference ? `Credit note ${reference}` : 'Credit note'}
    >
      <Page size="A4" style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title="Credit Note"
          subtitle={subtitle}
          meta={[
            { label: 'Issue date', value: issueDate },
            { label: 'Currency', value: currency },
          ]}
          accent={accent}
          template={template}
        />

        <View style={shell.body}>
          <View style={shell.parties}>
            <PartyBlock
              label="Customer"
              name={customer?.name || 'Select a customer'}
              email={customer?.email}
              phone={customer?.phone}
              lines={[customer?.address]}
            />
          </View>

          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Credit Note Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Reference Invoice</Text>
                <Text style={styles.detailValue}>
                  {referenceInvoice || 'No invoice selected'}
                </Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Invoice Date</Text>
                <Text style={styles.detailValue}>{invoiceDate || 'N/A'}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Credit Amount</Text>
                <Text style={styles.amountValue}>
                  {formatPdfMoney(creditAmount, currency)}
                </Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Reason for Credit</Text>
                <Text style={styles.detailValue}>{reason || 'Not specified'}</Text>
              </View>
            </View>
          </View>

          {lines.length > 0 ? (
            <View style={{ marginBottom: 8 }}>
              <Text style={shell.sectionTitle}>Lines</Text>
              <View style={shell.table}>
                <View style={templateTableHeaderStyle(template, accent)}>
                  <Text style={[th, styles.colDesc]}>Description</Text>
                  <Text style={[th, shell.right, styles.colQty]}>Qty</Text>
                  <Text style={[th, shell.right, styles.colPrice]}>Price</Text>
                  {showTax ? <Text style={[th, shell.right, styles.colTax]}>Tax</Text> : null}
                  <Text style={[th, shell.right, styles.colTotal, { borderRightWidth: 0 }]}>
                    Total
                  </Text>
                </View>
                {lines.map((line, i) => (
                  <View
                    key={`${line.description ?? 'line'}-${i}`}
                    style={[
                      shell.tableRow,
                      i === lines.length - 1 ? { borderBottomWidth: 0 } : null,
                    ]}
                    wrap={false}
                  >
                    <Text style={[shell.td, styles.colDesc]}>{line.description || '—'}</Text>
                    <Text style={[shell.td, shell.right, styles.colQty]}>
                      {Number(line.quantity) || 0}
                    </Text>
                    <Text style={[shell.td, shell.right, styles.colPrice]}>
                      {formatPdfMoney(Number(line.unitPrice) || 0, currency)}
                    </Text>
                    {showTax ? (
                      <Text style={[shell.td, shell.right, styles.colTax]}>
                        {Number(line.taxRate) ? `${Number(line.taxRate)}%` : '—'}
                      </Text>
                    ) : null}
                    <Text style={[shell.td, shell.right, styles.colTotal, { borderRightWidth: 0 }]}>
                      {formatPdfMoney(Number(line.total) || 0, currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {notes ? (
            <View style={shell.notes}>
              <Text style={shell.notesLabel}>Notes</Text>
              <Text style={shell.notesBody}>{notes}</Text>
            </View>
          ) : null}

          <Text style={styles.disclaimer}>
            This credit note is issued with reference to the original invoice. For any
            questions, please contact our finance department.
          </Text>
        </View>

        <DocumentFooter sellerName={seller.name} />
      </Page>
    </Document>
  );
}
