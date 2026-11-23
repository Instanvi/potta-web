/** Open the given preview DOM as a printable/downloadable PDF window. */
export function downloadPreviewAsPdf(
  source: HTMLElement | null,
  title = 'Document'
) {
  if (!source || typeof window === 'undefined') return;

  // Do not pass noopener/noreferrer in features — browsers then return null from
  // window.open while still opening about:blank, so we never write the HTML.
  const win = window.open('', '_blank', 'width=900,height=1100');
  if (!win) return;
  try {
    win.opener = null;
  } catch {
    /* ignore cross-origin / locked opener */
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  const safeTitle = title.replace(/</g, '');

  win.document.open();
  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
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
