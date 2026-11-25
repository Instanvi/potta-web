'use client';

import {
  ReceiptPrinter,
  readReceiptPrinterFormat,
  writeReceiptPrinterFormat,
  type ReceiptPrinterFormat,
} from './receiptPrinter';
import { useEffect, useState } from 'react';
import Select from '@potta/components/select';

const OPTIONS: { value: string; label: string }[] = [
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
    <Select
      label="Receipt printer"
      name="Receipt printer"
      bg=""
      options={OPTIONS}
      selectedValue={format}
      onChange={(value) => {
        const next = value as ReceiptPrinterFormat;
        setFormat(next);
        printer.setFormat(next);
        writeReceiptPrinterFormat(next);
      }}
    />
  );
}
