/**
 * auth.js
 *
 * Questo modulo gestisce l'autenticazione con Salesforce Marketing Cloud via OAuth2.
 * Implementa una semplice cache per riutilizzare il token finché non scade.
 *
 * Variabili d'ambiente richieste:
 *   - MC_CLIENT_ID       : Client ID dell'Installed Package in SFMC
 *   - MC_CLIENT_SECRET   : Client Secret dell'Installed Package in SFMC
 *   - MC_SUBDOMAIN       : Sottodominio SFMC 
 */

let cachedToken = null;      // Token memorizzato in cache
let tokenExpiresAt = 0;      // Timestamp (ms) di scadenza del token

/**
 * Recupera un access token valido da SFMC, usando caching per ridurre le chiamate.
 * @returns {Promise<string>} Il token di accesso
 * @throws se la richiesta alla token endpoint non va a buon fine
 */
export default async function getAccessToken() {
  const now = Date.now();

  // Se abbiamo già un token non scaduto, lo restituiamo
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  // Costruisci l'URL dell'endpoint di autenticazione OAuth2
  const url = `https://${process.env.MC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`;

  // Corpo della richiesta OAuth2 secondo spec SFMC
  const body = {
    grant_type: 'client_credentials',
    client_id: process.env.MC_CLIENT_ID,
    client_secret: process.env.MC_CLIENT_SECRET,
  };

  // Effettuiamo la chiamata HTTP POST per ottenere il token
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  // Gestione degli errori HTTP
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Auth error: ${response.status} ${text}`);
  }

  // Estrai i dati JSON con access_token ed expires_in (in secondi)
  const data = await response.json();

  // Memorizza il token e calcola la scadenza con un margine di sicurezza di 60 secondi
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in - 60) * 1000;

  return cachedToken;
}
