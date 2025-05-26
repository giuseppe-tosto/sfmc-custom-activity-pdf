
/**
 * transactional.js
 *
 * Questo modulo invia email transazionali con allegato PDF
 * tramite la Transactional Messaging REST API di Salesforce Marketing Cloud.
 *
 * Variabili d'ambiente richieste:
 *   - MC_SUBDOMAIN          : sottodominio SFMC (es. "mc1234567")
 *
 * @param {Object} params
 * @param {string} params.token         - Access token OAuth2 SFMC
 * @param {string} params.definitionKey - External Key della Transactional Send Definition
 * @param {string} params.to            - Indirizzo email del destinatario
 * @param {string} params.contactKey    - SubscriberKey del destinatario
 * @param {Buffer} params.pdfBuffer     - Buffer contenente il PDF
 * @param {string} params.fileName      - Nome del file allegato (es. "Receipt_ORD123.pdf")
 * @returns {Promise<string>}           - ID del messaggio inviato o risposta JSON
 * @throws {Error}                      - Se la chiamata REST fallisce
 */

import fetch from 'node-fetch';

export async function sendEmailWithAttachment({
  token,
  definitionKey,
  to,
  contactKey,
  pdfBuffer,
  fileName
}) {
  // DEBUG: verifica la definitionKey in uso
  console.log('🔍 DEBUG definitionKey:', definitionKey);

  const url = `https://${process.env.MC_SUBDOMAIN}.rest.marketingcloudapis.com/messaging/v1/email/messages`;

  // Costruisci il payload corretto con "recipients" (array) e "attachments"
  const payload = {
    definitionKey,
    recipients: [
      {
        address: to,
        subscriberKey: contactKey
      }
    ],
    attachments: [
      {
        name: fileName,
        type: 'application/pdf',
        content: pdfBuffer.toString('base64')
      }
    ]
  };

  // Esegui la richiesta POST
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // Leggi la risposta JSON
  const data = await response.json();

  // Se non è OK, solleva un errore con dettagli
  if (!response.ok) {
    throw new Error(`Transactional API error: ${response.status} ${JSON.stringify(data)}`);
  }

  // Restituisci l'ID del messaggio o l'intera risposta
  return data.requestId || data.id || JSON.stringify(data);
}
