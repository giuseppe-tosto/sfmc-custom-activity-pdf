/**
 * pdf.js
 *
 * Genera un PDF a partire da una stringa HTML, usando Puppeteer
 * che include automaticamente Chromium.
 */

import puppeteer from 'puppeteer';

/**
 * Genera un PDF da HTML
 * @param {string} html - Codice HTML completo da convertire in PDF
 * @returns {Promise<Buffer>} Buffer contenente i byte del PDF
 */
export async function generatePdf(html) {
  // Avvia Chromium incluso in puppeteer
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Stampa in PDF formato A4
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
