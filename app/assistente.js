// Assistente dell'orto in una finestra di chat a comparsa (pulsante in basso a destra, su tutte le pagine).
// La conversazione resta sul dispositivo; al server vanno solo gli ultimi messaggi.
window.OrtoAssistente = function (ctx) {
  'use strict';
  const { esc, store, account } = ctx;
  const MAX_SALVATI = 40;
  const SUGGERITE = [
    'Cosa posso seminare o trapiantare questa settimana?',
    'Le foglie delle zucchine hanno una polvere bianca: cosa faccio?',
    'Posso mettere l\'aglio dove c\'erano i pomodori?',
    'Come preparo il terreno per l\'inverno?'
  ];
  let chat = store.get('chat', []);
  let attesa = false, errore = '', invito = false, rimasti = null, aperto = false, bozza = '';

  // Pulsante e finestra
  const fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.setAttribute('aria-label', 'Apri l\'assistente dell\'orto');
  fab.innerHTML = '<span aria-hidden="true">💬</span>';
  const box = document.createElement('div');
  box.className = 'chat-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Assistente dell\'orto');
  box.hidden = true;
  document.body.append(fab, box);
  fab.onclick = () => apri();

  const salvaChat = () => { chat = chat.slice(-MAX_SALVATI); store.set('chat', chat); };

  // Formattazione minima: **grassetto**, elenchi "- ", a capo. Il testo è sempre prima reso sicuro.
  function formatta(t) {
    const righe = esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split('\n');
    let h = '', lista = false;
    righe.forEach(r => {
      const m = r.match(/^\s*[-•]\s+(.*)/);
      if (m) { if (!lista) { h += '<ul>'; lista = true; } h += `<li>${m[1]}</li>`; return; }
      if (lista) { h += '</ul>'; lista = false; }
      if (r.trim()) h += `<p>${r}</p>`;
    });
    return h + (lista ? '</ul>' : '');
  }

  function contenuto() {
    const testa = `<div class="chat-testa">
      <span class="chat-avatar">🌱</span>
      <span class="chat-titolo"><strong>Assistente dell'orto</strong><span class="small">Conosce le tue aiuole, la zona e il meteo</span></span>
      ${chat.length && account.utente() ? '<button class="chat-ic" id="chatNuova" title="Nuova conversazione" aria-label="Nuova conversazione">↺</button>' : ''}
      <button class="chat-ic" id="chatChiudi" aria-label="Chiudi">✕</button>
    </div>`;
    if (!account.attivo) return testa + '<div class="chat-corpo"><p>L\'assistente è in arrivo.</p></div>';
    if (!account.utente()) {
      return testa + `<div class="chat-corpo"><div class="chat-vuota">
        <p><strong>Chiedi qualsiasi cosa sul tuo orto.</strong> L'assistente conosce le tue aiuole, le colture, la tua zona e il meteo, e risponde in modo personale.</p>
        <p class="muted small">Con un account gratuito hai 3 domande al mese; con Premium 50.</p>
        <a class="btn primary" href="#/account" id="chatAccedi">Accedi o crea un account</a>
      </div></div>`;
    }
    const premium = account.premium();
    const msg = chat.map(m => `<div class="bolla ${m.ruolo === 'utente' ? 'io' : 'lui'}">${m.ruolo === 'utente' ? `<p>${esc(m.testo)}</p>` : formatta(m.testo)}</div>`).join('');
    return testa + `
      <div class="chat-corpo" id="chatCorpo">
        ${chat.length ? '' : `<div class="chat-vuota">
          <p><strong>Ciao! Sono l'assistente del tuo orto.</strong> Conosco le tue aiuole, cosa hai piantato e quando, la tua zona e il meteo dei prossimi giorni. Chiedimi pure.</p>
          <div class="chips">${SUGGERITE.map(s => `<button class="chip" data-sugg="${esc(s)}">${esc(s)}</button>`).join('')}</div>
        </div>`}
        ${msg}
        ${attesa ? '<div class="bolla lui attesa"><span class="ck-spinner"></span> Sto pensando…</div>' : ''}
        ${errore ? `<p class="note err">${esc(errore)}${invito ? ' <a href="#/account">Scopri il Premium</a>' : ''}</p>` : ''}
      </div>
      <form class="chat-invio" id="chatForm">
        <textarea name="testo" rows="1" maxlength="2000" placeholder="Scrivi una domanda sul tuo orto…" ${attesa ? 'disabled' : ''}>${esc(bozza)}</textarea>
        <button class="btn primary" type="submit" ${attesa ? 'disabled' : ''} aria-label="Invia">➤</button>
      </form>
      <div class="chat-piede muted small">${rimasti != null
        ? `${premium ? 'Messaggi' : 'Domande gratuite'} rimast${premium ? 'i' : 'e'} questo mese: ${rimasti}`
        : premium ? 'Fino a 50 messaggi al mese.' : '3 domande gratuite al mese · <a href="#/account">con Premium 50</a>'}
        · Risposte generate dall'IA: verifica le indicazioni importanti.</div>`;
  }

  function scorri() { const c = box.querySelector('#chatCorpo'); if (c) c.scrollTop = c.scrollHeight; }

  function disegna() {
    const ta = box.querySelector('textarea');
    if (ta) bozza = ta.value;
    box.innerHTML = contenuto();
    collega();
    scorri();
  }

  function collega() {
    box.querySelector('#chatChiudi').onclick = chiudi;
    const accedi = box.querySelector('#chatAccedi');
    if (accedi) accedi.onclick = () => chiudi();
    box.querySelectorAll('a[href^="#/"]').forEach(a => { if (a !== accedi) a.addEventListener('click', () => chiudi()); });
    const nuova = box.querySelector('#chatNuova');
    if (nuova) nuova.onclick = () => { if (confirm('Iniziare una nuova conversazione? Quella attuale verrà cancellata da questo dispositivo.')) { chat = []; salvaChat(); errore = ''; disegna(); } };
    box.querySelectorAll('[data-sugg]').forEach(b => b.onclick = () => invia(b.dataset.sugg));
    const form = box.querySelector('#chatForm');
    if (!form) return;
    const ta = form.testo;
    const altezza = () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; };
    altezza();
    form.onsubmit = e => { e.preventDefault(); invia(ta.value); };
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); invia(ta.value); } });
    ta.addEventListener('input', () => { bozza = ta.value; altezza(); });
  }

  async function invia(testo) {
    testo = testo.trim();
    if (!testo || attesa) return;
    chat.push({ ruolo: 'utente', testo }); salvaChat();
    attesa = true; errore = ''; invito = false; bozza = '';
    if (aperto) { box.innerHTML = contenuto(); collega(); scorri(); }
    try {
      const r = await account.assistente(chat.slice(-12));
      chat.push({ ruolo: 'assistente', testo: r.testo }); salvaChat();
      rimasti = r.rimasti;
    } catch (e) {
      errore = e.message; invito = !!e.invitoPremium;
      chat.pop(); salvaChat();
      bozza = testo;                    // la domanda non è stata elaborata: la rimetto nel campo
    }
    attesa = false;
    if (aperto) { box.innerHTML = contenuto(); collega(); scorri(); }
    else fab.classList.add('nuovo');    // risposta arrivata a finestra chiusa
  }

  function apri() {
    aperto = true;
    box.hidden = false; fab.hidden = true; fab.classList.remove('nuovo');
    document.body.classList.add('chat-aperta');
    box.innerHTML = contenuto(); collega(); scorri();
    const ta = box.querySelector('textarea');
    if (ta && window.matchMedia('(min-width: 601px)').matches) ta.focus();
  }
  function chiudi() {
    const ta = box.querySelector('textarea');
    if (ta) bozza = ta.value;
    aperto = false;
    box.hidden = true; fab.hidden = false;
    document.body.classList.remove('chat-aperta');
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && aperto) chiudi(); });

  // Se cambia l'accesso (login, Premium) con la finestra aperta, la ridisegno.
  return { apri, chiudi, aggiorna() { if (aperto) disegna(); } };
};
