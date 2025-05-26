import fetch from 'node-fetch';
import { uploadPdfAsset } from './asset.js';
import { getAccessToken } from './auth.js';

export async function sendEmailWithAttachment({
  definitionKey,
  to,
  contactKey,
  pdfBuffer,
  fileName
}) {
  // 1) carico il PDF e ottengo l'URL
  const assetUrl = await uploadPdfAsset({ pdfBuffer, fileName });

  // 2) recupero un token OAuth2
  const token = await getAccessToken();

  // 3) costruisco il payload REST senza attachments
  const payload = {
    definitionKey,
    recipients: [
      { contactKey, to }
    ],
    attributes: {
      // il nome "AttachmentURL" dev'essere usato
      // nel tuo template AMPscript: %%=AttachFile("HTTP", AttributeValue("AttachmentURL"), fileName, false)=%%
      AttachmentURL: assetUrl
    }
  };

  // 4) invio l'email via REST Transactional Messaging API
  const url = `https://${process.env.MC_SUBDOMAIN}.rest.marketingcloudapis.com/messaging/v1/email/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type':   'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Transactional API error ${res.status}: ${JSON.stringify(data)}`);
  }

  return data.requestId || data.id;
}
