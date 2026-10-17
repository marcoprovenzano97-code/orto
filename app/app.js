(function () {
  'use strict';

  const C = window.COLTURE, FAM = window.FAMIGLIE, ESIG = window.ESIGENZE, ZONE = window.ZONE;
  const BY_ID = Object.fromEntries(C.map(c => [c.id, c]));
  const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const MESI_BREVI = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
  const ATTIVITA = [
    { k: 'sem', nome: 'Semina in semenzaio', breve: 'Semenzaio',  css: 'var(--sem)', hint: 'In vaschette al riparo (serra, davanzale, tunnel).' },
    { k: 'dir', nome: 'Semina diretta',      breve: 'Diretta',    css: 'var(--dir)', hint: 'Direttamente nell\'aiuola (o messa a dimora di spicchi/tuberi).' },
    { k: 'tra', nome: 'Trapianto',           breve: 'Trapianto',  css: 'var(--tra)', hint: 'Piantine dal semenzaio o acquistate.' },
    { k: 'rac', nome: 'Raccolta',            breve: 'Raccolta',   css: 'var(--rac)', hint: '' }
  ];
  const PERENNI = new Set(['carciofo', 'fragola', 'asparago']);
  const ROTAZIONE = ['alta', 'media', 'bassa', 'miglioratrice'];

  // ── Stato ──────────────────────────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('orto.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('orto.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const state = {
    zona: ZONE[store.get('zona')] ? store.get('zona') : 'nord',
    mese: new Date().getMonth() + 1,
    filtro: { q: '', fam: '', ora: false },
    calZona: null
  };
  const MESE_OGGI = new Date().getMonth() + 1;

  // ── Utility ────────────────────────────────────────────
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const cache = {};
  function mesi(spec) {
    if (!spec) return new Set();
    if (cache[spec]) return cache[spec];
    const out = new Set();
    spec.split(',').forEach(part => {
      const [a, b] = part.split('-').map(Number);
      if (!b) { out.add(a); return; }
      let m = a;
      for (let i = 0; i < 12; i++) { out.add(m); if (m === b) break; m = m % 12 + 1; }
    });
    return (cache[spec] = out);
  }
  const inMese = (c, zona, k, m) => mesi(c.cal[zona][k]).has(m);
  const famDot = f => `<span class="dot" style="background:${FAM[f].colore}"></span>`;
  const famPill = f => `<span class="pill">${famDot(f)}${esc(FAM[f].nome)}</span>`;
  const chip = (c, cls = '') => `<a class="chip ${cls}" href="#/coltura/${c.id}"><span class="em">${c.emoji}</span>${esc(c.nome)}</a>`;

  // Spazio per pianta in un cassone: sesto quadrato pari alla distanza sulla fila,
  // ma non meno di metà della distanza tra le file (nei cassoni non servono corridoi).
  const areaPianta = c => Math.pow(Math.max(c.dist[0], c.dist[1] / 2), 2);
  function pianteMq(c) {
    const v = 10000 / areaPianta(c);
    if (v >= 1) return `≈ ${Math.round(v)} per m²`;
    return `1 ogni ${Math.round(1 / v * 10) / 10} m²`.replace('.', ',');
  }
  function relazioni(c, campo) {
    const ids = new Set(c[campo]);
    C.forEach(o => { if (o[campo].includes(c.id)) ids.add(o.id); });
    return [...ids].map(id => BY_ID[id]).filter(Boolean).sort((a, b) => a.nome.localeCompare(b.nome));
  }

  // ── Zona (barra in alto) ───────────────────────────────
  function renderZone() {
    const el = document.getElementById('zoneSwitch');
    el.innerHTML = Object.entries(ZONE).map(([k, z]) =>
      `<button role="radio" aria-checked="${k === state.zona}" data-zona="${k}" title="${esc(z.desc)}">${esc(z.nome)}</button>`).join('');
    el.onclick = e => {
      const b = e.target.closest('button[data-zona]');
      if (!b) return;
      state.zona = b.dataset.zona; state.calZona = null;
      store.set('zona', state.zona);
      account.zonaCambiata(state.zona);
      renderZone(); route();
    };
  }

  // ── Viste ──────────────────────────────────────────────
  // Foto reali da Unsplash (licenza gratuita anche per uso commerciale).
  const FOTO = window.FOTO_PAGINE;   // data/foto.js
  // "mie:<nome>" = foto locali in app/foto (800 e 1600 px); altrimenti ID di Unsplash.
  const mia = id => id.startsWith('mie:') ? id.slice(4) : null;
  const foto = (id, w) => mia(id) ? `foto/${mia(id)}-${w <= 900 ? 800 : 1600}.jpg` : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;
  const img = (id, alt, cls, sizes) => {
    const larg = mia(id) ? [800, 1600] : [600, 1000, 1600, 2200];
    return `<img class="${cls}" src="${foto(id, 1000)}" srcset="${larg.map(w => `${foto(id, w)} ${w}w`).join(', ')}" sizes="${sizes}" alt="${esc(alt)}" loading="${cls === 'hero-img' ? 'eager' : 'lazy'}" decoding="async">`;
  };

  function viewHome() {
    const m = MESE_OGGI, z = state.zona;
    const mese = ATTIVITA.map(a => ({ a, list: C.filter(c => inMese(c, z, a.k, m)).sort((x, y) => x.nome.localeCompare(y.nome)) }));
    const colonne = mese.filter(x => x.list.length).map(({ a, list }) => `
      <div class="hm-col">
        <div class="hm-col-t"><span class="bar" style="background:${a.css}"></span>${a.breve === 'Diretta' ? 'Semina diretta' : a.breve}<span class="count">${list.length}</span></div>
        <div class="chips">${list.slice(0, 4).map(c => chip(c)).join('')}${list.length > 4 ? `<a class="chip more" href="#/mese">+${list.length - 4}</a>` : ''}</div>
      </div>`).join('');
    const sezione = (id, alt, eyebrow, titolo, testo, link, cta, inverti) => `
      <section class="feature ${inverti ? 'inv' : ''}">
        <div class="feature-img">${img(id, alt, 'f-img', '(min-width: 760px) 50vw, 100vw')}</div>
        <div class="feature-txt">
          <p class="eyebrow">${eyebrow}</p>
          <h2>${titolo}</h2>
          <p>${testo}</p>
          <a class="btn primary" href="${link}">${cta}</a>
        </div>
      </section>`;
    return `
      <section class="hero">
        ${img(FOTO.copertina, 'Aiuola con file di piantine appena trapiantate tra le pietre, alberi sullo sfondo', 'hero-img', '100vw')}
        <div class="hero-velo"></div>
        <div class="hero-testo">
          <p class="eyebrow">L'app per il tuo orto</p>
          <h1>Coltiva con passione.<br>Organizza con metodo.</h1>
          <p class="hero-sub">Calendario di semina per la tua zona, schede di ${C.length} ortaggi, rotazioni e progetto delle aiuole: tutto quello che serve per un orto che rende, stagione dopo stagione.</p>
          <div class="btns">
            <a class="btn primary big" href="#/cassoni">Inizia il tuo orto</a>
            <a class="btn ghost big" href="#/mese">Cosa fare a ${MESI[m - 1].toLowerCase()}</a>
          </div>
        </div>
        <a class="hero-giu" href="#home-mese" aria-label="Scorri">⌄</a>
      </section>

      <div class="home-corpo">
        ${account.htmlOggi()}
        <section class="home-mese" id="home-mese">
          <div class="hm-head">
            <div><p class="eyebrow">${MESI[m - 1]} · zona ${esc(ZONE[z].nome)}</p><h2>Questo mese nell'orto</h2></div>
            <a class="link-freccia" href="#/mese">Tutto il calendario ›</a>
          </div>
          <div class="hm-grid">${colonne}</div>
        </section>

        ${sezione(FOTO.aiuole, 'Aiuola bordata con cavoli e piantine appena trapiantate', 'Il mio orto', 'Progetta le tue aiuole',
          'Disegna cassoni, aiuole in piena terra e vasi cella per cella. L\'app controlla consociazioni, spazio tra le piante e ombra, e ti dice cosa piantare per rispettare la rotazione.',
          '#/cassoni', 'Disegna la tua aiuola', false)}
        ${sezione(FOTO.semina, 'Piantine appena trapiantate in file tra le pietre', 'Calendario', 'Semina al momento giusto',
          'Semine, trapianti e raccolte mese per mese, tarati sulla tua zona: Nord, Centro o Sud e isole. Niente più piantine bruciate dal gelo o semine fuori tempo.',
          '#/mese', 'Apri il calendario', true)}
        ${sezione(FOTO.raccolto, 'Cassetta del raccolto con zucchina, melanzane, pomodori e cipolle', 'Colture', 'Conosci ogni ortaggio',
          `Schede tecniche di ${C.length} colture: quanta acqua, che terreno, distanze, tempi di raccolta, piante amiche e nemiche, malattie e consigli pratici.`,
          '#/colture', 'Sfoglia le schede', false)}

        <section class="premium-band">
          <p class="eyebrow">Premium</p>
          <h2>Il tuo orto ti avvisa</h2>
          <p>Pioggia in arrivo? Caldo record o gelata? Ricevi ogni mattina gli avvisi meteo per il tuo comune e i lavori della settimana, con le aiuole sincronizzate su telefono e computer.</p>
          <a class="btn primary big" href="#/account">Scopri il Premium</a>
        </section>

        <footer class="home-footer">
          <a href="#/guida">Guida all'orto</a> · <a href="#/assistente">Assistente</a> · <a href="#/account">Account</a><br>
          <a href="#/privacy">Privacy</a> · <a href="#/termini">Condizioni d'uso</a>
          <p class="muted small">Dati colturali indicativi. Foto: il nostro orto e Unsplash.</p>
        </footer>
      </div>`;
  }
  function bindHome(root) {
    account.bindOggi(root);
    // Primo avvio guidato: solo per chi non ha aiuole e non ha fatto l'accesso (chi ha un account ritrova il suo orto).
    setTimeout(() => { if (!account.utente() && !/^#\/?[a-z]/.test(location.hash)) benvenuto.forseMostra(); }, 1200);
    const giu = root.querySelector('.hero-giu');
    if (giu) giu.onclick = e => { e.preventDefault(); root.querySelector('#home-mese').scrollIntoView({ behavior: 'smooth' }); };
  }

  function viewMese() {
    const m = state.mese, z = state.zona;
    const blocchi = ATTIVITA.map(a => {
      const list = C.filter(c => inMese(c, z, a.k, m)).sort((x, y) => x.nome.localeCompare(y.nome));
      return `<section class="card">
        <div class="act-title"><span class="bar" style="background:${a.css}"></span><h2>${a.nome}</h2><span class="count">${list.length}</span></div>
        ${a.hint ? `<p class="muted small" style="margin:-4px 0 10px">${a.hint}</p>` : ''}
        ${list.length ? `<div class="chips">${list.map(c => chip(c)).join('')}</div>` : '<p class="empty">Niente in questo mese.</p>'}
      </section>`;
    }).join('');
    return `
      <div class="month-head">
        <button class="iconbtn" data-act="prev" aria-label="Mese precedente">‹</button>
        <div style="text-align:center">
          <h1>${MESI[m - 1]}</h1>
          <div class="sub">Zona ${esc(ZONE[z].nome)}${m === MESE_OGGI ? ' · mese corrente' : ''}</div>
        </div>
        <button class="iconbtn" data-act="next" aria-label="Mese successivo">›</button>
      </div>
      <div class="stack">${account.htmlOggi()}${blocchi}</div>
      <p class="disclaimer">Calendari indicativi per la zona ${esc(ZONE[z].nome)}: ${esc(ZONE[z].desc)} Adatta le date alle gelate della tua zona.</p>`;
  }
  function bindMese(root) {
    account.bindOggi(root);
    root.querySelector('[data-act="prev"]').onclick = () => { state.mese = (state.mese + 10) % 12 + 1; render(); };
    root.querySelector('[data-act="next"]').onclick = () => { state.mese = state.mese % 12 + 1; render(); };
  }

  function listaFiltrata() {
    const f = state.filtro, z = state.zona, q = f.q.trim().toLowerCase();
    return C.filter(c =>
      (!q || c.nome.toLowerCase().includes(q) || FAM[c.fam].nome.toLowerCase().includes(q)) &&
      (!f.fam || c.fam === f.fam) &&
      (!f.ora || ['sem', 'dir', 'tra'].some(k => inMese(c, z, k, MESE_OGGI)))
    ).sort((a, b) => a.nome.localeCompare(b.nome));
  }
  function righe() {
    const list = listaFiltrata(), z = state.zona;
    if (!list.length) return '<p class="empty">Nessuna coltura trovata.</p>';
    return list.map(c => {
      const ora = ['sem', 'dir', 'tra'].some(k => inMese(c, z, k, MESE_OGGI));
      return `<a class="row" href="#/coltura/${c.id}">
        <span class="em">${c.emoji}</span>
        <span class="body">
          <span class="name">${esc(c.nome)}</span>
          <span class="meta">${famPill(c.fam)}<span class="pill">💧 ${esc(c.acqua.freq.split(/[:,(]| in | fino | se | nei | dopo /)[0].trim())}</span>${ora ? '<span class="pill now-badge">Si semina ora</span>' : ''}</span>
        </span>
        <span class="chev">›</span>
      </a>`;
    }).join('');
  }
  function viewColture() {
    const f = state.filtro;
    const famUsate = [...new Set(C.map(c => c.fam))];
    return `
      <input class="search" type="search" id="q" placeholder="Cerca un ortaggio o una famiglia…" value="${esc(f.q)}" autocomplete="off">
      <div class="filters" id="famFilters">
        <button class="fbtn" aria-pressed="${!f.fam}" data-fam="">Tutte</button>
        ${famUsate.map(k => `<button class="fbtn" aria-pressed="${f.fam === k}" data-fam="${k}">${famDot(k)}${esc(FAM[k].nome)}</button>`).join('')}
      </div>
      <label class="toggle"><input type="checkbox" id="ora" ${f.ora ? 'checked' : ''}> Solo quelle da seminare o trapiantare a ${MESI[MESE_OGGI - 1].toLowerCase()}</label>
      <div class="list" id="list">${righe()}</div>`;
  }
  function bindColture(root) {
    const list = root.querySelector('#list');
    root.querySelector('#q').oninput = e => { state.filtro.q = e.target.value; list.innerHTML = righe(); };
    root.querySelector('#ora').onchange = e => { state.filtro.ora = e.target.checked; list.innerHTML = righe(); };
    root.querySelector('#famFilters').onclick = e => {
      const b = e.target.closest('button[data-fam]');
      if (!b) return;
      state.filtro.fam = b.dataset.fam;
      root.querySelectorAll('#famFilters button').forEach(x => x.setAttribute('aria-pressed', x === b));
      list.innerHTML = righe();
    };
  }

  function calendario(c, z) {
    let h = '<div class="cal"><span></span>';
    MESI_BREVI.forEach((l, i) => { h += `<span class="mh ${i + 1 === MESE_OGGI ? 'now' : ''}">${l}</span>`; });
    ATTIVITA.forEach(a => {
      if (!c.cal[z][a.k]) return;
      const s = mesi(c.cal[z][a.k]);
      h += `<span class="lbl">${a.breve}</span>`;
      for (let m = 1; m <= 12; m++) {
        h += `<span class="cell ${m === MESE_OGGI ? 'now' : ''}" title="${a.breve}: ${MESI[m - 1]}" ${s.has(m) ? `style="background:${a.css}"` : ''}></span>`;
      }
    });
    return h + '</div>';
  }

  function rotazioneTesto(c) {
    if (PERENNI.has(c.id)) {
      return `<p>Coltura <strong>perenne</strong>: resta nella stessa aiuola per più anni. Conviene dedicarle un'aiuola fuori dallo schema di rotazione.</p>`;
    }
    const i = ROTAZIONE.indexOf(c.esig);
    const prima = ESIG[ROTAZIONE[(i + 3) % 4]], dopo = ESIG[ROTAZIONE[(i + 1) % 4]];
    return `<dl class="kv">
        <dt>Famiglia</dt><dd>${famPill(c.fam)}</dd>
        <dt>Esigenza</dt><dd><strong>${ESIG[c.esig].nome}</strong> — ${ESIG[c.esig].desc}</dd>
        <dt>Meglio dopo</dt><dd>${prima.nome.toLowerCase()}</dd>
        <dt>Poi lascia il posto a</dt><dd>${dopo.nome.toLowerCase()}</dd>
      </dl>
      <p class="note" style="margin-top:10px">Non riportare <strong>${FAM[c.fam].nome}</strong> nella stessa aiuola prima di 3–4 anni: malattie e parassiti della famiglia restano nel terreno.</p>`;
  }

  function viewColtura(id) {
    const c = BY_ID[id];
    if (!c) return `<p>Coltura non trovata. <a href="#/colture">Torna all'elenco</a></p>`;
    const z = state.calZona || state.zona;
    const amiche = relazioni(c, 'amiche'), nemiche = relazioni(c, 'nemiche');
    const stessaFam = C.filter(o => o.fam === c.fam && o.id !== c.id);
    return `
      <div class="stack">
        <div class="meta">${famPill(c.fam)}<span class="pill">${esc(ESIG[c.esig].nome)}</span>${PERENNI.has(c.id) ? '<span class="pill">Perenne</span>' : ''}</div>
        <p class="lead">${esc(c.desc)}</p>

        <div class="facts">
          <div class="fact"><div class="k">Ciclo</div><div class="v">${esc(c.ciclo)}</div></div>
          <div class="fact"><div class="k">Acqua</div><div class="v">${esc(c.acqua.freq)}</div></div>
          <div class="fact"><div class="k">Esposizione</div><div class="v">${esc(c.sole)}</div></div>
          <div class="fact"><div class="k">Distanze</div><div class="v">${c.dist[0]} cm sulla fila · ${c.dist[1]} cm tra file</div></div>
          <div class="fact"><div class="k">In aiuola</div><div class="v">${pianteMq(c)}</div></div>
          <div class="fact"><div class="k">Germinazione</div><div class="v">${esc(c.germ)}</div></div>
        </div>

        <section class="card">
          <div class="section-title"><h2>📅 Calendario</h2></div>
          <div class="cal-zones" id="calZones">
            ${Object.entries(ZONE).map(([k, zz]) => `<button class="fbtn" aria-pressed="${k === z}" data-z="${k}">${esc(zz.nome)}</button>`).join('')}
          </div>
          ${calendario(c, z)}
          <div class="legend">${ATTIVITA.filter(a => c.cal[z][a.k]).map(a => `<span><span class="dot" style="background:${a.css}"></span>${a.nome}</span>`).join('')}</div>
        </section>

        <section class="card">
          <div class="section-title"><h2>💧 Irrigazione</h2></div>
          <dl class="kv">
            <dt>Frequenza</dt><dd>${esc(c.acqua.freq)}</dd>
            <dt>Quantità</dt><dd>${esc(c.acqua.quant)}</dd>
          </dl>
          <p class="note" style="margin-top:10px">${esc(c.acqua.note)}</p>
        </section>

        <section class="card">
          <div class="section-title"><h2>🌍 Terreno ed esigenze</h2></div>
          <dl class="kv">
            <dt>Terreno</dt><dd>${esc(c.terreno)}</dd>
            <dt>pH</dt><dd>${esc(c.ph)}</dd>
            <dt>Concimazione</dt><dd>${esc(ESIG[c.esig].desc)}</dd>
            <dt>Temperatura</dt><dd>${esc(c.tGerm)}</dd>
          </dl>
        </section>

        <section class="card">
          <div class="section-title"><h2>🤝 Consociazioni</h2></div>
          <p class="muted small" style="margin:0 0 6px">Sta bene vicino a</p>
          ${amiche.length ? `<div class="chips">${amiche.map(o => chip(o, 'good')).join('')}</div>` : '<p class="empty">—</p>'}
          <p class="muted small" style="margin:12px 0 6px">Da tenere lontano da</p>
          ${nemiche.length ? `<div class="chips">${nemiche.map(o => chip(o, 'bad')).join('')}</div>` : '<p class="empty">Nessuna incompatibilità nota.</p>'}
        </section>

        <section class="card">
          <div class="section-title"><h2>🔄 Rotazione</h2></div>
          ${rotazioneTesto(c)}
          ${stessaFam.length ? `<p class="muted small" style="margin:12px 0 6px">Stessa famiglia (non alternarle tra loro)</p><div class="chips">${stessaFam.map(o => chip(o)).join('')}</div>` : ''}
        </section>

        <section class="card">
          <div class="section-title"><h2>🐛 Avversità comuni</h2></div>
          <ul class="clean">${c.avv.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        </section>

        <section class="card">
          <div class="section-title"><h2>💡 Consigli</h2></div>
          <ul class="clean">${c.consigli.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        </section>
      </div>`;
  }
  function bindColtura(root) {
    const z = root.querySelector('#calZones');
    if (z) z.onclick = e => {
      const b = e.target.closest('button[data-z]');
      if (!b) return;
      state.calZona = b.dataset.z;
      const y = window.scrollY; render(); window.scrollTo(0, y);
    };
  }

  function viewGuida() {
    const gruppo = e => C.filter(c => c.esig === e && !PERENNI.has(c.id)).map(c => c.emoji + ' ' + c.nome).join(', ');
    const fams = [...new Set(C.map(c => c.fam))];
    return `
      <div class="stack">

        <section class="card">
          <div class="section-title"><h2>🔄 La rotazione in 4 anni</h2></div>
          <p style="margin-top:0">Dividi l'orto in 4 gruppi di aiuole (o settori). Ogni anno ogni gruppo passa alla fase successiva: il terreno non si impoverisce e le malattie di una famiglia non si accumulano.</p>
          <div class="rot">
            ${ROTAZIONE.map((e, i) => `<div class="step"><div class="n">Anno ${i + 1}</div><div class="t">${ESIG[e].nome}</div><div class="small muted">${ESIG[e].desc}</div><div class="small" style="margin-top:6px">${gruppo(e)}</div></div>`).join('')}
          </div>
          <p class="note" style="margin-top:12px">Due regole: <strong>1)</strong> la stessa famiglia non torna nella stessa aiuola prima di 3–4 anni; <strong>2)</strong> dopo una coltura molto esigente metti una meno esigente, e chiudi il ciclo con le leguminose che riportano azoto. Le perenni (asparago, carciofo, fragola) vanno in aiuole dedicate.</p>
        </section>

        <section class="card">
          <div class="section-title"><h2>🌿 Famiglie botaniche</h2></div>
          ${fams.map(f => `<div class="fam-row"><div class="fn">${famDot(f)}${esc(FAM[f].nome)}</div><div class="chips">${C.filter(c => c.fam === f).map(c => chip(c)).join('')}</div></div>`).join('')}
        </section>

        <section class="card">
          <div class="section-title"><h2>💧 Irrigazione</h2></div>
          <ul class="clean">
            <li>Controlla col dito: se a 3–5 cm il terreno è asciutto, è ora di bagnare. Cassoni rialzati e soprattutto vasi drenano e si scaldano di più: asciugano <strong>prima</strong> della piena terra.</li>
            <li>Meglio poche irrigazioni abbondanti che tante leggere: l'acqua deve arrivare in profondità e spingere le radici verso il basso.</li>
            <li>Irriga al mattino presto o la sera, sempre al piede. Le foglie bagnate favoriscono funghi (peronospora, oidio).</li>
            <li>Pacciama con paglia o foglie secche: dimezza l'acqua necessaria e tiene a bada le erbacce.</li>
            <li>Un'ala gocciolante con timer rende l'irrigazione regolare: la regolarità conta quanto la quantità.</li>
          </ul>
        </section>

        <section class="card">
          <div class="section-title"><h2>🤝 Consociazioni</h2></div>
          <p style="margin-top:0">Coltivare vicine piante che si aiutano: profondità di radici diverse, odori che confondono i parassiti, una che fa ombra all'altra. Esempi classici:</p>
          <ul class="clean">
            <li>🍅 Pomodoro + 🌿 basilico: il basilico allontana alcuni insetti e cresce bene nella mezz'ombra.</li>
            <li>🥕 Carota + 🧅 cipolla/porro: si proteggono a vicenda dalle rispettive mosche.</li>
            <li>🌽 Mais + 🫘 fagiolo + 🎃 zucca ("tre sorelle"): il mais fa da tutore, il fagiolo porta azoto, la zucca copre il suolo.</li>
            <li>Da evitare: 🫘 leguminose vicino ad 🧄 aglio e 🧅 cipolla, e il finocchio vicino a quasi tutto.</li>
          </ul>
        </section>

        <section class="card">
          <div class="section-title"><h2>🗺️ Le zone</h2></div>
          ${Object.values(ZONE).map(z => `<p style="margin:0 0 6px"><strong>${esc(z.nome)}</strong> — ${esc(z.desc)}</p>`).join('')}
          <p class="muted small" style="margin:8px 0 0">I calendari sono indicativi: in collina o vicino al mare possono spostarsi di 2–3 settimane. La regola d'oro per le colture estive è aspettare la fine delle gelate.</p>
        </section>
      </div>`;
  }

  // ── Account e Premium (account.js) ─────────────────────
  const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  const account = window.OrtoAccount({
    esc, store, state, ZONE, rerender,
    impostaZona(z) { state.zona = z; store.set('zona', z); renderZone(); }
  });

  // ── Modulo aiuole "Il mio orto" (cassoni.js) ───────────
  const cassoni = window.OrtoCassoni({
    C, BY_ID, FAM, ESIG, ZONE, store, state, esc, inMese, famDot, chip, relazioni, PERENNI, ROTAZIONE, areaPianta, account, rerender
  });
  account.collega({ get: cassoni.getDati, set: cassoni.setDati });

  // ── Assistente e primo avvio ───────────────────────────
  const assistente = window.OrtoAssistente({ esc, store, account, rerender });
  const benvenuto = window.OrtoBenvenuto({
    esc, store, state, ZONE, cassoni,
    impostaZona(z) { state.zona = z; store.set('zona', z); renderZone(); account.zonaCambiata(z); }
  });

  // ── Testata delle pagine: foto, percorso e Indietro ────
  // crumbs: [[etichetta, link], ...]; l'ultima voce è la pagina corrente.
  function banner({ foto: id, eyebrow, titolo, sub, crumbs }) {
    const percorso = [['Home', '#/'], ...crumbs];
    const genitore = percorso[percorso.length - 2][1];
    return `
      <section class="banner">
        ${img(id, '', 'hero-img', '100vw')}
        <div class="hero-velo"></div>
        <div class="banner-testo">
          <nav class="crumbs" aria-label="Percorso">
            <button class="indietro" type="button" data-indietro="${genitore}">‹ Indietro</button>
            <span class="crumbs-path">${percorso.map(([t, l], i) => i < percorso.length - 1 ? `<a href="${l}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`).join('<span class="sep">›</span>')}</span>
          </nav>
          ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
          <h1>${esc(titolo)}</h1>
          ${sub ? `<p class="banner-sub">${sub}</p>` : ''}
        </div>
      </section>`;
  }
  function testata(page, arg) {
    const zona = `zona ${esc(ZONE[state.zona].nome)}`;
    switch (page) {
      case 'mese': return { foto: FOTO.semina, eyebrow: 'Calendario · ' + zona, titolo: 'Calendario dell\'orto', sub: 'Cosa seminare, trapiantare e raccogliere, mese per mese.', crumbs: [['Calendario']] };
      case 'colture': return { foto: FOTO.raccolto, eyebrow: 'Colture', titolo: 'Schede degli ortaggi', sub: `${C.length} colture: acqua, terreno, tempi, consociazioni e malattie.`, crumbs: [['Colture']] };
      case 'coltura': {
        const c = BY_ID[arg];
        if (!c) return { foto: FOTO.raccolto, titolo: 'Coltura non trovata', crumbs: [['Colture', '#/colture'], ['Non trovata']] };
        return { foto: window.FOTO_COLTURE[c.id] || FOTO.raccolto, eyebrow: esc(FAM[c.fam].nome), titolo: c.nome, sub: esc(c.ciclo), crumbs: [['Colture', '#/colture'], [c.nome]] };
      }
      case 'cassoni': return { foto: FOTO.aiuole, eyebrow: 'Il mio orto · ' + zona, titolo: 'Le tue aiuole', sub: 'Progetta, ruota e segui ogni aiuola stagione dopo stagione.', crumbs: [['Il mio orto']] };
      case 'cassone': {
        const a = cassoni.info(arg);
        if (!a) return { foto: FOTO.aiuole, titolo: 'Aiuola non trovata', crumbs: [['Il mio orto', '#/cassoni'], ['Non trovata']] };
        return { foto: a.tipo === 'terra' ? FOTO.terra : a.tipo === 'vaso' ? FOTO.vaso : FOTO.cassone, eyebrow: esc(a.tipoNome), titolo: a.nome, sub: `${a.larghezza} × ${a.lunghezza} cm · ${esc(a.stagione)}`, crumbs: [['Il mio orto', '#/cassoni'], [a.nome]] };
      }
      case 'guida': return { foto: FOTO.guida, eyebrow: 'Guida', titolo: 'Guida all\'orto', sub: 'Rotazione, famiglie botaniche, irrigazione e consociazioni.', crumbs: [['Guida']] };
      case 'assistente': return { foto: FOTO.aiuole, eyebrow: 'Assistente', titolo: 'Assistente dell\'orto', sub: 'Chiedi qualsiasi cosa: conosce le tue aiuole, la tua zona e il meteo.', crumbs: [['Assistente']] };
      case 'privacy': return { foto: FOTO.terra, eyebrow: 'Privacy', titolo: 'Informativa privacy', sub: 'Quali dati trattiamo, perché e come puoi controllarli.', crumbs: [['Privacy']] };
      case 'termini': return { foto: FOTO.terra, eyebrow: 'Condizioni', titolo: 'Condizioni d\'uso', sub: 'Le regole del servizio, in parole semplici.', crumbs: [['Condizioni d\'uso']] };
      case 'account': return { foto: FOTO.account, eyebrow: 'Account', titolo: account.utente() ? 'Il tuo account' : 'Accedi o registrati', sub: 'Premium, sincronizzazione, meteo e notifiche.', crumbs: [['Account']] };
    }
    return null;
  }
  // "Indietro" torna alla pagina precedente se si è navigato dentro l'app, altrimenti alla pagina superiore.
  let passi = 0;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-indietro]');
    if (!b) return;
    if (passi > 0) history.back(); else location.hash = b.dataset.indietro;
  });

  // ── Router ─────────────────────────────────────────────
  let lastRoute = '';
  function route() {
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [page, arg] = h.split('/');
    const view = document.getElementById('view');
    let html, bind = null, tab = page;
    if (page === 'colture') { html = viewColture(); bind = bindColture; }
    else if (page === 'cassoni') { html = cassoni.viewLista(); bind = cassoni.bindLista; }
    else if (page === 'cassone') { html = cassoni.viewCassone(arg); bind = v => cassoni.bindCassone(v, arg); tab = 'cassoni'; }
    else if (page === 'coltura') { html = viewColtura(arg); bind = bindColtura; tab = 'colture'; }
    else if (page === 'guida') { html = viewGuida(); }
    else if (page === 'account') { html = account.viewAccount(); bind = account.bindAccount; }
    else if (page === 'assistente') { html = assistente.view(); bind = assistente.bind; }
    else if (page === 'privacy') { html = window.OrtoLegale.privacy(); }
    else if (page === 'termini') { html = window.OrtoLegale.termini(); }
    else if (page === 'mese') { html = viewMese(); bind = bindMese; }
    else { html = viewHome(); bind = bindHome; tab = 'home'; }
    const t = tab === 'home' ? null : testata(page, arg);
    if (t) html = banner(t) + `<div class="pagina-corpo">${html}</div>`;
    document.body.classList.toggle('pagina-home', tab === 'home');
    document.body.classList.toggle('pagina-foto', true);
    view.innerHTML = html;
    if (bind) bind(view);
    document.querySelectorAll('#menu a').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
    apriMenu(false);
    if (h !== lastRoute) window.scrollTo(0, 0);
    lastRoute = h;
  }
  const render = route;

  // ── Menu a tendina ─────────────────────────────────────
  const menuBtn = document.getElementById('menuBtn'), menu = document.getElementById('menu'), velo = document.getElementById('menuVelo');
  function apriMenu(apri) {
    menu.hidden = !apri; velo.hidden = !apri;
    menuBtn.setAttribute('aria-expanded', String(apri));
  }
  menuBtn.onclick = () => apriMenu(menu.hidden);
  velo.onclick = () => apriMenu(false);
  menu.onclick = e => { if (e.target.closest('a')) apriMenu(false); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { apriMenu(false); menuBtn.focus(); } });
  // In home l'intestazione è trasparente sopra la foto e diventa piena scorrendo.
  const aggiornaTesta = () => document.body.classList.toggle('scorso', window.scrollY > 60);
  window.addEventListener('scroll', aggiornaTesta, { passive: true });
  aggiornaTesta();

  window.addEventListener('hashchange', () => { state.calZona = null; passi++; route(); });
  renderZone();
  route();
  account.avvio();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
