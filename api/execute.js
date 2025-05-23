/**
 * api/execute.js
 *
 * Endpoint principale per la Custom Activity “PDF Attachment” di Journey Builder.
 * Riceve i dati dal Journey (orderID, items, ecc.), genera un PDF (usando Puppeteer),
 * e invia un’email transazionale con il PDF in allegato tramite la Transactional Messaging API.
 *
 * Richiede le seguenti variabili d’ambiente (configurate su Vercel):
 *   - MC_CLIENT_ID, MC_CLIENT_SECRET, MC_SUBDOMAIN    - per l’OAuth2 con SFMC
 *   - TRIGGERED_SEND_KEY                              - key della Triggered Send Definition
 *
 * Dipendenze interne (in api/helpers/):
 *   - auth.js         - getAccessToken()
 *   - pdf.js          - generatePdf(html) → Promise<Buffer>
 *   - transactional.js→ sendEmailWithAttachment({ token, definitionKey, to, contactKey, pdfBuffer, fileName })
 */

import path from 'path';
import fs from 'fs/promises';

// Helpers
import getAccessToken from './helpers/auth.js';
import { generatePdf } from './helpers/pdf.js';
import { sendEmailWithAttachment } from './helpers/transactional.js';

export default async function handler(req, res) {
  // STEP 1 -- Accetta solo richieste POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // STEP 2 -- Ricostruisci gli inArguments in un singolo oggetto
    // Salesforce Marketing Cloud passa gli inArguments come array di oggetti
    const inArgsArray = req.body.arguments?.execute?.inArguments || req.body.inArguments;
    const args = Object.assign({}, ...inArgsArray);

    // STEP 3 -- Estrai i parametri essenziali
    const {
      contactKey,     // Chiave univoca del contatto in SFMC
      emailAddress,   // Indirizzo email del destinatario
      orderID,        // ID dell’ordine
      purchaseDate,   // Data/ora dell’acquisto
      items,          // Stringa JSON con array di {name, quantity, unitPrice}
      totalAmount,    // Importo totale
      pdfTemplate     // Nome del template HTML selezionato (template1 o template2)
    } = args;

    // STEP 4 -- Decodifica il campo items in array di oggetti
    const itemsArray = JSON.parse(items);

    // STEP 5 -- Carica il file HTML del template e sostituisci i placeholder
    const templatesDir = path.join(process.cwd(), 'api', 'templates');
    const templateFile = path.join(templatesDir, `${pdfTemplate}.html`);
    let html = await fs.readFile(templateFile, 'utf-8');

    // Sostituisci i placeholder base nel template
    html = html
      .replace(/{{orderID}}/g, orderID)
      .replace(/{{purchaseDate}}/g, purchaseDate)
      .replace(/{{totalAmount}}/g, totalAmount);

    // Costruisci le righe della tabella articoli in HTML
    const itemsRows = itemsArray
      .map(item => {
        // item.name, item.quantity, item.unitPrice
        return `
          <tr>
            <td>${item.name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">${item.unitPrice.toFixed(2)}</td>
          </tr>`;
      })
      .join('');
    // Inserisci le righe generate nel placeholder {{itemsRows}}
    html = html.replace(/{{itemsRows}}/g, itemsRows);

    // STEP 6 -- Genera il PDF (ritorna un Buffer)
    const pdfBuffer = await generatePdf(html);

    // STEP 7 -- Ottieni un access token per chiamare le API di SFMC
    const token = await getAccessToken();

    // Chiave della Triggered Send Definition (configurata in ambiente)
    const definitionKey = process.env.TRIGGERED_SEND_KEY;
    // Nome file del PDF allegato
    const fileName = `Receipt_${orderID}.pdf`;

    // STEP 8 -- Invia l’email transazionale con l’allegato PDF
    const messageId = await sendEmailWithAttachment({
      token,
      definitionKey,
      to: emailAddress,
      contactKey,
      pdfBuffer,
      fileName
    });

    // STEP 9 -- Risposta di successo
    return res
      .status(200)
      .json({
        status: 'ok',
        messageId,            // ID del messaggio inviato
        bytes: pdfBuffer.length // dimensione in byte del PDF
      });
  } catch (err) {
    // STEP 10 -- Gestione degli errori
    console.error('execute error:', err);
    return res
      .status(500)
      .json({ error: err.message });
  }
}
