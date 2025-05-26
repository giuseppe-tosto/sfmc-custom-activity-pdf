/**
 * pdf.js
 *
 * Questo modulo espone la funzione `generatePdf(html)` per convertire
 * una stringa HTML in un file PDF utilizzando il servizio esterno PDFShift.
 * È completamente serverless-friendly e non richiede alcun binario locale di Chromium.
 *
 *  Requisiti:
 *   - Variabile d’ambiente `PDFSHIFT_API_KEY` impostata con la tua API Key di PDFShift
 *     (https://pdfshift.io)
 *
 */

import fetch from 'node-fetch';

/**
 * Genera un PDF a partire da HTML chiamando l’API PDFShift.
 *
 * @param {string} html - Il codice HTML completo da convertire in PDF.
 * @returns {Promise<Buffer>} - Un Buffer contenente i byte del PDF generato.
 * @throws {Error} - Se la chiamata all’API restituisce un errore HTTP o un payload non valido.
 */
export async function generatePdf(html) {
  // **DEBUG**: controlla la presenza della chiave (rimuovere in produzione)
  console.log('🔍 DEBUG PDFSHIFT_API_KEY length:', process.env.PDFSHIFT_API_KEY?.length);

  // Endpoint ufficiale di PDFShift per la conversione HTML→PDF
  const url = 'https://api.pdfshift.io/v3/convert/pdf';

  // Corpo della richiesta: il campo `source` contiene l’HTML da convertire
  const payload = {
    source: html
    // Possibili opzioni aggiuntive (non usate qui):
    // format: 'A4',
    // margin: { top: '20px', bottom: '20px' },
    // header: { height: '20mm', contents: '<div>Header</div>' },
    // footer: { height: '20mm', contents: '<div>Page {{page}} of {{pages}}</div>' },
  };

  // Prepariamo le intestazioni:
  // - Content-Type: JSON
  // - X-API-Key: la tua chiave PDFShift
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.PDFSHIFT_API_KEY
  };

  // Eseguiamo la richiesta POST verso PDFShift
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  // Se lo status HTTP non è 2xx, consideriamo fallita la richiesta
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDFShift error ${response.status}: ${errorText}`);
  }

  // PDFShift restituisce direttamente il contenuto raw del PDF
  const pdfBuffer = await response.buffer();

  // Ritorniamo il Buffer da inviare come allegato o salvare
  return pdfBuffer;
}
