/**
 * publish.js
 *
 * Endpoint chiamato da SFMC quando l’utente pubblica effettivamente il Journey.
 * Qui aggiungiamo dei log per registrare il payload e la configurazione finale.
 */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const payload = req.body;

  // Log completo del payload ricevuto
  console.log('PUBLISH payload:', JSON.stringify(payload, null, 2));

  // Log specifici per sicurezza
  console.log('PUBLISH configurationArguments:', JSON.stringify(payload.configurationArguments, null, 2));
  console.log('PUBLISH metaData:', JSON.stringify(payload.metaData, null, 2));

  // Risposta di conferma
  return res.status(200).json(payload);
}
