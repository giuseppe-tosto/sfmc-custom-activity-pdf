/**
 * Questo modulo genera un PDF da HTML chiamando l'API esterna PDFShift.
 * Non usa nessun Chromium locale, quindi è 100% serverless-friendly.
 *
 * Variabili d'ambiente:
 *   PDFSHIFT_API_KEY  –  la tua chiave privata da https://pdfshift.io
 */

import fetch from 'node-fetch';

export async function generatePdf(html) {
  // Costruiamo il payload per PDFShift
  const url = 'https://api.pdfshift.io/v3/convert/';
  const payload = {
    source: html,
    // puoi aggiungere opzioni come margins, format: "A4", ecc.
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Autenticazione Basic: chiave + “:”
      'Authorization': 'Basic ' +
        Buffer.from(`${process.env.PDFSHIFT_API_KEY}:`).toString('base64')
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PDFShift error ${res.status}: ${text}`);
  }

  // PDFShift risponde con il PDF raw
  const buffer = await res.buffer();
  return buffer;
}
