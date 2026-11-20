/** Client-side row export. Excel (.xlsx) is the default. */

export type ExportFormat = 'xlsx' | 'csv';

export type ExportColumn<T> = {
  key: keyof T | string;
  header: string;
  value?: (row: T) => string | number | null | undefined;
};

function cellValue<T>(row: T, col: ExportColumn<T>) {
  if (col.value) return col.value(row);
  const v = (row as Record<string, unknown>)[col.key as string];
  if (v == null) return '';
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv<T>(rows: T[], columns: ExportColumn<T>[]) {
  const esc = (s: string) => {
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    columns.map((c) => esc(c.header)).join(','),
    ...rows.map((row) => columns.map((c) => esc(String(cellValue(row, c) ?? ''))).join(',')),
  ];
  return lines.join('\n');
}

/** Minimal XLSX (SheetJS-compatible) writer via dynamic import when available; CSV fallback. */
export async function exportRows<T>({
  filename,
  rows,
  columns,
  format = 'xlsx',
}: {
  filename: string;
  rows: T[];
  columns: ExportColumn<T>[];
  format?: ExportFormat;
}) {
  const base = filename.replace(/\.(xlsx|csv)$/i, '');
  if (format === 'csv') {
    downloadBlob(new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' }), `${base}.csv`);
    return;
  }
  try {
    const XLSX = await import('xlsx');
    const data = [
      columns.map((c) => c.header),
      ...rows.map((row) => columns.map((c) => cellValue(row, c) ?? '')),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Export');
    const buf = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
    downloadBlob(
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${base}.xlsx`,
    );
  } catch {
    downloadBlob(new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' }), `${base}.csv`);
  }
}
