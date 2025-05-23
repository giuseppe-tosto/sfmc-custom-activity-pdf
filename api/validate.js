/**
 * validate.js
 *
 * Endpoint chiamato da SFMC in fase di “Publish” per verificare la correttezza della configurazione.
 * Deve restituire 200 se tutto ok, oppure 400 con un messaggio se mancano dati obbligatori.
 */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const payload = req.body;
  const config = payload.configurationArguments || {};
  const pdfTemplate = config.pdfTemplate;

  // Verifica che sia stato scelto un template
  if (!pdfTemplate || (pdfTemplate !== 'template1' && pdfTemplate !== 'template2')) {
    return res
      .status(400)
      .json({ message: 'Seleziona un pdfTemplate valido: "template1" o "template2".' });
  }

  return res.status(200).json({ message: 'Validazione superata con successo.' });
}
