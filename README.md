# 🚀 Custom PDF Attachment per Salesforce Marketing Cloud

Questo progetto implementa una Custom Activity di tipo REST per Journey Builder in Salesforce Marketing Cloud (SFMC) che:

- Genera dinamicamente un PDF (ricevuta d'acquisto) a partire dai dati di una Data Extension
- Invia immediatamente un'email transazionale con il PDF allegato tramite la Transactional Messaging API 


## 📂 Struttura del repository

- **`public/`**  
  - `config.json`       – Manifest della Custom Activity  
  - `config.html`       – UI di configurazione (modal)  
  - `config.js`         – Script Postmonger per la UI  
  - `icon.svg`          – Icona per Journey Builder    

- **`api/`**  
  - `execute.js`        – Endpoint REST per "execute"
  - **`helpers/`**  
    - `auth.js`         – OAuth2 SFMC 
    - `pdf.js `         – Generazione PDF via Puppeteer (HTML→PDF) 
    - `transactional.js` – Invio email con attachment via Transactional API    
  - `save.js`           – Endpoint “save”  
  - `publish.js`        – Endpoint “publish”  
  - `validate.js`       – Endpoint “validate”  
 
## 🖋️ Autore

**Tosto Giuseppe**  
