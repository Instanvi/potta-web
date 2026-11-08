'use client';

import React from 'react';
import { TableCell, TableRow } from '@potta/components/ui/table';

export function SkeletonRows({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((__, c) => (
            <TableCell key={c}>
              <div className="h-4 w-full animate-pulse bg-black/10" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function MessageRow({
  columns,
  title,
  description,
  tone = 'muted',
  action,
}: {
  columns: number;
  title: string;
  description?: string;
  tone?: 'muted' | 'error';
  action?: React.ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns} className="h-40 text-center">
        <p className={`text-sm font-medium ${tone === 'error' ? 'text-red-600' : 'text-black'}`}>{title}</p>
        {description ? <p className="mt-1 text-xs text-gray-500">{description}</p> : null}
        {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
      </TableCell>
    </TableRow>
  );
}

export function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message) return message;
  return fallback;
}
