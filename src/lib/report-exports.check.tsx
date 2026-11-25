/**
 * Generates every report download and checks the file is a real PDF, Word, Excel, or CSV.
 * Run: npx tsx src/lib/report-exports.check.tsx
 */
import { strFromU8, unzipSync } from 'fflate';
import { StatementPdfDocument } from '@/components/documents/report-pdf-document';
import { orgToSeller } from '@/lib/org-to-seller';
import { buildReportDownload, REPORT_DOWNLOAD_FORMATS } from '@/lib/report-download';
import type { ReportColumn } from '@/app/(routes)/reports/utils/api';

const columns: ReportColumn[] = [
  { key: 'account', label: 'Account', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'money' },
];

const rows = [
  { account: 'Sales, retail', amount: 1250.5 },
  { account: 'Rent', amount: 400 },
];

const totals = { amount: 1650.5 };
const seller = orgToSeller(null);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function unzip(blob: Blob) {
  const packed = new Uint8Array(await blob.arrayBuffer());
  assert(packed[0] === 0x50 && packed[1] === 0x4b, 'file is not a zip archive');
  return unzipSync(packed);
}

async function main() {
  assert(
    REPORT_DOWNLOAD_FORMATS.map((item) => item.format).join(',') === 'pdf,docx,xlsx,csv',
    'download menu is missing a format',
  );

  const tabular = await Promise.all(
    REPORT_DOWNLOAD_FORMATS.map((item) =>
      buildReportDownload({
        format: item.format,
        filename: 'Profit and Loss',
        title: 'Profit and Loss',
        description: 'Business overview',
        period: 'Period 2026-11-01 – 2026-11-25',
        columns,
        rows,
        totals,
        seller,
      }),
    ),
  );

  const byName = Object.fromEntries(tabular.map((file) => [file.filename.split('.').pop(), file]));

  const pdfBytes = new Uint8Array(await byName.pdf.blob.arrayBuffer());
  assert(byName.pdf.filename === 'Profit and Loss.pdf', 'pdf filename');
  assert(pdfBytes.byteLength > 1000, 'pdf is empty');
  assert(String.fromCharCode(...pdfBytes.slice(0, 5)) === '%PDF-', 'pdf header');

  const docx = await unzip(byName.docx.blob);
  const documentXml = strFromU8(docx['word/document.xml']);
  assert(documentXml.includes('Profit and Loss'), 'docx title');
  assert(documentXml.includes('Sales, retail'), 'docx account');
  assert(documentXml.includes('1650.5'), 'docx total');
  assert(byName.docx.blob.type.includes('wordprocessingml'), 'docx mime');

  const xlsx = await unzip(byName.xlsx.blob);
  const workbook = strFromU8(xlsx['xl/workbook.xml'] ?? new Uint8Array());
  const sheet = strFromU8(xlsx['xl/worksheets/sheet1.xml']);
  const shared = xlsx['xl/sharedStrings.xml'] ? strFromU8(xlsx['xl/sharedStrings.xml']) : '';
  const excelText = `${workbook}\n${sheet}\n${shared}`;
  assert(excelText.includes('Sales, retail'), 'xlsx account');
  assert(excelText.includes('1650.5'), 'xlsx total');
  assert(excelText.includes('Account'), 'xlsx header');

  const csv = await byName.csv.blob.text();
  assert(csv.startsWith('Account,Amount'), 'csv header');
  assert(csv.includes('"Sales, retail"'), 'csv quoted comma');
  assert(csv.includes('1650.5'), 'csv total');
  assert(csv.includes('Rent'), 'csv second row');

  const statement = await buildReportDownload({
    format: 'pdf',
    filename: 'Balance sheet',
    title: 'Balance sheet',
    columns,
    rows,
    seller,
    pdfDocument: (
      <StatementPdfDocument
        seller={seller}
        title="Balance sheet"
        period="As of 2026-11-25"
        sections={[
          {
            title: 'Assets',
            lines: [{ label: 'Cash on hand', amount: 900 }],
            total: 900,
          },
        ]}
        summary={[{ label: 'Total liabilities + equity', amount: 900 }]}
      />
    ),
  });
  const statementBytes = new Uint8Array(await statement.blob.arrayBuffer());
  assert(statement.filename.endsWith('.pdf'), 'statement pdf name');
  assert(String.fromCharCode(...statementBytes.slice(0, 5)) === '%PDF-', 'statement pdf header');
  assert(statementBytes.byteLength > 1000, 'statement pdf is empty');

  for (const file of [...tabular, statement]) {
    console.log(`ok ${file.filename} ${file.blob.size} bytes ${file.blob.type}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
