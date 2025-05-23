/**
 * save.js
 *
 * Endpoint chiamato da SFMC quando l’utente clicca “Done” nel modal di configurazione.
 * Riceve il payload completo (arguments, configurationArguments, metaData) e lo restituisce.
 */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Ricevi intero payload
  const payload = req.body;

  // per debug
  console.log('SAVE payload:', JSON.stringify(payload, null, 2));

  // Rispondi con lo stesso payload per far sì che SFMC lo salvi
  return res.status(200).json(payload);
}
