import { downloadBlob } from '@/lib/download-blob';

function safeFilename(title: string) {
  const base = title
    .replace(/[^\w\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base || 'document'}.pdf`;
}

/**
 * Rasterize a preview DOM node to a multi-page PDF and download the file.
 * Does not open Chrome's print dialog.
 */
export async function downloadPreviewAsPdf(
  source: HTMLElement | null,
  title = 'Document',
) {
  if (!source || typeof window === 'undefined') return;

  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const target =
    (source.querySelector('[data-pdf-capture]') as HTMLElement | null) ||
    (source.firstElementChild as HTMLElement | null) ||
    source;

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: Math.max(target.scrollWidth, target.clientWidth),
    windowHeight: Math.max(target.scrollHeight, target.clientHeight),
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const blob = pdf.output('blob');
  downloadBlob(blob, safeFilename(title));
}
