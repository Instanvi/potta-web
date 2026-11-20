/** Open the given preview DOM as a printable/downloadable PDF window. */
export function downloadPreviewAsPdf(
  source: HTMLElement | null,
  title = 'Document'
) {
  if (!source || typeof window === 'undefined') return;

  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');
  if (!win) return;

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, '')}</title>
    ${styles}
    <style>
      @page { margin: 12mm; }
      body { margin: 0; background: #fff; }
      .print-root { min-height: 100vh; background: #fff !important; padding: 0 !important; }
      .print-root .shadow-sm,
      .print-root .shadow { box-shadow: none !important; }
      @media print {
        .no-print { display: none !important; }
      }
    </style>
  </head>
  <body>
    <div class="print-root">${source.innerHTML}</div>
    <script>
      window.onload = function () {
        setTimeout(function () { window.focus(); window.print(); }, 250);
      };
    </script>
  </body>
</html>`);
  win.document.close();
}
