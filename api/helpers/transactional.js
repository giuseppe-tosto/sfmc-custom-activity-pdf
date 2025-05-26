/**
 * transactional.js
 *
 * Invia un'email transazionale con allegato PDF utilizzando
 * la Transactional Messaging REST API di SFMC, caricando prima
 * il PDF in Content Builder e poi referenziandolo via AMPscript.
 *
 * Variabili d'ambiente richieste:
 *   - MC_SUBDOMAIN : sottodominio SFMC (es. "mc1234567")
 */

import fetch from 'node-fetch';
import { uploadPdfAsset } from './asset.js';
// Qui usiamo il default import perché auth.js esporta getAccessToken come default
import getAccessToken from './auth.js';

/**
 * Invia l'email con allegato PDF:
 * 1) carica il PDF in Content Builder
 * 2) chiama la REST API messaging/v1/email/messages
 */
export async function sendEmailWithAttachment({
  definitionKey,
  to,
  contactKey,
  pdfBuffer,
  fileName
}) {
  // 1) Carica il PDF e ottieni l'URL pubblico
  const assetUrl = await uploadPdfAsset({ pdfBuffer, fileName });

  // 2) Ottieni il token OAuth2
  const token = await getAccessToken();

  // 3) Prepara il payload JSON (senza campo attachments)
  const payload = {
    definitionKey,
    recipients: [
      { contactKey, to }
    ],
    attributes: {
      AttachmentURL: assetUrl
    }
  };

  // 4) Invia via REST Transactional Messaging API
  const url = `https://${process.env.MC_SUBDOMAIN}.rest.marketingcloudapis.com/messaging/v1/email/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Transactional API error: ${res.status} ${JSON.stringify(data)}`);
  }

  return data.requestId || data.id;
}
