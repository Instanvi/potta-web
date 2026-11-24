'use client';

import {
  ReceiptPrinter,
  readReceiptPrinterFormat,
  writeReceiptPrinterFormat,
  type ReceiptPrinterFormat,
} from './receiptPrinter';
import { useEffect, useState } from 'react';

const OPTIONS: { value: ReceiptPrinterFormat; label: string }[] = [
  { value: 'thermal-58', label: '58mm thermal' },
  { value: 'thermal-80', label: '80mm thermal' },
  { value: 'a4', label: 'A4 / letter' },
];

/** Lets cashiers pick paper width so the receipt layout matches the printer. */
export function ReceiptPrinterFormatSelect({
  printer,
}: {
  printer: ReceiptPrinter;
}) {
  const [format, setFormat] = useState<ReceiptPrinterFormat>('thermal-80');

  useEffect(() => {
    setFormat(printer.getFormat() || readReceiptPrinterFormat());
  }, [printer]);

  return (
    <label className="flex flex-col gap-1 text-sm text-gray-600">
      <span className="font-medium text-gray-800">Receipt printer</span>
      <select
        className="h-10 rounded-[2px] border border-black/10 bg-white px-3 text-sm text-foreground"
        value={format}
        aria-label="Receipt printer format"
        onChange={(e) => {
          const next = e.target.value as ReceiptPrinterFormat;
          setFormat(next);
          printer.setFormat(next);
          writeReceiptPrinterFormat(next);
        }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
