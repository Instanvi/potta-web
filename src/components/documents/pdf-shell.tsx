import { Font, Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import { resolvePdfLogoUrl } from '@/lib/brand';
import type { PdfSeller } from '@/lib/org-to-seller';
import {
  documentTemplate,
  type DocumentTemplateId,
} from '@/components/documents/document-templates';

try {
  Font.registerHyphenationCallback((word) => [word]);
} catch {
  /* ignore */
}

export const PDF_ACCENT = '#0b5d1e';

export type PdfMetaItem = { label: string; value: string };

/** Currency formatter safe for XAF/XOF (no decimals) and unknown codes. */
export function formatPdfMoney(value: number, currency?: string | null): string {
  const code = (currency || 'XAF').toUpperCase();
  const zero = code === 'XAF' || code === 'XOF';
  const n = Number.isFinite(Number(value)) ? Number(value) : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: zero ? 0 : 2,
      maximumFractionDigits: zero ? 0 : 2,
    }).format(n);
  } catch {
    return `${code} ${n.toFixed(zero ? 0 : 2)}`;
  }
}

export const pdfShellStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111111',
    paddingBottom: 56,
  },
  header: {
    paddingHorizontal: 36,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerSeller: {
    maxWidth: '55%',
    alignItems: 'center',
  },
  headerLogo: {
    width: 44,
    height: 44,
    objectFit: 'contain',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerSellerName: {
    color: '#111111',
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  headerSellerLine: {
    color: '#4b5563',
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  headerRight: {
    alignItems: 'flex-end',
    maxWidth: '45%',
  },
  headerTitle: {
    color: '#111111',
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  headerSub: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  headerMeta: {
    color: '#4b5563',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'right',
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 24,
  },
  parties: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  partyCol: {
    flex: 1,
    paddingRight: 16,
  },
  partyLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  partyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  partyLine: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 2,
    lineHeight: 1.4,
  },
  partyLogo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  table: {
    borderWidth: 0.5,
    borderColor: '#d1d5db',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
  },
  th: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    textTransform: 'uppercase',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#d1d5db',
  },
  td: {
    fontSize: 9,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#d1d5db',
  },
  right: { textAlign: 'right' },
  notes: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  notesLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  notesBody: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.5,
  },
  emptyLine: {
    paddingVertical: 16,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
  },
  totalsWrap: {
    marginLeft: 'auto',
    width: 220,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: { fontSize: 10, color: '#4b5563' },
  totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  grandLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  grandValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
});

function SellerIdentity({ seller }: { seller: PdfSeller }) {
  const s = pdfShellStyles;
  const logoSrc = resolvePdfLogoUrl(seller.logoUrl);
  return (
    <View style={s.headerSeller}>
      {logoSrc ? (
        // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image
        <Image src={logoSrc} style={s.headerLogo} />
      ) : null}
      <View>
        <Text style={s.headerSellerName}>{seller.name || 'Your organization'}</Text>
        {(seller.addressLines ?? []).map((line, i) => (
          <Text key={`${line}-${i}`} style={s.headerSellerLine}>
            {line}
          </Text>
        ))}
        {seller.email ? <Text style={s.headerSellerLine}>{seller.email}</Text> : null}
        {seller.phone ? <Text style={s.headerSellerLine}>{seller.phone}</Text> : null}
        {seller.registrationNumber ? (
          <Text style={s.headerSellerLine}>Reg. {seller.registrationNumber}</Text>
        ) : null}
        {seller.taxId ? <Text style={s.headerSellerLine}>Tax ID {seller.taxId}</Text> : null}
      </View>
    </View>
  );
}

/** Letterhead. Classic is the accent band; the other templates rearrange the same fields. */
export function LetterheadHeader({
  seller,
  title,
  subtitle,
  meta = [],
  accent = PDF_ACCENT,
  template = 'classic',
}: {
  seller: PdfSeller;
  title: string;
  subtitle?: string;
  meta?: PdfMetaItem[];
  accent?: string;
  template?: DocumentTemplateId;
}) {
  const s = pdfShellStyles;
  const spec = documentTemplate(template);
  const logoSrc = resolvePdfLogoUrl(seller.logoUrl);

  if (spec.header === 'band') {
    return (
      <View style={[s.header, { borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }]}>
        <SellerIdentity seller={seller} />
        <View style={s.headerRight}>
          <Text style={[s.headerTitle, { color: accent }]}>{title.toUpperCase()}</Text>
          {subtitle ? <Text style={s.headerSub}>{subtitle}</Text> : null}
          {meta.map((m) => (
            <Text key={m.label} style={s.headerMeta}>
              {m.label}: {m.value || '—'}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  if (spec.header === 'compact') {
    return (
      <View>
        <View style={{ paddingHorizontal: 36, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ alignItems: 'center', maxWidth: '55%' }}>
            {logoSrc ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image
              <Image src={logoSrc} style={{ width: 36, height: 36, objectFit: 'contain', marginBottom: 12 }} />
            ) : null}
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>{seller.name || 'Your organization'}</Text>
          </View>
          <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: accent }}>{title.toUpperCase()}</Text>
        </View>
        <View style={{ marginHorizontal: 36, marginTop: 10, borderWidth: 0.5, borderColor: '#d1d5db', paddingVertical: 6, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
          {subtitle ? <Text style={{ fontSize: 8, color: '#374151' }}>{subtitle}</Text> : <Text />}
          {meta.map((m) => (
            <Text key={m.label} style={{ fontSize: 8, color: '#374151' }}>
              {m.label}: {m.value || '—'}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  const open = spec.header === 'open';
  return (
    <View>
      {spec.header === 'rail' ? (
        <View
          fixed
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: accent }}
        />
      ) : null}
      <View
        style={{
          paddingHorizontal: 36,
          paddingTop: 28,
          paddingBottom: 14,
          borderBottomWidth: open ? 2 : 0,
          borderBottomColor: accent,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ maxWidth: '55%' }}>
          <Text
            style={{
              fontSize: open ? 26 : 22,
              fontFamily: 'Helvetica-Bold',
              color: open ? '#111111' : accent,
            }}
          >
            {open ? title : title.toUpperCase()}
          </Text>
          {subtitle ? (
            <Text style={{ marginTop: 4, fontSize: 10, color: '#6b7280' }}>{subtitle}</Text>
          ) : null}
          {meta.map((m) => (
            <Text key={m.label} style={{ marginTop: 2, fontSize: 9, color: '#4b5563' }}>
              {m.label}: {m.value || '—'}
            </Text>
          ))}
        </View>
        <SellerIdentity seller={seller} />
      </View>
    </View>
  );
}

/** Labelled party (customer / vendor / seller) block. */
export function PartyBlock({
  label,
  name,
  email,
  phone,
  lines = [],
}: {
  label: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  lines?: Array<string | null | undefined>;
}) {
  const s = pdfShellStyles;
  return (
    <View style={s.partyCol}>
      <Text style={s.partyLabel}>{label}</Text>
      <Text style={s.partyName}>{name}</Text>
      {email ? <Text style={s.partyLine}>{email}</Text> : null}
      {phone ? <Text style={s.partyLine}>{phone}</Text> : null}
      {lines.filter(Boolean).map((line, i) => (
        <Text key={`${line}-${i}`} style={s.partyLine}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function templateTableHeaderStyle(
  template?: DocumentTemplateId,
  accent: string = PDF_ACCENT,
) {
  const spec = documentTemplate(template);
  if (spec.table === 'open') {
    return [pdfShellStyles.tableHeader, { borderBottomColor: accent }];
  }
  return pdfShellStyles.tableHeader;
}

/** Header text stays dark — table headers no longer use filled backgrounds. */
export function templateTableHeaderColor(_template?: DocumentTemplateId): string | undefined {
  return undefined;
}

/** Line table shared by invoices, bills, receipts, and purchase orders. */
export function LineItemsTable({
  columns,
  rows,
  emptyLabel = 'No line items yet',
  template = 'classic',
  accent = PDF_ACCENT,
}: {
  columns: { header: string; width: string; align?: 'right' }[];
  rows: string[][];
  emptyLabel?: string;
  template?: DocumentTemplateId;
  accent?: string;
}) {
  const s = pdfShellStyles;
  const spec = documentTemplate(template);
  const align = (column?: { align?: 'right' }) =>
    column?.align === 'right' ? s.right : undefined;
  const headerStyle =
    spec.table === 'open'
      ? [s.tableHeader, { borderBottomColor: accent }]
      : s.tableHeader;
  return (
    <View style={[{ marginBottom: spec.totals === 'under' ? 4 : 20 }, s.table]}>
      <View style={headerStyle}>
        {columns.map((column, columnIndex) => (
          <Text
            key={column.header}
            style={[
              s.th,
              align(column),
              { width: column.width },
              columnIndex === columns.length - 1 ? { borderRightWidth: 0 } : null,
            ]}
          >
            {column.header}
          </Text>
        ))}
      </View>
      {rows.length === 0 ? (
        <Text style={s.emptyLine}>{emptyLabel}</Text>
      ) : (
        rows.map((cells, index) => (
          <View
            key={`line-${index}`}
            style={[
              s.tableRow,
              index === rows.length - 1 ? { borderBottomWidth: 0 } : null,
            ]}
            wrap={false}
          >
            {cells.map((cell, cellIndex) => (
              <Text
                key={`${columns[cellIndex]?.header ?? 'cell'}-${cellIndex}`}
                style={[
                  s.td,
                  align(columns[cellIndex]),
                  { width: columns[cellIndex]?.width },
                  cellIndex === cells.length - 1 ? { borderRightWidth: 0 } : null,
                ]}
              >
                {cell}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

/** Right-aligned subtotal rows plus an accent total. */
export function TotalsBlock({
  rows,
  total,
  accent = PDF_ACCENT,
  template = 'classic',
}: {
  rows: { label: string; amount: string }[];
  total: string;
  accent?: string;
  template?: DocumentTemplateId;
}) {
  const s = pdfShellStyles;
  const spec = documentTemplate(template);
  const grandColor = spec.totals === 'light' ? '#111111' : accent;
  const wrap =
    spec.totals === 'card'
      ? [s.totalsWrap, { backgroundColor: '#f6f8f7', padding: 10, borderLeftWidth: 3, borderLeftColor: accent, width: 240 }]
      : spec.totals === 'under'
        ? [s.totalsWrap, { marginTop: 0 }]
        : s.totalsWrap;
  return (
    <View style={wrap}>
      {rows.map((row) => (
        <View key={row.label} style={s.totalRow}>
          <Text style={s.totalLabel}>{row.label}</Text>
          <Text style={s.totalValue}>{row.amount}</Text>
        </View>
      ))}
      <View style={[s.grandRow, { borderTopColor: spec.totals === 'light' ? '#e5e7eb' : accent }]}>
        <Text style={[s.grandLabel, { color: grandColor }]}>Total</Text>
        <Text style={[s.grandValue, { color: grandColor }]}>{total}</Text>
      </View>
    </View>
  );
}

/** Labelled note blocks. Empty values are omitted. */
export function NotesSection({
  items,
}: {
  items: Array<{ label: string; value?: string | null }>;
}) {
  const visible = items.filter((item) => item.value?.trim());
  if (visible.length === 0) return null;
  const s = pdfShellStyles;
  return (
    <View style={s.notes}>
      {visible.map((item, index) => (
        <View key={item.label} style={index > 0 ? { marginTop: 10 } : undefined}>
          <Text style={s.notesLabel}>{item.label}</Text>
          <Text style={s.notesBody}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Fixed footer: organisation name + page numbers on every page. */
export function DocumentFooter({ sellerName }: { sellerName?: string }) {
  const s = pdfShellStyles;
  return (
    <View style={s.footer} fixed>
      <Text>{sellerName || 'Potta'}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}
