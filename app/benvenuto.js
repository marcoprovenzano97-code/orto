// Primo avvio guidato: zona → prima aiuola → cosa coltivare. Compare una sola volta,
// finché l'utente non ha aiuole; si può saltare in qualsiasi momento.
window.OrtoBenvenuto = function (ctx) {
  'use strict';
  const { esc, store, state, ZONE, cassoni, impostaZona } = ctx;
  const TIPI = [
    { k: 'cassone', em: '🪵', nome: 'Cassone rialzato', l: 120, h: 240 },
    { k: 'terra', em: '🌱', nome: 'Aiuola in piena terra', l: 300, h: 180 },
    { k: 'vaso', em: '🪴', nome: 'Vaso o fioriera', l: 60, h: 90 }
  ];
  const st = { passo: 1, tipo: 'cassone', larghezza: 120, lunghezza: 240, scelte: new Set(), messaggio: '' };
  let el = null;

  // Zona climatica indicativa dalla latitudine (Nord ≥ 44,1°; Centro ≥ 41,6°; Sud e isole sotto).
  const zonaDa = lat => lat >= 44.1 ? 'nord' : lat >= 41.6 ? 'centro' : 'sud';

  function html() {
    const punti = [1, 2, 3].map(n => `<span class="bv-punto ${n === st.passo ? 'on' : n < st.passo ? 'fatto' : ''}"></span>`).join('');
    let corpo = '';
    if (st.passo === 1) {
      corpo = `
        <p class="eyebrow">Benvenuto in Ortogramma</p>
        <h2>Dove si trova il tuo orto?</h2>
        <p class="muted">Serve per i calendari di semina: le date cambiano molto tra Nord e Sud.</p>
        <div class="bv-scelte">${Object.entries(ZONE).map(([k, z]) => `
          <button class="bv-opz ${state.zona === k ? 'on' : ''}" data-zona="${k}"><strong>${esc(z.nome)}</strong><span class="muted small">${esc(z.desc)}</span></button>`).join('')}</div>
        <button class="btn" id="bvGps" style="margin-top:10px">📍 Rileva dalla posizione</button>
        ${st.messaggio ? `<p class="muted small" style="margin:8px 0 0">${esc(st.messaggio)}</p>` : ''}`;
    } else if (st.passo === 2) {
      corpo = `
        <h2>Com'è il tuo orto?</h2>
        <p class="muted">Inizia da un'aiuola: potrai aggiungerne altre dopo.</p>
        <div class="bv-scelte tipi">${TIPI.map(t => `
          <button class="bv-opz ${st.tipo === t.k ? 'on' : ''}" data-tipo="${t.k}"><span class="bv-em">${t.em}</span><strong>${t.nome}</strong></button>`).join('')}</div>
        <div class="form" style="margin-top:12px"><div class="two">
          <label>Larghezza (cm)<input id="bvL" type="number" min="30" max="720" step="10" value="${st.larghezza}"></label>
          <label>Lunghezza (cm)<input id="bvH" type="number" min="30" max="720" step="10" value="${st.lunghezza}"></label>
        </div></div>`;
    } else {
      const lista = cassoni.coltureDiStagione().sort((a, b) => a.nome.localeCompare(b.nome));
      corpo = `
        <h2>Cosa vorresti coltivare?</h2>
        <p class="muted">Queste si mettono a dimora in questa stagione nella tua zona. Scegline fino a 6: le dispongo io nell'aiuola rispettando spazi e consociazioni.</p>
        <div class="chips bv-colture">${lista.map(c => `<button class="chip ${st.scelte.has(c.id) ? 'good' : ''}" data-c="${c.id}"><span class="em">${c.emoji}</span>${esc(c.nome)}</button>`).join('')}</div>
        <p class="muted small" style="margin:10px 0 0">${st.scelte.size ? `${st.scelte.size} scelte` : 'Puoi anche lasciarla vuota e disegnarla tu.'}</p>`;
    }
    return `<div class="bv-velo"></div>
      <div class="bv-foglio" role="dialog" aria-modal="true" aria-label="Primo avvio">
        <div class="bv-testa"><div class="bv-punti">${punti}</div><button class="link" id="bvSalta">Salta</button></div>
        <div class="bv-corpo">${corpo}</div>
        <div class="bv-piede">
          ${st.passo > 1 ? '<button class="btn" id="bvIndietro">‹ Indietro</button>' : '<span></span>'}
          <button class="btn primary" id="bvAvanti">${st.passo < 3 ? 'Avanti' : st.scelte.size ? 'Crea la mia aiuola' : 'Crea l\'aiuola vuota'}</button>
        </div>
      </div>`;
  }

  function disegna() { el.innerHTML = html(); collega(); }
  function chiudi(fatto) {
    store.set('benvenuto', fatto ? 'fatto' : 'saltato');
    el.remove(); el = null;
    document.body.classList.remove('bv-aperto');
  }
  function leggiMisure() {
    const l = el.querySelector('#bvL'), h = el.querySelector('#bvH');
    if (l) st.larghezza = Math.max(30, Math.min(720, +l.value || st.larghezza));
    if (h) st.lunghezza = Math.max(30, Math.min(720, +h.value || st.lunghezza));
  }
  function collega() {
    el.querySelector('#bvSalta').onclick = () => chiudi(false);
    const ind = el.querySelector('#bvIndietro');
    if (ind) ind.onclick = () => { leggiMisure(); st.passo--; disegna(); };
    el.querySelectorAll('[data-zona]').forEach(b => b.onclick = () => { impostaZona(b.dataset.zona); st.messaggio = ''; disegna(); });
    const gps = el.querySelector('#bvGps');
    if (gps) gps.onclick = () => {
      if (!navigator.geolocation) { st.messaggio = 'Posizione non disponibile: scegli la zona qui sopra.'; return disegna(); }
      gps.disabled = true; gps.textContent = '📍 Rilevo…';
      navigator.geolocation.getCurrentPosition(
        p => { const z = zonaDa(p.coords.latitude); impostaZona(z); st.messaggio = `Zona rilevata: ${ZONE[z].nome}.`; disegna(); },
        () => { st.messaggio = 'Non riesco a leggere la posizione: scegli la zona qui sopra.'; disegna(); },
        { timeout: 15000, maximumAge: 600000 });
    };
    el.querySelectorAll('[data-tipo]').forEach(b => b.onclick = () => {
      const t = TIPI.find(x => x.k === b.dataset.tipo);
      st.tipo = t.k; st.larghezza = t.l; st.lunghezza = t.h; disegna();
    });
    const cl = el.querySelector('.bv-colture');
    if (cl) cl.onclick = e => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      if (st.scelte.has(b.dataset.c)) st.scelte.delete(b.dataset.c);
      else if (st.scelte.size < 6) st.scelte.add(b.dataset.c);
      disegna();
    };
    el.querySelector('#bvAvanti').onclick = () => {
      leggiMisure();
      if (st.passo < 3) { st.passo++; return disegna(); }
      const nome = { cassone: 'Il mio cassone', terra: 'Il mio orto', vaso: 'Il mio vaso' }[st.tipo];
      const id = cassoni.creaConColture({ nome, tipo: st.tipo, larghezza: st.larghezza, lunghezza: st.lunghezza }, [...st.scelte]);
      chiudi(true);
      location.hash = '#/cassone/' + id;
    };
  }

  return {
    // Mostra la procedura se è il primo avvio e non ci sono aiuole.
    forseMostra() {
      if (el || store.get('benvenuto', null) || cassoni.getDati().cassoni.length) return;
      el = document.createElement('div');
      el.className = 'bv';
      document.body.appendChild(el);
      document.body.classList.add('bv-aperto');
      disegna();
    }
  };
};
