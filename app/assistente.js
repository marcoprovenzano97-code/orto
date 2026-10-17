// Assistente dell'orto: chat con risposte personalizzate sul proprio orto (Premium).
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
  let attesa = false, errore = '', rimasti = null;

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

  function view() {
    if (!account.attivo) return '<div class="card"><p style="margin:0">L\'assistente è in arrivo.</p></div>';
    if (!account.utente() || !account.premium()) {
      return `<a class="card premium-teaser" href="#/account">
        <span class="pt-icon">💬</span>
        <span><strong>Chiedi qualsiasi cosa sul tuo orto</strong><span class="muted small" style="display:block">L'assistente conosce le tue aiuole, le colture, la tua zona e il meteo, e risponde in modo personale. Disponibile con Premium.</span></span>
        <span class="chev">›</span></a>`;
    }
    const msg = chat.map(m => `<div class="bolla ${m.ruolo === 'utente' ? 'io' : 'lui'}">${m.ruolo === 'utente' ? `<p>${esc(m.testo)}</p>` : formatta(m.testo)}</div>`).join('');
    return `
      <div class="chat" id="chat">
        ${chat.length ? '' : `<div class="chat-vuota">
          <p><strong>Ciao! Sono l'assistente del tuo orto.</strong> Conosco le tue aiuole, cosa hai piantato, la tua zona e il meteo dei prossimi giorni. Chiedimi pure.</p>
          <div class="chips">${SUGGERITE.map(s => `<button class="chip" data-sugg="${esc(s)}">${esc(s)}</button>`).join('')}</div>
        </div>`}
        ${msg}
        ${attesa ? '<div class="bolla lui attesa"><span class="ck-spinner"></span> Sto pensando…</div>' : ''}
        ${errore ? `<p class="note err">${esc(errore)}</p>` : ''}
      </div>
      <form class="chat-invio" id="chatForm">
        <textarea name="testo" rows="1" maxlength="2000" placeholder="Scrivi una domanda sul tuo orto…" ${attesa ? 'disabled' : ''}></textarea>
        <button class="btn primary" type="submit" ${attesa ? 'disabled' : ''} aria-label="Invia">➤</button>
      </form>
      <div class="chat-piede muted small">
        <span>${rimasti != null ? `Messaggi rimasti questo mese: ${rimasti}` : 'Fino a 50 messaggi al mese.'}</span>
        ${chat.length ? '<button class="link" id="chatNuova">Nuova conversazione</button>' : ''}
      </div>
      <p class="muted small" style="margin:6px 0 0">Le risposte sono generate con l'intelligenza artificiale e possono contenere errori: verifica le indicazioni importanti.</p>`;
  }

  function bind(root) {
    const form = root.querySelector('#chatForm');
    if (!form) return;
    const ta = form.testo;
    const scorri = () => { const c = root.querySelector('#chat'); if (c && c.lastElementChild) c.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' }); };
    const ridisegna = () => { const y = window.scrollY; ctx.rerender(); window.scrollTo(0, y); };
    async function invia(testo) {
      testo = testo.trim();
      if (!testo || attesa) return;
      chat.push({ ruolo: 'utente', testo }); salvaChat();
      attesa = true; errore = '';
      ridisegna(); setTimeout(scorri, 50);
      try {
        const r = await account.assistente(chat.slice(-12));
        chat.push({ ruolo: 'assistente', testo: r.testo }); salvaChat();
        rimasti = r.rimasti;
      } catch (e) {
        errore = e.message;
        chat.pop(); salvaChat();          // la domanda non è stata elaborata: la rimetto nel campo
        setTimeout(() => { const t = document.querySelector('#chatForm textarea'); if (t) t.value = testo; }, 0);
      }
      attesa = false;
      if (location.hash === '#/assistente') { ridisegna(); setTimeout(scorri, 50); }
    }
    form.onsubmit = e => { e.preventDefault(); invia(ta.value); };
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); invia(ta.value); } });
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(160, ta.scrollHeight) + 'px'; });
    root.querySelectorAll('[data-sugg]').forEach(b => b.onclick = () => invia(b.dataset.sugg));
    const nuova = root.querySelector('#chatNuova');
    if (nuova) nuova.onclick = () => { if (confirm('Cancellare la conversazione da questo dispositivo?')) { chat = []; salvaChat(); errore = ''; ridisegna(); } };
    if (chat.length) setTimeout(scorri, 50);
  }

  return { view, bind };
};
