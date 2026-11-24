import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { resolvePdfLogoUrl } from '@/lib/brand';

try {
  Font.registerHyphenationCallback((word) => [word]);
} catch {
  /* ignore */
}

export type CreditNotePdfSeller = {
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLines?: string[];
  logoUrl?: string | null;
  registrationNumber?: string | null;
  taxId?: string | null;
};

export type CreditNotePdfCustomer = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
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
  accent?: string;
  draft?: boolean;
};

const money = (value: number, currency: string) => {
  const code = (currency || 'USD').toUpperCase();
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
    backgroundColor: '#1e40af',
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
    color: '#bfdbfe',
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
    gap: 24,
    marginBottom: 28,
  },
  partyCol: {
    flex: 1,
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
  detailsBox: {
    backgroundColor: '#f9fafb',
    padding: 20,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailCell: {
    width: '50%',
    marginBottom: 14,
    paddingRight: 12,
  },
  detailLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  amountValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
  },
  notes: {
    marginTop: 16,
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
  disclaimer: {
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
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
  accent = '#1e40af',
  draft = true,
}: CreditNotePdfProps) {
  const headerBg = { backgroundColor: accent };

  return (
    <Document
      title={title}
      author={seller.name || 'Potta'}
      subject={reference ? `Credit note ${reference}` : 'Credit note'}
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, headerBg]}>
          <View>
            <Text style={styles.headerTitle}>CREDIT NOTE</Text>
            <Text style={styles.headerSub}>
              {reference ? `#${reference}` : title}
              {draft ? '  ·  Draft' : ''}
            </Text>
          </View>
          <View>
            <Text style={styles.headerMeta}>Issue date: {issueDate || '—'}</Text>
            <Text style={styles.headerMeta}>Currency: {currency}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.parties}>
            <View style={styles.partyCol}>
              <Text style={styles.partyLabel}>From</Text>
              {(() => {
                const logoSrc = resolvePdfLogoUrl(seller.logoUrl);
                return logoSrc ? (
                  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image
                  <Image src={logoSrc} style={styles.logo} />
                ) : null;
              })()}
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
              <Text style={styles.partyLabel}>Customer</Text>
              <Text style={styles.partyName}>{customer?.name || 'Select a customer'}</Text>
              {customer?.email ? <Text style={styles.partyLine}>{customer.email}</Text> : null}
              {customer?.phone ? <Text style={styles.partyLine}>{customer.phone}</Text> : null}
              {customer?.address ? <Text style={styles.partyLine}>{customer.address}</Text> : null}
            </View>
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
                <Text style={styles.amountValue}>{money(creditAmount, currency)}</Text>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Reason for Credit</Text>
                <Text style={styles.detailValue}>{reason || 'Not specified'}</Text>
              </View>
            </View>
          </View>

          {notes ? (
            <View style={styles.notes}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesBody}>{notes}</Text>
            </View>
          ) : null}

          <Text style={styles.disclaimer}>
            This credit note is issued with reference to the original invoice. For any
            questions, please contact our finance department.
          </Text>
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
