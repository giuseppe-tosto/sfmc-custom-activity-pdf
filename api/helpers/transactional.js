/**
 * transactional.js
 *
 * Questo modulo invia email transazionali con allegati tramite la Transactional Messaging API v1 di SFMC.
 * Si assume di avere un access token valido e il definitionKey di una Triggered Send Definition.
 */

/**
 * Invia un'email con allegato PDF
 * @param {Object} params
 * @param {string} params.token          - Access token SFMC
 * @param {string} params.definitionKey  - Key della Triggered Send Definition
 * @param {string} params.to             - Indirizzo email destinatario
 * @param {string} params.contactKey     - SubscriberKey del destinatario
 * @param {Buffer} params.pdfBuffer      - Buffer contenente il PDF
 * @param {string} params.fileName       - Nome del file allegato (es. Receipt_123.pdf)
 * @returns {Promise<string>} l'ID della richiesta
 * @throws se la chiamata API restituisce un errore
 */
export async function sendEmailWithAttachment({ token, definitionKey, to, contactKey, pdfBuffer, fileName }) {
  // Costruisci l'URL per l'API Transactional Messaging
  const url = `https://${process.env.MC_SUBDOMAIN}.rest.marketingcloudapis.com/messaging/v1/email/messages`;

  // Prepara il payload JSON con recipient, definitionKey e attachments
  const payload = {
    definitionKey,
    recipient: { address: to, subscriberKey: contactKey },
    attachments: [
      {
        name: fileName,
        type: 'application/pdf',
        content: pdfBuffer.toString('base64')
      }
    ]
  };

  // Esegui la chiamata POST con Authorization Bearer token
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // Gestione errori HTTP
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Transactional API error: ${response.status} ${text}`);
  }

  // Estrai la risposta JSON: può contenere requestId o id
  const data = await response.json();
  return data.requestId || data.id || '';
}

