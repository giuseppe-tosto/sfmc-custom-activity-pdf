/**
 * validate.js
 *
 * Endpoint chiamato da SFMC in fase di “Publish” per verificare la correttezza della configurazione.
 * Logga il payload e la configurazione, poi restituisce 200 o 400 a seconda dei campi.
 */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const payload = req.body;
  // Log completo per debug
  console.log('VALIDATE payload:', JSON.stringify(payload, null, 2));

  const config = payload.configurationArguments || {};
  console.log('VALIDATE configurationArguments:', JSON.stringify(config, null, 2));

  const pdfTemplate = config.pdfTemplate;

  // Verifica che sia stato scelto un template valido
  if (!pdfTemplate || (pdfTemplate !== 'template1' && pdfTemplate !== 'template2')) {
    console.error('VALIDATE error: pdfTemplate non valido:', pdfTemplate);
    return res
      .status(400)
      .json({ message: 'Seleziona un pdfTemplate valido: "template1" o "template2".' });
  }

  // Tutto ok
  console.log('VALIDATE success: pdfTemplate =', pdfTemplate);
  return res.status(200).json({ message: 'Validazione superata con successo.' });
}
