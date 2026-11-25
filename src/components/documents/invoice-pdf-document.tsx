import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { resolvePdfLogoUrl } from '@/lib/brand';

try {
  Font.registerHyphenationCallback((word) => [word]);
} catch {
  /* ignore */
}

export type InvoicePdfLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
};

export type InvoicePdfSeller = {
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLines?: string[];
  logoUrl?: string | null;
  registrationNumber?: string | null;
  taxId?: string | null;
};

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

const money = (value: number, currency: string) => {
  const code = (currency || 'XAF').toUpperCase();
  const zero = code === 'XAF' || code === 'XOF';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: zero ? 0 : 2,
      maximumFractionDigits: zero ? 0 : 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(zero ? 0 : 2)}`;
  }
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111111',
    paddingBottom: 48,
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 36,
    paddingVertical: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: '#d1fae5',
    fontSize: 10,
    marginTop: 6,
  },
  headerMeta: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'right',
    lineHeight: 1.5,
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 28,
  },
  parties: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  partyCol: {
    width: '50%',
    paddingRight: 12,
  },
  partyLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  partyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  partyLine: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 2,
    lineHeight: 1.4,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: 'contain',
    marginBottom: 8,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeadCell: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  colDesc: { width: '42%' },
  colQty: { width: '12%', textAlign: 'right' },
  colPrice: { width: '18%', textAlign: 'right' },
  colTax: { width: '10%', textAlign: 'right' },
  colAmt: { width: '18%', textAlign: 'right' },
  cell: { fontSize: 9, color: '#111111' },
  empty: {
    padding: 16,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    borderTopColor: '#059669',
    paddingTop: 10,
    marginTop: 4,
  },
  grandLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#059669' },
  grandValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#059669' },
  notes: {
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  notesLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  notesBody: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.5,
  },
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
  accent = '#059669',
  draft = true,
}: InvoicePdfProps) {
  const headerBg = { backgroundColor: accent };
  const headRow = { backgroundColor: accent };
  const grandColor = { color: accent };
  const borderAccent = { borderTopColor: accent };

  return (
    <Document
      title={title}
      author={seller.name || 'Potta'}
      subject={invoiceNumber ? `Invoice ${invoiceNumber}` : 'Invoice'}
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, headerBg]}>
          <View>
            <Text style={styles.headerTitle}>INVOICE</Text>
            <Text style={styles.headerSub}>
              {invoiceNumber || title}
              {draft ? '  ·  Draft' : ''}
            </Text>
          </View>
          <View>
            {issueDate ? (
              <Text style={styles.headerMeta}>Issue date: {issueDate}</Text>
            ) : null}
            {dueDate ? (
              <Text style={styles.headerMeta}>Due date: {dueDate}</Text>
            ) : null}
            {currency ? (
              <Text style={styles.headerMeta}>Currency: {currency}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.parties}>
            <View style={styles.partyCol}>
              <Text style={styles.partyLabel}>From</Text>
              {seller.logoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image
                <Image src={resolvePdfLogoUrl(seller.logoUrl)} style={styles.logo} />
              ) : null}
              <Text style={styles.partyName}>{seller.name || 'Your organization'}</Text>
              {seller.email ? <Text style={styles.partyLine}>{seller.email}</Text> : null}
              {seller.phone ? <Text style={styles.partyLine}>{seller.phone}</Text> : null}
              {(seller.addressLines ?? []).map((line) => (
                <Text key={line} style={styles.partyLine}>
                  {line}
                </Text>
              ))}
              {seller.registrationNumber ? (
                <Text style={styles.partyLine}>Reg. {seller.registrationNumber}</Text>
              ) : null}
              {seller.taxId ? <Text style={styles.partyLine}>Tax ID {seller.taxId}</Text> : null}
            </View>

            <View style={styles.partyCol}>
              <Text style={styles.partyLabel}>Bill to</Text>
              <Text style={styles.partyName}>{customer?.name || 'Select a customer'}</Text>
              {customer?.email ? <Text style={styles.partyLine}>{customer.email}</Text> : null}
              {customer?.phone ? <Text style={styles.partyLine}>{customer.phone}</Text> : null}
              {customer?.address ? <Text style={styles.partyLine}>{customer.address}</Text> : null}
              {shippingAddress ? (
                <>
                  <Text style={[styles.partyLabel, { marginTop: 12 }]}>Ship to</Text>
                  <Text style={styles.partyLine}>{shippingAddress}</Text>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableHead, headRow]}>
              <Text style={[styles.tableHeadCell, styles.colDesc]}>Item</Text>
              <Text style={[styles.tableHeadCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeadCell, styles.colPrice]}>Price</Text>
              <Text style={[styles.tableHeadCell, styles.colTax]}>Tax %</Text>
              <Text style={[styles.tableHeadCell, styles.colAmt]}>Total</Text>
            </View>
            {lines.length === 0 ? (
              <Text style={styles.empty}>No line items yet</Text>
            ) : (
              lines.map((line, index) => (
                <View key={`${line.description}-${index}`} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.cell, styles.colDesc]}>{line.description}</Text>
                  <Text style={[styles.cell, styles.colQty]}>{line.quantity}</Text>
                  <Text style={[styles.cell, styles.colPrice]}>
                    {money(line.unitPrice, currency)}
                  </Text>
                  <Text style={[styles.cell, styles.colTax]}>{line.taxRate || 0}</Text>
                  <Text style={[styles.cell, styles.colAmt]}>
                    {money(line.lineTotal, currency)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{money(subtotal, currency)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{money(tax, currency)}</Text>
            </View>
            <View style={[styles.grandRow, borderAccent]}>
              <Text style={[styles.grandLabel, grandColor]}>Total</Text>
              <Text style={[styles.grandValue, grandColor]}>{money(total, currency)}</Text>
            </View>
          </View>

          {(paymentMethod || paymentReference || paymentTerms || notes) && (
            <View style={styles.notes}>
              {paymentMethod ? (
                <>
                  <Text style={styles.notesLabel}>Payment method</Text>
                  <Text style={styles.notesBody}>{paymentMethod}</Text>
                </>
              ) : null}
              {paymentReference ? (
                <>
                  <Text style={[styles.notesLabel, { marginTop: 10 }]}>Payment reference</Text>
                  <Text style={styles.notesBody}>{paymentReference}</Text>
                </>
              ) : null}
              {paymentTerms ? (
                <>
                  <Text style={[styles.notesLabel, { marginTop: 10 }]}>Payment terms</Text>
                  <Text style={styles.notesBody}>{paymentTerms}</Text>
                </>
              ) : null}
              {notes ? (
                <>
                  <Text style={[styles.notesLabel, { marginTop: 10 }]}>Notes</Text>
                  <Text style={styles.notesBody}>{notes}</Text>
                </>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>{seller.name || 'Potta'}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
