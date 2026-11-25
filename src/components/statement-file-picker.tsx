'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Click-or-drop file control. The native input stays hidden so the browser “Choose file” row does not show. */
export function StatementFilePicker({
  accept = '.csv,text/csv',
  label = 'Choose a statement file',
  hint,
  onFile,
}: {
  accept?: string;
  label?: string;
  hint?: string;
  onFile: (file: File) => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const take = (file?: File) => {
    if (!file) return;
    setName(file.name);
    void onFile(file);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          take(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          'flex w-full items-center gap-3 rounded-[2px] border border-dashed px-3 py-3 text-left transition-colors',
          drag
            ? 'border-primary bg-brand-subtle'
            : 'border-black/15 bg-white hover:bg-accent',
        )}
      >
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-brand-subtle text-primary">
          <i className="ri-file-upload-line text-lg" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm text-foreground">{name ?? label}</span>
          <span className="block text-xs text-muted-foreground">
            {name ? 'Click or drop to replace' : 'CSV · click or drop a file'}
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          take(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
