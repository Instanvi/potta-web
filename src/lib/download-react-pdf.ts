import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { downloadBlob } from '@/lib/download-blob';

/** Generate a PDF blob from a @react-pdf Document and trigger a browser download. */
export async function downloadReactPdf(
  document: ReactElement<DocumentProps>,
  filename: string,
) {
  const raw = await pdf(document).toBlob();
  const blob =
    raw.type === 'application/pdf'
      ? raw
      : new Blob([raw], { type: 'application/pdf' });
  downloadBlob(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
