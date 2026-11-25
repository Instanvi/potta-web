import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveBlob } from '@/lib/export-file';

export type DocxColumn = {
  key: string;
  label: string;
};

function cell(text: string, bold = false) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || '—', bold })],
      }),
    ],
  });
}

export async function buildReportDocxBlob({
  title,
  description,
  period,
  columns,
  rows,
}: {
  title: string;
  description?: string;
  period?: string;
  columns: DocxColumn[];
  rows: Record<string, unknown>[];
}): Promise<Blob> {
  const header = new TableRow({
    tableHeader: true,
    children: columns.map((column) => cell(column.label, true)),
  });
  const body = rows.map(
    (row) =>
      new TableRow({
        children: columns.map((column) => {
          const value = row[column.key];
          return cell(value == null || value === '' ? '' : String(value));
        }),
      }),
  );

  const intro: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
  ];
  if (description) intro.push(new Paragraph(description));
  if (period) intro.push(new Paragraph(period));
  intro.push(new Paragraph(''));

  const doc = new Document({
    sections: [
      {
        children: [
          ...intro,
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [header, ...body],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

/** Download a Word table of the report currently on screen. */
export async function downloadReportDocx({
  filename,
  ...input
}: {
  filename: string;
  title: string;
  description?: string;
  period?: string;
  columns: DocxColumn[];
  rows: Record<string, unknown>[];
}) {
  const blob = await buildReportDocxBlob(input);
  const base = filename.replace(/\.(docx|pdf|xlsx|csv)$/i, '') || 'report';
  saveBlob(blob, `${base}.docx`);
}
