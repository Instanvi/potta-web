'use client';

import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-main-bg text-sm text-muted-foreground">
        Loading PDF preview…
      </div>
    ),
  },
);

/** On-screen preview of the same react-pdf document that download and print use. */
export function PdfPreview({ document }: { document: ReactElement<DocumentProps> }) {
  return (
    <div className="h-full min-h-0 bg-main-bg">
      <PDFViewer
        width="100%"
        height="100%"
        showToolbar={false}
        className="h-full w-full border-0"
      >
        {document}
      </PDFViewer>
    </div>
  );
}
