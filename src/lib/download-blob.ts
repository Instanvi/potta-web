/** Trigger a real file download from a Blob (no print dialog / new tab). */
export function downloadBlob(blob: Blob, filename: string) {
  const name = filename.includes('.') ? filename : `${filename}.pdf`;
  const typed =
    blob.type && blob.type !== 'application/octet-stream'
      ? blob
      : new Blob([blob], { type: 'application/pdf' });
  const url = URL.createObjectURL(typed);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  a.style.display = 'none';
  window.document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1500);
}
