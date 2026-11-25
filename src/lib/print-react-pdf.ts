import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { downloadReactPdf } from '@/lib/download-react-pdf';

/**
 * Render a @react-pdf Document and open the browser print dialog for it via a
 * hidden iframe. Falls back to a file download if the iframe cannot print.
 */
export async function printReactPdf(
  document: ReactElement<DocumentProps>,
  filename = 'document',
): Promise<void> {
  const raw = await pdf(document).toBlob();
  const blob =
    raw.type === 'application/pdf'
      ? raw
      : new Blob([raw], { type: 'application/pdf' });

  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const iframe = window.document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
      URL.revokeObjectURL(url);
    }, 60_000);
  };

  const fallback = async () => {
    iframe.remove();
    URL.revokeObjectURL(url);
    await downloadReactPdf(document, filename);
  };

  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    iframe.onload = () => {
      // Some browsers fire onload twice for blob PDFs; only print once.
      if (settled) return;
      try {
        const win = iframe.contentWindow;
        if (!win) throw new Error('No iframe window');
        win.focus();
        win.print();
        cleanup();
        done();
      } catch {
        settled = true;
        void fallback().finally(resolve);
      }
    };
    iframe.onerror = () => {
      settled = true;
      void fallback().finally(resolve);
    };

    iframe.src = url;
    window.document.body.appendChild(iframe);
  });
}
