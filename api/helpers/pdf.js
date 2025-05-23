/**
 * pdf.js
 *
 * Questo modulo genera un PDF a partire da una stringa HTML.
 * Utilizza puppeteer-core e chrome-aws-lambda per eseguire Chromium in ambiente serverless.
 */

import chromium from 'chrome-aws-lambda';

/**
 * Genera un PDF da HTML
 * @param {string} html - Codice HTML completo da convertire in PDF
 * @returns {Promise<Buffer>} Buffer contenente i byte del PDF
 * @throws se c'è un errore durante il rendering o la stampa del PDF
 */
export async function generatePdf(html) {
  // Avvia Chromium con le impostazioni di chrome-aws-lambda
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();

    // Imposta il contenuto HTML e attende il caricamento delle risorse
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Genera il PDF con margini e stampa dello sfondo
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    return pdfBuffer;
  } finally {
    // Chiude sempre il browser per liberare risorse
    await browser.close();
  }
}
