import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/** Generate a PDF blob from a @react-pdf Document and trigger a browser download. */
export async function downloadReactPdf(
  document: ReactElement<DocumentProps>,
  filename: string,
) {
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  a.rel = 'noopener';
  window.document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
