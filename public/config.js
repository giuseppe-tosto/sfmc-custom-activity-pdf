(function() {
  // STEP 1 -- Verifica che Postmonger sia caricato
  if (typeof Postmonger === 'undefined') {
    console.error('[CPAA] ERRORE: Postmonger non definito');
    return;
  }

  // STEP 2 -- Inizializza sessione e cache DOM
  const connection = new Postmonger.Session();
  let payload = {};
  const tmpl1 = document.getElementById('template1');
  const tmpl2 = document.getElementById('template2');

  // STEP 3 -- Helper per leggere la scelta del template
  function getPdfTemplate() {
    const sel = document.querySelector('input[name="pdfTemplate"]:checked');
    return sel ? sel.value : '';
  }

  // STEP 4 -- Registra listener
  connection.on('initActivity', onInitActivity);
  connection.on('clickedNext', onClickedNext);

  // STEP 5 -- Avvia handshake con Journey Builder
  connection.trigger('ready');

  // STEP 6 -- Popola la UI all'apertura del modal
  function onInitActivity(data) {
    payload = data || {};
    const selected = payload.configurationArguments && payload.configurationArguments.pdfTemplate;

    if (selected === 'template1') tmpl1.checked = true;
    if (selected === 'template2') tmpl2.checked = true;

    // Abilita bottone Done
    connection.trigger('updateButton', { button: 'next', enabled: true });
  }

  // STEP 7 -- Raccoglie i valori e invia updateActivity
  function onClickedNext() {
    payload.configurationArguments = payload.configurationArguments || {};
    payload.configurationArguments.pdfTemplate = getPdfTemplate();
    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;

    connection.trigger('updateActivity', payload);
  }

  // STEP 8 -- Gestione errori globali
  window.addEventListener('error', function(e) {
    console.error('[CPAA] uncaught error:', e.error);
  });
})();
