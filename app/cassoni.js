// Modulo "I miei cassoni": anagrafica cassoni, storico per stagione, rotazione e progetto su griglia.
// I dati restano sul dispositivo (localStorage "orto.cassoni"); esporta/importa per il backup.
window.OrtoCassoni = function (ctx) {
  'use strict';
  const { C, BY_ID, FAM, ESIG, ZONE, store, state, esc, inMese, famDot, chip, relazioni, PERENNI, ROTAZIONE, areaPianta, account, rerender } = ctx;
  const LIMITE_GRATIS = 1;  // aiuole nel piano gratuito (solo quando gli account sono attivi)
  const limitato = () => account.attivo && !account.premium() && dati.cassoni.length >= LIMITE_GRATIS;

  const TIPI = {
    cassone: { nome: 'Cassone rialzato' },
    terra:   { nome: 'Piena terra' },
    vaso:    { nome: 'Vaso / fioriera' }
  };
  const tipoDi = cs => TIPI[cs.tipo] ? cs.tipo : 'cassone';

  const CELLA = 30;                     // lato della cella in cm
  const CELLA_AREA = CELLA * CELLA;
  const MAX_CELLE = 24;                 // per lato
  // Piante che crescono in altezza (o vanno tutorate) e fanno ombra a chi sta a nord.
  const ALTE = new Set(['pomodoro', 'mais', 'cetriolo', 'fagiolo', 'fava', 'carciofo', 'asparago']);

  const dati = store.get('cassoni', null) || { cassoni: [] };
  function salva() {
    dati.aggiornato = new Date().toISOString();
    store.set('cassoni', dati);
    account.datiSalvati(dati);
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const trova = id => dati.cassoni.find(x => x.id === id);

  // ── Stagioni ─────────────────────────────────────────────
  // PE = impianti da febbraio a giugno; AI = impianti da luglio a gennaio.
  const MESI_STAG = { PE: [2, 3, 4, 5, 6], AI: [7, 8, 9, 10, 11, 12, 1] };
  function stagioneDa(d) {
    const m = d.getMonth() + 1, y = d.getFullYear();
    if (m >= 2 && m <= 6) return y + '-PE';
    return (m >= 7 ? y : y - 1) + '-AI';
  }
  const ord = k => { const [a, s] = k.split('-'); return +a * 2 + (s === 'AI' ? 1 : 0); };
  const daOrd = o => Math.floor(o / 2) + '-' + (o % 2 ? 'AI' : 'PE');
  function etichetta(k) {
    const [a, s] = k.split('-');
    return s === 'PE' ? `Primavera-estate ${a}` : `Autunno-inverno ${a}/${String(+a + 1).slice(2)}`;
  }
  function etichettaBreve(k) {
    const [a, s] = k.split('-');
    return s === 'PE' ? `prim.-est. ${a}` : `aut.-inv. ${a}/${String(+a + 1).slice(2)}`;
  }
  const OGGI = stagioneDa(new Date());
  if (!state.stagione) state.stagione = OGGI;

  // La coltura si mette a dimora (trapianto o semina diretta) in questa stagione, nella zona scelta?
  const adatta = (c, k) => ['dir', 'tra'].some(a => MESI_STAG[k.split('-')[1]].some(m => inMese(c, state.zona, a, m)));

  // ── Dati di un cassone ───────────────────────────────────
  function piano(cs, k, crea) {
    cs.piani = cs.piani || {};
    if (!cs.piani[k] && crea) cs.piani[k] = { celle: {}, extra: [] };
    return cs.piani[k];
  }
  const coltureDi = p => p ? [...new Set([...Object.values(p.celle || {}), ...(p.extra || [])])].filter(id => BY_ID[id]) : [];
  const dimensioni = cs => ({ cols: Math.min(MAX_CELLE, Math.max(1, Math.round(cs.larghezza / CELLA))), rows: Math.min(MAX_CELLE, Math.max(1, Math.round(cs.lunghezza / CELLA))) });

  // Stagioni precedenti a k (fino a 3 anni) con qualcosa coltivato, dalla più recente.
  function storiaPrima(cs, k) {
    const out = [];
    for (let o = ord(k) - 1; o >= ord(k) - 6; o--) {
      const kk = daOrd(o), col = coltureDi((cs.piani || {})[kk]);
      if (col.length) out.push({ k: kk, colture: col });
    }
    return out;
  }
  function famRecenti(cs, k) {
    const m = new Map();
    storiaPrima(cs, k).forEach(s => s.colture.forEach(id => { const f = BY_ID[id].fam; if (!m.has(f)) m.set(f, s.k); }));
    return m;
  }
  // Esigenza prevalente dell'ultima stagione coltivata → quella che tocca adesso.
  function rotazione(cs, k) {
    const prec = storiaPrima(cs, k).find(s => s.colture.some(id => !PERENNI.has(id)));
    if (!prec) return null;
    const p = cs.piani[prec.k], peso = {};
    Object.values(p.celle || {}).forEach(id => { if (BY_ID[id] && !PERENNI.has(id)) peso[BY_ID[id].esig] = (peso[BY_ID[id].esig] || 0) + 1; });
    (p.extra || []).forEach(id => { if (BY_ID[id] && !PERENNI.has(id)) peso[BY_ID[id].esig] = (peso[BY_ID[id].esig] || 0) + 1; });
    const prevalente = Object.keys(peso).sort((a, b) => peso[b] - peso[a])[0];
    return { k: prec.k, prevalente, tocca: ROTAZIONE[(ROTAZIONE.indexOf(prevalente) + 1) % 4] };
  }
  function valuta(c, cs, k, fr, rot) {
    if (fr.has(c.fam) && !cs.perenne) return { cat: 'evita', motivo: `${FAM[c.fam].nome} già qui in ${etichettaBreve(fr.get(c.fam))}` };
    if (PERENNI.has(c.id) && !cs.perenne) return { cat: 'possibile', motivo: 'perenne: meglio un\'aiuola dedicata' };
    if (rot && c.esig === rot.tocca) return { cat: 'consigliata', motivo: ESIG[c.esig].nome };
    return { cat: 'possibile', motivo: ESIG[c.esig].nome };
  }

  // ── Analisi del progetto ─────────────────────────────────
  const nemicheCache = {}, amicheCache = {};
  const nemiche = id => nemicheCache[id] || (nemicheCache[id] = new Set(relazioni(BY_ID[id], 'nemiche').map(o => o.id)));
  const amiche = id => amicheCache[id] || (amicheCache[id] = new Set(relazioni(BY_ID[id], 'amiche').map(o => o.id)));
  const nome = id => `${BY_ID[id].emoji} ${esc(BY_ID[id].nome)}`;

  function analizza(cs, k) {
    const p = piano(cs, k) || { celle: {}, extra: [] };
    const { cols, rows } = dimensioni(cs);
    const celle = p.celle, conf = new Set(), avvisi = [], visti = new Set(), buone = new Set();
    const at = (r, c) => celle[r + ',' + c];

    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const a = at(r, c);
      if (!a || !BY_ID[a]) continue;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const b = at(r + dr, c + dc);
        if (!b || b === a || !BY_ID[b]) continue;
        const coppia = [a, b].sort().join('|');
        if (nemiche(a).has(b)) {
          conf.add(r + ',' + c); conf.add((r + dr) + ',' + (c + dc));
          if (!visti.has(coppia)) { visti.add(coppia); avvisi.push({ t: 'bad', h: `${nome(a)} e ${nome(b)} sono vicini: meglio separarli.` }); }
        } else if (amiche(a).has(b)) buone.add(coppia);
      }
      // Ombra: pianta alta a sud (riga più in basso) di una bassa nella stessa colonna.
      if (ALTE.has(a)) {
        for (let rr = 0; rr < r; rr++) {
          const b = at(rr, c);
          if (b && BY_ID[b] && !ALTE.has(b)) {
            const key = 'ombra|' + a + '|' + b;
            if (!visti.has(key)) { visti.add(key); avvisi.push({ t: 'warn', h: `${nome(a)} è a sud di ${nome(b)} e gli farà ombra: sposta le piante alte sul lato nord (in alto).` }); }
          }
        }
      }
    }

    const conteggio = {};
    Object.entries(celle).forEach(([rc, id]) => {
      const [r, c] = rc.split(',').map(Number);
      if (r < rows && c < cols && BY_ID[id]) conteggio[id] = (conteggio[id] || 0) + 1;
    });
    const riepilogo = Object.entries(conteggio).map(([id, n]) => ({ id, n, piante: n * CELLA_AREA / areaPianta(BY_ID[id]) }))
      .sort((a, b) => BY_ID[a.id].nome.localeCompare(BY_ID[b.id].nome));
    riepilogo.forEach(x => {
      if (x.piante < 1) {
        const servono = Math.ceil(areaPianta(BY_ID[x.id]) / CELLA_AREA);
        avvisi.push({ t: 'warn', h: `${nome(x.id)} ha bisogno di circa ${servono} celle per pianta: ne hai ${x.n}.` });
      }
    });

    const fr = famRecenti(cs, k);
    if (!cs.perenne) {
      const famUsate = new Set(coltureDi(p).map(id => BY_ID[id].fam));
      famUsate.forEach(f => { if (fr.has(f)) avvisi.push({ t: 'bad', h: `Rotazione: le ${FAM[f].nome} erano già in questa aiuola in ${etichettaBreve(fr.get(f))}.` }); });
    }
    coltureDi(p).forEach(id => {
      if (!adatta(BY_ID[id], k)) avvisi.push({ t: 'info', h: `${nome(id)} di solito non si mette a dimora in questa stagione (zona ${esc(ZONE[state.zona].nome)}).` });
    });
    if (buone.size) {
      avvisi.push({ t: 'good', h: `Vicinanze favorevoli: ${[...buone].map(cp => cp.split('|').map(id => BY_ID[id].emoji).join(' + ')).join(', ')}.` });
    }
    return { conf, avvisi, riepilogo };
  }

  // ── Vista isometrica ─────────────────────────────────────
  // Cassone in legno su una zolla di prato, con gli strati di terra in sezione.
  // Nord in fondo (riga 0), come nella griglia di progetto.
  function isoSVG(cs, k, mini) {
    const { cols, rows } = dimensioni(cs);
    const p = piano(cs, k) || { celle: {} };
    const tipo = tipoDi(cs);
    // Altezza e colori dei bordi: legno (cassone), terra smossa (piena terra), terracotta (vaso)
    const stile = {
      cassone: { H: 15, sx: '#a06f45', dx: '#82573a', bordo: '#c08c5c', bw: 3.5, assi: true, prato: '#a9c97a' },
      terra:   { H: 4,  sx: '#6e4f36', dx: '#5a402b', bordo: '#7a5a3e', bw: 1.5, assi: false, prato: '#a9c97a' },
      vaso:    { H: 24, sx: '#c46a43', dx: '#a4532f', bordo: '#e08f66', bw: 4, assi: true, prato: '#d8cdbd' }
    }[tipo];
    const a = 20, b = 11.5, H = stile.H, G = 0.75, GH = 22;
    const P = (c, r, z = 0) => [(c - r) * a, (c + r) * b - z];
    const giu = (q, d) => [q[0], q[1] + d];
    const pt = qs => qs.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
    const poly = (qs, fill, extra = '') => `<polygon points="${pt(qs)}" fill="${fill}" ${extra}/>`;
    const lato = (q1, q2, d0, d1, fill) => poly([giu(q1, d0), giu(q2, d0), giu(q2, d1), giu(q1, d1)], fill);

    const g0 = -G, gc = cols + G, gr = rows + G;
    let s = '';
    // Zolla: fianchi a strati (erba, terra, argilla, sabbia) e prato sopra
    [[0, 4, '#7fa04e', '#6b8a40'], [4, 10, '#6e4f36', '#5a402b'], [10, 16, '#a7835a', '#8f6f4a'], [16, GH, '#d6c3a0', '#bfa985']].forEach(([d0, d1, sx, dx]) => {
      s += lato(P(g0, gr), P(gc, gr), d0, d1, sx);
      s += lato(P(gc, g0), P(gc, gr), d0, d1, dx);
    });
    s += poly([P(g0, g0), P(gc, g0), P(gc, gr), P(g0, gr)], stile.prato);

    // Cassone: fianchi in legno con le assi
    s += poly([P(0, rows, H), P(cols, rows, H), P(cols, rows), P(0, rows)], stile.sx);
    s += poly([P(cols, 0, H), P(cols, rows, H), P(cols, rows), P(cols, 0)], stile.dx);
    const asse = (q1, q2) => `<line x1="${q1[0].toFixed(1)}" y1="${(q1[1]).toFixed(1)}" x2="${q2[0].toFixed(1)}" y2="${q2[1].toFixed(1)}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>`;
    if (stile.assi) s += asse(P(0, rows, H / 2), P(cols, rows, H / 2)) + asse(P(cols, 0, H / 2), P(cols, rows, H / 2));
    // Terra con bordo superiore delle assi
    s += poly([P(0, 0, H), P(cols, 0, H), P(cols, rows, H), P(0, rows, H)], '#5e3f29', `stroke="${stile.bordo}" stroke-width="${stile.bw}" stroke-linejoin="round"`);
    if (!mini) {
      for (let c = 1; c < cols; c++) s += `<line x1="${P(c, 0, H)[0]}" y1="${P(c, 0, H)[1]}" x2="${P(c, rows, H)[0]}" y2="${P(c, rows, H)[1]}" stroke="rgba(255,255,255,.07)"/>`;
      for (let r = 1; r < rows; r++) s += `<line x1="${P(0, r, H)[0]}" y1="${P(0, r, H)[1]}" x2="${P(cols, r, H)[0]}" y2="${P(cols, r, H)[1]}" stroke="rgba(255,255,255,.07)"/>`;
    }

    // Piante, dalla più lontana alla più vicina
    const piante = Object.entries(p.celle).map(([rc, id]) => { const [r, c] = rc.split(',').map(Number); return { r, c, id }; })
      .filter(x => x.r < rows && x.c < cols && BY_ID[x.id])
      .sort((x, y) => (x.r + x.c) - (y.r + y.c) || x.c - y.c);
    piante.forEach(({ r, c, id }) => {
      const [cx, cy] = P(c + .5, r + .5, H);
      const alta = ALTE.has(id), fs = alta ? 25 : 19;
      s += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${a * .5}" ry="${b * .5}" fill="rgba(0,0,0,.28)"/>`;
      if (alta) s += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy - 34).toFixed(1)}" stroke="#c9a77a" stroke-width="1.6"/>`;
      s += `<text x="${cx.toFixed(1)}" y="${(cy + 2 - (alta ? 6 : 0)).toFixed(1)}" font-size="${fs}" text-anchor="middle">${BY_ID[id].emoji}</text>`;
    });

    const minX = P(g0, gr)[0] - 4, maxX = P(gc, g0)[0] + 4;
    const minY = P(g0, g0)[1] - (piante.length ? 40 : 6), maxY = P(gc, gr)[1] + GH + 4;
    const titolo = `${cs.nome}, vista 3D`;
    return `<svg class="iso" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}" role="img" aria-label="${esc(titolo)}">${s}</svg>`;
  }

  // ── Lista cassoni ────────────────────────────────────────
  function viewLista() {
    const righe = dati.cassoni.map(cs => {
      const { cols, rows } = dimensioni(cs);
      const col = coltureDi(piano(cs, OGGI));
      const rot = cs.perenne ? null : rotazione(cs, OGGI);
      return `<a class="row" href="#/cassone/${cs.id}">
        <span class="thumb">${isoSVG(cs, OGGI, true)}</span>
        <span class="body">
          <span class="name">${esc(cs.nome)}</span>
          <span class="muted small" style="display:block">${TIPI[tipoDi(cs)].nome} · ${cs.larghezza} × ${cs.lunghezza} cm${cs.perenne ? ' · perenni' : ''}</span>
          <span class="meta">
            ${col.length ? `<span class="pill">${col.map(id => BY_ID[id].emoji).join(' ')}</span>` : '<span class="pill">vuoto questa stagione</span>'}
            ${rot ? `<span class="pill now-badge">Tocca a: ${esc(ESIG[rot.tocca].nome.toLowerCase())}</span>` : ''}
          </span>
        </span>
        <span class="chev">›</span>
      </a>`;
    }).join('');
    return `
      <div class="stack">
        <p class="muted small" style="margin:0">Stagione attuale: <strong>${etichetta(OGGI)}</strong></p>
        ${dati.cassoni.length ? `<div class="list">${righe}</div>` : `
          <div class="card">
            <p style="margin-top:0"><strong>Crea la tua prima aiuola</strong> qui sotto (cassone rialzato, piena terra o vaso): dentro trovi</p>
            <ul class="clean">
              <li>i suggerimenti di rotazione basati su cosa c'era negli anni scorsi;</li>
              <li><strong>✏️ Disegna l'aiuola</strong>: una griglia (celle da 30 cm) dove disponi le colture, con il controllo di consociazioni, spazi e ombra e la vista 3D.</li>
            </ul>
          </div>`}
        ${limitato() ? `
        <a class="card premium-teaser" href="#/account">
          <span class="pt-icon">✨</span>
          <span><strong>Vuoi altre aiuole?</strong><span class="muted small" style="display:block">Il piano gratuito include ${LIMITE_GRATIS} aiuola. Con Premium sono illimitate, sincronizzate tra i tuoi dispositivi e con promemoria e avvisi meteo.</span></span>
          <span class="chev">›</span>
        </a>` : `
        <details class="card" id="nuovo" ${dati.cassoni.length ? '' : 'open'}>
          <summary><strong>+ Nuova aiuola</strong></summary>
          ${formCassone({ nome: `Aiuola ${dati.cassoni.length + 1}`, tipo: 'cassone', larghezza: 120, lunghezza: 240 }, 'Aggiungi')}
        </details>`}
        <section class="card">
          <div class="section-title"><h2>💾 Backup</h2></div>
          <p class="muted small" style="margin:0 0 10px">${account.premium() ? 'Le aiuole sono sincronizzate nel tuo account. Puoi comunque esportarne una copia.' : 'I dati sono salvati solo su questo dispositivo. Esporta un backup ogni tanto, o per passarli su un altro telefono.'}</p>
          <div class="btns">
            <button class="btn" id="esporta" ${dati.cassoni.length ? '' : 'disabled'}>Esporta</button>
            <label class="btn">Importa<input type="file" id="importa" accept="application/json,.json" hidden></label>
          </div>
        </section>
      </div>`;
  }
  function formCassone(cs, azione) {
    return `<form class="form" data-form="cassone">
      <label>Nome<input name="nome" required maxlength="40" value="${esc(cs.nome)}"></label>
      <label>Tipo<select name="tipo">${Object.entries(TIPI).map(([k, t]) => `<option value="${k}" ${tipoDi(cs) === k ? 'selected' : ''}>${t.nome}</option>`).join('')}</select></label>
      <div class="two">
        <label>Larghezza (cm)<input name="larghezza" type="number" min="30" max="${MAX_CELLE * CELLA}" step="10" required value="${cs.larghezza}"></label>
        <label>Lunghezza (cm)<input name="lunghezza" type="number" min="30" max="${MAX_CELLE * CELLA}" step="10" required value="${cs.lunghezza}"></label>
      </div>
      <label class="toggle"><input type="checkbox" name="perenne" ${cs.perenne ? 'checked' : ''}> Aiuola per colture perenni (asparago, carciofo, fragola): esclusa dalla rotazione</label>
      <button class="btn primary" type="submit">${azione}</button>
    </form>`;
  }
  const leggiForm = f => ({
    nome: f.nome.value.trim() || 'Aiuola',
    tipo: TIPI[f.tipo.value] ? f.tipo.value : 'cassone',
    larghezza: Math.max(30, Math.min(MAX_CELLE * CELLA, +f.larghezza.value || 120)),
    lunghezza: Math.max(30, Math.min(MAX_CELLE * CELLA, +f.lunghezza.value || 240)),
    perenne: f.perenne.checked
  });
  function bindLista(root) {
    const f = root.querySelector('form[data-form="cassone"]');
    if (f) f.onsubmit = e => {
      e.preventDefault();
      if (limitato()) { location.hash = '#/account'; return; }
      const cs = Object.assign({ id: uid(), piani: {} }, leggiForm(f));
      dati.cassoni.push(cs); salva();
      location.hash = '#/cassone/' + cs.id;
    };
    root.querySelector('#esporta').onclick = () => {
      const blob = new Blob([JSON.stringify({ app: 'orto', versione: 1, esportato: new Date().toISOString(), ...dati }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `orto-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    root.querySelector('#importa').onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      file.text().then(t => {
        const j = JSON.parse(t);
        if (!Array.isArray(j.cassoni)) throw new Error('formato');
        if (!confirm(`Importare ${j.cassoni.length} aiuole? I dati attuali su questo dispositivo verranno sostituiti.`)) return;
        dati.cassoni = j.cassoni; salva(); rerender();
      }).catch(() => alert('File non valido: serve un backup esportato da questa app.'));
    };
  }

  // ── Dettaglio cassone ────────────────────────────────────
  const ui = { pennello: null, tutte: false, registra: false };

  function viewCassone(id) {
    const cs = trova(id);
    if (!cs) return `<p>Aiuola non trovata. <a href="#/cassoni">Torna al tuo orto</a></p>`;
    const k = state.stagione;
    const { cols, rows } = dimensioni(cs);
    return `
      <div class="stack">
        <div class="iso-hero">
          <div class="iso-stage">${isoSVG(cs, k)}</div>
          <p class="tagline">${(n => n ? `${n} ${n === 1 ? 'coltura' : 'colture'} in campo` : 'Pronta da progettare')(coltureDi(piano(cs, k)).length)} · ${cols}×${rows} celle da ${CELLA} cm${cs.perenne ? ' · perenni' : ''}</p>
          <button class="btn primary hero-cta" id="vaiDisegna">✏️ Disegna l'aiuola</button>
        </div>
        ${account.attivo ? `
        <section class="card" id="irrCard">${htmlIrrigazione(cs, null)}</section>
        <section class="card" id="ckCard">${htmlCheckup(cs)}</section>` : ''}
        <details class="card">
          <summary>Modifica aiuola</summary>
          ${formCassone(cs, 'Salva')}
          <button class="btn danger" id="elimina" style="margin-top:10px">Elimina aiuola</button>
        </details>

        <div class="month-head">
          <button class="iconbtn" data-stag="-1" aria-label="Stagione precedente">‹</button>
          <div style="text-align:center">
            <h1 style="font-size:1.15rem">${etichetta(k)}</h1>
            <div class="sub">${k === OGGI ? 'stagione attuale' : `<a href="#" id="oggi">torna alla stagione attuale</a>`}</div>
          </div>
          <button class="iconbtn" data-stag="1" aria-label="Stagione successiva">›</button>
        </div>

        <section class="card" id="rotCard">${htmlRotazione(cs, k)}</section>

        <section class="card">
          <div class="section-title" id="disegna"><h2>✏️ Disegna l'aiuola</h2></div>
          <div id="palette">${htmlPalette(cs, k)}</div>
          <div class="grid-wrap">
            <div class="nord">↑ Nord</div>
            <div class="grid ${ui.pennello ? 'painting' : ''}" id="grid" style="grid-template-columns:repeat(${cols},1fr);max-width:${cols * 52}px">${htmlCelle(cs, k)}</div>
          </div>
          <div id="riepilogo"></div>
        </section>

        <section class="card">
          <div class="section-title"><h2>🔎 Controlli</h2></div>
          <div id="avvisi"></div>
        </section>

        <section class="card" id="raccoltiCard">${htmlRaccolti(cs)}</section>

        <section class="card">
          <div class="section-title"><h2>🗂️ Storico dell'aiuola</h2></div>
          ${htmlStorico(cs)}
          ${ui.registra ? htmlRegistra() : `<button class="btn" id="apriRegistra" style="margin-top:10px">+ Registra una stagione passata</button>`}
        </section>
      </div>`;
  }

  // ── Diario dei raccolti (premium) ───────────────────────
  const oggiISO = () => window.OrtoPromemoria.isoGiorno(new Date());

  // ── Irrigazione in litri (premium) ──────────────────────
  function htmlIrrigazione(cs, stato) {
    const titolo = '<div class="section-title"><h2>💧 Irrigazione oggi</h2></div>';
    if (!account.premium()) {
      return titolo + '<p class="muted small" style="margin:0">Quanti litri servono oggi a questa aiuola, calcolati dal meteo del tuo comune, dalle colture e dal tipo di aiuola. <a href="#/account">Disponibile con Premium</a>.</p>';
    }
    if (!account.haComune()) return titolo + '<p class="muted small" style="margin:0"><a href="#/account">Imposta il tuo comune</a> per calcolare l\'acqua che serve.</p>';
    if (!stato) return titolo + '<p class="muted small" style="margin:0">Calcolo in corso…</p>';
    if (stato.errore) return titolo + `<p class="muted small" style="margin:0">${esc(stato.errore)}</p>`;
    const ir = stato.ir, P = window.OrtoPromemoria;
    const pulsante = cs.irrigata === oggiISO()
      ? '<p class="muted small" style="margin:10px 0 0">✅ Annaffiata oggi.</p>'
      : '<button class="btn" id="hoAnnaffiato" style="margin-top:12px">💧 Ho annaffiato oggi</button>';
    if (!ir) return titolo + '<p class="muted small" style="margin:0">Disegna o registra le colture di questa stagione per calcolare l\'acqua.</p>' + pulsante;
    let corpo;
    if (ir.serve) {
      corpo = `<p class="irr-litri"><strong>${ir.litri} litri</strong>${P.annaffiatoi(ir.litri)}</p>
        <p class="muted small" style="margin:0">Mancano circa ${ir.mm} mm d'acqua su ${String(ir.area).replace('.', ',')} m² coltivati, ${ir.giorni === 1 ? 'da ieri' : `negli ultimi ${ir.giorni} giorni`}. Annaffia la sera o al mattino presto, al piede.</p>`;
    } else if (ir.pioggiaOggi >= 5) {
      corpo = `<p class="irr-litri"><strong>Non serve</strong></p><p class="muted small" style="margin:0">Oggi sono previsti ${Math.round(ir.pioggiaOggi)} mm di pioggia.</p>`;
    } else {
      corpo = `<p class="irr-litri"><strong>Non serve</strong></p><p class="muted small" style="margin:0">Il terreno ha ancora acqua a sufficienza${ir.mm > 0 ? ` (mancano solo ${ir.mm} mm)` : ''}.</p>`;
    }
    return titolo + corpo + pulsante +
      '<p class="muted small" style="margin:10px 0 0">Stima indicativa: se il terreno a 3–5 cm è ancora umido, aspetta.</p>';
  }
  async function aggiornaIrrigazione(root, cs) {
    const el = root.querySelector('#irrCard');
    if (!el || !account.premium() || !account.haComune()) return;
    let stato;
    try {
      const m = await account.meteoUtente();
      stato = { ir: window.OrtoPromemoria.irrigazione(cs, BY_ID, m, new Date()) };
    } catch (e) { stato = { errore: 'Meteo non disponibile in questo momento.' }; }
    if (!el.isConnected) return;
    el.innerHTML = htmlIrrigazione(cs, stato);
    const b = el.querySelector('#hoAnnaffiato');
    if (b) b.onclick = () => { cs.irrigata = oggiISO(); salva(); el.innerHTML = htmlIrrigazione(cs, { ir: window.OrtoPromemoria.irrigazione(cs, BY_ID, null, new Date()) }); aggiornaIrrigazione(root, cs); };
  }

  // ── Check-up con foto (premium) ─────────────────────────
  const AZIONI = { raccogli: '🧺', annaffia: '💧', pota: '✂️', tratta: '🐛', concima: '🌿', proteggi: '🛡️', aspetta: '⏳', controlla: '🔎' };
  const STATI = { buono: ['✅', 'In buona salute', 'good'], attenzione: ['⚠️', 'Da tenere d\'occhio', 'warn'], problema: ['⛔', 'C\'è un problema', 'bad'] };
  const RACCOLTA = { si: 'Pronta da raccogliere', in_parte: 'Pronta in parte', no: 'Non ancora pronta' };
  function htmlEsito(e) {
    if (!e.foto_utile) return `<div class="esito"><p><strong>📷 Foto poco chiara</strong></p><p class="muted">${esc(e.consiglio_foto || 'Riprova con una foto più vicina e ben illuminata.')}</p></div>`;
    const [ic, txt, cls] = STATI[e.stato] || STATI.attenzione;
    return `<div class="esito">
      <div class="esito-stato ${cls}">${ic} ${txt}</div>
      ${e.corrisponde ? '' : `<p class="note">Nella foto sembra esserci <strong>${esc(e.coltura_vista)}</strong>, non la coltura indicata: ho valutato quella.</p>`}
      <p>${esc(e.riepilogo)}</p>
      ${e.raccolta && RACCOLTA[e.raccolta.pronta] ? `<p class="esito-racc">🧺 <strong>${RACCOLTA[e.raccolta.pronta]}</strong>${e.raccolta.quando ? ` — ${esc(e.raccolta.quando)}` : ''}</p>` : ''}
      ${(e.azioni || []).length ? `<ul class="esito-azioni">${e.azioni.map(a => `<li class="p-${a.priorita}"><span class="ai">${AZIONI[a.tipo] || '•'}</span><span><strong>${esc(a.titolo)}</strong><br>${esc(a.dettaglio)}</span></li>`).join('')}</ul>` : ''}
      ${(e.problemi || []).length ? `<p class="muted small" style="margin:12px 0 4px">Possibili problemi</p><ul class="clean small">${e.problemi.map(p => `<li><strong>${esc(p.nome)}</strong> (certezza ${esc(p.certezza)}): ${esc(p.segni)}</li>`).join('')}</ul>` : ''}
    </div>`;
  }
  function htmlCheckup(cs) {
    const titolo = '<div class="section-title"><h2>📷 Check-up con foto</h2></div>';
    if (!account.premium()) {
      return titolo + '<p class="muted small" style="margin:0">Fotografa una pianta e scopri se è da raccogliere, potare, annaffiare o se ha qualche malattia, con i rimedi. <a href="#/account">Disponibile con Premium</a>.</p>';
    }
    const inCampo = [...new Set([OGGI, state.stagione].flatMap(k => coltureDi(piano(cs, k))))];
    const opzioni = [...inCampo, ...C.map(c => c.id).filter(id => !inCampo.includes(id))]
      .map(id => `<option value="${id}">${BY_ID[id].emoji} ${esc(BY_ID[id].nome)}</option>`).join('');
    const storico = (cs.checkup || []).slice().reverse();
    return titolo + `
      <p class="muted small" style="margin:0 0 10px">Inquadra la pianta da vicino, con buona luce. Ti dico come sta e cosa fare.</p>
      <div class="form">
        <label>Coltura nella foto<select id="ckColtura">${opzioni}</select></label>
        <label class="btn primary ck-scatta">📷 Scatta o scegli una foto<input type="file" id="ckFoto" accept="image/*" capture="environment" hidden></label>
      </div>
      <div id="ckRisultato"></div>
      ${storico.length ? `<p class="muted small" style="margin:16px 0 6px">Check-up precedenti</p>
        <div class="ck-storico">${storico.map(s => `
          <details class="ck-voce">
            <summary><img src="${s.thumb}" alt=""><span><strong>${BY_ID[s.coltura] ? esc(BY_ID[s.coltura].nome) : 'Pianta'}</strong><br><span class="muted small">${new Date(s.data + 'T12:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} · ${(STATI[s.esito.stato] || STATI.attenzione)[0]} ${esc((STATI[s.esito.stato] || STATI.attenzione)[1])}</span></span></summary>
            ${htmlEsito(s.esito)}
          </details>`).join('')}</div>` : ''}`;
  }
  // Ridimensiona la foto sul telefono prima dell'invio (meno dati, analisi più veloce).
  function riduci(file, lato, qualita) {
    return new Promise((ok, ko) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const s = Math.min(1, lato / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c.toDataURL('image/jpeg', qualita));
      };
      im.onerror = () => { URL.revokeObjectURL(url); ko(new Error('Formato della foto non supportato.')); };
      im.src = url;
    });
  }
  function bindCheckup(root, cs) {
    const el = root.querySelector('#ckCard');
    if (!el || !account.premium()) return;
    const input = el.querySelector('#ckFoto'), out = el.querySelector('#ckRisultato');
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const coltura = el.querySelector('#ckColtura').value;
      out.innerHTML = '<div class="ck-attesa"><span class="ck-spinner"></span>Analizzo la foto… di solito ci vogliono 20–40 secondi.</div>';
      input.disabled = true;
      try {
        const [foto, thumb] = await Promise.all([riduci(file, 1280, 0.82), riduci(file, 240, 0.7)]);
        out.insertAdjacentHTML('afterbegin', `<img class="ck-anteprima" src="${thumb}" alt="">`);
        const r = await account.checkup({ immagine: foto, coltura, tipoAiuola: tipoDi(cs), irrigata: cs.irrigata || null });
        cs.checkup = (cs.checkup || []).concat({ id: uid(), data: oggiISO(), coltura, thumb, esito: r.esito }).slice(-12);
        salva();
        el.innerHTML = htmlCheckup(cs);
        el.querySelector('#ckColtura').value = coltura;
        el.querySelector('#ckRisultato').innerHTML = `<img class="ck-anteprima" src="${thumb}" alt="">${htmlEsito(r.esito)}<p class="muted small" style="margin:8px 0 0">Check-up rimasti questo mese: ${r.rimasti}</p>`;
        bindCheckup(root, cs);
      } catch (e) {
        out.innerHTML = `<p class="note err">${esc(e.message || 'Analisi non riuscita.')}</p>`;
      } finally {
        input.disabled = false; input.value = '';
      }
    };
  }
  const fmtKg = n => (Math.round(n * 100) / 100).toLocaleString('it-IT') + ' kg';
  function htmlRaccolti(cs) {
    const titolo = '<div class="section-title"><h2>🧺 Diario dei raccolti</h2></div>';
    if (account.attivo && !account.premium()) {
      return titolo + '<p class="muted small" style="margin:0">Registra quanto raccogli in ogni aiuola e confronta le stagioni. <a href="#/account">Disponibile con Premium</a>.</p>';
    }
    const lista = (cs.raccolti || []).slice().sort((a, b) => b.data.localeCompare(a.data));
    const anno = String(new Date().getFullYear());
    const tot = {};
    lista.filter(r => r.data.startsWith(anno)).forEach(r => { tot[r.coltura] = (tot[r.coltura] || 0) + r.kg; });
    const inCampo = coltureDi(piano(cs, OGGI));
    const opzioni = [...inCampo, ...C.map(c => c.id).filter(id => !inCampo.includes(id))]
      .map(id => `<option value="${id}">${BY_ID[id].emoji} ${esc(BY_ID[id].nome)}</option>`).join('');
    const nomeC = id => BY_ID[id] ? BY_ID[id].emoji + ' ' + esc(BY_ID[id].nome) : esc(id);
    return titolo + `
      <form class="form racc-form" data-form="raccolto">
        <div class="three">
          <label>Coltura<select name="coltura">${opzioni}</select></label>
          <label>Kg<input name="kg" type="number" min="0.01" step="0.01" required inputmode="decimal" placeholder="0,5"></label>
          <label>Data<input name="data" type="date" required value="${oggiISO()}" max="${oggiISO()}"></label>
        </div>
        <button class="btn primary" type="submit">+ Registra raccolto</button>
      </form>
      ${Object.keys(tot).length ? `<p class="muted small" style="margin:14px 0 6px">Totale ${anno}</p><div class="riep" style="margin:0">${Object.entries(tot).sort((a, b) => b[1] - a[1]).map(([id, kg]) => `<span class="pill">${nomeC(id)} · ${fmtKg(kg)}</span>`).join('')}</div>` : ''}
      ${lista.length ? `<ul class="racc-lista">${lista.slice(0, 12).map(r => `<li><span class="muted">${new Date(r.data + 'T12:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span><span>${nomeC(r.coltura)}</span><strong>${fmtKg(r.kg)}</strong><button class="link danger" data-togli="${r.id}" aria-label="Elimina raccolto">✕</button></li>`).join('')}</ul>` : '<p class="empty" style="margin:12px 0 0">Ancora nessun raccolto registrato.</p>'}`;
  }

  function htmlRotazione(cs, k) {
    if (cs.perenne) return `<div class="section-title"><h2>🔄 Rotazione</h2></div><p style="margin:0">Aiuola per colture perenni: resta fuori dalla rotazione.</p>`;
    const rot = rotazione(cs, k), fr = famRecenti(cs, k);
    const cand = C.filter(c => adatta(c, k)).map(c => ({ c, v: valuta(c, cs, k, fr, rot) }));
    const gruppo = cat => cand.filter(x => x.v.cat === cat).sort((a, b) => a.c.nome.localeCompare(b.c.nome));
    const cons = gruppo('consigliata'), evita = gruppo('evita');
    let h = `<div class="section-title"><h2>🔄 Cosa piantare qui</h2></div>`;
    if (rot) {
      h += `<p style="margin:0 0 10px">Ultima stagione registrata: <strong>${etichetta(rot.k)}</strong>, con prevalenza del gruppo «${esc(ESIG[rot.prevalente].nome.toLowerCase())}». Ora tocca al gruppo <strong>«${esc(ESIG[rot.tocca].nome.toLowerCase())}»</strong>.</p>`;
      h += cons.length ? `<p class="muted small" style="margin:0 0 6px">Consigliate in questa stagione</p><div class="chips">${cons.map(x => chip(x.c, 'good')).join('')}</div>`
        : `<p class="empty">Nessuna coltura di questo gruppo si mette a dimora in questa stagione: scegli tra le altre, evitando le famiglie già usate.</p>`;
    } else {
      h += `<p style="margin:0">Nessuno storico per questa aiuola. Registra cosa c'era nelle stagioni passate (qui sotto, in "Storico") oppure disegna l'aiuola qui sotto: dalla prossima stagione riceverai i suggerimenti di rotazione.</p>`;
    }
    if (evita.length) {
      h += `<p class="muted small" style="margin:12px 0 6px">Da evitare (famiglia coltivata qui di recente)</p><div class="chips">${evita.map(x => chip(x.c, 'bad')).join('')}</div>`;
    }
    return h;
  }

  function htmlPalette(cs, k) {
    const rot = rotazione(cs, k), fr = famRecenti(cs, k);
    const ordine = { consigliata: 0, possibile: 1, evita: 2 };
    const lista = C.filter(c => ui.tutte || adatta(c, k) || coltureDi(piano(cs, k)).includes(c.id))
      .map(c => ({ c, v: valuta(c, cs, k, fr, rot) }))
      .sort((a, b) => ordine[a.v.cat] - ordine[b.v.cat] || a.c.nome.localeCompare(b.c.nome));
    const sel = ui.pennello;
    return `
      <p class="muted small" style="margin:0 0 8px">${sel ? (sel === 'gomma' ? 'Tocca o trascina sulle celle per svuotarle.' : `Tocca o trascina sulle celle per piantare <strong>${nome(sel)}</strong>.`) : 'Scegli una coltura, poi tocca le celle dell’aiuola (ogni cella = 30×30 cm).'}</p>
      <div class="palette">
        <button class="pbtn" data-p="gomma" aria-pressed="${sel === 'gomma'}">🧽 Gomma</button>
        ${lista.map(x => `<button class="pbtn ${x.v.cat}" data-p="${x.c.id}" aria-pressed="${sel === x.c.id}" title="${esc(x.v.motivo)}">${x.c.emoji} ${esc(x.c.nome)}${x.v.cat === 'consigliata' ? ' ★' : x.v.cat === 'evita' ? ' ⚠' : ''}</button>`).join('')}
      </div>
      <label class="toggle small" style="margin-top:8px"><input type="checkbox" id="tutte" ${ui.tutte ? 'checked' : ''}> Mostra anche le colture fuori stagione</label>
      <p class="muted small" style="margin:0">★ consigliata dalla rotazione · ⚠ famiglia già coltivata qui di recente</p>`;
  }

  function htmlCelle(cs, k, conf) {
    const p = piano(cs, k) || { celle: {} };
    const { cols, rows } = dimensioni(cs);
    let h = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const rc = r + ',' + c, id = p.celle[rc], cr = id && BY_ID[id];
      h += `<button class="cella ${cr ? 'piena' : ''} ${conf && conf.has(rc) ? 'conf' : ''}" data-rc="${rc}" ${cr ? `style="--tint:${FAM[cr.fam].colore}40" title="${esc(cr.nome)}"` : 'title="vuota"'}>${cr ? cr.emoji : ''}</button>`;
    }
    return h;
  }

  function htmlRiepilogo(an) {
    if (!an.riepilogo.length) return '';
    return `<div class="riep">${an.riepilogo.map(x => {
      const pi = x.piante >= 1 ? `≈ ${Math.floor(x.piante)} ${Math.floor(x.piante) === 1 ? 'pianta' : 'piante'}` : 'spazio insufficiente';
      return `<span class="pill">${BY_ID[x.id].emoji} ${esc(BY_ID[x.id].nome)} · ${x.n} ${x.n === 1 ? 'cella' : 'celle'} · ${pi}</span>`;
    }).join('')}</div>`;
  }

  function htmlAvvisi(an) {
    if (!an.avvisi.length) return '<p class="empty" style="margin:0">Nessun problema rilevato. Disegna il progetto per vedere i controlli su consociazioni, spazio, ombra e rotazione.</p>';
    const icona = { bad: '⛔', warn: '⚠️', info: 'ℹ️', good: '✅' };
    const ordine = { bad: 0, warn: 1, info: 2, good: 3 };
    return `<ul class="avvisi">${an.avvisi.sort((a, b) => ordine[a.t] - ordine[b.t]).map(a => `<li class="${a.t}"><span>${icona[a.t]}</span><span>${a.h}</span></li>`).join('')}</ul>`;
  }

  function htmlStorico(cs) {
    const stag = Object.keys(cs.piani || {}).filter(k => coltureDi(cs.piani[k]).length).sort((a, b) => ord(b) - ord(a));
    if (!stag.length) return '<p class="empty" style="margin:0">Ancora niente: le stagioni che progetti o registri compaiono qui.</p>';
    return `<div class="storico">${stag.map(k => `
      <div class="st-row">
        <div class="st-h"><strong>${etichetta(k)}</strong>${k === state.stagione ? '' : `<button class="link" data-vai="${k}">apri</button>`}<button class="link danger" data-cancella="${k}">cancella</button></div>
        <div class="chips">${coltureDi(cs.piani[k]).map(id => chip(BY_ID[id])).join('')}</div>
      </div>`).join('')}</div>`;
  }

  function htmlRegistra() {
    const annoOggi = +OGGI.split('-')[0];
    const anni = []; for (let a = annoOggi; a >= annoOggi - 5; a--) anni.push(a);
    return `<form class="form registra" data-form="registra">
      <p style="margin:0">Indica cosa hai coltivato in questa aiuola in una stagione passata (senza disegnare la griglia).</p>
      <div class="two">
        <label>Anno<select name="anno">${anni.map(a => `<option ${a === annoOggi - 1 ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
        <label>Stagione<select name="stag"><option value="PE">Primavera-estate</option><option value="AI">Autunno-inverno</option></select></label>
      </div>
      <div class="chips pick">${C.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(c => `<label class="chip"><input type="checkbox" name="c" value="${c.id}"><span class="em">${c.emoji}</span>${esc(c.nome)}</label>`).join('')}</div>
      <div class="btns"><button class="btn primary" type="submit">Salva nello storico</button><button class="btn" type="button" id="chiudiRegistra">Annulla</button></div>
    </form>`;
  }

  function bindCassone(root, id) {
    const cs = trova(id);
    if (!cs) return;
    const k = state.stagione;
    const grid = root.querySelector('#grid');

    function aggiorna() {
      const an = analizza(cs, k);
      grid.innerHTML = htmlCelle(cs, k, an.conf);
      root.querySelector('#riepilogo').innerHTML = htmlRiepilogo(an);
      root.querySelector('#avvisi').innerHTML = htmlAvvisi(an);
      root.querySelector('.iso-stage').innerHTML = isoSVG(cs, k);
    }
    aggiorna();
    root.querySelector('#vaiDisegna').onclick = () => root.querySelector('#disegna').scrollIntoView({ behavior: 'smooth', block: 'start' });
    aggiornaIrrigazione(root, cs);
    bindCheckup(root, cs);

    // Modifica / elimina
    const f = root.querySelector('form[data-form="cassone"]');
    f.onsubmit = e => {
      e.preventDefault();
      Object.assign(cs, leggiForm(f));
      const { cols, rows } = dimensioni(cs);
      Object.values(cs.piani || {}).forEach(p => Object.keys(p.celle).forEach(rc => {
        const [r, c] = rc.split(',').map(Number);
        if (r >= rows || c >= cols) delete p.celle[rc];
      }));
      salva(); rerender();
    };
    root.querySelector('#elimina').onclick = () => {
      if (!confirm(`Eliminare "${cs.nome}" con tutto il suo storico?`)) return;
      dati.cassoni = dati.cassoni.filter(x => x !== cs); salva();
      location.hash = '#/cassoni';
    };

    // Stagioni
    root.querySelectorAll('[data-stag]').forEach(b => b.onclick = () => { state.stagione = daOrd(ord(k) + +b.dataset.stag); rerender(); });
    const oggi = root.querySelector('#oggi');
    if (oggi) oggi.onclick = e => { e.preventDefault(); state.stagione = OGGI; rerender(); };

    // Tavolozza
    root.querySelector('#palette').onclick = e => {
      const b = e.target.closest('button[data-p]');
      if (!b) return;
      ui.pennello = ui.pennello === b.dataset.p ? null : b.dataset.p;
      root.querySelector('#palette').innerHTML = htmlPalette(cs, k);
      grid.classList.toggle('painting', !!ui.pennello);
    };
    root.querySelector('#palette').onchange = e => {
      if (e.target.id !== 'tutte') return;
      ui.tutte = e.target.checked;
      root.querySelector('#palette').innerHTML = htmlPalette(cs, k);
    };

    // Pittura sulla griglia (tocco o trascinamento)
    let attivo = false, modificato = false;
    function dipingi(b) {
      const p = piano(cs, k, true), rc = b.dataset.rc;
      if (ui.pennello === 'gomma') {
        if (!p.celle[rc]) return;
        delete p.celle[rc];
        b.textContent = ''; b.classList.remove('piena');
      } else {
        if (p.celle[rc] === ui.pennello) return;
        p.celle[rc] = ui.pennello;
        const cr = BY_ID[ui.pennello];
        b.textContent = cr.emoji; b.classList.add('piena'); b.style.setProperty('--tint', FAM[cr.fam].colore + '40');
      }
      modificato = true;
    }
    grid.addEventListener('pointerdown', e => {
      const b = e.target.closest('.cella');
      if (!b) return;
      if (!ui.pennello) { root.querySelector('#palette').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      e.preventDefault();
      attivo = true; dipingi(b);
    });
    grid.addEventListener('pointermove', e => {
      if (!attivo) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const b = el && el.closest('.cella');
      if (b && grid.contains(b)) dipingi(b);
    });
    const fine = () => {
      if (!attivo) return;
      attivo = false;
      if (modificato) {
        modificato = false;
        salva(); aggiorna();
        root.querySelector('#rotCard').innerHTML = htmlRotazione(cs, k);
      }
    };
    grid.addEventListener('pointerup', fine);
    grid.addEventListener('pointercancel', fine);
    grid.addEventListener('pointerleave', fine);

    // Diario raccolti
    const rc = root.querySelector('#raccoltiCard');
    rc.addEventListener('submit', e => {
      const fr = e.target.closest('form[data-form="raccolto"]');
      if (!fr) return;
      e.preventDefault();
      const kg = parseFloat(String(fr.kg.value).replace(',', '.'));
      if (!(kg > 0)) return;
      cs.raccolti = cs.raccolti || [];
      cs.raccolti.push({ id: uid(), data: fr.data.value, coltura: fr.coltura.value, kg });
      salva();
      rc.innerHTML = htmlRaccolti(cs);
    });
    rc.addEventListener('click', e => {
      const b = e.target.closest('[data-togli]');
      if (!b || !confirm('Eliminare questo raccolto?')) return;
      cs.raccolti = (cs.raccolti || []).filter(r => r.id !== b.dataset.togli);
      salva();
      rc.innerHTML = htmlRaccolti(cs);
    });

    // Storico
    root.querySelectorAll('[data-vai]').forEach(b => b.onclick = () => { state.stagione = b.dataset.vai; rerender(); });
    root.querySelectorAll('[data-cancella]').forEach(b => b.onclick = () => {
      if (!confirm(`Cancellare ${etichetta(b.dataset.cancella)} dallo storico di questa aiuola?`)) return;
      delete cs.piani[b.dataset.cancella]; salva(); rerender();
    });
    const apri = root.querySelector('#apriRegistra');
    if (apri) apri.onclick = () => { ui.registra = true; rerender(); };
    const reg = root.querySelector('form[data-form="registra"]');
    if (reg) {
      reg.querySelector('#chiudiRegistra').onclick = () => { ui.registra = false; rerender(); };
      reg.onsubmit = e => {
        e.preventDefault();
        const scelte = [...reg.querySelectorAll('input[name="c"]:checked')].map(x => x.value);
        if (!scelte.length) { alert('Seleziona almeno una coltura.'); return; }
        const p = piano(cs, reg.anno.value + '-' + reg.stag.value, true);
        p.extra = [...new Set([...(p.extra || []), ...scelte])];
        salva(); ui.registra = false; rerender();
      };
    }
  }

  // Cambiando cassone si riparte senza coltura selezionata.
  window.addEventListener('hashchange', () => { ui.pennello = null; ui.registra = false; });

  return {
    viewLista, bindLista, viewCassone, bindCassone,
    getDati: () => dati,
    // Dati per la testata della pagina di un'aiuola.
    info(id) {
      const cs = trova(id);
      return cs && { nome: cs.nome, tipo: tipoDi(cs), tipoNome: TIPI[tipoDi(cs)].nome, larghezza: cs.larghezza, lunghezza: cs.lunghezza, stagione: etichetta(state.stagione) };
    },
    // Sostituisce i dati locali con quelli arrivati dal cloud (senza rimandarli indietro).
    setDati(n) {
      dati.cassoni = Array.isArray(n && n.cassoni) ? n.cassoni : [];
      dati.aggiornato = (n && n.aggiornato) || new Date().toISOString();
      store.set('cassoni', dati);
    }
  };
};
