import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PdfSeller } from '@/lib/org-to-seller';
import { readStoredDocumentTemplate, type DocumentTemplateId } from './document-templates';
import {
  DocumentFooter,
  LetterheadHeader,
  PDF_ACCENT,
  pdfShellStyles as shell,
} from './pdf-shell';

export type ReportPdfColumn = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'money';
};

export type ReportPdfProps = {
  seller: PdfSeller;
  title: string;
  description?: string;
  /** e.g. "Period 2026-01-01 – 2026-11-25" or "As of 2026-11-25". */
  period?: string;
  columns: ReportPdfColumn[];
  rows: Record<string, unknown>[];
  totals?: Record<string, number>;
  currency?: string;
  accent?: string;
  template?: DocumentTemplateId;
};

export type StatementPdfSection = {
  title: string;
  lines: { label: string; amount: number }[];
  total?: number;
  totalLabel?: string;
};

export type StatementPdfProps = {
  seller: PdfSeller;
  title: string;
  period?: string;
  currency?: string;
  sections: StatementPdfSection[];
  /** Highlighted closing rows, e.g. Net profit, Total liabilities + equity. */
  summary?: { label: string; amount: number }[];
  accent?: string;
  template?: DocumentTemplateId;
};

const formatNumber = (value: unknown, money: boolean) => {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('en-US', {
    minimumFractionDigits: money ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

const formatCell = (value: unknown, type: ReportPdfColumn['type']) => {
  if (value == null || value === '') return '—';
  if (type === 'money') return formatNumber(value, true);
  if (type === 'number') return formatNumber(value, false);
  return String(value);
};

const styles = StyleSheet.create({
  titleBlock: { marginBottom: 14 },
  reportTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  reportDesc: { fontSize: 9, color: '#4b5563', marginTop: 3 },
  reportPeriod: { fontSize: 9, color: '#6b7280', marginTop: 3 },
  totals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9fafb',
  },
  totalItem: { marginRight: 20, marginBottom: 2, flexDirection: 'row' },
  totalLabel: { fontSize: 9, color: '#6b7280' },
  totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  cell: { paddingRight: 6 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  sectionHeadText: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  lineLabel: { fontSize: 9.5, flex: 1, paddingRight: 8 },
  lineAmount: { fontSize: 9.5, textAlign: 'right', width: 110 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#9ca3af',
    marginBottom: 14,
  },
  totalRowText: { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 4,
    backgroundColor: '#ecfdf5',
  },
});

function TitleBlock({
  title,
  description,
  period,
}: {
  title: string;
  description?: string;
  period?: string;
}) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.reportTitle}>{title}</Text>
      {description ? <Text style={styles.reportDesc}>{description}</Text> : null}
      {period ? <Text style={styles.reportPeriod}>{period}</Text> : null}
    </View>
  );
}

/** Tabular report: letterhead, title/period, totals strip, repeating table header. */
export function ReportPdfDocument({
  seller,
  title,
  description,
  period,
  columns,
  rows,
  totals,
  accent = PDF_ACCENT,
  template = readStoredDocumentTemplate(),
}: ReportPdfProps) {
  const landscape = columns.length > 6;
  const totalEntries = Object.entries(totals ?? {});

  return (
    <Document title={title} author={seller.name || 'Potta'} subject={title}>
      <Page size="A4" orientation={landscape ? 'landscape' : 'portrait'} style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title="Report"
          subtitle={title}
          meta={[{ label: 'Generated', value: new Date().toLocaleDateString() }]}
          accent={accent}
          template={template}
        />
        <View style={shell.body}>
          <TitleBlock title={title} description={description} period={period} />

          {totalEntries.length > 0 ? (
            <View style={styles.totals}>
              {totalEntries.map(([k, v]) => (
                <View key={k} style={styles.totalItem}>
                  <Text style={styles.totalLabel}>{k}: </Text>
                  <Text style={styles.totalValue}>{formatNumber(v, true)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={shell.tableHeader} fixed>
            {columns.map((col) => (
              <Text
                key={col.key}
                style={[
                  shell.th,
                  styles.cell,
                  { flex: 1 },
                  col.type === 'money' || col.type === 'number' ? shell.right : {},
                ]}
              >
                {col.label}
              </Text>
            ))}
          </View>
          {rows.map((row, i) => (
            <View key={i} style={shell.tableRow} wrap={false}>
              {columns.map((col) => (
                <Text
                  key={col.key}
                  style={[
                    shell.td,
                    styles.cell,
                    { flex: 1 },
                    col.type === 'money' || col.type === 'number' ? shell.right : {},
                  ]}
                >
                  {formatCell(row[col.key], col.type)}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <DocumentFooter sellerName={seller.name} />
      </Page>
    </Document>
  );
}

/** Sectioned financial statement (Income statement / Balance sheet). */
export function StatementPdfDocument({
  seller,
  title,
  period,
  currency,
  sections,
  summary = [],
  accent = PDF_ACCENT,
  template = readStoredDocumentTemplate(),
}: StatementPdfProps) {
  const fmt = (n: number) =>
    `${formatNumber(n, true)}${currency ? ` ${currency}` : ''}`;

  return (
    <Document title={title} author={seller.name || 'Potta'} subject={title}>
      <Page size="A4" style={shell.page}>
        <LetterheadHeader
          seller={seller}
          title="Statement"
          subtitle={title}
          meta={[{ label: 'Generated', value: new Date().toLocaleDateString() }]}
          accent={accent}
          template={template}
        />
        <View style={shell.body}>
          <TitleBlock title={title} period={period} />
          {sections.map((section) => (
            <View key={section.title}>
              <View style={styles.sectionHead} wrap={false}>
                <Text style={styles.sectionHeadText}>{section.title}</Text>
              </View>
              {section.lines.length === 0 ? (
                <View style={shell.tableRow}>
                  <Text style={[styles.lineLabel, { color: '#9ca3af' }]}>No accounts</Text>
                </View>
              ) : (
                section.lines.map((line, i) => (
                  <View key={`${line.label}-${i}`} style={shell.tableRow} wrap={false}>
                    <Text style={styles.lineLabel}>{line.label}</Text>
                    <Text style={styles.lineAmount}>{fmt(line.amount)}</Text>
                  </View>
                ))
              )}
              {section.total != null ? (
                <View style={styles.totalRow} wrap={false}>
                  <Text style={styles.totalRowText}>
                    {section.totalLabel || `Total ${section.title.toLowerCase()}`}
                  </Text>
                  <Text style={styles.totalRowText}>{fmt(section.total)}</Text>
                </View>
              ) : (
                <View style={{ marginBottom: 14 }} />
              )}
            </View>
          ))}
          {summary.map((s) => (
            <View key={s.label} style={styles.summaryRow} wrap={false}>
              <Text style={styles.totalRowText}>{s.label}</Text>
              <Text style={styles.totalRowText}>{fmt(s.amount)}</Text>
            </View>
          ))}
        </View>
        <DocumentFooter sellerName={seller.name} />
      </Page>
    </Document>
  );
}
