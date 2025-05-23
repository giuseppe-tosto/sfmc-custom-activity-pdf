/**
 * Genera un PDF a partire da una stringa HTML usando chrome-aws-lambda.
 * chrome-aws-lambda include un binario di Chromium ottimizzato per AWS Lambda/Vercel.
 */

import chromium from 'chrome-aws-lambda';

/**
 * @param {string} html – HTML completo da convertire in PDF
 * @returns {Promise<Buffer>} Buffer contenente i byte del PDF
 */
export async function generatePdf(html) {
  // Avvia Chromium fornito da chrome-aws-lambda
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    // Carica il contenuto HTML e aspetta che non ci siano richieste pendenti
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Genera PDF in A4 con margini e sfondi
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
