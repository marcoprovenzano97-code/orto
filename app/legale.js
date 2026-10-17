// Testi legali: informativa privacy e condizioni d'uso.
// Da far rivedere a un professionista prima del lancio commerciale (e da aggiornare con i pagamenti).
window.OrtoLegale = (function () {
  'use strict';
  const TITOLARE = 'Marco Provenzano';
  const EMAIL = 'marco.provenzano97@gmail.com';
  const AGGIORNATO = '17 ottobre 2026';
  const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

  const privacy = () => `
    <div class="legale">
      <p class="muted small">Ultimo aggiornamento: ${AGGIORNATO}</p>

      <h2>Chi tratta i tuoi dati</h2>
      <p>Il titolare del trattamento è <strong>${TITOLARE}</strong>, contattabile all'indirizzo ${mail} per qualsiasi domanda o richiesta sui tuoi dati.</p>

      <h2>Se usi l'app senza account</h2>
      <p>Aiuole, progetti, storico e impostazioni restano <strong>solo sul tuo dispositivo</strong> (nella memoria del browser). Non li riceviamo e non li vediamo.</p>

      <h2>Quali dati trattiamo se crei un account</h2>
      <ul>
        <li><strong>Dati dell'account</strong>: indirizzo email e password (conservata in forma cifrata dal fornitore del servizio di accesso, noi non la vediamo).</li>
        <li><strong>Profilo</strong>: zona climatica, comune scelto oppure posizione approssimata a circa 1 km (se usi "Usa la mia posizione"), preferenza sulle notifiche, stato dell'abbonamento Premium, data di accettazione di queste condizioni.</li>
        <li><strong>Dati dell'orto</strong> (con Premium, per la sincronizzazione tra dispositivi): aiuole, colture, progetti, storico, raccolti, irrigazioni registrate e l'esito dei check-up con una piccola miniatura della foto.</li>
        <li><strong>Foto del check-up</strong>: quando avvii un check-up la foto, ridotta sul tuo dispositivo, viene inviata al servizio di analisi insieme alla coltura, al tipo di aiuola e al meteo della tua zona. Sul nostro server conserviamo solo l'esito e i consumi dell'analisi, non la foto intera.</li>
        <li><strong>Messaggi all'assistente</strong>: la domanda e la conversazione recente vengono inviate al servizio di intelligenza artificiale insieme a una descrizione del tuo orto, per generare la risposta. Sul nostro server registriamo solo il numero di messaggi e i consumi, non il testo; la conversazione resta sul tuo dispositivo.</li>
        <li><strong>Notifiche</strong>: se le attivi, salviamo l'indirizzo tecnico del tuo dispositivo per recapitarle.</li>
        <li><strong>Dati tecnici</strong>: i fornitori registrano dati di funzionamento (come indirizzo IP e orari delle richieste) per sicurezza e diagnosi.</li>
      </ul>

      <h2>Perché li trattiamo</h2>
      <ul>
        <li>Per fornirti il servizio che hai richiesto (account, sincronizzazione, check-up, assistente, promemoria): base giuridica è il contratto, cioè le condizioni d'uso che accetti.</li>
        <li>Per inviarti le notifiche: base giuridica è il tuo consenso, che puoi revocare in ogni momento dalla pagina Account o dalle impostazioni del browser.</li>
        <li>Per la sicurezza del servizio e per prevenire abusi: nostro legittimo interesse.</li>
      </ul>
      <p>Non vendiamo i tuoi dati, non li usiamo per pubblicità e non facciamo profilazione.</p>

      <h2>A chi li affidiamo</h2>
      <p>Usiamo fornitori che trattano i dati per nostro conto, solo per far funzionare l'app:</p>
      <ul>
        <li><strong>Supabase</strong> — account, database e funzioni del server. I dati sono conservati in data center nell'Unione Europea (Irlanda).</li>
        <li><strong>Anthropic</strong> — analisi delle foto del check-up e risposte dell'assistente (Stati Uniti). Riceve i dati solo quando usi queste funzioni; secondo le condizioni commerciali del fornitore, i dati inviati tramite il suo servizio non sono usati per addestrare i modelli e sono conservati solo per un periodo limitato.</li>
        <li><strong>GitHub (Microsoft)</strong> — pubblicazione del sito (Stati Uniti), con registri tecnici delle visite.</li>
        <li><strong>Open-Meteo</strong> — previsioni del tempo: riceve le coordinate approssimate del tuo comune.</li>
        <li><strong>BigDataCloud</strong> — ricava il nome del comune quando usi "Usa la mia posizione".</li>
        <li><strong>Google Fonts, jsDelivr, Unsplash</strong> — caratteri, librerie e alcune immagini del sito: ricevono l'indirizzo IP del tuo dispositivo quando le carica.</li>
        <li><strong>Servizi di notifica del browser</strong> (Google, Apple, Mozilla) — recapitano le notifiche al tuo dispositivo.</li>
      </ul>
      <p>Quando i dati sono trasferiti fuori dall'Unione Europea, il trasferimento avviene con le garanzie previste dal GDPR (clausole contrattuali standard o adesione al Data Privacy Framework UE-USA).</p>

      <h2>Per quanto tempo</h2>
      <p>Conserviamo i dati finché il tuo account è attivo. Se elimini l'account, profilo, orto, iscrizioni alle notifiche e registri vengono cancellati subito dal database; eventuali copie di sicurezza dei fornitori vengono sovrascritte entro breve tempo.</p>

      <h2>I tuoi diritti</h2>
      <p>Puoi chiedere in ogni momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne il trattamento, opporti, revocare il consenso e ricevere una copia in un formato leggibile. Dalla pagina <a href="#/account">Account</a> puoi direttamente <strong>scaricare i tuoi dati</strong> ed <strong>eliminare l'account</strong>. Per tutto il resto scrivi a ${mail}. Se ritieni che il trattamento non sia corretto puoi presentare reclamo al <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener">Garante per la protezione dei dati personali</a>.</p>

      <h2>Cookie e memoria del browser</h2>
      <p>Non usiamo cookie di profilazione né strumenti di statistica. L'app usa la memoria locale del browser solo per funzionare (salvare aiuole, impostazioni e accesso): sono strumenti tecnici che non richiedono consenso.</p>

      <h2>Minori</h2>
      <p>Il servizio con account non è destinato a persone sotto i 14 anni.</p>

      <h2>Modifiche</h2>
      <p>Se cambiamo questa informativa aggiorniamo la data in alto; per modifiche importanti ti avviseremo nell'app.</p>
    </div>`;

  const termini = () => `
    <div class="legale">
      <p class="muted small">Ultimo aggiornamento: ${AGGIORNATO}</p>

      <h2>Il servizio</h2>
      <p>Ortogramma è un'app per aiutarti a pianificare e seguire il tuo orto: schede delle colture, calendari di semina per zona, progetto delle aiuole, rotazioni, promemoria, avvisi meteo, check-up con foto e assistente. Il servizio è fornito da ${TITOLARE} (${mail}).</p>

      <h2>Account</h2>
      <p>Per alcune funzioni serve un account. Sei responsabile di tenere riservata la tua password e delle attività svolte con il tuo account. Puoi eliminarlo in qualsiasi momento dalla pagina Account.</p>

      <h2>Consigli indicativi</h2>
      <p>Calendari, quantità d'acqua, distanze, rotazioni e consigli sono <strong>indicazioni di massima</strong>: il risultato dipende da clima locale, terreno, varietà e cura. Non garantiamo raccolti né risultati e non rispondiamo di perdite di colture.</p>
      <p>Check-up con foto e assistente usano l'intelligenza artificiale: <strong>possono sbagliare</strong>. Verifica sempre le indicazioni importanti; per trattamenti fitosanitari leggi e rispetta l'etichetta del prodotto, le dosi e i tempi di attesa prima della raccolta, e in caso di dubbio rivolgiti a un tecnico o a un rivenditore autorizzato. Per sicurezza alimentare (conserve, piante tossiche) segui le indicazioni delle fonti ufficiali.</p>

      <h2>Uso corretto</h2>
      <p>Non usare il servizio per scopi illeciti, per inviare contenuti offensivi o non pertinenti, o per aggirare i limiti di utilizzo. Possiamo sospendere gli account che violano queste regole.</p>

      <h2>Premium</h2>
      <p>Le funzioni Premium (tra cui check-up con foto, assistente, irrigazione calcolata, avvisi, sincronizzazione) hanno limiti di utilizzo mensili indicati nell'app. In questa fase il Premium è attivato su invito e senza costi; quando saranno disponibili gli abbonamenti a pagamento, prezzi, rinnovo, disdetta e diritto di recesso di 14 giorni saranno indicati prima dell'acquisto.</p>

      <h2>Disponibilità e modifiche</h2>
      <p>Facciamo il possibile perché il servizio sia sempre disponibile, ma possono esserci interruzioni per manutenzione o problemi dei fornitori. Possiamo migliorare o modificare le funzioni; in caso di modifiche importanti a queste condizioni ti avviseremo nell'app.</p>

      <h2>Responsabilità</h2>
      <p>Nei limiti consentiti dalla legge, non rispondiamo di danni indiretti derivanti dall'uso dell'app o dall'impossibilità di usarla. Restano salvi i diritti che la legge riconosce ai consumatori.</p>

      <h2>Legge applicabile</h2>
      <p>Si applica la legge italiana. Per i consumatori è competente il foro del luogo di residenza.</p>

      <p>Il trattamento dei dati personali è descritto nell'<a href="#/privacy">informativa privacy</a>.</p>
    </div>`;

  return { privacy, termini, EMAIL };
})();
