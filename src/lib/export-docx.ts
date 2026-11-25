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

export type DocxColumn = {
  key: string;
  label: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

function cell(text: string, bold = false) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || '—', bold })],
      }),
    ],
  });
}

/** Download a Word table of the report currently on screen. */
export async function downloadReportDocx({
  filename,
  title,
  description,
  period,
  columns,
  rows,
}: {
  filename: string;
  title: string;
  description?: string;
  period?: string;
  columns: DocxColumn[];
  rows: Record<string, unknown>[];
}) {
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

  const blob = await Packer.toBlob(doc);
  const base = filename.replace(/\.(docx|pdf|xlsx|csv)$/i, '') || 'report';
  downloadBlob(blob, `${base}.docx`);
}
