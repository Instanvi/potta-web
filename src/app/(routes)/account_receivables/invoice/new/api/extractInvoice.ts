export async function extractInvoiceFromFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    'https://extractor-9f3k.onrender.com/supplier/potta/',
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Extraction failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
