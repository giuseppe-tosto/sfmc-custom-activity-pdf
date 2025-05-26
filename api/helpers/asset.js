import fetch from 'node-fetch';
// Import come default se auth.js esporta getAccessToken come default
import getAccessToken from './auth.js';

/**
 * Carica un PDF buffer in Content Builder come asset di tipo "file"
 * e restituisce l'URL pubblico per il recupero HTTP.
 *
 * @param {Object} params
 * @param {Buffer} params.pdfBuffer - Il buffer del PDF generato
 * @param {string} params.fileName  - Il nome con cui salvare il file (es. "Receipt_123.pdf")
 * @returns {Promise<string>} URL pubblico dove il PDF è raggiungibile via HTTP
 */
export async function uploadPdfAsset({ pdfBuffer, fileName }) {
  const token = await getAccessToken();
  const url   = `https://${process.env.MC_SUBDOMAIN}.rest.marketingcloudapis.com/asset/v1/content/assets`;

  const payload = {
    name: fileName,
    assetType: { name: 'file' },
    file: pdfBuffer.toString('base64'),
    fileProperties: { mimeType: 'application/pdf' }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Asset upload error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.fileProperties.url;
}
