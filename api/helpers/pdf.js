import fetch from 'node-fetch';

/**
 * Genera un PDF da HTML chiamando l’API PDFShift.
 */
export async function generatePdf(html) {
  // **DEBUG**: controlla che la variabile d’ambiente sia letta correttamente
  console.log('🔍 DEBUG PDFSHIFT_API_KEY:', process.env.PDFSHIFT_API_KEY);

  const url = 'https://api.pdfshift.io/v3/convert/pdf';
  const payload = { source: html };
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' +
      Buffer.from(`${process.env.PDFSHIFT_API_KEY}:`).toString('base64')
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDFShift error ${response.status}: ${errorText}`);
  }

  return await response.buffer();
}
