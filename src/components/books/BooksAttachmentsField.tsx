'use client';

import { useMemo, useState } from 'react';
import FileUpload from '@/components/fileUpload';
import { FIELD_LABEL } from '@/lib/field-styles';

export type BooksAttachmentMeta = { name: string; size: number };

function parseAttachments(raw: string): BooksAttachmentMeta[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => ({
        name: String(row?.name ?? '').trim(),
        size: Number(row?.size) || 0,
      }))
      .filter((row) => row.name);
  } catch {
    return [];
  }
}

/** Local attachment picker for Books create/edit — metadata only (not uploaded yet). */
export function BooksAttachmentsField({
  label = 'Attachments',
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const meta = useMemo(() => parseAttachments(value), [value]);
  const [files, setFiles] = useState<File[]>([]);

  const syncFromFiles = (nextFiles: File[]) => {
    setFiles(nextFiles);
    onChange(
      JSON.stringify(
        nextFiles.map((file) => ({ name: file.name, size: file.size })),
      ),
    );
  };

  return (
    <div className="space-y-2">
      <span className={FIELD_LABEL}>{label}</span>
      <FileUpload
        files={files}
        setFiles={syncFromFiles}
        maxFiles={5}
        maxSizeMB={5}
      />
      {meta.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {meta.map((file) => (
            <li key={`${file.name}-${file.size}`}>
              {file.name}
              {file.size ? ` · ${Math.max(1, Math.round(file.size / 1024))} KB` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
