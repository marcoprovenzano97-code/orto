// "Come si fa": schede operative passo passo (vangare, riempire un cassone, seminare, trapiantare…),
// con i passaggi da spuntare, cosa fare nella propria zona questo mese e piccoli calcolatori.
window.OrtoLavori = function (ctx) {
  'use strict';
  const { esc, store, state, C, BY_ID, inMese, img, FOTO, cassoni } = ctx;
  const MESE = new Date().getMonth() + 1;
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const fmt = (n, d = 0) => n.toLocaleString('it-IT', { maximumFractionDigits: d });

  // ── Contenuti ──────────────────────────────────────────
  const GUIDE = [
    {
      id: 'vangare', emoji: '⛏️', foto: FOTO.terra, titolo: 'Preparare il terreno',
      sub: 'Vangare, concimare e affinare la terra prima di seminare o trapiantare.',
      tempo: 'circa 1 ora ogni 10 m²', livello: 'Fatica: media',
      quando: {
        nord: 'Vangatura principale a ottobre–novembre (terreni pesanti) oppure a febbraio–marzo; affinatura 1–2 settimane prima di seminare.',
        centro: 'Vangatura principale a ottobre–novembre oppure a febbraio; affinatura 1–2 settimane prima di seminare.',
        sud: 'Vangatura principale a ottobre–dicembre oppure a gennaio–febbraio; d\'estate lavora presto al mattino.'
      },
      attrezzi: ['Vanga o forca da vanga (meglio la forca nei terreni pesanti)', 'Zappa', 'Rastrello', 'Carriola', 'Guanti e scarpe robuste'],
      passi: [
        { t: 'Controlla che il terreno sia "in tempera"', d: 'Prendi una manciata di terra a 10 cm e stringila nel pugno: se forma una palla che si sbriciola quando la tocchi, è il momento giusto. Se resta appiccicosa è troppo bagnata (rovini la struttura); se è polvere, bagna il giorno prima.' },
        { t: 'Togli erbacce, sassi e residui', d: 'Estirpa le erbe infestanti con la radice, soprattutto quelle perenni (gramigna, convolvolo). I residui sani delle colture vanno nel compost.' },
        { t: 'Spargi il concime organico', d: 'Distribuisci letame maturo o compost in modo uniforme sulla superficie (dosi nel calcolatore qui sotto). Mai letame fresco a contatto con le radici: va interrato almeno 2–3 mesi prima.' },
        { t: 'Vanga a 25–30 cm', d: 'Affonda la vanga in verticale per tutta la lama, solleva la zolla e girala appena, lasciandola grossolana. Procedi all\'indietro per non calpestare la terra lavorata. Non rivoltare in profondità lo strato fertile: con la forca da vanga basta smuovere e arieggiare.' },
        { t: 'Lascia riposare', d: 'Se vanghi in autunno lascia le zolle grosse: pioggia e gelo le sbricioleranno da sole durante l\'inverno. In primavera aspetta almeno una settimana.' },
        { t: 'Affina e livella', d: 'Prima di seminare rompi le zolle con la zappa, poi passa il rastrello avanti e indietro fino a una superficie fine e piana (il "letto di semina"). Per i trapianti può restare un po\' più grossolana.' }
      ],
      errori: ['Vangare con il terreno bagnato: si formano zolle dure come mattoni.', 'Calpestare le aiuole già lavorate.', 'Interrare letame fresco poco prima di seminare: brucia le radici e attira parassiti.'],
      extra: 'concime',
      alternativa: '<strong>Senza vangare (no-dig):</strong> sulle aiuole già avviate puoi evitare la vangatura: copri ogni autunno con 3–5 cm di compost e lascia lavorare i lombrichi. Il terreno resta più vivo e le erbacce diminuiscono.'
    },
    {
      id: 'cassone', emoji: '🪵', foto: FOTO.aiuole, titolo: 'Riempire un cassone rialzato',
      sub: 'Gli strati giusti, quanta terra serve e come non farla compattare.',
      tempo: 'mezza giornata', livello: 'Fatica: media',
      quando: { nord: 'Qualsiasi momento; ideale in autunno o a fine inverno, 2–3 settimane prima di piantare.', centro: 'Qualsiasi momento; ideale in autunno o a fine inverno, 2–3 settimane prima di piantare.', sud: 'Qualsiasi momento; ideale in autunno o in inverno, 2–3 settimane prima di piantare.' },
      attrezzi: ['Rete metallica a maglia fine (contro le talpe, se sei in piena terra)', 'Telo di tessuto non tessuto o cartone', 'Rami e ramaglie (facoltativi)', 'Terra, compost e terriccio (quantità nel calcolatore)', 'Carriola e pala'],
      passi: [
        { t: 'Prepara il fondo', d: 'Se il cassone poggia sul terreno, rompi il fondo con la vanga per far drenare l\'acqua e stendi una rete metallica contro talpe e arvicole. Sopra metti cartone senza stampe: soffoca l\'erba e poi si decompone.' },
        { t: 'Strato drenante (solo cassoni alti oltre 40 cm)', d: 'Sul fondo 10–15 cm di rami sminuzzati o ramaglie: drenano e si decompongono lentamente nutrendo la terra. Nei cassoni bassi salta questo passaggio.' },
        { t: 'Riempi con la miscela', d: 'Mescola bene terra di campo (o terriccio universale), compost maturo e terriccio: una buona regola è un terzo ciascuno. Evita solo terriccio da sacco: è leggero e si asciuga troppo in fretta.' },
        { t: 'Bagna a strati', d: 'Ogni 15–20 cm di riempimento bagna abbondantemente: la terra si assesta e non resteranno sacche d\'aria.' },
        { t: 'Colma fino a 3–5 cm dal bordo', d: 'La terra cala del 10–15% nelle prime settimane: riempi un po\' di più e rabbocca con compost ogni anno.' },
        { t: 'Aspetta prima di piantare', d: 'Lascia assestare almeno 1–2 settimane; poi rastrella la superficie e disegna la tua aiuola nell\'app.' }
      ],
      errori: ['Usare solo compost: è troppo ricco e si compatta.', 'Dimenticare la rete antitalpa in piena terra.', 'Riempire tutto a secco e bagnare solo alla fine.'],
      extra: 'volume'
    },
    {
      id: 'semenzaio', emoji: '🌱', foto: FOTO.semina, titolo: 'Seminare in semenzaio',
      sub: 'Piantine forti per pomodori, peperoni, cavoli e insalate, al riparo.',
      tempo: '30 minuti', livello: 'Facile',
      quando: { nord: 'Ortaggi estivi da fine febbraio ad aprile (al caldo, in casa o in serra); cavoli e insalate autunnali a giugno–luglio.', centro: 'Ortaggi estivi da febbraio a marzo (al caldo); cavoli e insalate autunnali a giugno–luglio.', sud: 'Ortaggi estivi da gennaio a marzo; cavoli e insalate autunnali a luglio–agosto.' },
      attrezzi: ['Vassoi alveolari o vasetti da 6–8 cm', 'Terriccio da semina (fine e leggero)', 'Nebulizzatore', 'Etichette', 'Coperchio trasparente o pellicola', 'Un davanzale luminoso o una lampada da coltivazione'],
      passi: [
        { t: 'Riempi i contenitori', d: 'Terriccio da semina leggermente inumidito, livellato e premuto appena con le dita. Deve restare soffice.' },
        { t: 'Semina alla profondità giusta', d: 'Regola d\'oro: copri il seme con uno strato di terra pari a 2–3 volte la sua grandezza (vedi la tabella qui sotto). 2–3 semi per alveolo.' },
        { t: 'Bagna e copri', d: 'Nebulizza la superficie senza spostare i semi, metti un\'etichetta con coltura e data e copri con il coperchio per mantenere l\'umidità.' },
        { t: 'Tieni al caldo', d: 'Pomodori, peperoni e melanzane vogliono 20–25 °C per germinare (sopra un termosifone tiepido va bene). Cavoli e insalate germinano già a 12–15 °C.' },
        { t: 'Alla nascita: luce!', d: 'Appena spuntano togli il coperchio e porta i vasetti nel punto più luminoso: con poca luce le piantine "filano" e diventano deboli. Gira i vassoi ogni giorno.' },
        { t: 'Dirada', d: 'Quando hanno 2 foglie vere lascia la piantina più robusta per alveolo, tagliando le altre con le forbici (non strapparle).' },
        { t: 'Abitua all\'esterno', d: '7–10 giorni prima del trapianto portale fuori di giorno, all\'ombra e poi al sole, e rientrale la notte. Trapianta dopo circa 4–8 settimane dalla semina, quando hanno 4–6 foglie.' }
      ],
      errori: ['Seminare troppo profondo: i semi piccoli non riescono a uscire.', 'Terriccio fradicio: le piantine marciscono al colletto ("moria").', 'Troppo poca luce: piantine lunghe e sottili.'],
      extra: 'semenzaio'
    },
    {
      id: 'semina', emoji: '🫘', foto: FOTO.semina, titolo: 'Semina diretta in piena terra',
      sub: 'Carote, fagioli, piselli, ravanelli, rucola: si seminano dove crescono.',
      tempo: '20 minuti per aiuola', livello: 'Facile',
      quando: { nord: 'Da marzo (piselli, carote, ravanelli) a giugno; fagioli e zucchine da metà aprile–maggio, a terreno caldo.', centro: 'Da febbraio–marzo a giugno, poi agosto–settembre per le colture autunnali.', sud: 'Quasi tutto l\'anno: evita solo i mesi più caldi per le insalate.' },
      attrezzi: ['Rastrello', 'Zappetta o un bastone per tracciare il solco', 'Cordino con due picchetti (per file dritte)', 'Annaffiatoio con la "cipolla" (getto a pioggia fine)'],
      passi: [
        { t: 'Prepara il letto di semina', d: 'Terreno affinato, senza zolle né sassi, appena umido (vedi la scheda "Preparare il terreno").' },
        { t: 'Traccia il solco', d: 'Tendi il cordino e traccia un solco con la zappetta alla profondità indicata per la coltura (tabella qui sotto). Tra un solco e l\'altro lascia la distanza "tra le file".' },
        { t: 'Distribuisci i semi', d: 'Semi grossi (fagioli, piselli, zucchine) uno per uno alla distanza giusta, o a "postarelle" di 2–3 semi. Semi minuti (carote, rucola) a pioggia, mescolati con un po\' di sabbia asciutta per non farli troppo fitti.' },
        { t: 'Copri e premi', d: 'Richiudi il solco con il dorso del rastrello e premi leggermente con la mano o con il piatto della zappa: il seme deve essere a contatto con la terra.' },
        { t: 'Bagna a pioggia fine', d: 'Annaffia delicatamente e tieni il terreno umido fino alla nascita, senza far formare la crosta. Una sottile pacciamatura di compost aiuta.' },
        { t: 'Dirada', d: 'Quando le piantine hanno 2–4 foglie, togli quelle in eccesso fino alla distanza "sulla fila". Sembra uno spreco, ma piante troppo fitte restano piccole.' }
      ],
      errori: ['Seminare in terra fredda: i semi marciscono (fagioli e zucchine vogliono almeno 12–15 °C).', 'Non diradare.', 'Getto d\'acqua forte che scopre o sposta i semi.'],
      extra: 'semina'
    },
    {
      id: 'trapianto', emoji: '🪴', foto: FOTO.aiuole, titolo: 'Trapiantare le piantine',
      sub: 'Dal vasetto all\'aiuola senza stress, alla distanza giusta.',
      tempo: '5 minuti per pianta', livello: 'Facile',
      quando: { nord: 'Ortaggi estivi da fine aprile–maggio, dopo le ultime gelate; cavoli autunnali a luglio–agosto.', centro: 'Ortaggi estivi da metà aprile; cavoli autunnali a luglio–agosto.', sud: 'Ortaggi estivi da marzo–aprile; cavoli e insalate autunnali ad agosto–settembre.' },
      attrezzi: ['Trapiantatoio o paletta', 'Annaffiatoio', 'Metro o un bastone segnato', 'Tutori e legacci per le piante alte'],
      passi: [
        { t: 'Scegli il momento', d: 'Nel tardo pomeriggio o in una giornata nuvolosa: la pianta ha la notte per riprendersi. Evita i giorni di vento forte.' },
        { t: 'Bagna le piantine', d: 'Un\'ora prima annaffia bene i vasetti: la zolla esce intera e le radici non si rompono.' },
        { t: 'Segna le distanze', d: 'Con il metro segna i punti di impianto rispettando la distanza sulla fila e tra le file (tabella qui sotto, o la griglia dell\'aiuola nell\'app).' },
        { t: 'Scava la buca', d: 'Un po\' più grande della zolla. Metti sul fondo una manciata di compost se il terreno è povero.' },
        { t: 'Metti a dimora', d: 'Togli la piantina tenendola per la zolla (mai per il fusto) e mettila alla stessa profondità del vasetto. Fanno eccezione pomodori e cavoli: interrali di più, fino alle prime foglie, così fanno nuove radici.' },
        { t: 'Rincalza e premi', d: 'Richiudi con la terra e premi bene intorno con le mani, lasciando una piccola conca per trattenere l\'acqua.' },
        { t: 'Annaffia subito', d: 'Abbondante, al piede (1–2 L per pianta). Nei giorni seguenti tieni umido; con il sole forte ombreggia per 2–3 giorni.' },
        { t: 'Tutori subito', d: 'Per pomodori, cetrioli e fagioli rampicanti pianta il tutore al momento del trapianto: dopo rischi di ferire le radici.' }
      ],
      errori: ['Trapiantare nelle ore calde.', 'Piantine non abituate all\'esterno: si "bruciano" al primo sole.', 'Troppo vicine: più malattie e raccolti piccoli.'],
      extra: 'trapianto'
    },
    {
      id: 'pacciamare', emoji: '🌾', foto: FOTO.copertina, titolo: 'Pacciamare',
      sub: 'Coprire il terreno: meno acqua, meno erbacce, terra più viva.',
      tempo: '15 minuti per aiuola', livello: 'Facile',
      quando: { nord: 'In primavera quando il terreno si è scaldato (maggio), e in autunno per proteggere il suolo.', centro: 'Da fine aprile, e in autunno per proteggere il suolo.', sud: 'Da aprile; fondamentale d\'estate per risparmiare acqua.' },
      attrezzi: ['Paglia (non fieno, che ha semi), foglie secche, erba sfalciata asciutta o cippato', 'Guanti'],
      passi: [
        { t: 'Togli le erbacce e bagna', d: 'La pacciamatura va su terreno pulito e umido: trattiene l\'umidità che c\'è, non ne crea.' },
        { t: 'Stendi lo strato', d: '5–8 cm di paglia o foglie (2–3 cm se è erba fresca, che altrimenti fermenta). Lascia libero un cerchio di 3–4 cm intorno al fusto per evitare marciumi.' },
        { t: 'Rabbocca', d: 'Il materiale si decompone: aggiungine durante la stagione. A fine anno puoi lasciarlo, o interrarlo leggermente.' }
      ],
      errori: ['Pacciamare il terreno ancora freddo in primavera: rallenta la crescita.', 'Usare fieno pieno di semi.', 'Strato a contatto con i fusti.'],
      alternativa: 'Nell\'app puoi segnare la pacciamatura sulle celle dell\'aiuola con lo strumento «Pacciamatura»: la vedi anche nella vista 3D.'
    },
    {
      id: 'compost', emoji: '♻️', foto: FOTO.terra, titolo: 'Fare il compost',
      sub: 'Trasformare scarti di cucina e dell\'orto nel concime migliore.',
      tempo: '6–12 mesi (lavoro attivo: pochi minuti a settimana)', livello: 'Facile',
      quando: { nord: 'Tutto l\'anno; si avvia meglio in primavera o in autunno.', centro: 'Tutto l\'anno; si avvia meglio in primavera o in autunno.', sud: 'Tutto l\'anno; d\'estate tienilo all\'ombra e più umido.' },
      attrezzi: ['Compostiera (o un angolo con una rete o dei bancali)', 'Forca', 'Materiale "verde" (umido) e "marrone" (secco)'],
      passi: [
        { t: 'Scegli il posto', d: 'A mezz\'ombra, sulla terra nuda (non sul cemento) così entrano lombrichi e microrganismi.' },
        { t: 'Base di rametti', d: 'Un primo strato di 10 cm di rametti fa circolare l\'aria dal basso.' },
        { t: 'Alterna verde e marrone', d: 'Verde: scarti di frutta e verdura, fondi di caffè, erba, residui dell\'orto. Marrone: foglie secche, paglia, cartone senza stampe, rametti sminuzzati. Circa 1 parte di verde per 2 di marrone.' },
        { t: 'Controlla l\'umidità', d: 'Deve essere come una spugna strizzata. Troppo bagnato e puzza: aggiungi marrone. Troppo secco e si ferma: bagna o aggiungi verde.' },
        { t: 'Rivolta', d: 'Ogni 3–4 settimane rimescola con la forca: l\'aria accelera il processo.' },
        { t: 'Usa il compost maturo', d: 'Dopo 6–12 mesi è scuro, sbriciolato e profuma di bosco: setaccialo e usalo nelle aiuole (2–3 kg/m²) o per riempire i cassoni.' }
      ],
      errori: ['Mettere carne, pesce, latticini, piante malate o erbacce con i semi.', 'Solo erba fresca: fermenta e puzza.', 'Lasciarlo secco d\'estate.']
    },
    {
      id: 'inverno', emoji: '🍂', foto: FOTO.guida, titolo: 'Preparare l\'orto per l\'inverno',
      sub: 'Liberare, proteggere e nutrire il terreno per la prossima primavera.',
      tempo: '1–2 ore', livello: 'Facile',
      quando: { nord: 'Ottobre–novembre, prima dei geli.', centro: 'Novembre–dicembre.', sud: 'Dicembre, o salta: molte aiuole restano coltivate tutto l\'inverno.' },
      attrezzi: ['Forbici e cesoie', 'Rastrello', 'Compost o letame maturo', 'Tessuto non tessuto', 'Semi da sovescio (favino, veccia, senape) se vuoi'],
      passi: [
        { t: 'Libera le aiuole finite', d: 'Togli i resti delle colture estive: quelli sani nel compost, quelli malati (peronospora, oidio) nell\'organico, mai nel compost.' },
        { t: 'Registra la stagione', d: 'Nell\'app segna cosa c\'era in ogni aiuola: servirà per la rotazione del prossimo anno.' },
        { t: 'Non lasciare il terreno nudo', d: 'Copri con 5 cm di foglie o paglia, oppure semina un sovescio (favino, veccia, senape) da interrare in primavera: protegge dalla pioggia e porta sostanza organica.' },
        { t: 'Nutri', d: 'L\'autunno è il momento del letame maturo o del compost (3–4 kg/m² di letame), che durante l\'inverno si integrerà nel terreno.' },
        { t: 'Proteggi le colture invernali', d: 'Tieni a portata di mano il tessuto non tessuto per coprire insalate, finocchi e semine giovani nelle notti di gelo (l\'app ti avvisa se attivi le notifiche Premium).' },
        { t: 'Ripara e pulisci gli attrezzi', d: 'Pulisci, asciuga e ungi le lame; ripara i cassoni prima della primavera.' }
      ],
      errori: ['Lasciare a terra piante malate.', 'Terreno nudo per tutto l\'inverno: la pioggia lo compatta e lo dilava.']
    }
  ];
  const PER_ID = Object.fromEntries(GUIDE.map(g => [g.id, g]));

  // Passaggi spuntati, salvati sul dispositivo: { guida: [indici] }
  let fatti = store.get('lavori', {});
  const salvaFatti = () => store.set('lavori', fatti);

  // ── Tabelle "nella tua zona questo mese" ───────────────
  const zona = () => state.zona;
  const daFare = k => C.filter(c => inMese(c, zona(), k, MESE)).sort((a, b) => a.nome.localeCompare(b.nome));
  function tabella(lista, colonne) {
    if (!lista.length) return `<p class="muted small" style="margin:0">A ${MESI[MESE - 1]} non ci sono colture da fare così nella tua zona. Guarda il <a href="#/mese">calendario</a> dei prossimi mesi.</p>`;
    return `<div class="tab-scorri"><table class="lav-tab"><thead><tr><th>Coltura</th>${colonne.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>
      ${lista.map(c => `<tr><td><a href="#/coltura/${c.id}">${c.emoji} ${esc(c.nome)}</a></td>${colonne.map(col => `<td>${col[1](c)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>`;
  }
  const dist = c => `${c.dist[0]} × ${c.dist[1]} cm`;
  function htmlExtra(g) {
    const titoloMese = t => `<div class="section-title"><h2>${t}</h2></div>`;
    if (g.extra === 'semina') return `<section class="card">${titoloMese(`📋 Da seminare in piena terra a ${MESI[MESE - 1]}`)}
      ${disegnoProfondita()}
      ${tabella(daFare('dir'), [['Profondità', c => esc(c.prof || '—')], ['Distanze (fila × tra file)', dist], ['Nasce in', c => esc(c.germ)]])}
      <p class="muted small" style="margin:10px 0 0">Zona ${esc(window.ZONE[zona()].nome)}: cambia zona in alto per vedere le altre.</p></section>`;
    if (g.extra === 'semenzaio') return `<section class="card">${titoloMese(`📋 Da seminare in semenzaio a ${MESI[MESE - 1]}`)}
      ${tabella(daFare('sem'), [['Profondità', c => esc(c.prof || '—')], ['Temperatura', c => esc(c.tGerm)], ['Nasce in', c => esc(c.germ)]])}</section>`;
    if (g.extra === 'trapianto') return `<section class="card">${titoloMese(`📋 Da trapiantare a ${MESI[MESE - 1]}`)}
      ${tabella(daFare('tra'), [['Distanze (fila × tra file)', dist], ['Per m²', c => '≈ ' + fmt(10000 / Math.pow(Math.max(c.dist[0], c.dist[1] / 2), 2))]])}</section>`;
    if (g.extra === 'volume') {
      const cs = (cassoni.getDati().cassoni || []).find(x => x.tipo === 'cassone' || !x.tipo);
      return `<section class="card">${titoloMese('🧮 Quanta terra serve')}
        ${disegnoStrati()}
        <form class="form calc" id="calcVolume">
          <div class="three">
            <label>Larghezza (cm)<input name="l" type="number" min="20" max="2400" value="${cs ? cs.larghezza : 120}" inputmode="numeric"></label>
            <label>Lunghezza (cm)<input name="p" type="number" min="20" max="2400" value="${cs ? cs.lunghezza : 240}" inputmode="numeric"></label>
            <label>Altezza (cm)<input name="h" type="number" min="10" max="120" value="30" inputmode="numeric"></label>
          </div>
        </form>
        <div id="risVolume" class="calc-ris"></div>
        ${cs ? `<p class="muted small" style="margin:8px 0 0">Misure precompilate dalla tua aiuola «${esc(cs.nome)}».</p>` : ''}</section>`;
    }
    if (g.extra === 'concime') {
      const terra = (cassoni.getDati().cassoni || []).reduce((s, x) => s + x.larghezza * x.lunghezza / 10000, 0);
      return `<section class="card">${titoloMese('🧮 Quanto concime serve')}
        <form class="form calc" id="calcConcime">
          <div class="two">
            <label>Superficie (m²)<input name="mq" type="number" min="1" max="10000" step="0.5" value="${terra ? fmt(Math.round(terra * 2) / 2, 1).replace(',', '.') : 10}" inputmode="decimal"></label>
            <label>Concime<select name="tipo">
              <option value="letame">Letame maturo</option><option value="compost">Compost maturo</option><option value="pellet">Letame pellettato</option>
            </select></label>
          </div>
        </form>
        <div id="risConcime" class="calc-ris"></div>
        ${terra ? `<p class="muted small" style="margin:8px 0 0">Superficie precompilata: la somma delle tue aiuole.</p>` : ''}</section>`;
    }
    return '';
  }
  function aggiornaCalcoli(root) {
    const v = root.querySelector('#calcVolume');
    if (v) {
      const l = +v.l.value || 0, p = +v.p.value || 0, h = +v.h.value || 0;
      const litri = l * p * h / 1000 * 1.1;          // +10% per l'assestamento
      const alto = h > 40, drenaggio = alto ? l * p * 12 / 1000 : 0, miscela = Math.max(0, litri - drenaggio);
      const terzo = miscela / 3, sacchi = x => Math.ceil(x / 50);
      root.querySelector('#risVolume').innerHTML = litri > 0 ? `
        <p class="calc-tot"><strong>${fmt(litri)} L</strong><span class="muted small">totali, già con il 10% in più per l'assestamento · circa ${fmt(litri / 1000, 1)} m³</span></p>
        <ul class="clean">
          ${alto ? `<li>Strato drenante di rami e ramaglie (12 cm): <strong>${fmt(drenaggio)} L</strong></li>` : ''}
          <li>Terra di campo o terriccio universale: <strong>${fmt(terzo)} L</strong> (${sacchi(terzo)} sacchi da 50 L)</li>
          <li>Compost maturo o letame maturo: <strong>${fmt(terzo)} L</strong> (${sacchi(terzo)} sacchi da 50 L)</li>
          <li>Terriccio per orto: <strong>${fmt(terzo)} L</strong> (${sacchi(terzo)} sacchi da 50 L)</li>
        </ul>
        ${litri > 1500 ? '<p class="muted small" style="margin:6px 0 0">Per quantità così grandi conviene ordinare terra e compost sfusi a metri cubi da un vivaio o da un impianto di compostaggio.</p>' : ''}` : '';
    }
    const c = root.querySelector('#calcConcime');
    if (c) {
      const mq = parseFloat(String(c.mq.value).replace(',', '.')) || 0;
      const D = { letame: [3, 4, 'Interralo in autunno o almeno 2–3 mesi prima di piantare.'], compost: [2, 3, 'Si può usare anche poco prima di piantare.'], pellet: [0.15, 0.25, 'Concentrato: rispetta le dosi della confezione.'] }[c.tipo.value];
      root.querySelector('#risConcime').innerHTML = mq > 0 ? `
        <p class="calc-tot"><strong>${fmt(mq * D[0], 1)}–${fmt(mq * D[1], 1)} kg</strong><span class="muted small">per ${fmt(mq, 1)} m² (${fmt(D[0], 2)}–${fmt(D[1], 2)} kg/m²)</span></p>
        <p class="small" style="margin:0">${D[2]} Per le colture molto esigenti (pomodoro, zucchina, cavoli) usa la dose più alta; per le leguminose e le aromatiche ne basta poco o niente.</p>` : '';
    }
  }

  // Disegni semplici e chiari: strati del cassone e profondità di semina.
  function disegnoStrati() {
    const strati = [['Terra + compost + terriccio', '#6f472c', 120], ['Rami e ramaglie (cassoni alti)', '#a07b4f', 34], ['Cartone e rete antitalpa', '#c9b28a', 10]];
    let y = 20, s = '';
    strati.forEach(([t, col, h]) => {
      s += `<rect x="40" y="${y}" width="200" height="${h}" fill="${col}"/>`;
      s += `<line x1="246" y1="${y + h / 2}" x2="262" y2="${y + h / 2}" stroke="#8a7a68"/><text x="268" y="${y + h / 2 + 4}" font-size="12" fill="currentColor">${t}</text>`;
      y += h;
    });
    return `<svg class="schema" viewBox="0 0 470 ${y + 30}" role="img" aria-label="Strati di un cassone rialzato">
      <rect x="30" y="14" width="10" height="${y - 4}" fill="#a8794e"/><rect x="240" y="14" width="10" height="${y - 4}" fill="#a8794e"/>
      <path d="M40 20 h200" stroke="#3d2618" stroke-dasharray="3 3"/><text x="268" y="16" font-size="12" fill="currentColor">3–5 cm sotto il bordo</text>
      <rect x="10" y="${y + 6}" width="260" height="8" rx="2" fill="#7fa04e"/><text x="10" y="${y + 28}" font-size="11" fill="currentColor" opacity=".7">terreno</text>
      ${s}</svg>`;
  }
  function disegnoProfondita() {
    const semi = [['Lattuga', 3, 0.4], ['Carota', 5, 0.8], ['Pisello', 12, 3.5], ['Fava', 16, 5]];
    return `<svg class="schema" viewBox="0 0 470 150" role="img" aria-label="Profondità di semina: circa 2–3 volte la grandezza del seme">
      <rect x="0" y="40" width="470" height="110" fill="#7b5236"/><rect x="0" y="34" width="470" height="8" fill="#6f472c"/>
      ${semi.map(([n, r, cm], i) => {
        const x = 60 + i * 110, y = 40 + cm * 14;
        return `<line x1="${x}" y1="40" x2="${x}" y2="${y - r}" stroke="#f3e9d8" stroke-dasharray="2 3" opacity=".7"/>
          <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .7}" fill="#e7cf97" stroke="#5a3b22"/>
          <text x="${x}" y="22" font-size="12" text-anchor="middle" fill="currentColor">${n}</text>
          <text x="${x + r + 6}" y="${y + 4}" font-size="11" fill="#f3e9d8">${String(cm).replace('.', ',')} cm</text>`;
      }).join('')}
      <text x="460" y="140" font-size="11" text-anchor="end" fill="#f3e9d8" opacity=".85">copri 2–3 volte la grandezza del seme</text>
    </svg>`;
  }

  // ── Viste ──────────────────────────────────────────────
  function viewElenco() {
    const m = MESE, z = zona();
    // Guide più utili in questo periodo dell'anno.
    const stagione = m >= 9 && m <= 11 ? ['inverno', 'vangare', 'compost'] : m >= 1 && m <= 3 ? ['vangare', 'semenzaio', 'cassone'] : m >= 4 && m <= 6 ? ['trapianto', 'semina', 'pacciamare'] : ['pacciamare', 'semenzaio', 'semina'];
    const card = g => `<a class="lav-card" href="#/lavori/${g.id}">
        <span class="lav-foto">${img(g.foto, '', 'lav-img', '(min-width: 700px) 33vw, 100vw')}<span class="lav-em">${g.emoji}</span></span>
        <span class="lav-testo"><strong>${esc(g.titolo)}</strong><span class="muted small">${esc(g.sub)}</span>
        <span class="lav-meta">${esc(g.tempo)} · ${esc(g.livello)}${(fatti[g.id] || []).length ? ` · ✓ ${fatti[g.id].length}/${g.passi.length}` : ''}</span></span>
      </a>`;
    return `<div class="stack">
      <p class="lead" style="margin:0">Le operazioni di base, spiegate passo passo. Ogni scheda ti dice cosa fare nella tua zona, con gli attrezzi, gli errori da evitare e i passaggi da spuntare mentre lavori.</p>
      <section>
        <div class="section-title"><h2>🗓️ Da fare in questo periodo</h2><span class="muted small" style="margin-left:auto">${esc(window.ZONE[z].nome)} · ${MESI[m - 1]}</span></div>
        <div class="lav-griglia">${stagione.map(id => card(PER_ID[id])).join('')}</div>
      </section>
      <section>
        <div class="section-title"><h2>📚 Tutte le schede</h2></div>
        <div class="lav-griglia">${GUIDE.filter(g => !stagione.includes(g.id)).map(card).join('')}</div>
      </section>
    </div>`;
  }

  function viewScheda(id) {
    const g = PER_ID[id];
    if (!g) return `<p>Scheda non trovata. <a href="#/lavori">Torna a "Come si fa"</a></p>`;
    const f = new Set(fatti[g.id] || []);
    const i = GUIDE.indexOf(g), dopo = GUIDE[(i + 1) % GUIDE.length];
    return `<div class="stack">
      <div class="facts">
        <div class="fact"><div class="k">Quando (${esc(window.ZONE[zona()].nome)})</div><div class="v">${esc(g.quando[zona()])}</div></div>
        <div class="fact"><div class="k">Tempo</div><div class="v">${esc(g.tempo)}</div></div>
        <div class="fact"><div class="k">Difficoltà</div><div class="v">${esc(g.livello)}</div></div>
      </div>

      <section class="card">
        <div class="section-title"><h2>🧰 Ti serve</h2></div>
        <ul class="clean lav-attrezzi">${g.attrezzi.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      </section>

      <section class="card" id="passiCard">
        <div class="section-title"><h2>👣 Passo passo</h2><span class="muted small" style="margin-left:auto" id="contaPassi">${f.size}/${g.passi.length} fatti</span></div>
        <ol class="passi">${g.passi.map((p, n) => `<li class="${f.has(n) ? 'fatto' : ''}">
          <label class="passo"><input type="checkbox" data-passo="${n}" ${f.has(n) ? 'checked' : ''}><span class="passo-n">${n + 1}</span>
          <span><strong>${esc(p.t)}</strong><span class="passo-d">${esc(p.d)}</span></span></label></li>`).join('')}</ol>
        ${f.size ? '<button class="link" id="azzeraPassi">Ricomincia da capo</button>' : ''}
      </section>

      ${htmlExtra(g)}

      <section class="card">
        <div class="section-title"><h2>⚠️ Errori da evitare</h2></div>
        <ul class="avvisi">${g.errori.map(e => `<li class="bad"><span></span><span>${esc(e)}</span></li>`).join('')}</ul>
        ${g.alternativa ? `<p class="note" style="margin:12px 0 0">${g.alternativa}</p>` : ''}
      </section>

      <a class="card premium-teaser" href="#/assistente">
        <span class="pt-icon">💬</span>
        <span><strong>Hai un dubbio su questo lavoro?</strong><span class="muted small" style="display:block">Chiedi all'assistente: conosce le tue aiuole, la tua zona e il meteo.</span></span>
        <span class="chev">›</span>
      </a>
      <a class="lav-dopo" href="#/lavori/${dopo.id}">Scheda successiva: <strong>${dopo.emoji} ${esc(dopo.titolo)}</strong> ›</a>
    </div>`;
  }

  function bindScheda(root, id) {
    const g = PER_ID[id];
    if (!g) return;
    const card = root.querySelector('#passiCard');
    card.addEventListener('change', e => {
      const cb = e.target.closest('[data-passo]');
      if (!cb) return;
      const s = new Set(fatti[g.id] || []), n = +cb.dataset.passo;
      if (cb.checked) s.add(n); else s.delete(n);
      fatti[g.id] = [...s].sort((a, b) => a - b);
      if (!fatti[g.id].length) delete fatti[g.id];
      salvaFatti();
      cb.closest('li').classList.toggle('fatto', cb.checked);
      root.querySelector('#contaPassi').textContent = `${s.size}/${g.passi.length} fatti`;
    });
    card.addEventListener('click', e => {
      if (!e.target.closest('#azzeraPassi')) return;
      delete fatti[g.id]; salvaFatti();
      card.querySelectorAll('[data-passo]').forEach(cb => { cb.checked = false; cb.closest('li').classList.remove('fatto'); });
      root.querySelector('#contaPassi').textContent = `0/${g.passi.length} fatti`;
      e.target.remove();
    });
    root.querySelectorAll('form.calc').forEach(f => {
      f.addEventListener('input', () => aggiornaCalcoli(root));
      f.addEventListener('submit', e => e.preventDefault());
    });
    aggiornaCalcoli(root);
  }

  return {
    viewElenco, viewScheda, bindScheda,
    info: id => PER_ID[id] && { titolo: PER_ID[id].titolo, sub: PER_ID[id].sub, foto: PER_ID[id].foto, emoji: PER_ID[id].emoji },
    // Scheda operativa collegata a un'attività del calendario (sem → semenzaio, dir → semina, tra → trapianto).
    perAttivita: { sem: 'semenzaio', dir: 'semina', tra: 'trapianto' }
  };
};
