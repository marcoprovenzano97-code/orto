// Promemoria del giorno: meteo + calendario delle aiuole.
// Funzione pura, usata sia dall'app (scheda "Oggi nel tuo orto") sia dalla funzione
// sul server che invia le notifiche push (supabase/functions/promemoria).
(function (root) {
  'use strict';

  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  // Colture che soffrono di più la sete col caldo.
  const ASSETATE = new Set(['pomodoro', 'melanzana', 'peperone', 'zucchina', 'cetriolo', 'melone', 'anguria', 'zucca', 'sedano', 'lattuga', 'basilico', 'fagiolino', 'mais', 'finocchio']);
  // Colture danneggiate da temperature vicine allo zero.
  const GELO_FAM = new Set(['solanacee', 'cucurbitacee']);
  const GELO = new Set(['basilico', 'fagiolo', 'fagiolino', 'mais']);

  function mesi(spec) {
    const out = new Set();
    if (!spec) return out;
    spec.split(',').forEach(part => {
      const [a, b] = part.split('-').map(Number);
      if (!b) { out.add(a); return; }
      let m = a;
      for (let i = 0; i < 12; i++) { out.add(m); if (m === b) break; m = m % 12 + 1; }
    });
    return out;
  }
  // PE = impianti da febbraio a giugno; AI = da luglio a gennaio (come in cassoni.js).
  function stagioneDa(d) {
    const m = d.getMonth() + 1, y = d.getFullYear();
    if (m >= 2 && m <= 6) return y + '-PE';
    return (m >= 7 ? y : y - 1) + '-AI';
  }
  const pad = n => String(n).padStart(2, '0');
  const isoGiorno = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const elenco = arr => arr.slice(0, 5).map(c => `${c.emoji} ${c.nome}`).join(', ') + (arr.length > 5 ? ` e altre ${arr.length - 5}` : '');

  // Colture presenti nelle aiuole oggi. Le stagioni indicano quando si pianta, ma le colture
  // restano in campo più a lungo: da luglio a ottobre ci sono ancora quelle di primavera-estate,
  // da febbraio a maggio quelle autunno-invernali (aglio, cavoli, fave…).
  function inCampo(dati, byId, oggi) {
    const m = oggi.getMonth() + 1, y = oggi.getFullYear();
    const chiavi = [stagioneDa(oggi)];
    if (m >= 7 && m <= 10) chiavi.push(y + '-PE');
    if (m >= 2 && m <= 5) chiavi.push((y - 1) + '-AI');
    const out = [];
    ((dati && dati.cassoni) || []).forEach(cs => {
      const ids = new Set();
      chiavi.forEach(k => {
        const p = cs.piani && cs.piani[k];
        if (p) [...Object.values(p.celle || {}), ...(p.extra || [])].forEach(id => ids.add(id));
      });
      ids.forEach(id => { if (byId[id]) out.push({ c: byId[id], aiuola: cs }); });
    });
    return out;
  }
  const uniche = list => [...new Map(list.map(x => [x.c.id, x.c])).values()];

  // ── Irrigazione in litri (metodo FAO: ETc = ET0 × Kc) ──────────────────
  // Kc di pieno sviluppo, indicativi per l'orto familiare (FAO-56, arrotondati).
  const KC = {
    pomodoro: 1.15, peperone: 1.05, melanzana: 1.05, peperoncino: 1.05, patata: 1.15,
    zucchina: 1.0, zucca: 1.0, cetriolo: 1.0, melone: 1.05, anguria: 1.0,
    fagiolo: 1.1, fagiolino: 1.05, pisello: 1.15, fava: 1.15,
    cavolfiore: 1.05, broccolo: 1.05, cappuccio: 1.05, cavolonero: 1.05, verza: 1.05, cimedirapa: 1.05,
    rucola: 1.0, ravanello: 0.9, lattuga: 1.0, radicchio: 1.0, indivia: 1.0, carciofo: 1.0,
    carota: 1.05, sedano: 1.05, prezzemolo: 1.0, finocchio: 1.0, bietola: 1.05, spinacio: 1.0, barbabietola: 1.05,
    aglio: 1.0, cipolla: 1.05, porro: 1.0, basilico: 0.95, fragola: 0.85, mais: 1.2, valerianella: 1.0, asparago: 0.95
  };
  // Vasi e cassoni rialzati perdono più acqua (bordi esposti, drenaggio rapido).
  const FATTORE_TIPO = { terra: 1.0, cassone: 1.1, vaso: 1.2 };
  const CELLA_M2 = 0.09;          // cella da 30×30 cm (predefinita; cs.cella può essere 50 o 100)
  const PIOGGIA_UTILE = 0.8;      // quota di pioggia che resta davvero nel terreno
  const SOGLIA_MM = 2;            // sotto questa carenza non conviene annaffiare

  function chiaviInCampo(oggi) {
    const m = oggi.getMonth() + 1, y = oggi.getFullYear(), k = [stagioneDa(oggi)];
    if (m >= 7 && m <= 10) k.push(y + '-PE');
    if (m >= 2 && m <= 5) k.push((y - 1) + '-AI');
    return k;
  }

  /**
   * Quanta acqua serve oggi a un'aiuola.
   * Bilancio dall'ultima irrigazione registrata (al massimo 4 giorni fa, oggi compreso):
   * evapotraspirazione della coltura meno pioggia utile, per la superficie coltivata.
   * @returns {null | {mm, litri, area, giorni, pioggiaOggi, serve}}  null se mancano meteo o colture
   */
  function irrigazione(cs, byId, meteo, oggi) {
    const d = meteo && meteo.daily;
    if (!d || !d.et0_fao_evapotranspiration) return null;
    const iso = isoGiorno(oggi), i = d.time.indexOf(iso);
    if (i < 0) return null;

    // Colture in campo con il loro peso: celle disegnate, oppure colture registrate senza griglia.
    const peso = {};
    chiaviInCampo(oggi).forEach(k => {
      const p = cs.piani && cs.piani[k];
      if (!p) return;
      Object.values(p.celle || {}).forEach(id => { if (byId[id]) peso[id] = (peso[id] || 0) + 1; });
    });
    let celle = Object.values(peso).reduce((s, n) => s + n, 0);
    let area = celle * ([50, 100].includes(cs.cella) ? cs.cella * cs.cella / 10000 : CELLA_M2);
    if (!celle) {
      chiaviInCampo(oggi).forEach(k => {
        const p = cs.piani && cs.piani[k];
        if (p) (p.extra || []).forEach(id => { if (byId[id]) peso[id] = 1; });
      });
      if (!Object.keys(peso).length) return null;
      area = (cs.larghezza || 100) * (cs.lunghezza || 100) / 10000;
    }
    const nPeso = Object.values(peso).reduce((s, n) => s + n, 0);
    const kc = Object.entries(peso).reduce((s, [id, n]) => s + (KC[id] || 1) * n, 0) / nPeso;
    const fattore = FATTORE_TIPO[cs.tipo] || FATTORE_TIPO.cassone;

    let inizio = Math.max(0, i - 3);
    if (cs.irrigata) {
      const j = d.time.indexOf(cs.irrigata);
      if (j >= 0 && j >= inizio) inizio = j + 1;
      else if (cs.irrigata > d.time[i]) inizio = i + 1;
    }
    let etc = 0, pioggia = 0;
    for (let j = inizio; j <= i; j++) {
      etc += (d.et0_fao_evapotranspiration[j] || 0) * kc * fattore;
      pioggia += (d.precipitation_sum[j] || 0) * PIOGGIA_UTILE;
    }
    const mm = Math.max(0, etc - pioggia);
    return {
      mm: Math.round(mm * 10) / 10,
      litri: Math.round(mm * area),
      area: Math.round(area * 100) / 100,
      giorni: Math.max(0, i - inizio + 1),
      pioggiaOggi: d.precipitation_sum[i] || 0,
      serve: mm >= SOGLIA_MM && (d.precipitation_sum[i] || 0) < 5
    };
  }
  // ── Calendario personale: tappe di ogni coltura dalla data d'impianto ────────────
  // Le date d'impianto stanno in piano.impianti = { <coltura>: { data: 'AAAA-MM-GG', modo: 'trapianto' | 'semina' } }.
  // Per quanti giorni, dopo la prima raccolta, la coltura continua a produrre (indicativo).
  const DURATA_RACCOLTA = {
    pomodoro: 75, peperone: 80, melanzana: 70, peperoncino: 80, patata: 20, zucchina: 60, zucca: 30, cetriolo: 45,
    melone: 30, anguria: 25, fagiolo: 30, fagiolino: 30, pisello: 25, fava: 25, cavolfiore: 20, broccolo: 30,
    cappuccio: 30, cavolonero: 120, verza: 60, rucola: 30, ravanello: 10, cimedirapa: 30, lattuga: 20, radicchio: 60,
    indivia: 30, carota: 45, sedano: 40, prezzemolo: 150, finocchio: 30, bietola: 120, spinacio: 30, barbabietola: 40,
    aglio: 20, cipolla: 30, porro: 90, basilico: 90, mais: 15, valerianella: 60
  };
  // Colture da riseminare a scaglioni per avere raccolti continui.
  const SCALARI = new Set(['lattuga', 'rucola', 'ravanello', 'fagiolino', 'spinacio', 'cimedirapa', 'valerianella']);
  const INTERVALLO_SCALARE = 21;
  const SEMENZAIO_GG = 25;        // giorni medi tra semina in semenzaio e trapianto
  const GIORNO = 864e5;
  const daISO = s => new Date(s + 'T12:00:00');
  const piuGiorni = (iso, n) => isoGiorno(new Date(daISO(iso).getTime() + n * GIORNO));
  const giorniTra = (a, b) => Math.round((daISO(b) - daISO(a)) / GIORNO);

  // "70–90 giorni dal trapianto" → { min: 70, max: 90, rif: 'trapianto' }; null per le perenni.
  // Se è indicata una varietà (imp.varieta) uso i suoi tempi.
  function ciclo(c, varieta) {
    const v = varieta && c.varieta && c.varieta.find(x => x.id === varieta);
    const testo = (v && v.ciclo) || c.ciclo || '';
    const m = /(\d+)\s*[–-]\s*(\d+)\s*giorni/.exec(testo);
    if (!m) return null;
    return { min: +m[1], max: +m[2], rif: /trapianto/.test(testo) ? 'trapianto' : /semina/.test(testo) ? 'semina' : 'impianto' };
  }

  /** Tappe delle colture di un'aiuola che hanno una data d'impianto (stagioni ancora in campo). */
  function tappe(cs, byId, oggi) {
    const out = [], iso = isoGiorno(oggi), viste = new Set();
    chiaviInCampo(oggi).forEach(k => {
      const p = cs.piani && cs.piani[k];
      if (!p || !p.impianti) return;
      const presenti = new Set([...Object.values(p.celle || {}), ...(p.extra || [])]);
      Object.entries(p.impianti).forEach(([id, imp]) => {
        const c = byId[id];
        if (!c || !imp || !imp.data || !presenti.has(id) || viste.has(id)) return;
        viste.add(id);
        const cy = ciclo(c, imp.varieta), giorni = giorniTra(imp.data, iso);
        const t = { aiuola: cs, coltura: c, stagione: k, data: imp.data, modo: imp.modo || 'trapianto', giorni,
          varieta: imp.varieta && c.varieta && c.varieta.find(x => x.id === imp.varieta) };
        if (!cy) { out.push(Object.assign(t, { stato: 'perenne' })); return; }
        // Il ciclo della scheda parte dalla semina o dal trapianto: correggo se l'impianto è avvenuto nell'altro modo.
        const corr = cy.rif === 'semina' && t.modo === 'trapianto' ? -SEMENZAIO_GG : cy.rif === 'trapianto' && t.modo === 'semina' ? SEMENZAIO_GG : 0;
        t.min = Math.max(5, cy.min + corr); t.max = Math.max(t.min, cy.max + corr);
        t.raccoltaDa = piuGiorni(imp.data, t.min);
        t.raccoltaA = piuGiorni(imp.data, t.max);
        t.fine = piuGiorni(t.raccoltaA, DURATA_RACCOLTA[id] || 21);
        t.stato = iso < t.raccoltaDa ? 'crescita' : iso <= t.fine ? 'raccolta' : 'finito';
        t.progresso = Math.max(0, Math.min(1, giorni / t.min));
        if (SCALARI.has(id) && t.stato !== 'finito') t.risemina = piuGiorni(imp.data, INTERVALLO_SCALARE);
        out.push(t);
      });
    });
    return out;
  }

  /**
   * Trattamenti di un'aiuola con il loro tempo di carenza (cs.trattamenti = [{id, data, prodotto, nome, carenza, colture: [id]}]).
   * colture vuoto = tutta l'aiuola. Restituisce quelli ancora attivi (o finiti da ≤ giorniDopo giorni) con la data "fino".
   */
  function carenze(cs, oggi, giorniDopo = 0) {
    const iso = isoGiorno(oggi);
    return (cs.trattamenti || []).filter(t => t && t.data && t.carenza > 0)
      .map(t => Object.assign({}, t, { fino: piuGiorni(t.data, t.carenza) }))
      .filter(t => t.data <= iso && iso <= piuGiorni(t.fino, giorniDopo))
      .map(t => Object.assign(t, { attivo: iso < t.fino }));
  }
  // Carenza attiva per una coltura dell'aiuola: la più lunga, oppure null.
  function carenzaPer(cs, id, oggi) {
    return carenze(cs, oggi).filter(t => t.attivo && (!t.colture || !t.colture.length || t.colture.includes(id)))
      .sort((a, b) => b.fino.localeCompare(a.fino))[0] || null;
  }

  // Semi in scorta (dati.semi = [{id, coltura, nota, scadenza: 'AAAA-MM'}]): scaduti se il mese è passato.
  const semeScaduto = (s, oggi) => !!s.scadenza && s.scadenza < isoGiorno(oggi).slice(0, 7);

  const annaffiatoi = l => {
    if (l <= 3) return '';
    const n = Math.max(1, Math.round(l / 5));
    return ` (circa ${n} annaffiato${n === 1 ? 'io' : 'i'} da 5 L)`;
  };

  /**
   * @param {object} o
   * @param {Array}  o.colture  database colture (window.COLTURE)
   * @param {object} o.dati     orto dell'utente ({ cassoni: [...] })
   * @param {string} o.zona     nord | centro | sud
   * @param {object} [o.meteo]  risposta Open-Meteo con daily: time, precipitation_sum, temperature_2m_max/min (past_days ≥ 5)
   * @param {Date}   o.oggi
   * @returns {Array<{id,tipo,livello,titolo,testo,link?}>}  tipo: meteo | lavori; livello: alta | media | info
   */
  function calcola({ colture, dati, zona, meteo, oggi }) {
    const byId = Object.fromEntries(colture.map(c => [c.id, c]));
    const iso = isoGiorno(oggi), m = oggi.getMonth() + 1;
    const aiuole = (dati && dati.cassoni) || [];
    const campo = inCampo(dati, byId, oggi), cc = uniche(campo);
    const tipi = new Set(aiuole.map(a => a.tipo || 'cassone'));
    const asciuganoPrima = tipi.has('vaso') ? ' Vasi e fioriere asciugano per primi.' : tipi.has('cassone') ? ' I cassoni rialzati asciugano prima della piena terra.' : '';
    const out = [];

    const d = meteo && meteo.daily;
    const i = d ? d.time.indexOf(iso) : -1;
    if (i >= 0) {
      const P = j => (j >= 0 && j < d.time.length && d.precipitation_sum[j]) || 0;
      const giorni = [i, i + 1, i + 2].filter(j => j < d.time.length);
      const tmax = giorni.map(j => d.temperature_2m_max[j]);
      const tmin = [i, i + 1].filter(j => j < d.time.length).map(j => d.temperature_2m_min[j]);
      const maxT = Math.max(...tmax), minT = Math.min(...tmin);
      const pioggia2 = P(i) + P(i + 1);
      const passata = [1, 2, 3, 4, 5].reduce((s, k) => s + P(i - k), 0);
      const r = Math.round;

      if (P(i) >= 5) {
        out.push({ id: `pioggia-${iso}`, tipo: 'meteo', livello: 'media', titolo: `🌧️ Oggi piove (${r(P(i))} mm)`,
          testo: 'Niente irrigazione oggi.' + (tipi.has('vaso') ? ' Controlla solo i vasi al riparo dalla pioggia.' : '') });
      } else if (pioggia2 >= 8) {
        out.push({ id: `pioggia-${iso}`, tipo: 'meteo', livello: 'media', titolo: `🌦️ Pioggia in arrivo (${r(pioggia2)} mm in 2 giorni)`,
          testo: 'Puoi saltare la prossima irrigazione.' });
      } else if (passata < 2 && pioggia2 < 2 && maxT >= 24 && cc.length) {
        out.push({ id: `secco-${iso}`, tipo: 'meteo', livello: 'media', titolo: '💧 Niente pioggia da giorni',
          testo: 'Controlla l\'umidità col dito: se a 3–5 cm il terreno è asciutto, irriga al piede.' + asciuganoPrima });
      }
      if (tmax.filter(t => t >= 32).length >= 2) {
        const sete = cc.filter(c => ASSETATE.has(c.id));
        out.push({ id: `caldo-${iso}`, tipo: 'meteo', livello: 'alta', titolo: `🌡️ Caldo in arrivo (fino a ${r(maxT)} °C)`,
          testo: 'Irriga al mattino presto, al piede e in abbondanza; la pacciamatura trattiene l\'umidità.' + (sete.length ? ` Le più assetate: ${elenco(sete)}.` : '') });
      }
      if (minT <= 2) {
        const sens = cc.filter(c => GELO_FAM.has(c.fam) || GELO.has(c.id));
        if (sens.length) {
          out.push({ id: `gelo-${iso}`, tipo: 'meteo', livello: 'alta', titolo: `❄️ Rischio gelata (minima ${r(minT)} °C)`,
            testo: `Copri con tessuto non tessuto: ${elenco(sens)}. Togli la copertura di giorno.` });
        } else if (minT <= -2 && cc.length) {
          out.push({ id: `gelo-${iso}`, tipo: 'meteo', livello: 'media', titolo: `❄️ Notte molto fredda (minima ${r(minT)} °C)`,
            testo: 'Le colture invernali resistono, ma proteggi semine giovani e insalate con tessuto non tessuto.' });
        }
      }
    }

    // Irrigazione aiuola per aiuola (solo se oggi non piove già abbastanza).
    if (i >= 0) {
      const sete = aiuole.map(cs => ({ cs, ir: irrigazione(cs, byId, meteo, oggi) })).filter(x => x.ir && x.ir.serve);
      if (sete.length) {
        const tot = sete.reduce((s, x) => s + x.ir.litri, 0);
        out.push({ id: `irriga-${iso}`, tipo: 'meteo', livello: 'media', titolo: `💧 Da annaffiare oggi (circa ${tot} L)`,
          testo: sete.map(x => `${x.cs.nome}: ${x.ir.litri} L`).join(' · ') + '. Meglio la sera o al mattino presto, al piede.',
          link: '#/cassone/' + sete[0].cs.id });
      }
    }

    // Tappe del calendario personale (una notifica per tappa, grazie all'id che include la data).
    const nomeIn = t => `${t.coltura.emoji} ${t.coltura.nome} (${t.aiuola.nome})`;
    aiuole.forEach(cs => tappe(cs, byId, oggi).forEach(t => {
      if (t.stato === 'raccolta' && iso <= piuGiorni(t.raccoltaDa, 6)) {
        out.push({ id: `pronto-${cs.id}-${t.coltura.id}-${t.raccoltaDa}`, tipo: 'evento', livello: 'media', titolo: `🧺 Pronto da raccogliere: ${nomeIn(t)}`,
          testo: `Inizia il periodo di raccolta previsto (piantato il ${t.data}). Controlla la maturazione: con il caldo può anticipare, con il freddo ritardare.`, link: '#/cassone/' + cs.id });
      }
      if (t.stato === 'finito' && iso <= piuGiorni(t.fine, 7)) {
        out.push({ id: `fine-${cs.id}-${t.coltura.id}-${t.fine}`, tipo: 'evento', livello: 'info', titolo: `🔚 Fine ciclo: ${nomeIn(t)}`,
          testo: 'La coltura è a fine produzione: quando la togli, guarda cosa piantare dopo seguendo la rotazione.', link: '#/cassone/' + cs.id });
      }
      if (t.risemina && iso >= t.risemina && iso <= piuGiorni(t.risemina, 6)) {
        out.push({ id: `risemina-${cs.id}-${t.coltura.id}-${t.risemina}`, tipo: 'evento', livello: 'info', titolo: `🌱 Risemina: ${nomeIn(t)}`,
          testo: 'Sono passate tre settimane dall\'ultima semina: una nuova semina ora ti dà raccolti continui.', link: '#/cassone/' + cs.id });
      }
    }));

    // Trattamenti: avviso finché vale il tempo di carenza, poi una notifica quando si può tornare a raccogliere.
    aiuole.forEach(cs => carenze(cs, oggi, 1).forEach(t => {
      const cols = (t.colture && t.colture.length ? t.colture : []).map(id => byId[id]).filter(Boolean);
      const cosa = cols.length ? elenco(cols) : 'tutta l’aiuola';
      if (t.attivo) {
        out.push({ id: `carenza-${cs.id}-${t.id}`, tipo: 'lavori', livello: 'alta', titolo: `🧴 Non raccogliere fino al ${t.fino.split('-').reverse().slice(0, 2).join('/')}`,
          testo: `${cs.nome}, ${cosa}: trattamento con ${t.nome || 'un prodotto'} del ${t.data.split('-').reverse().slice(0, 2).join('/')}. Rispetta sempre il tempo di carenza scritto in etichetta.`, link: '#/cassone/' + cs.id });
      } else {
        out.push({ id: `carenzafine-${cs.id}-${t.id}`, tipo: 'evento', livello: 'info', titolo: `✅ Si può tornare a raccogliere (${cs.nome})`,
          testo: `È finito il tempo di carenza del trattamento con ${t.nome || 'un prodotto'} su ${cosa}.`, link: '#/cassone/' + cs.id });
      }
    }));

    // Scorta di semi: cosa seminare questo mese tra quelli che hai già (una notifica al mese).
    const semi = ((dati && dati.semi) || []).filter(s => byId[s.coltura]);
    const buoni = semi.filter(s => !semeScaduto(s, oggi));
    const daSeminare = uniche(buoni.map(s => ({ c: byId[s.coltura] })).filter(x => ['sem', 'dir'].some(k => mesi(x.c.cal[zona][k]).has(m))));
    if (daSeminare.length) {
      out.push({ id: `semiscorta-${iso.slice(0, 7)}`, tipo: 'evento', livello: 'info', titolo: '🌰 È il momento dei tuoi semi',
        testo: `Hai in scorta semi da seminare a ${MESI[m - 1]}: ${elenco(daSeminare)}.`, link: '#/cassoni' });
    }
    const scaduti = semi.filter(s => semeScaduto(s, oggi));
    if (scaduti.length) {
      out.push({ id: `semiscaduti-${iso.slice(0, 7)}`, tipo: 'lavori', livello: 'info', titolo: '🌰 Semi scaduti in scorta',
        testo: `${elenco(uniche(scaduti.map(s => ({ c: byId[s.coltura] }))))}: possono germinare meno. Fai una prova su carta umida o semina più fitto.`, link: '#/cassoni' });
    }

    const daRaccogliere = uniche(campo.filter(x => mesi(x.c.cal[zona].rac).has(m)));
    if (daRaccogliere.length) {
      out.push({ id: `raccolta-${iso.slice(0, 7)}`, tipo: 'lavori', livello: 'info', titolo: '🧺 Periodo di raccolta', testo: elenco(daRaccogliere) + '.' });
    }
    const vuote = aiuole.filter(cs => !cs.perenne && !campo.some(x => x.aiuola === cs));
    if (vuote.length) {
      out.push({ id: `vuote-${stagioneDa(oggi)}`, tipo: 'lavori', livello: 'info', titolo: vuote.length === 1 ? '🌱 Un\'aiuola è libera' : `🌱 ${vuote.length} aiuole libere`,
        testo: `${vuote.slice(0, 3).map(v => v.nome).join(', ')}${vuote.length > 3 ? '…' : ''}: guarda cosa piantare in questa stagione.`, link: '#/cassone/' + vuote[0].id });
    }
    const semina = colture.filter(c => ['sem', 'dir'].some(k => mesi(c.cal[zona][k]).has(m)));
    if (semina.length) {
      out.push({ id: `semine-${iso.slice(0, 7)}`, tipo: 'lavori', livello: 'info', titolo: `🗓️ Da seminare a ${MESI[m - 1]}`, testo: elenco(semina) + '.', link: '#/mese' });
    }
    return out;
  }

  root.OrtoPromemoria = { calcola, stagioneDa, isoGiorno, irrigazione, annaffiatoi, tappe, ciclo, piuGiorni, giorniTra, carenze, carenzaPer, semeScaduto };
})(typeof window !== 'undefined' ? window : globalThis);
