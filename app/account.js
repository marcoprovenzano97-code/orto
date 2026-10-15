// Account (Supabase): accesso con codice via email, piano premium, sincronizzazione cloud
// dell'orto, posizione per il meteo, notifiche push e scheda "Oggi nel tuo orto".
// Senza configurazione (config.js vuoto) l'app resta tutta locale e questa parte è nascosta.
window.OrtoAccount = function (ctx) {
  'use strict';
  const { esc, store, state, ZONE } = ctx;
  const CFG = window.ORTO_CONFIG || {};
  const attivo = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
  const sb = attivo ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
    // detectSessionInUrl: legge il link "password dimenticata" (#access_token=…&type=recovery)
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
  }) : null;

  const st = { utente: null, profilo: null, pronto: !attivo, fase: 'email', email: '', errore: '', avviso: '' };
  let fonte = null;            // { get(), set(dati) } fornito dal modulo aiuole
  let timer = null;

  const premium = () => {
    const p = st.profilo;
    return !!(p && p.premium && (!p.premium_fino || new Date(p.premium_fino) > new Date()));
  };
  const fmtData = s => new Date(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtOra = s => new Date(s).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  // ── Avvio e sessione ───────────────────────────────────
  async function caricaProfilo() {
    const { data } = await sb.from('profili').select('*').eq('id', st.utente.id).maybeSingle();
    st.profilo = data;
    if (data && data.zona && ZONE[data.zona] && data.zona !== state.zona) ctx.impostaZona(data.zona);
  }
  async function entrato() {
    await caricaProfilo();
    await sincronizza();
    ctx.rerender();
  }
  async function avvio() {
    if (!attivo) return;
    const { data } = await sb.auth.getSession();
    st.utente = (data.session && data.session.user) || null;
    if (st.utente) await entrato();
    st.pronto = true;
    ctx.rerender();
    sb.auth.onAuthStateChange((evento, session) => {
      if (evento === 'PASSWORD_RECOVERY') {
        st.fase = 'nuovaPassword';
        setTimeout(() => { location.hash = '#/account'; ctx.rerender(); }, 0);
      }
      const prima = st.utente && st.utente.id;
      st.utente = (session && session.user) || null;
      // Le chiamate a Supabase vanno fatte fuori dal callback (evita blocchi della libreria).
      if (st.utente && st.utente.id !== prima) setTimeout(entrato, 0);
      if (!st.utente && prima) { st.profilo = null; setTimeout(ctx.rerender, 0); }
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizza(); });
  }

  // ── Sincronizzazione (solo premium) ────────────────────
  // Vince la versione modificata più di recente. Al primo collegamento di un dispositivo
  // che ha già aiuole proprie, si chiede quale tenere.
  async function sincronizza() {
    if (!st.utente || !premium() || !fonte) return;
    const locale = fonte.get();
    const { data, error } = await sb.from('orti').select('dati, aggiornato').eq('user_id', st.utente.id).maybeSingle();
    if (error) { st.errore = 'Sincronizzazione non riuscita: ' + error.message; return; }
    const giaCollegato = store.get('syncUtente', null) === st.utente.id;
    const haLocale = (locale.cassoni || []).length > 0;
    const tLoc = Date.parse(locale.aggiornato || 0) || 0, tRem = data ? Date.parse(data.aggiornato) : 0;
    if (data && haLocale && !giaCollegato && (data.dati.cassoni || []).length) {
      const usaAccount = confirm('Su questo dispositivo ci sono già delle aiuole, e anche nel tuo account.\n\nOK = usa quelle dell\'account (sostituiscono quelle del dispositivo)\nAnnulla = carica nell\'account quelle di questo dispositivo');
      if (usaAccount) fonte.set(data.dati); else await carica(locale);
    } else if (data && tRem > tLoc) {
      fonte.set(data.dati);
    } else if (!data || tLoc > tRem) {
      await carica(locale);
    }
    store.set('syncUtente', st.utente.id);
    segna();
    ctx.rerender();
  }
  async function carica(dati) {
    const { error } = await sb.from('orti').upsert({ user_id: st.utente.id, dati, aggiornato: dati.aggiornato || new Date().toISOString() });
    if (error) st.errore = 'Sincronizzazione non riuscita: ' + error.message; else segna();
  }
  function segna() { st.errore = ''; store.set('ultimaSync', new Date().toISOString()); }
  function datiSalvati(dati) {
    if (!st.utente || !premium()) return;
    clearTimeout(timer);
    timer = setTimeout(() => carica(dati), 1500);
  }

  // ── Profilo: zona, posizione ───────────────────────────
  function zonaCambiata(z) {
    if (st.utente && st.profilo) { st.profilo.zona = z; sb.from('profili').update({ zona: z }).eq('id', st.utente.id).then(() => {}); }
  }
  async function salvaPosizione(luogo, lat, lon) {
    const { error } = await sb.from('profili').update({ luogo, lat, lon }).eq('id', st.utente.id);
    if (error) throw error;
    Object.assign(st.profilo, { luogo, lat, lon });
    try { sessionStorage.removeItem('orto.meteo'); } catch (e) { /* ignore */ }
  }
  async function cercaComune(q) {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=it&countryCode=IT`);
    const j = await r.json();
    return (j.results || []).map(x => ({ nome: [x.name, x.admin2 || x.admin1].filter(Boolean).join(' (') + (x.admin2 || x.admin1 ? ')' : ''), lat: x.latitude, lon: x.longitude }));
  }

  // ── Notifiche push ─────────────────────────────────────
  function b64ToU8(b64) {
    const pad = '='.repeat((4 - b64.length % 4) % 4);
    const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, ch => ch.charCodeAt(0));
  }
  const pushSupportato = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  async function statoNotifiche() {
    if (!pushSupportato()) return 'non-supportate';
    if (Notification.permission === 'denied') return 'negate';
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && await reg.pushManager.getSubscription();
    return sub && Notification.permission === 'granted' ? 'attive' : 'spente';
  }
  async function attivaNotifiche() {
    if (!pushSupportato()) throw new Error('Questo browser non supporta le notifiche. Su iPhone aggiungi prima l\'app alla schermata Home e aprila da lì.');
    if (!CFG.vapidPublicKey) throw new Error('Notifiche non ancora configurate.');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Permesso negato: puoi riattivarlo dalle impostazioni del browser per questo sito.');
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(CFG.vapidPublicKey) });
    const j = sub.toJSON();
    const { error } = await sb.from('push_iscrizioni').upsert({ user_id: st.utente.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: 'endpoint' });
    if (error) throw error;
    await sb.from('profili').update({ notifiche: true }).eq('id', st.utente.id);
    st.profilo.notifiche = true;
    await reg.showNotification('Il mio Orto', { body: 'Notifiche attive: ti avviso di pioggia, caldo, gelate e dei lavori della settimana.', icon: 'icons/icon-192.png' });
  }
  async function disattivaNotifiche() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && await reg.pushManager.getSubscription();
    if (sub) {
      await sb.from('push_iscrizioni').delete().eq('endpoint', sub.endpoint);
      await sub.unsubscribe();
    }
  }

  // ── Meteo e scheda "Oggi nel tuo orto" ────────────────
  async function meteo(lat, lon) {
    const chiave = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    try {
      const c = JSON.parse(sessionStorage.getItem('orto.meteo') || 'null');
      if (c && c.chiave === chiave && Date.now() - c.t < 3600e3) return c.dati;
    } catch (e) { /* ignore */ }
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=5&forecast_days=4&timezone=Europe%2FRome`);
    const dati = await r.json();
    try { sessionStorage.setItem('orto.meteo', JSON.stringify({ chiave, t: Date.now(), dati })); } catch (e) { /* ignore */ }
    return dati;
  }
  function htmlOggi() {
    if (!attivo) return '';
    if (!premium()) {
      return `<a class="card premium-teaser" href="#/account">
        <span class="pt-icon">🔔</span>
        <span><strong>Oggi nel tuo orto</strong><span class="muted small" style="display:block">Con Premium: avvisi su pioggia, caldo e gelate per le tue aiuole, promemoria dei lavori e sincronizzazione tra dispositivi.</span></span>
        <span class="chev">›</span></a>`;
    }
    return `<section class="card oggi" id="oggiCard"><div class="section-title"><h2>🔔 Oggi nel tuo orto</h2></div><p class="muted small" style="margin:0">Carico meteo e promemoria…</p></section>`;
  }
  async function bindOggi(root) {
    const el = root.querySelector('#oggiCard');
    if (!el || !fonte) return;
    const p = st.profilo;
    let m = null, notaMeteo = '';
    if (p && p.lat != null) {
      try { m = await meteo(p.lat, p.lon); } catch (e) { notaMeteo = 'Meteo non disponibile in questo momento.'; }
    } else {
      notaMeteo = '<a href="#/account">Imposta il tuo comune</a> per ricevere gli avvisi meteo.';
    }
    const voci = window.OrtoPromemoria.calcola({ colture: window.COLTURE, dati: fonte.get(), zona: state.zona, meteo: m, oggi: new Date() });
    const ordine = { alta: 0, media: 1, info: 2 };
    voci.sort((a, b) => ordine[a.livello] - ordine[b.livello]);
    if (!el.isConnected) return;
    el.innerHTML = `<div class="section-title"><h2>🔔 Oggi nel tuo orto</h2>${p && p.luogo ? `<span class="muted small" style="margin-left:auto">${esc(p.luogo)}</span>` : ''}</div>
      ${voci.length ? `<ul class="avvisi">${voci.map(v => `<li class="${v.livello === 'alta' ? 'bad' : v.livello === 'media' ? '' : 'good'}"><span></span><span><strong>${esc(v.titolo)}</strong><br>${esc(v.testo)}${v.link ? ` <a href="${v.link}">Apri</a>` : ''}</span></li>`).join('')}</ul>` : '<p class="empty" style="margin:0">Nessun avviso per oggi.</p>'}
      ${notaMeteo ? `<p class="muted small" style="margin:10px 0 0">${notaMeteo}</p>` : ''}`;
  }

  // ── Pagina Account ─────────────────────────────────────
  const VANTAGGI = [
    ['🌱', 'Aiuole illimitate', 'con storico, rotazione e disegno'],
    ['☁️', 'Sincronizzazione', 'stesso orto su telefono e PC, con backup automatico'],
    ['🔔', 'Promemoria', 'raccolte, aiuole libere e semine della settimana'],
    ['🌦️', 'Irrigazione col meteo', 'avvisi di pioggia, caldo e gelate per il tuo comune'],
    ['🧺', 'Diario dei raccolti', 'quanto hai raccolto, aiuola per aiuola']
  ];
  function viewAccount() {
    const testa = `<h1 style="font-size:1.4rem;margin:4px 0 12px">Account</h1>`;
    if (!attivo) return testa + `<div class="card"><p style="margin:0">Gli account e il Premium sono in arrivo. Per ora l'app funziona tutta su questo dispositivo.</p></div>`;
    if (!st.pronto) return testa + '<p class="muted">Caricamento…</p>';
    const msg = (st.errore ? `<p class="note err">${esc(st.errore)}</p>` : '') + (st.avviso ? `<p class="note">${esc(st.avviso)}</p>` : '');
    const vantaggi = `<ul class="vantaggi">${VANTAGGI.map(([i, t, d]) => `<li><span>${i}</span><span><strong>${t}</strong> <span class="muted">— ${d}</span></span></li>`).join('')}</ul>`;

    if (st.fase === 'nuovaPassword' && st.utente) {
      return testa + `<section class="card"><div class="section-title"><h2>Nuova password</h2></div>${msg}
        <form class="form" id="formNuovaPw">
          <label>Nuova password<input type="password" name="pw" required minlength="8" autocomplete="new-password"></label>
          <button class="btn primary" type="submit">Salva password</button>
        </form></section>`;
    }
    if (!st.utente) {
      const registra = st.fase === 'registra';
      const form = `
        <div class="seg" role="tablist">
          <button type="button" role="tab" aria-selected="${!registra}" data-fase="email">Entra</button>
          <button type="button" role="tab" aria-selected="${registra}" data-fase="registra">Crea account</button>
        </div>
        <form class="form" id="formAccesso">
          <label>Email<input type="email" name="email" required autocomplete="email" value="${esc(st.email)}" placeholder="nome@esempio.it"></label>
          <label>Password<input type="password" name="pw" required minlength="${registra ? 8 : 6}" autocomplete="${registra ? 'new-password' : 'current-password'}"${registra ? ' placeholder="almeno 8 caratteri"' : ''}></label>
          <button class="btn primary" type="submit">${registra ? 'Crea account' : 'Entra'}</button>
          ${registra ? '' : '<button class="link" type="button" id="pwDimenticata" style="align-self:flex-start">Password dimenticata?</button>'}
        </form>`;
      return testa + `<div class="stack">
        <section class="card">${msg}${form}</section>
        <section class="card premium-box"><div class="section-title"><h2>✨ Premium</h2></div>${vantaggi}</section>
      </div>`;
    }

    const p = st.profilo || {};
    const piano = premium()
      ? `<span class="pill now-badge">Premium attivo${p.premium_fino ? ' fino al ' + fmtData(p.premium_fino) : ''}</span>`
      : '<span class="pill">Piano gratuito</span>';
    const ultima = store.get('ultimaSync', null);
    let h = testa + `<div class="stack">${msg}
      <section class="card">
        <div class="section-title"><h2>👤 ${esc(st.utente.email)}</h2></div>
        <p style="margin:0">${piano}</p>
      </section>`;
    if (!premium()) {
      h += `<section class="card premium-box"><div class="section-title"><h2>✨ Premium</h2></div>${vantaggi}
        <p class="note" style="margin-top:12px">Il Premium è in fase di prova ed è attivabile su invito. Gli abbonamenti arriveranno a breve.</p></section>`;
    } else {
      h += `
      <section class="card">
        <div class="section-title"><h2>📍 Il tuo comune</h2></div>
        <p class="muted small" style="margin:0 0 10px">Serve per il meteo: pioggia, caldo e gelate. Viene salvata solo la posizione del comune.</p>
        ${p.luogo ? `<p style="margin:0 0 10px">Attuale: <strong>${esc(p.luogo)}</strong></p>` : ''}
        <form class="form" id="formComune"><label>Cerca il comune<input name="q" required minlength="2" placeholder="es. Lumezzane" autocomplete="off"></label>
          <div class="btns"><button class="btn" type="submit">Cerca</button><button class="btn" type="button" id="posAttuale">📍 Usa la mia posizione</button></div></form>
        <div id="risultatiComune" class="chips" style="margin-top:10px"></div>
      </section>
      <section class="card">
        <div class="section-title"><h2>🔔 Notifiche</h2></div>
        <p class="muted small" style="margin:0 0 10px">Ogni mattina: avvisi di pioggia, caldo e gelate. Il lunedì: raccolte e lavori della settimana.</p>
        <div id="statoNotifiche" class="muted small">Verifico…</div>
      </section>
      <section class="card">
        <div class="section-title"><h2>☁️ Sincronizzazione</h2></div>
        <p style="margin:0 0 10px">${ultima ? 'Ultima sincronizzazione: ' + fmtOra(ultima) : 'Non ancora sincronizzato.'}</p>
        <button class="btn" id="syncOra">Sincronizza ora</button>
      </section>`;
    }
    h += `<button class="btn" id="esci">Esci</button></div>`;
    return h;
  }

  function bindAccount(root) {
    if (!attivo) return;
    const mostra = (errore, avviso) => { st.errore = errore || ''; st.avviso = avviso || ''; ctx.rerender(); };
    const occupato = (btn, s) => { if (btn) { btn.disabled = s; } };

    root.querySelectorAll('[data-fase]').forEach(b => b.onclick = () => {
      const f = root.querySelector('#formAccesso');
      if (f) st.email = f.email.value.trim();
      st.fase = b.dataset.fase; mostra();
    });
    const fa = root.querySelector('#formAccesso');
    if (fa) {
      fa.onsubmit = async e => {
        e.preventDefault();
        const b = fa.querySelector('button[type=submit]'); occupato(b, true);
        st.email = fa.email.value.trim();
        const cred = { email: st.email, password: fa.pw.value };
        const { data, error } = st.fase === 'registra' ? await sb.auth.signUp(cred) : await sb.auth.signInWithPassword(cred);
        if (error) {
          occupato(b, false);
          const t = /invalid login/i.test(error.message) ? 'Email o password non corretti.'
            : /already registered/i.test(error.message) ? 'Esiste già un account con questa email: usa "Entra".'
            : /password/i.test(error.message) ? 'Password non valida: usane una di almeno 8 caratteri.'
            : 'Accesso non riuscito: ' + error.message;
          return mostra(t);
        }
        if (!data.session) return mostra('', 'Account creato: controlla la posta per confermare l\'indirizzo.');
        st.fase = 'email'; st.errore = ''; st.avviso = '';
      };
      const pd = root.querySelector('#pwDimenticata');
      if (pd) pd.onclick = async () => {
        const email = fa.email.value.trim();
        if (!email) return mostra('Scrivi prima la tua email qui sopra.');
        st.email = email;
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
        if (error) return mostra('Invio non riuscito: ' + error.message);
        mostra('', 'Ti ho mandato un\'email con il link per scegliere una nuova password. Aprilo da questo dispositivo.');
      };
    }
    const fn = root.querySelector('#formNuovaPw');
    if (fn) fn.onsubmit = async e => {
      e.preventDefault();
      const { error } = await sb.auth.updateUser({ password: fn.pw.value });
      if (error) return mostra('Password non salvata: ' + error.message);
      st.fase = 'email'; mostra('', 'Password aggiornata.');
    };
    const esci = root.querySelector('#esci');
    if (esci) esci.onclick = async () => { await sb.auth.signOut(); st.fase = 'email'; mostra(); };

    const sync = root.querySelector('#syncOra');
    if (sync) sync.onclick = async () => { occupato(sync, true); await sincronizza(); st.avviso = st.errore ? '' : 'Sincronizzato.'; ctx.rerender(); };

    const fcom = root.querySelector('#formComune');
    if (fcom) {
      const ris = root.querySelector('#risultatiComune');
      fcom.onsubmit = async e => {
        e.preventDefault();
        ris.innerHTML = '<span class="muted small">Cerco…</span>';
        try {
          const lista = await cercaComune(fcom.q.value.trim());
          ris.innerHTML = lista.length ? lista.map((x, i) => `<button class="chip" type="button" data-i="${i}">${esc(x.nome)}</button>`).join('') : '<span class="muted small">Nessun comune trovato.</span>';
          ris.onclick = async ev => {
            const b = ev.target.closest('button[data-i]');
            if (!b) return;
            const x = lista[+b.dataset.i];
            try { await salvaPosizione(x.nome, x.lat, x.lon); mostra('', 'Comune salvato: ' + x.nome); } catch (err) { mostra('Salvataggio non riuscito: ' + err.message); }
          };
        } catch (err) { ris.innerHTML = '<span class="muted small">Ricerca non disponibile, riprova.</span>'; }
      };
      root.querySelector('#posAttuale').onclick = () => {
        if (!navigator.geolocation) return mostra('Posizione non disponibile su questo dispositivo.');
        navigator.geolocation.getCurrentPosition(async pos => {
          // Arrotondata a ~1 km: basta per il meteo e non salva la posizione esatta.
          const lat = Math.round(pos.coords.latitude * 100) / 100, lon = Math.round(pos.coords.longitude * 100) / 100;
          try { await salvaPosizione('Posizione attuale', lat, lon); mostra('', 'Posizione salvata.'); } catch (err) { mostra('Salvataggio non riuscito: ' + err.message); }
        }, () => mostra('Non è stato possibile leggere la posizione: controlla i permessi.'), { maximumAge: 600000, timeout: 15000 });
      };
    }

    const sn = root.querySelector('#statoNotifiche');
    if (sn) statoNotifiche().then(s => {
      if (!sn.isConnected) return;
      const testi = {
        'non-supportate': 'Questo browser non supporta le notifiche. Su iPhone: aggiungi l\'app alla schermata Home (Condividi → Aggiungi alla schermata Home) e aprila da lì.',
        negate: 'Le notifiche sono bloccate per questo sito: riattivale dalle impostazioni del browser.',
        attive: '✅ Attive su questo dispositivo.',
        spente: 'Non attive su questo dispositivo.'
      };
      sn.innerHTML = `<p style="margin:0 0 10px">${testi[s]}</p>` +
        (s === 'spente' ? '<button class="btn primary" id="attivaNotifiche">Attiva notifiche</button>' : s === 'attive' ? '<button class="btn" id="spegniNotifiche">Disattiva su questo dispositivo</button>' : '');
      const a = sn.querySelector('#attivaNotifiche');
      if (a) a.onclick = async () => { occupato(a, true); try { await attivaNotifiche(); mostra('', 'Notifiche attivate.'); } catch (err) { mostra(err.message); } };
      const d = sn.querySelector('#spegniNotifiche');
      if (d) d.onclick = async () => { occupato(d, true); await disattivaNotifiche(); mostra('', 'Notifiche disattivate su questo dispositivo.'); };
    });
  }

  return {
    attivo, premium, avvio, collega: f => { fonte = f; }, datiSalvati, zonaCambiata,
    htmlOggi, bindOggi, viewAccount, bindAccount,
    utente: () => st.utente
  };
};
