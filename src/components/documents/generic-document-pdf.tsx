import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PdfSeller } from '@/lib/org-to-seller';
import { readStoredDocumentTemplate, type DocumentTemplateId } from './document-templates';
import {
  DocumentFooter,
  LetterheadHeader,
  PDF_ACCENT,
  formatPdfMoney,
  pdfShellStyles as shell,
  templateTableHeaderColor,
  templateTableHeaderStyle,
} from './pdf-shell';

export type GenericDocumentPdfLine = {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount?: number;
};

export type GenericDocumentPdfProps = {
  title: string;
  subtitle?: string;
  seller: PdfSeller;
  fields: { label: string; value: string }[];
  lines?: GenericDocumentPdfLine[];
  currency?: string;
  accent?: string;
  template?: DocumentTemplateId;
};

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  fieldLabel: { fontSize: 9, color: '#6b7280', width: '40%' },
  fieldValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    width: '60%',
    textAlign: 'right',
  },
  colDesc: { flex: 3 },
  colQty: { width: 44 },
  colPrice: { width: 80 },
  colTotal: { width: 80 },
});

const num = (v: unknown) => (v == null || v === '' ? null : Number(v));

/** Letterhead + key/value fields + optional line table for books resources. */
export function GenericDocumentPdf({
  title,
  subtitle,
  seller,
  fields,
  lines = [],
  currency,
  accent = PDF_ACCENT,
  template = readStoredDocumentTemplate(),
}: GenericDocumentPdfProps) {
  const fmt = (v: number | null) =>
    v == null || !Number.isFinite(v) ? '' : currency ? formatPdfMoney(v, currency) : v.toLocaleString();
  const headInk = templateTableHeaderColor(template);
  const th = headInk ? [shell.th, { color: headInk }] : shell.th;

  return (
    <Document title={title} author={seller.name || 'Potta'} subject={subtitle || title}>
      <Page size="A4" style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title={subtitle || 'Document'}
          subtitle={title}
          meta={[{ label: 'Date', value: new Date().toLocaleDateString() }]}
          accent={accent}
          template={template}
        />
        <View style={shell.body}>
          {fields.map((f) => (
            <View key={f.label} style={styles.fieldRow} wrap={false}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <Text style={styles.fieldValue}>{f.value || '—'}</Text>
            </View>
          ))}

          {lines.length > 0 ? (
            <View style={{ marginTop: 20 }}>
              <Text style={shell.sectionTitle}>Lines</Text>
              <View style={templateTableHeaderStyle(template, accent)}>
                <Text style={[th, styles.colDesc]}>Item</Text>
                <Text style={[th, shell.right, styles.colQty]}>Qty</Text>
                <Text style={[th, shell.right, styles.colPrice]}>Price</Text>
                <Text style={[th, shell.right, styles.colTotal]}>Total</Text>
              </View>
              {lines.map((line, i) => (
                <View key={`${line.description ?? 'line'}-${i}`} style={shell.tableRow} wrap={false}>
                  <Text style={[shell.td, styles.colDesc]}>{line.description || '—'}</Text>
                  <Text style={[shell.td, shell.right, styles.colQty]}>
                    {line.quantity ?? ''}
                  </Text>
                  <Text style={[shell.td, shell.right, styles.colPrice]}>
                    {fmt(num(line.unitPrice))}
                  </Text>
                  <Text style={[shell.td, shell.right, styles.colTotal]}>
                    {fmt(num(line.totalAmount))}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <DocumentFooter sellerName={seller.name} />
      </Page>
    </Document>
  );
}
