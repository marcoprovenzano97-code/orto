// Database colture – Orto App
// Calendari: mesi 1-12, intervalli "2-3", più finestre "3-4,9", a cavallo d'anno "10-2".
//   sem = semina in semenzaio protetto, dir = semina/messa a dimora diretta,
//   tra = trapianto in aiuola, rac = raccolta.
// esig = esigenza nutritiva per la rotazione: alta | media | bassa | miglioratrice
// Dati indicativi per l'orto familiare italiano: vanno adattati a microclima e varietà.

window.ZONE = {
  nord:   { nome: 'Nord',          desc: 'Pianura padana e prealpi: inverni freddi, gelate fino a metà aprile.' },
  centro: { nome: 'Centro',        desc: 'Toscana, Marche, Umbria, Lazio, Abruzzo: clima intermedio.' },
  sud:    { nome: 'Sud e isole',   desc: 'Clima mediterraneo: inverni miti, estati calde e secche.' }
};

window.FAMIGLIE = {
  solanacee:     { nome: 'Solanacee',      colore: '#d1495b' },
  cucurbitacee:  { nome: 'Cucurbitacee',   colore: '#edae49' },
  leguminose:    { nome: 'Leguminose',     colore: '#7a9e3d' },
  brassicacee:   { nome: 'Brassicacee',    colore: '#3d8a8a' },
  asteracee:     { nome: 'Asteracee',      colore: '#6b8fd6' },
  apiacee:       { nome: 'Apiacee',        colore: '#e07a3f' },
  amarantacee:   { nome: 'Amarantacee',    colore: '#a3477f' },
  amarillidacee: { nome: 'Amarillidacee',  colore: '#8c6bb1' },
  lamiacee:      { nome: 'Lamiacee',       colore: '#3f9b5f' },
  rosacee:       { nome: 'Rosacee',        colore: '#c4455f' },
  poacee:        { nome: 'Poacee',         colore: '#b59a3a' },
  caprifoliacee: { nome: 'Caprifoliacee',  colore: '#5d9c8c' },
  asparagacee:   { nome: 'Asparagacee',    colore: '#6f8f4e' }
};

window.ESIGENZE = {
  alta:          { nome: 'Molto esigente',  desc: 'Vuole terreno ricco: letame maturo o compost abbondante prima dell\'impianto.' },
  media:         { nome: 'Media esigenza',  desc: 'Basta un terreno con buona sostanza organica residua.' },
  bassa:         { nome: 'Poco esigente',   desc: 'Teme gli eccessi di azoto: meglio dopo una coltura molto concimata.' },
  miglioratrice: { nome: 'Miglioratrice',   desc: 'Leguminosa: fissa azoto nel terreno e lo arricchisce per la coltura successiva.' }
};

window.COLTURE = [
  // ───────────── SOLANACEE ─────────────
  {
    id: 'pomodoro', nome: 'Pomodoro', emoji: '🍅', fam: 'solanacee', esig: 'alta',
    desc: 'La regina dell\'orto estivo. Varietà a crescita indeterminata (da tutorare e sfemminellare) o determinata (cespugliose, più compatte, adatte ai cassoni).',
    sole: 'Pieno sole (almeno 6–8 ore)',
    terreno: 'Profondo, ricco di sostanza organica, ben drenato',
    ph: '6,0 – 7,0',
    acqua: { freq: '2–3 volte a settimana in estate', quant: '3–5 L per pianta', note: 'Irrigare al piede, mai sulle foglie (peronospora). Turni regolari: gli sbalzi causano spaccature e marciume apicale.' },
    germ: '6–10 giorni', tGerm: 'min 12 °C, ottimale 20–25 °C',
    ciclo: '70–90 giorni dal trapianto',
    dist: [50, 80],
    cal: {
      nord:   { sem: '2-3', dir: '',  tra: '4-5', rac: '7-9' },
      centro: { sem: '2-3', dir: '',  tra: '4-5', rac: '7-10' },
      sud:    { sem: '1-3', dir: '',  tra: '3-5', rac: '6-10' }
    },
    amiche: ['basilico', 'carota', 'sedano', 'prezzemolo', 'aglio', 'cipolla', 'lattuga', 'asparago'],
    nemiche: ['patata', 'finocchio'],
    avv: ['Peronospora (macchie brune su foglie e frutti, con umidità)', 'Marciume apicale (carenza di calcio da irrigazione irregolare)', 'Tuta absoluta e nottue', 'Afidi e aleurodidi'],
    consigli: ['Trapiantare quando le minime notturne restano sopra 10–12 °C.', 'Interrare il fusto fino alle prime foglie: emette radici e la pianta è più robusta.', 'Pacciamare con paglia per mantenere l\'umidità costante.', 'Nelle indeterminate togliere i germogli ascellari (femminelle) una volta a settimana.']
  },
  {
    id: 'peperone', nome: 'Peperone', emoji: '🫑', fam: 'solanacee', esig: 'alta',
    desc: 'Ortaggio da caldo, lento nelle prime fasi. Frutti verdi, gialli o rossi a seconda della varietà e della maturazione.',
    sole: 'Pieno sole, posizione riparata dal vento',
    terreno: 'Fertile, sciolto, ben drenato',
    ph: '6,0 – 7,0',
    acqua: { freq: '2–3 volte a settimana in estate', quant: '2–3 L per pianta', note: 'Teme sia la siccità sia i ristagni. Lo stress idrico in fioritura fa cadere i fiori.' },
    germ: '8–14 giorni', tGerm: 'min 15 °C, ottimale 25 °C',
    ciclo: '70–90 giorni dal trapianto',
    dist: [40, 60],
    cal: {
      nord:   { sem: '2-3', dir: '', tra: '5',   rac: '7-10' },
      centro: { sem: '2-3', dir: '', tra: '4-5', rac: '7-10' },
      sud:    { sem: '1-2', dir: '', tra: '4-5', rac: '6-10' }
    },
    amiche: ['basilico', 'carota', 'cipolla', 'lattuga', 'prezzemolo'],
    nemiche: ['fagiolo', 'finocchio'],
    avv: ['Afidi', 'Marciume apicale', 'Piralide del mais (larve nei frutti)', 'Ragnetto rosso con caldo secco'],
    consigli: ['Sostenere le piante con un tutore: i frutti pesanti spezzano i rami.', 'Raccogliere il primo frutto ancora verde stimola la produzione.']
  },
  {
    id: 'melanzana', nome: 'Melanzana', emoji: '🍆', fam: 'solanacee', esig: 'alta',
    desc: 'La più esigente in calore tra le solanacee. Produce da metà estate fino ai primi freddi.',
    sole: 'Pieno sole, posizione calda',
    terreno: 'Ricco, profondo, ben concimato',
    ph: '6,0 – 7,0',
    acqua: { freq: '2–3 volte a settimana in estate', quant: '3–4 L per pianta', note: 'Ha bisogno di acqua abbondante e regolare soprattutto durante l\'ingrossamento dei frutti.' },
    germ: '10–15 giorni', tGerm: 'min 15 °C, ottimale 25–30 °C',
    ciclo: '70–80 giorni dal trapianto',
    dist: [50, 80],
    cal: {
      nord:   { sem: '2-3', dir: '', tra: '5',   rac: '7-9' },
      centro: { sem: '2-3', dir: '', tra: '4-5', rac: '7-10' },
      sud:    { sem: '1-3', dir: '', tra: '4-5', rac: '6-10' }
    },
    amiche: ['fagiolo', 'fagiolino', 'basilico', 'lattuga'],
    nemiche: ['patata'],
    avv: ['Dorifora (come sulla patata)', 'Ragnetto rosso', 'Afidi', 'Verticillosi (avvizzimento)'],
    consigli: ['Non trapiantare prima che il terreno sia ben caldo: col freddo si blocca per settimane.', 'Raccogliere i frutti lucidi, prima che i semi interni diventino scuri.']
  },
  {
    id: 'peperoncino', nome: 'Peperoncino', emoji: '🌶️', fam: 'solanacee', esig: 'media',
    desc: 'Piccante, molto produttivo e adatto anche ai vasi. Molte varietà (cayenna, habanero, jalapeño) con piccantezza diversa.',
    sole: 'Pieno sole',
    terreno: 'Sciolto e ben drenato, non troppo ricco di azoto',
    ph: '6,0 – 7,0',
    acqua: { freq: '2 volte a settimana in estate', quant: '1–2 L per pianta', note: 'Un leggero stress idrico a maturazione aumenta la piccantezza. Evitare i ristagni.' },
    germ: '10–20 giorni', tGerm: 'min 18 °C, ottimale 25–30 °C',
    ciclo: '80–100 giorni dal trapianto',
    dist: [40, 50],
    cal: {
      nord:   { sem: '2-3', dir: '', tra: '5',   rac: '8-10' },
      centro: { sem: '2-3', dir: '', tra: '4-5', rac: '7-10' },
      sud:    { sem: '1-3', dir: '', tra: '4-5', rac: '7-11' }
    },
    amiche: ['basilico', 'carota', 'cipolla', 'lattuga'],
    nemiche: ['fagiolo', 'finocchio'],
    avv: ['Afidi', 'Marciume radicale da ristagno'],
    consigli: ['Le varietà tropicali (habanero, chinense) germinano lentamente: seminare presto e al caldo.', 'In vaso si può ritirare in casa e farlo svernare.']
  },
  {
    id: 'patata', nome: 'Patata', emoji: '🥔', fam: 'solanacee', esig: 'alta',
    desc: 'Si coltiva dai tuberi-seme (non dai semi). Nei cassoni dà buoni risultati grazie al terreno soffice.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, profondo, senza sassi; non calcareo',
    ph: '5,5 – 6,5',
    acqua: { freq: '1–2 volte a settimana', quant: '10–15 L per m²', note: 'Fondamentale dalla fioritura in poi (formazione dei tuberi). Sospendere 2 settimane prima della raccolta.' },
    germ: '15–30 giorni (emergenza)', tGerm: 'terreno ad almeno 8 °C',
    ciclo: '90–120 giorni (novelle 70)',
    dist: [30, 70],
    cal: {
      nord:   { sem: '', dir: '3-4',     tra: '', rac: '6-8' },
      centro: { sem: '', dir: '2-4',     tra: '', rac: '6-7' },
      sud:    { sem: '', dir: '1-3,8-9', tra: '', rac: '5-6,11-12' }
    },
    amiche: ['fagiolo', 'fava', 'mais', 'cappuccio'],
    nemiche: ['pomodoro', 'zucca', 'cetriolo', 'melanzana'],
    avv: ['Dorifora (larve rosse che defogliano)', 'Peronospora', 'Elateridi (fori nei tuberi)'],
    consigli: ['Usare tuberi-seme certificati, non patate da cucina.', 'Rincalzare (accumulare terra alla base) 2–3 volte: i tuberi esposti alla luce diventano verdi e tossici.', 'Far pre-germogliare i tuberi alla luce 3–4 settimane prima.']
  },

  // ───────────── CUCURBITACEE ─────────────
  {
    id: 'zucchina', nome: 'Zucchina', emoji: '🥒', fam: 'cucurbitacee', esig: 'alta',
    desc: 'Velocissima e generosa: 2–3 piante bastano per una famiglia. Si mangiano anche i fiori.',
    sole: 'Pieno sole',
    terreno: 'Molto fertile, ricco di sostanza organica',
    ph: '6,0 – 7,5',
    acqua: { freq: '2–3 volte a settimana in estate', quant: '5–8 L per pianta', note: 'Molta acqua ma al piede: le foglie bagnate favoriscono l\'oidio (mal bianco).' },
    germ: '5–8 giorni', tGerm: 'min 14 °C, ottimale 25 °C',
    ciclo: '45–60 giorni dalla semina',
    dist: [80, 100],
    cal: {
      nord:   { sem: '4',   dir: '5-6', tra: '5',   rac: '6-9' },
      centro: { sem: '3-4', dir: '4-6', tra: '4-5', rac: '6-9' },
      sud:    { sem: '2-3', dir: '3-7', tra: '3-4', rac: '5-10' }
    },
    amiche: ['fagiolo', 'mais', 'lattuga', 'ravanello', 'basilico'],
    nemiche: ['patata'],
    avv: ['Oidio (polvere bianca sulle foglie)', 'Afidi', 'Virosi trasmesse dagli afidi'],
    consigli: ['Raccogliere spesso, a 15–20 cm: se ne lasci ingrossare una la pianta rallenta.', 'Una seconda semina a fine giugno garantisce zucchine fino all\'autunno.']
  },
  {
    id: 'zucca', nome: 'Zucca', emoji: '🎃', fam: 'cucurbitacee', esig: 'alta',
    desc: 'Pianta strisciante che occupa molto spazio. Le zucche invernali (butternut, delica, mantovana) si conservano per mesi.',
    sole: 'Pieno sole',
    terreno: 'Molto ricco; ideale su cumulo di compost',
    ph: '6,0 – 7,5',
    acqua: { freq: '1–2 volte a settimana, abbondante', quant: '10 L per pianta', note: 'Ridurre a fine estate per favorire la maturazione e la conservabilità.' },
    germ: '6–10 giorni', tGerm: 'min 14 °C',
    ciclo: '90–120 giorni dalla semina',
    dist: [150, 200],
    cal: {
      nord:   { sem: '4',   dir: '5',   tra: '5',   rac: '9-10' },
      centro: { sem: '3-4', dir: '4-5', tra: '4-5', rac: '8-10' },
      sud:    { sem: '',    dir: '3-5', tra: '',    rac: '8-10' }
    },
    amiche: ['mais', 'fagiolo', 'ravanello'],
    nemiche: ['patata'],
    avv: ['Oidio', 'Marciume dei frutti a contatto col terreno umido'],
    consigli: ['Nei cassoni conviene farla uscire dal bordo o guidarla su una rete robusta.', 'Raccogliere quando il picciolo è secco e legnoso; lasciare 2 settimane al sole per "curare" la buccia.', 'Mettere una tavoletta o paglia sotto ai frutti.']
  },
  {
    id: 'cetriolo', nome: 'Cetriolo', emoji: '🥒', fam: 'cucurbitacee', esig: 'alta',
    desc: 'Rampicante: coltivato in verticale su rete occupa poco spazio ed è ideale per i cassoni.',
    sole: 'Pieno sole o leggera mezz\'ombra nelle ore calde al Sud',
    terreno: 'Fertile, umido ma ben drenato',
    ph: '6,0 – 7,0',
    acqua: { freq: 'ogni 2 giorni in estate', quant: '2–4 L per pianta', note: 'È composto per il 95% di acqua: con la siccità i frutti diventano amari.' },
    germ: '5–8 giorni', tGerm: 'min 15 °C',
    ciclo: '50–70 giorni dalla semina',
    dist: [40, 100],
    cal: {
      nord:   { sem: '4',   dir: '5-6', tra: '5', rac: '7-9' },
      centro: { sem: '3-4', dir: '4-6', tra: '5', rac: '6-9' },
      sud:    { sem: '2-3', dir: '3-6', tra: '4', rac: '6-9' }
    },
    amiche: ['fagiolo', 'pisello', 'lattuga', 'mais'],
    nemiche: ['patata'],
    avv: ['Oidio', 'Peronospora delle cucurbitacee', 'Afidi'],
    consigli: ['Montare la rete/tutore prima della semina.', 'Raccogliere giovani: più si lasciano crescere, più la pianta smette di produrre.']
  },
  {
    id: 'melone', nome: 'Melone', emoji: '🍈', fam: 'cucurbitacee', esig: 'alta',
    desc: 'Ama il caldo e il terreno asciutto in maturazione. Può essere allevato a terra o su rete con sostegni per i frutti.',
    sole: 'Pieno sole, posizione calda',
    terreno: 'Sciolto, ricco, molto drenato',
    ph: '6,0 – 7,0',
    acqua: { freq: '2 volte a settimana fino all\'ingrossamento', quant: '3–5 L per pianta', note: 'Ridurre molto in maturazione: troppa acqua rende i frutti insipidi e li fa spaccare.' },
    germ: '5–10 giorni', tGerm: 'min 16 °C',
    ciclo: '80–100 giorni dalla semina',
    dist: [80, 150],
    cal: {
      nord:   { sem: '4',   dir: '',    tra: '5', rac: '7-9' },
      centro: { sem: '3-4', dir: '5',   tra: '5', rac: '7-9' },
      sud:    { sem: '3',   dir: '4-5', tra: '4', rac: '6-9' }
    },
    amiche: ['mais', 'fagiolo', 'lattuga'],
    nemiche: ['patata'],
    avv: ['Oidio', 'Afidi', 'Fusariosi'],
    consigli: ['Cimare la pianta dopo la 4ª–5ª foglia per stimolare i rami laterali che portano i frutti.', 'È maturo quando si stacca facilmente dal picciolo e profuma.']
  },
  {
    id: 'anguria', nome: 'Anguria', emoji: '🍉', fam: 'cucurbitacee', esig: 'alta',
    desc: 'Richiede tanto spazio e tanto calore. Per i cassoni scegliere varietà a frutto piccolo (tipo "sugar baby").',
    sole: 'Pieno sole',
    terreno: 'Sabbioso, profondo e ricco',
    ph: '6,0 – 7,0',
    acqua: { freq: '2 volte a settimana', quant: '5–10 L per pianta', note: 'Abbondante in crescita, ridurre nelle ultime 2 settimane prima della raccolta.' },
    germ: '5–10 giorni', tGerm: 'min 18 °C',
    ciclo: '80–110 giorni dalla semina',
    dist: [100, 200],
    cal: {
      nord:   { sem: '4',   dir: '',    tra: '5', rac: '8-9' },
      centro: { sem: '3-4', dir: '5',   tra: '5', rac: '7-9' },
      sud:    { sem: '3',   dir: '4-5', tra: '4', rac: '7-8' }
    },
    amiche: ['mais', 'ravanello'],
    nemiche: ['patata'],
    avv: ['Oidio', 'Fusariosi', 'Afidi'],
    consigli: ['Matura quando il viticcio vicino al frutto è secco e la parte appoggiata a terra è gialla.', 'Lasciare al massimo 2–3 frutti per pianta.']
  },

  // ───────────── LEGUMINOSE ─────────────
  {
    id: 'fagiolo', nome: 'Fagiolo', emoji: '🫘', fam: 'leguminose', esig: 'miglioratrice',
    desc: 'Da sgranare (borlotto, cannellino) o secco. Nano o rampicante: il rampicante sfrutta lo spazio in verticale.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, non serve concimare (fissa azoto)',
    ph: '6,0 – 7,0',
    acqua: { freq: '2 volte a settimana in estate', quant: '10–15 L per m²', note: 'Acqua regolare soprattutto in fioritura e formazione dei baccelli. Evitare bagnare le foglie.' },
    germ: '6–10 giorni', tGerm: 'min 12 °C',
    ciclo: '90–110 giorni (secco); 70–80 da sgranare fresco',
    dist: [10, 50],
    cal: {
      nord:   { sem: '', dir: '5-6', tra: '', rac: '8-10' },
      centro: { sem: '', dir: '4-7', tra: '', rac: '7-10' },
      sud:    { sem: '', dir: '3-8', tra: '', rac: '6-10' }
    },
    amiche: ['mais', 'zucca', 'zucchina', 'cetriolo', 'patata', 'carota', 'cappuccio', 'melanzana'],
    nemiche: ['aglio', 'cipolla', 'porro', 'finocchio', 'peperone'],
    avv: ['Afidi neri', 'Tonchio (insetto dei semi conservati)', 'Ruggine'],
    consigli: ['Non trapiantare: seminare direttamente 3–4 semi per buchetta.', 'A fine ciclo tagliare le piante alla base lasciando le radici nel terreno: rilasciano azoto.']
  },
  {
    id: 'fagiolino', nome: 'Fagiolino', emoji: '🫛', fam: 'leguminose', esig: 'miglioratrice',
    desc: 'Si raccoglie il baccello tenero intero. Le semine scalari ogni 3 settimane danno raccolti continui.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, fresco, poco concimato',
    ph: '6,0 – 7,0',
    acqua: { freq: '2–3 volte a settimana in estate', quant: '10–15 L per m²', note: 'Con la siccità i baccelli diventano fibrosi. Irrigare al mattino.' },
    germ: '6–10 giorni', tGerm: 'min 12 °C',
    ciclo: '55–70 giorni dalla semina',
    dist: [10, 40],
    cal: {
      nord:   { sem: '', dir: '5-7', tra: '', rac: '7-9' },
      centro: { sem: '', dir: '4-8', tra: '', rac: '6-10' },
      sud:    { sem: '', dir: '3-9', tra: '', rac: '5-10' }
    },
    amiche: ['mais', 'zucchina', 'cetriolo', 'patata', 'carota', 'melanzana', 'cappuccio'],
    nemiche: ['aglio', 'cipolla', 'porro', 'finocchio'],
    avv: ['Afidi', 'Antracnosi', 'Ruggine'],
    consigli: ['Raccogliere ogni 2–3 giorni quando i baccelli sono lisci e prima che si vedano i semi.']
  },
  {
    id: 'pisello', nome: 'Pisello', emoji: '🫛', fam: 'leguminose', esig: 'miglioratrice',
    desc: 'Coltura fresca di fine inverno/primavera. Ottimo come primo ciclo prima di un ortaggio estivo esigente.',
    sole: 'Sole o mezz\'ombra',
    terreno: 'Fresco, ben lavorato, non concimato di recente',
    ph: '6,0 – 7,5',
    acqua: { freq: '1–2 volte a settimana se non piove', quant: '10 L per m²', note: 'Spesso bastano le piogge primaverili; serve acqua in fioritura se il tempo è secco.' },
    germ: '7–14 giorni', tGerm: 'min 4–5 °C',
    ciclo: '70–90 giorni (autunnali più lunghi)',
    dist: [5, 40],
    cal: {
      nord:   { sem: '', dir: '2-4',       tra: '', rac: '5-6' },
      centro: { sem: '', dir: '10-11,2-3', tra: '', rac: '4-6' },
      sud:    { sem: '', dir: '10-2',      tra: '', rac: '2-5' }
    },
    amiche: ['carota', 'ravanello', 'lattuga', 'cetriolo', 'mais', 'spinacio'],
    nemiche: ['aglio', 'cipolla', 'porro'],
    avv: ['Oidio a fine ciclo', 'Tonchio', 'Afidi'],
    consigli: ['Anche le varietà nane apprezzano una rete bassa o rametti come sostegno.', 'Soffre il caldo: al Sud preferire la semina autunnale.']
  },
  {
    id: 'fava', nome: 'Fava', emoji: '🫛', fam: 'leguminose', esig: 'miglioratrice',
    desc: 'Rustica e resistente al freddo. Ottima per arricchire di azoto un\'aiuola durante l\'inverno.',
    sole: 'Pieno sole',
    terreno: 'Si adatta, preferisce terreni argillosi',
    ph: '6,5 – 8,0',
    acqua: { freq: 'raramente: solo se l\'inverno/primavera è secco', quant: '10 L per m²', note: 'Generalmente bastano le piogge. Serve acqua in fioritura in primavere asciutte.' },
    germ: '7–14 giorni', tGerm: 'min 4 °C',
    ciclo: '100–180 giorni (le autunnali sono più lunghe)',
    dist: [15, 50],
    cal: {
      nord:   { sem: '', dir: '2-3',      tra: '', rac: '5-6' },
      centro: { sem: '', dir: '10-11,2', tra: '', rac: '4-6' },
      sud:    { sem: '', dir: '10-12',    tra: '', rac: '3-5' }
    },
    amiche: ['patata', 'lattuga', 'spinacio', 'carciofo'],
    nemiche: ['aglio', 'cipolla', 'finocchio'],
    avv: ['Afide nero (attacca le cime)', 'Orobanche (pianta parassita)'],
    consigli: ['Cimare le piante a inizio baccellatura: elimina le colonie di afidi e anticipa la raccolta.', 'Al Nord la semina autunnale è possibile solo in zone riparate.']
  },

  // ───────────── BRASSICACEE ─────────────
  {
    id: 'cavolfiore', nome: 'Cavolfiore', emoji: '🥦', fam: 'brassicacee', esig: 'alta',
    desc: 'Coltura autunno-invernale. Si raccoglie l\'infiorescenza bianca (o viola, arancio, verde romanesco).',
    sole: 'Pieno sole',
    terreno: 'Ricco, profondo, che trattiene l\'umidità',
    ph: '6,5 – 7,5',
    acqua: { freq: '2 volte a settimana dopo il trapianto estivo', quant: '3–4 L per pianta', note: 'Il trapianto avviene in piena estate: le prime 3 settimane sono critiche, non far mai seccare.' },
    germ: '5–8 giorni', tGerm: 'min 5–7 °C',
    ciclo: '90–120 giorni dal trapianto',
    dist: [50, 70],
    cal: {
      nord:   { sem: '5-6', dir: '', tra: '7',   rac: '10-12' },
      centro: { sem: '6-7', dir: '', tra: '7-8', rac: '10-2' },
      sud:    { sem: '6-8', dir: '', tra: '8-9', rac: '11-3' }
    },
    amiche: ['sedano', 'lattuga', 'fagiolo', 'patata', 'spinacio', 'bietola'],
    nemiche: ['fragola'],
    avv: ['Cavolaia (bruchi verdi)', 'Altica (piccoli fori sulle foglie)', 'Ernia del cavolo (con ristagni e terreno acido)'],
    consigli: ['Quando si forma il fiore, piegare sopra di esso alcune foglie: resta bianco e tenero.', 'Una rete anti-insetto subito dopo il trapianto evita la cavolaia.']
  },
  {
    id: 'broccolo', nome: 'Broccolo', emoji: '🥦', fam: 'brassicacee', esig: 'alta',
    desc: 'Dopo il taglio della testa principale produce getti laterali per settimane.',
    sole: 'Pieno sole',
    terreno: 'Fertile, fresco',
    ph: '6,5 – 7,5',
    acqua: { freq: '2 volte a settimana in estate/inizio autunno', quant: '3 L per pianta', note: 'Regolare, soprattutto dopo il trapianto.' },
    germ: '5–8 giorni', tGerm: 'min 5 °C',
    ciclo: '60–90 giorni dal trapianto',
    dist: [50, 60],
    cal: {
      nord:   { sem: '5-7', dir: '', tra: '7-8', rac: '9-11' },
      centro: { sem: '6-7', dir: '', tra: '7-8', rac: '10-1' },
      sud:    { sem: '7-8', dir: '', tra: '8-9', rac: '11-2' }
    },
    amiche: ['sedano', 'lattuga', 'fagiolo', 'patata', 'spinacio'],
    nemiche: ['fragola'],
    avv: ['Cavolaia', 'Altica', 'Afide ceroso'],
    consigli: ['Tagliare la testa quando i boccioli sono ancora chiusi e verde scuro.']
  },
  {
    id: 'cappuccio', nome: 'Cavolo cappuccio', emoji: '🥬', fam: 'brassicacee', esig: 'alta',
    desc: 'Testa compatta, verde o rossa. Esistono varietà primaverili-estive e autunno-invernali.',
    sole: 'Pieno sole',
    terreno: 'Ricco, argilloso-fresco',
    ph: '6,5 – 7,5',
    acqua: { freq: '2 volte a settimana col caldo', quant: '3 L per pianta', note: 'Irrigazioni irregolari fanno spaccare la testa.' },
    germ: '5–8 giorni', tGerm: 'min 5 °C',
    ciclo: '70–120 giorni dal trapianto',
    dist: [40, 60],
    cal: {
      nord:   { sem: '3,6',     dir: '', tra: '4-5,7',   rac: '6-8,10-12' },
      centro: { sem: '2-3,6-7', dir: '', tra: '4,7-8',   rac: '6-7,10-1' },
      sud:    { sem: '1-2,7-8', dir: '', tra: '3,8-9',   rac: '5-6,11-2' }
    },
    amiche: ['sedano', 'lattuga', 'fagiolo', 'patata', 'spinacio', 'bietola'],
    nemiche: ['fragola'],
    avv: ['Cavolaia', 'Altica', 'Lumache'],
    consigli: ['Scegliere la varietà adatta alla stagione: le estive in autunno non chiudono la testa.']
  },
  {
    id: 'cavolonero', nome: 'Cavolo nero', emoji: '🥬', fam: 'brassicacee', esig: 'alta',
    desc: 'Cavolo da foglia toscano: si raccolgono le foglie dal basso per tutto l\'inverno. Più buono dopo le gelate.',
    sole: 'Pieno sole',
    terreno: 'Fertile, ben drenato',
    ph: '6,5 – 7,5',
    acqua: { freq: '1–2 volte a settimana dopo il trapianto', quant: '2–3 L per pianta', note: 'In inverno di solito bastano le piogge.' },
    germ: '5–8 giorni', tGerm: 'min 5 °C',
    ciclo: '70–90 giorni dal trapianto, poi raccolta continua',
    dist: [50, 60],
    cal: {
      nord:   { sem: '5-6', dir: '', tra: '7-8', rac: '10-2' },
      centro: { sem: '6-7', dir: '', tra: '7-8', rac: '10-3' },
      sud:    { sem: '7-8', dir: '', tra: '8-9', rac: '11-3' }
    },
    amiche: ['sedano', 'lattuga', 'fagiolo', 'patata', 'bietola'],
    nemiche: ['fragola'],
    avv: ['Cavolaia', 'Altica', 'Afide ceroso'],
    consigli: ['Raccogliere sempre le foglie basse e lasciare il ciuffo centrale: la pianta continua a crescere.']
  },
  {
    id: 'verza', nome: 'Verza', emoji: '🥬', fam: 'brassicacee', esig: 'alta',
    desc: 'Cavolo a foglie bollose, molto resistente al freddo. Classico ortaggio invernale.',
    sole: 'Pieno sole',
    terreno: 'Ricco, fresco',
    ph: '6,5 – 7,5',
    acqua: { freq: '2 volte a settimana dopo il trapianto', quant: '3 L per pianta', note: 'Critica la fase estiva di attecchimento.' },
    germ: '5–8 giorni', tGerm: 'min 5 °C',
    ciclo: '90–150 giorni dal trapianto',
    dist: [50, 60],
    cal: {
      nord:   { sem: '5-6', dir: '', tra: '7',   rac: '10-2' },
      centro: { sem: '6-7', dir: '', tra: '7-8', rac: '11-2' },
      sud:    { sem: '7-8', dir: '', tra: '8-9', rac: '11-3' }
    },
    amiche: ['sedano', 'lattuga', 'fagiolo', 'patata', 'spinacio'],
    nemiche: ['fragola'],
    avv: ['Cavolaia', 'Altica', 'Lumache'],
    consigli: ['Le gelate leggere migliorano il sapore: non c\'è fretta di raccoglierla.']
  },
  {
    id: 'rucola', nome: 'Rucola', emoji: '🌿', fam: 'brassicacee', esig: 'bassa',
    desc: 'Velocissima, si taglia più volte. Perfetta da seminare negli spazi liberi tra una coltura e l\'altra.',
    sole: 'Sole in primavera/autunno, mezz\'ombra in estate',
    terreno: 'Qualsiasi, purché fresco',
    ph: '6,0 – 7,5',
    acqua: { freq: 'ogni 2–3 giorni', quant: 'leggera, 5 L per m²', note: 'Con caldo e secco diventa molto piccante e va subito a seme.' },
    germ: '3–7 giorni', tGerm: 'min 5 °C',
    ciclo: '25–40 giorni dalla semina',
    dist: [5, 15],
    cal: {
      nord:   { sem: '', dir: '3-5,8-9',  tra: '', rac: '4-6,9-11' },
      centro: { sem: '', dir: '3-5,8-10', tra: '', rac: '4-6,9-12' },
      sud:    { sem: '', dir: '2-4,9-11', tra: '', rac: '3-5,10-1' }
    },
    amiche: ['lattuga', 'fagiolo', 'carota'],
    nemiche: [],
    avv: ['Altica (fori sulle foglie, soprattutto in estate)'],
    consigli: ['Seminare poco alla volta ogni 2–3 settimane.', 'Tagliare a 2–3 cm dal suolo: ricaccia.']
  },
  {
    id: 'ravanello', nome: 'Ravanello', emoji: '🌱', fam: 'brassicacee', esig: 'bassa',
    desc: 'L\'ortaggio più rapido: pronto in 3–4 settimane. Ottimo per i bambini e per riempire i vuoti.',
    sole: 'Sole o mezz\'ombra',
    terreno: 'Sciolto, fresco, senza concime fresco',
    ph: '6,0 – 7,0',
    acqua: { freq: 'ogni 2 giorni', quant: 'leggera, costante', note: 'Con l\'acqua irregolare diventa spugnoso, legnoso o si spacca.' },
    germ: '3–6 giorni', tGerm: 'min 5 °C',
    ciclo: '20–30 giorni dalla semina',
    dist: [4, 15],
    cal: {
      nord:   { sem: '', dir: '3-5,8-9',   tra: '', rac: '4-6,9-10' },
      centro: { sem: '', dir: '2-5,8-10',  tra: '', rac: '3-6,9-11' },
      sud:    { sem: '', dir: '1-4,9-12',  tra: '', rac: '2-5,10-1' }
    },
    amiche: ['carota', 'lattuga', 'pisello', 'spinacio', 'zucchina', 'cetriolo'],
    nemiche: [],
    avv: ['Altica', 'Mosca del cavolo'],
    consigli: ['Seminare insieme alle carote: spunta prima e segna la fila.', 'Raccogliere appena pronti: in pochi giorni diventano piccanti e vuoti.']
  },
  {
    id: 'cimedirapa', nome: 'Cime di rapa', emoji: '🥬', fam: 'brassicacee', esig: 'media',
    desc: 'Si raccolgono le infiorescenze ancora chiuse con le foglie tenere. Varietà precoci (40 gg), medie e tardive (90 gg).',
    sole: 'Pieno sole',
    terreno: 'Fresco, mediamente fertile',
    ph: '6,0 – 7,5',
    acqua: { freq: '2 volte a settimana dopo la semina estiva', quant: '10 L per m²', note: 'La semina avviene col caldo: tenere umido fino all\'emergenza.' },
    germ: '4–7 giorni', tGerm: 'min 5 °C',
    ciclo: '40–90 giorni dalla semina (secondo la varietà)',
    dist: [15, 40],
    cal: {
      nord:   { sem: '', dir: '8',    tra: '', rac: '10-11' },
      centro: { sem: '', dir: '8-9',  tra: '', rac: '10-12' },
      sud:    { sem: '', dir: '8-10', tra: '', rac: '10-2' }
    },
    amiche: ['lattuga', 'spinacio', 'sedano'],
    nemiche: ['fragola'],
    avv: ['Altica', 'Cavolaia'],
    consigli: ['Diradare le piantine a 15 cm: troppo fitte non fanno le cime.']
  },

  // ───────────── ASTERACEE ─────────────
  {
    id: 'lattuga', nome: 'Lattuga', emoji: '🥬', fam: 'asteracee', esig: 'media',
    desc: 'Cappuccio, romana, gentilina, da taglio: con le varietà giuste si raccoglie quasi tutto l\'anno.',
    sole: 'Sole; mezz\'ombra in estate',
    terreno: 'Fresco, soffice, ricco di humus',
    ph: '6,0 – 7,0',
    acqua: { freq: 'ogni 2–3 giorni (quotidiana col caldo)', quant: '1 L per pianta', note: 'Radici superficiali: poca acqua ma spesso. Irrigare al mattino per evitare marciumi.' },
    germ: '4–8 giorni', tGerm: 'min 4 °C; sopra 25 °C germina male',
    ciclo: '45–70 giorni (da taglio 25–35)',
    dist: [25, 30],
    cal: {
      nord:   { sem: '2-3,7-8', dir: '3-8',      tra: '4-5,8-9',  rac: '5-10' },
      centro: { sem: '1-3,8-9', dir: '3-9',      tra: '3-5,9-10', rac: '4-11' },
      sud:    { sem: '1-2,9-10',dir: '2-4,9-11', tra: '2-4,10-11',rac: '3-5,10-1' }
    },
    amiche: ['carota', 'ravanello', 'fragola', 'cetriolo', 'cipolla', 'cappuccio'],
    nemiche: ['prezzemolo'],
    avv: ['Lumache e limacce', 'Afidi', 'Peronospora della lattuga'],
    consigli: ['Trapiantare col colletto fuori terra: interrato marcisce.', 'D\'estate scegliere varietà resistenti alla salita a seme e seminare in luogo ombreggiato.', 'Semine scalari ogni 2–3 settimane.']
  },
  {
    id: 'radicchio', nome: 'Radicchio', emoji: '🥬', fam: 'asteracee', esig: 'media',
    desc: 'Cicoria da cespo (Chioggia, Treviso, Castelfranco). Il freddo ne esalta colore e sapore.',
    sole: 'Pieno sole',
    terreno: 'Profondo, fresco',
    ph: '6,0 – 7,5',
    acqua: { freq: '2 volte a settimana in estate', quant: '1–2 L per pianta', note: 'Regolare durante la crescita estiva, poi bastano le piogge autunnali.' },
    germ: '5–10 giorni', tGerm: 'min 8 °C',
    ciclo: '90–150 giorni',
    dist: [25, 35],
    cal: {
      nord:   { sem: '6-7', dir: '6-7', tra: '7-8', rac: '10-2' },
      centro: { sem: '6-7', dir: '',    tra: '8',   rac: '10-2' },
      sud:    { sem: '7-8', dir: '',    tra: '8-9', rac: '11-3' }
    },
    amiche: ['finocchio', 'lattuga', 'carota'],
    nemiche: [],
    avv: ['Lumache', 'Marciume del colletto'],
    consigli: ['Il cespo diventa rosso col freddo: non raccoglierlo troppo presto.']
  },
  {
    id: 'indivia', nome: 'Indivia e scarola', emoji: '🥬', fam: 'asteracee', esig: 'media',
    desc: 'Riccia e scarola: insalate amarognole di fine estate e autunno.',
    sole: 'Pieno sole',
    terreno: 'Fresco, fertile',
    ph: '6,0 – 7,0',
    acqua: { freq: '2–3 volte a settimana in estate', quant: '1–2 L per pianta', note: 'Bagnare il terreno, non il cuore del cespo (marcisce).' },
    germ: '5–10 giorni', tGerm: 'min 8 °C',
    ciclo: '70–90 giorni',
    dist: [30, 40],
    cal: {
      nord:   { sem: '6-7', dir: '', tra: '7-8', rac: '9-11' },
      centro: { sem: '6-7', dir: '', tra: '7-8', rac: '9-12' },
      sud:    { sem: '7-8', dir: '', tra: '8-9', rac: '10-1' }
    },
    amiche: ['finocchio', 'porro', 'lattuga'],
    nemiche: [],
    avv: ['Lumache', 'Afidi', 'Marciume'],
    consigli: ['Legare il cespo 10–15 giorni prima della raccolta per imbianchire il cuore e ridurre l\'amaro.']
  },
  {
    id: 'carciofo', nome: 'Carciofo', emoji: '🌿', fam: 'asteracee', esig: 'alta',
    desc: 'Pianta perenne: occupa l\'aiuola per 4–5 anni. Si propaga con carducci (polloni) o ovoli.',
    sole: 'Pieno sole',
    terreno: 'Profondo, fertile, ben drenato',
    ph: '6,5 – 7,5',
    acqua: { freq: '1 volta a settimana in crescita', quant: '10–15 L per pianta', note: 'Le varietà rifiorenti al Sud si "risvegliano" con irrigazioni ad agosto. Ristagno = marciume.' },
    germ: '—', tGerm: 'si propaga per carducci/ovoli',
    ciclo: 'Primi capolini dopo 8–12 mesi; produce per 4–5 anni',
    dist: [80, 120],
    cal: {
      nord:   { sem: '', dir: '', tra: '3-4', rac: '5-6' },
      centro: { sem: '', dir: '', tra: '3-4,8-9', rac: '3-5,10-12' },
      sud:    { sem: '', dir: '', tra: '7-8', rac: '11-5' }
    },
    amiche: ['fava', 'pisello', 'lattuga'],
    nemiche: [],
    avv: ['Afidi', 'Nottue', 'Marciume del colletto'],
    consigli: ['Al Nord proteggere la ceppaia in inverno con paglia o tessuto.', 'Essendo perenne, tenerlo fuori dallo schema di rotazione in un\'aiuola dedicata.']
  },

  // ───────────── APIACEE ─────────────
  {
    id: 'carota', nome: 'Carota', emoji: '🥕', fam: 'apiacee', esig: 'media',
    desc: 'Nei cassoni viene benissimo perché il terreno è soffice e senza sassi.',
    sole: 'Pieno sole',
    terreno: 'Sabbioso, profondo, privo di sassi, senza letame fresco',
    ph: '6,0 – 7,0',
    acqua: { freq: 'ogni 2 giorni fino all\'emergenza, poi 1–2 volte a settimana', quant: '10 L per m²', note: 'Il seme è lento: il terreno non deve mai seccare finché non spunta. Acqua irregolare = carote spaccate.' },
    germ: '10–20 giorni', tGerm: 'min 7 °C',
    ciclo: '70–110 giorni dalla semina',
    dist: [4, 25],
    cal: {
      nord:   { sem: '', dir: '3-7',          tra: '', rac: '6-10' },
      centro: { sem: '', dir: '2-8',          tra: '', rac: '5-11' },
      sud:    { sem: '', dir: '1-3,8-10',     tra: '', rac: '4-6,11-2' }
    },
    amiche: ['cipolla', 'porro', 'lattuga', 'pisello', 'ravanello', 'pomodoro', 'aglio'],
    nemiche: [],
    avv: ['Mosca della carota (gallerie nella radice)', 'Nematodi'],
    consigli: ['Il letame fresco fa biforcare le radici.', 'Diradare a 4–5 cm quando le piantine hanno 2–3 foglie.', 'Consociata con cipolla o porro tiene lontana la mosca della carota.']
  },
  {
    id: 'sedano', nome: 'Sedano', emoji: '🌿', fam: 'apiacee', esig: 'alta',
    desc: 'Da coste o da taglio. Ama la frescezza e l\'acqua costante.',
    sole: 'Sole o mezz\'ombra',
    terreno: 'Ricco, umido, fertile',
    ph: '6,0 – 7,0',
    acqua: { freq: 'ogni 2 giorni in estate', quant: '2 L per pianta', note: 'Molto avido d\'acqua: senza diventa fibroso e amaro.' },
    germ: '15–25 giorni', tGerm: 'min 10 °C; il seme vuole luce',
    ciclo: '80–110 giorni dal trapianto',
    dist: [30, 40],
    cal: {
      nord:   { sem: '3',     dir: '', tra: '5-6',   rac: '8-10' },
      centro: { sem: '2-3',   dir: '', tra: '5-6',   rac: '8-11' },
      sud:    { sem: '2-3,7', dir: '', tra: '4-5,9', rac: '7-8,11-12' }
    },
    amiche: ['pomodoro', 'porro', 'cappuccio', 'fagiolo'],
    nemiche: [],
    avv: ['Septoriosi (macchie fogliari)', 'Lumache', 'Mosca del sedano'],
    consigli: ['Seme piccolissimo: non coprirlo quasi per nulla.', 'Per coste bianche e tenere, fasciare il cespo 2–3 settimane prima della raccolta.']
  },
  {
    id: 'prezzemolo', nome: 'Prezzemolo', emoji: '🌿', fam: 'apiacee', esig: 'bassa',
    desc: 'Aromatica biennale: si taglia per mesi. Liscio (più profumato) o riccio.',
    sole: 'Mezz\'ombra o sole',
    terreno: 'Fresco, ricco di humus',
    ph: '6,0 – 7,0',
    acqua: { freq: '2–3 volte a settimana in estate', quant: 'leggera', note: 'Tenere fresco ma senza ristagni.' },
    germ: '15–30 giorni', tGerm: 'min 8 °C',
    ciclo: '70–90 giorni, poi tagli continui',
    dist: [10, 20],
    cal: {
      nord:   { sem: '', dir: '3-8',       tra: '', rac: '5-11' },
      centro: { sem: '', dir: '2-9',       tra: '', rac: '4-12' },
      sud:    { sem: '', dir: '2-4,9-11',  tra: '', rac: '10-6' }
    },
    amiche: ['pomodoro', 'asparago'],
    nemiche: ['lattuga'],
    avv: ['Lumache', 'Afidi'],
    consigli: ['Mettere i semi in acqua tiepida per 24 ore prima della semina accelera la germinazione.', 'Tagliare gli steli esterni, lasciando il cuore.']
  },
  {
    id: 'finocchio', nome: 'Finocchio', emoji: '🌿', fam: 'apiacee', esig: 'media',
    desc: 'Si raccoglie il grumolo bianco. Le semine estive per raccolti autunnali sono le più sicure.',
    sole: 'Pieno sole',
    terreno: 'Fresco, fertile, ben lavorato',
    ph: '6,5 – 7,5',
    acqua: { freq: '2–3 volte a settimana', quant: '1–2 L per pianta', note: 'Acqua costante: con lo stress idrico "monta a seme" senza ingrossare.' },
    germ: '8–14 giorni', tGerm: 'min 10 °C',
    ciclo: '70–100 giorni dal trapianto',
    dist: [25, 40],
    cal: {
      nord:   { sem: '6-7', dir: '6-7', tra: '7-8', rac: '9-11' },
      centro: { sem: '6-7', dir: '7',   tra: '7-8', rac: '10-12' },
      sud:    { sem: '',    dir: '7-8', tra: '8-9', rac: '11-3' }
    },
    amiche: ['lattuga', 'indivia', 'porro', 'radicchio'],
    nemiche: ['pomodoro', 'fagiolo', 'fagiolino', 'fava', 'peperone'],
    avv: ['Afidi', 'Marciume del grumolo'],
    consigli: ['Rincalzare il grumolo quando inizia a ingrossare: diventa più bianco e tenero.', 'Ha effetto inibente su molte piante: meglio a fine aiuola.']
  },

  // ───────────── AMARANTACEE ─────────────
  {
    id: 'bietola', nome: 'Bietola', emoji: '🥬', fam: 'amarantacee', esig: 'media',
    desc: 'Da taglio o da coste: produce per mesi con un solo impianto. Tra le più facili in assoluto.',
    sole: 'Sole o mezz\'ombra',
    terreno: 'Qualsiasi, purché fresco',
    ph: '6,5 – 7,5',
    acqua: { freq: '2 volte a settimana in estate', quant: '10 L per m²', note: 'Tollera brevi siccità ma con acqua regolare è più tenera.' },
    germ: '7–14 giorni', tGerm: 'min 6 °C',
    ciclo: '50–60 giorni, poi tagli continui',
    dist: [20, 35],
    cal: {
      nord:   { sem: '', dir: '3-7',      tra: '', rac: '5-11' },
      centro: { sem: '', dir: '2-9',      tra: '', rac: '4-12' },
      sud:    { sem: '', dir: '2-4,9-11', tra: '', rac: '10-6' }
    },
    amiche: ['cipolla', 'cappuccio', 'lattuga', 'fagiolo'],
    nemiche: [],
    avv: ['Cercospora (macchie fogliari)', 'Lumache', 'Mosca della bietola'],
    consigli: ['Ogni "seme" è un glomerulo con più semi: diradare lasciando la piantina più forte.', 'Raccogliere le foglie esterne: la pianta continua a produrre.']
  },
  {
    id: 'spinacio', nome: 'Spinacio', emoji: '🥬', fam: 'amarantacee', esig: 'media',
    desc: 'Ortaggio da stagione fresca: con le giornate lunghe e il caldo va subito a seme.',
    sole: 'Sole in inverno, mezz\'ombra in primavera',
    terreno: 'Fresco, ricco, ben drenato',
    ph: '6,5 – 7,5',
    acqua: { freq: '2 volte a settimana se non piove', quant: '10 L per m²', note: 'Umidità costante; nei mesi freddi raramente serve irrigare.' },
    germ: '7–14 giorni', tGerm: 'min 4 °C; sopra 25 °C germina male',
    ciclo: '40–60 giorni dalla semina',
    dist: [8, 25],
    cal: {
      nord:   { sem: '', dir: '2-4,8-9',  tra: '', rac: '4-6,10-11' },
      centro: { sem: '', dir: '2-3,9-10', tra: '', rac: '4-5,10-1' },
      sud:    { sem: '', dir: '10-2',     tra: '', rac: '11-4' }
    },
    amiche: ['fragola', 'pisello', 'fava', 'cappuccio', 'ravanello'],
    nemiche: [],
    avv: ['Peronospora', 'Afidi', 'Salita a seme precoce'],
    consigli: ['Evitare le semine tra maggio e luglio.', 'Raccogliere tutto il cespo o le foglie esterne man mano.']
  },
  {
    id: 'barbabietola', nome: 'Barbabietola rossa', emoji: '🟣', fam: 'amarantacee', esig: 'media',
    desc: 'Radice dolce da cuocere; anche le foglie giovani sono commestibili.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, profondo, senza letame fresco',
    ph: '6,5 – 7,5',
    acqua: { freq: '1–2 volte a settimana', quant: '10 L per m²', note: 'Irrigazioni regolari evitano radici legnose e con anelli marcati.' },
    germ: '7–14 giorni', tGerm: 'min 7 °C',
    ciclo: '60–90 giorni dalla semina',
    dist: [10, 30],
    cal: {
      nord:   { sem: '', dir: '4-6',      tra: '', rac: '7-10' },
      centro: { sem: '', dir: '3-7',      tra: '', rac: '6-10' },
      sud:    { sem: '', dir: '2-4,9-10', tra: '', rac: '5-6,11-1' }
    },
    amiche: ['cipolla', 'lattuga', 'cappuccio', 'aglio'],
    nemiche: [],
    avv: ['Cercospora', 'Mosca della bietola'],
    consigli: ['Raccogliere a 5–8 cm di diametro: più grandi diventano fibrose.']
  },

  // ───────────── AMARILLIDACEE (ex Liliacee) ─────────────
  {
    id: 'aglio', nome: 'Aglio', emoji: '🧄', fam: 'amarillidacee', esig: 'bassa',
    desc: 'Si pianta lo spicchio. Coltura lunga ma senza cure: occupa l\'aiuola in inverno.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, ben drenato, mai letame fresco',
    ph: '6,0 – 7,5',
    acqua: { freq: 'quasi mai: solo in primavere molto secche', quant: 'leggera', note: 'Teme molto i ristagni (marcisce). Sospendere del tutto un mese prima della raccolta.' },
    germ: '—', tGerm: 'si pianta lo spicchio',
    ciclo: '210–240 giorni (impianto autunnale)',
    dist: [10, 30],
    cal: {
      nord:   { sem: '', dir: '10-11,2-3', tra: '', rac: '6-7' },
      centro: { sem: '', dir: '10-12,2',   tra: '', rac: '6-7' },
      sud:    { sem: '', dir: '10-12',     tra: '', rac: '5-6' }
    },
    amiche: ['pomodoro', 'carota', 'fragola', 'lattuga', 'barbabietola'],
    nemiche: ['fagiolo', 'fagiolino', 'pisello', 'fava', 'asparago'],
    avv: ['Ruggine', 'Marciume da ristagno'],
    consigli: ['Piantare lo spicchio con la punta in alto a 3–4 cm di profondità.', 'Si raccoglie quando 2/3 delle foglie sono ingiallite.', 'Usare aglio da semina, non quello del supermercato (spesso trattato).']
  },
  {
    id: 'cipolla', nome: 'Cipolla', emoji: '🧅', fam: 'amarillidacee', esig: 'bassa',
    desc: 'Da seme, da piantina o da bulbilli. Bianca, dorata o rossa (Tropea). Le invernali si piantano in autunno.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, ben drenato',
    ph: '6,0 – 7,0',
    acqua: { freq: '1 volta a settimana se non piove', quant: '10 L per m²', note: 'Sospendere quando le foglie iniziano a piegarsi: le cipolle si conservano meglio.' },
    germ: '8–14 giorni', tGerm: 'min 5 °C',
    ciclo: '120–180 giorni',
    dist: [10, 25],
    cal: {
      nord:   { sem: '1-2',  dir: '3-4,9',     tra: '3-4',  rac: '5-8' },
      centro: { sem: '1-2',  dir: '2-3,9-10',  tra: '3-4',  rac: '5-8' },
      sud:    { sem: '9-10', dir: '9-11,1-2',  tra: '11-2', rac: '4-7' }
    },
    amiche: ['carota', 'lattuga', 'barbabietola', 'bietola', 'pomodoro', 'fragola'],
    nemiche: ['fagiolo', 'fagiolino', 'pisello', 'fava', 'asparago'],
    avv: ['Peronospora della cipolla', 'Mosca della cipolla', 'Tripidi'],
    consigli: ['I bulbilli vanno interrati appena, con la punta fuori.', 'Dopo la raccolta lasciarle asciugare al sole qualche giorno prima di conservarle.']
  },
  {
    id: 'porro', nome: 'Porro', emoji: '🌿', fam: 'amarillidacee', esig: 'alta',
    desc: 'Coltura lunga e rustica: resiste al gelo e si raccoglie tutto l\'inverno.',
    sole: 'Pieno sole',
    terreno: 'Profondo, ricco, fresco',
    ph: '6,0 – 7,5',
    acqua: { freq: '1–2 volte a settimana in estate', quant: '10 L per m²', note: 'Regolare nei mesi estivi dopo il trapianto.' },
    germ: '10–15 giorni', tGerm: 'min 7 °C',
    ciclo: '120–150 giorni dal trapianto',
    dist: [15, 35],
    cal: {
      nord:   { sem: '2-4', dir: '', tra: '5-7', rac: '9-3' },
      centro: { sem: '2-4', dir: '', tra: '5-7', rac: '9-3' },
      sud:    { sem: '3-5', dir: '', tra: '6-8', rac: '10-3' }
    },
    amiche: ['carota', 'sedano', 'fragola', 'indivia'],
    nemiche: ['fagiolo', 'fagiolino', 'pisello'],
    avv: ['Tignola del porro', 'Ruggine', 'Mosca minatrice'],
    consigli: ['Al trapianto accorciare radici e foglie di un terzo e interrare in un buco profondo 15 cm.', 'Rincalzare durante la crescita per avere un fusto bianco più lungo.']
  },

  // ───────────── ALTRE ─────────────
  {
    id: 'basilico', nome: 'Basilico', emoji: '🌿', fam: 'lamiacee', esig: 'media',
    desc: 'Aromatica estiva per eccellenza, sensibilissima al freddo. Ottima vicino ai pomodori.',
    sole: 'Pieno sole (mezz\'ombra al Sud in piena estate)',
    terreno: 'Sciolto, fertile, drenato',
    ph: '6,0 – 7,5',
    acqua: { freq: 'ogni 2 giorni in estate', quant: '0,5 L per pianta', note: 'Bagnare alla base, al mattino o la sera. Teme il ristagno.' },
    germ: '7–14 giorni', tGerm: 'min 15 °C',
    ciclo: '30–45 giorni dal trapianto',
    dist: [20, 25],
    cal: {
      nord:   { sem: '3-4', dir: '5-6', tra: '5',   rac: '6-9' },
      centro: { sem: '3',   dir: '4-6', tra: '4-5', rac: '6-10' },
      sud:    { sem: '2-3', dir: '4-6', tra: '4',   rac: '5-10' }
    },
    amiche: ['pomodoro', 'peperone', 'melanzana', 'peperoncino', 'asparago'],
    nemiche: [],
    avv: ['Peronospora del basilico (foglie gialle con muffa grigia sotto)', 'Fusariosi', 'Lumache'],
    consigli: ['Cimare le punte e togliere i fiori: la pianta diventa più folta e profumata.', 'Sotto i 10 °C le foglie anneriscono.']
  },
  {
    id: 'fragola', nome: 'Fragola', emoji: '🍓', fam: 'rosacee', esig: 'media',
    desc: 'Perenne: un impianto produce bene per 2–3 anni. Si moltiplica con gli stoloni.',
    sole: 'Pieno sole',
    terreno: 'Leggermente acido, ricco di humus, ben drenato',
    ph: '5,5 – 6,5',
    acqua: { freq: '2–3 volte a settimana in fruttificazione', quant: '1 L per pianta', note: 'Irrigare al piede: i frutti bagnati marciscono (muffa grigia).' },
    germ: '—', tGerm: 'si pianta la piantina / lo stolone',
    ciclo: 'Produce dalla primavera successiva all\'impianto; rifiorenti fino all\'autunno',
    dist: [30, 40],
    cal: {
      nord:   { sem: '', dir: '', tra: '3-4,8-9',  rac: '5-6' },
      centro: { sem: '', dir: '', tra: '3,8-10',   rac: '4-6' },
      sud:    { sem: '', dir: '', tra: '9-11',     rac: '3-5' }
    },
    amiche: ['aglio', 'cipolla', 'porro', 'lattuga', 'spinacio'],
    nemiche: ['cavolfiore', 'broccolo', 'cappuccio', 'cavolonero', 'verza', 'cimedirapa'],
    avv: ['Muffa grigia (botrite)', 'Lumache', 'Oidio', 'Uccelli'],
    consigli: ['Pacciamare con paglia o telo: frutti puliti e meno marciumi.', 'Tagliare gli stoloni non necessari per concentrare le energie sui frutti.', 'Rinnovare l\'impianto ogni 3 anni in un\'altra aiuola.']
  },
  {
    id: 'mais', nome: 'Mais dolce', emoji: '🌽', fam: 'poacee', esig: 'alta',
    desc: 'Pannocchie da consumare fresche. Si impollina col vento: va seminato a blocchi, non in una fila sola.',
    sole: 'Pieno sole',
    terreno: 'Fertile, profondo',
    ph: '6,0 – 7,0',
    acqua: { freq: '2 volte a settimana in estate', quant: '15–20 L per m²', note: 'Critico in fioritura (pennacchio) e riempimento della pannocchia.' },
    germ: '7–10 giorni', tGerm: 'min 10 °C',
    ciclo: '70–100 giorni dalla semina',
    dist: [25, 70],
    cal: {
      nord:   { sem: '', dir: '5-6', tra: '', rac: '8-9' },
      centro: { sem: '', dir: '4-6', tra: '', rac: '7-9' },
      sud:    { sem: '', dir: '3-6', tra: '', rac: '6-9' }
    },
    amiche: ['fagiolo', 'zucca', 'zucchina', 'cetriolo', 'melone', 'patata'],
    nemiche: [],
    avv: ['Piralide', 'Uccelli sui semi appena seminati'],
    consigli: ['Seminare almeno 3–4 file vicine (a quadrato) per una buona impollinazione.', 'È pronto quando le "barbe" sono scure e il chicco schiacciato fa latte.']
  },
  {
    id: 'valerianella', nome: 'Valerianella (soncino)', emoji: '🌱', fam: 'caprifoliacee', esig: 'bassa',
    desc: 'Insalatina invernale rustica e resistente al gelo, quando c\'è poco altro da raccogliere.',
    sole: 'Sole o mezz\'ombra',
    terreno: 'Compatto e fresco; non serve vangare in profondità',
    ph: '6,5 – 7,5',
    acqua: { freq: 'mantenere umido fino all\'emergenza', quant: 'leggera', note: 'Poi bastano le piogge autunnali.' },
    germ: '10–15 giorni', tGerm: 'min 5 °C; col caldo germina male',
    ciclo: '50–70 giorni',
    dist: [5, 15],
    cal: {
      nord:   { sem: '', dir: '8-10', tra: '', rac: '10-3' },
      centro: { sem: '', dir: '8-10', tra: '', rac: '10-3' },
      sud:    { sem: '', dir: '9-11', tra: '', rac: '11-3' }
    },
    amiche: ['cipolla', 'porro', 'lattuga'],
    nemiche: [],
    avv: ['Lumache', 'Oidio'],
    consigli: ['Ideale dopo la raccolta delle colture estive, senza rilavorare troppo il terreno.']
  },
  {
    id: 'asparago', nome: 'Asparago', emoji: '🌱', fam: 'asparagacee', esig: 'alta',
    desc: 'Perenne di lunga durata (10–15 anni). Si piantano le "zampe" (radici di 1 anno).',
    sole: 'Pieno sole',
    terreno: 'Sabbioso, profondo, molto drenato',
    ph: '6,5 – 7,5',
    acqua: { freq: '1 volta a settimana nei primi 2 anni', quant: '10 L per m²', note: 'Dopo l\'attecchimento è molto resistente alla siccità. Teme i ristagni.' },
    germ: '—', tGerm: 'si piantano le zampe',
    ciclo: 'Prima raccolta dal 3° anno',
    dist: [30, 100],
    cal: {
      nord:   { sem: '', dir: '', tra: '3-4', rac: '4-6' },
      centro: { sem: '', dir: '', tra: '2-4', rac: '3-5' },
      sud:    { sem: '', dir: '', tra: '1-3', rac: '2-5' }
    },
    amiche: ['pomodoro', 'prezzemolo', 'basilico'],
    nemiche: ['aglio', 'cipolla'],
    avv: ['Criocera dell\'asparago', 'Ruggine'],
    consigli: ['Destinargli un cassone dedicato: resta lì per molti anni e va escluso dalla rotazione.', 'Non raccogliere i primi 2 anni per far rinforzare le radici.']
  },

  // ───────────── AROMATICHE PERENNI ─────────────
  {
    id: 'rosmarino', nome: 'Rosmarino', emoji: '🌿', fam: 'lamiacee', esig: 'bassa',
    desc: 'Arbusto sempreverde e rustico: una pianta basta per tutta la cucina di casa. Ama il sole e teme solo i ristagni.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, sassoso, ben drenato, anche povero',
    ph: '6,0 – 8,0',
    acqua: { freq: 'ogni 10–15 giorni in estate, quasi mai in inverno', quant: '2–3 L per pianta', note: 'Teme molto i ristagni: meglio poca acqua che troppa. In vaso controlla più spesso.' },
    germ: '—', tGerm: 'si moltiplica per talea o da piantina',
    ciclo: 'Pianta perenne: si raccoglie tutto l\'anno',
    dist: [60, 80],
    cal: {
      nord:   { sem: '', dir: '', tra: '4-5,9',      rac: '1-12' },
      centro: { sem: '', dir: '', tra: '3-5,9-10',   rac: '1-12' },
      sud:    { sem: '', dir: '', tra: '2-4,10-11',  rac: '1-12' }
    },
    amiche: ['salvia', 'carota', 'cappuccio', 'fagiolo'],
    nemiche: [],
    avv: ['Marciume radicale da ristagno', 'Crisomela del rosmarino (piccolo coleottero verde metallico)'],
    consigli: ['Pota leggermente dopo la fioritura, senza tagliare il legno vecchio senza foglie.', 'Per moltiplicarlo fai talee di 10 cm in primavera.', 'Al Nord, in zone molto fredde, proteggi la base in inverno.']
  },
  {
    id: 'salvia', nome: 'Salvia', emoji: '🌿', fam: 'lamiacee', esig: 'bassa',
    desc: 'Aromatica perenne dalle foglie vellutate, profumatissima. Va rinnovata ogni 4–5 anni perché diventa legnosa.',
    sole: 'Pieno sole',
    terreno: 'Ben drenato, anche calcareo',
    ph: '6,0 – 7,5',
    acqua: { freq: 'ogni 7–10 giorni in estate', quant: '1–2 L per pianta', note: 'Soffre l\'umidità persistente: annaffia al piede e lascia asciugare tra un\'irrigazione e l\'altra.' },
    germ: '10–20 giorni', tGerm: 'min 15 °C (di solito si parte da piantina o talea)',
    ciclo: 'Pianta perenne: raccolta delle foglie da primavera ad autunno',
    dist: [40, 60],
    cal: {
      nord:   { sem: '3', dir: '', tra: '4-5,9',     rac: '3-11' },
      centro: { sem: '3', dir: '', tra: '3-5,9-10',  rac: '2-11' },
      sud:    { sem: '2', dir: '', tra: '2-4,10-11', rac: '1-12' }
    },
    amiche: ['rosmarino', 'cappuccio', 'carota', 'fragola'],
    nemiche: ['cetriolo'],
    avv: ['Oidio con umidità', 'Marciume da ristagno'],
    consigli: ['Cima i rametti per farla cespugliosa.', 'Taglia i fiori appassiti: rinvigorisce la pianta.']
  },
  {
    id: 'timo', nome: 'Timo', emoji: '🌿', fam: 'lamiacee', esig: 'bassa',
    desc: 'Piccolo cespuglio aromatico e rustico, ottimo anche come bordura delle aiuole. Attira le api.',
    sole: 'Pieno sole',
    terreno: 'Povero, sassoso, molto drenato',
    ph: '6,5 – 8,0',
    acqua: { freq: 'ogni 10–15 giorni in estate', quant: 'poca', note: 'Resiste bene alla siccità; l\'acqua in eccesso lo fa marcire.' },
    germ: '10–20 giorni', tGerm: 'min 15 °C',
    ciclo: 'Pianta perenne: raccolta da primavera ad autunno',
    dist: [25, 30],
    cal: {
      nord:   { sem: '3-4', dir: '', tra: '4-5,9',     rac: '4-10' },
      centro: { sem: '3',   dir: '', tra: '3-5,9-10',  rac: '3-11' },
      sud:    { sem: '2-3', dir: '', tra: '2-4,10-11', rac: '1-12' }
    },
    amiche: ['cappuccio', 'pomodoro', 'melanzana', 'fragola'],
    nemiche: [],
    avv: ['Marciume da ristagno'],
    consigli: ['Accorcia di un terzo dopo la fioritura per tenerlo compatto.', 'Ideale ai bordi delle aiuole e tra le pietre dei camminamenti.']
  },
  {
    id: 'menta', nome: 'Menta', emoji: '🌿', fam: 'lamiacee', esig: 'media',
    desc: 'Aromatica vigorosa e invadente: si espande con i rizomi e in poco tempo occupa tutto lo spazio intorno.',
    sole: 'Mezz\'ombra o sole non troppo forte',
    terreno: 'Fresco, umido, ricco',
    ph: '6,0 – 7,5',
    acqua: { freq: '2–3 volte a settimana in estate', quant: '1–2 L per pianta', note: 'Ama il terreno sempre fresco, al contrario delle altre aromatiche.' },
    germ: '10–15 giorni', tGerm: 'min 15 °C (meglio da piantina o divisione dei cespi)',
    ciclo: 'Pianta perenne: raccolta da primavera ad autunno',
    dist: [30, 40],
    cal: {
      nord:   { sem: '', dir: '', tra: '3-5,9',      rac: '4-10' },
      centro: { sem: '', dir: '', tra: '3-5,9-10',   rac: '4-11' },
      sud:    { sem: '', dir: '', tra: '2-4,10-11',  rac: '3-11' }
    },
    amiche: ['cappuccio', 'pomodoro'],
    nemiche: ['prezzemolo'],
    avv: ['Ruggine della menta', 'Afidi'],
    consigli: ['Coltivala in un vaso interrato o in un vaso a parte: altrimenti invade l\'aiuola.', 'Taglia spesso le cime, prima della fioritura, per avere foglie tenere.']
  },
  {
    id: 'origano', nome: 'Origano', emoji: '🌿', fam: 'lamiacee', esig: 'bassa',
    desc: 'Aromatica perenne del Mediterraneo: più è al sole e all\'asciutto, più è profumata.',
    sole: 'Pieno sole',
    terreno: 'Povero, calcareo, ben drenato',
    ph: '6,5 – 8,0',
    acqua: { freq: 'ogni 10–15 giorni in estate', quant: 'poca', note: 'Molto resistente alla siccità.' },
    germ: '7–14 giorni', tGerm: 'min 15 °C',
    ciclo: 'Pianta perenne: si raccoglie in fioritura (giugno–settembre) per essiccarlo',
    dist: [30, 40],
    cal: {
      nord:   { sem: '3-4', dir: '', tra: '4-5,9',     rac: '6-9' },
      centro: { sem: '3',   dir: '', tra: '3-5,9-10',  rac: '6-9' },
      sud:    { sem: '2-3', dir: '', tra: '2-4,10-11', rac: '5-9' }
    },
    amiche: ['pomodoro', 'peperone', 'cappuccio'],
    nemiche: [],
    avv: ['Marciume da ristagno'],
    consigli: ['Raccogli i rametti fioriti e falli seccare a mazzetti, appesi all\'ombra.']
  },
  {
    id: 'erbacipollina', nome: 'Erba cipollina', emoji: '🌱', fam: 'amarillidacee', esig: 'bassa',
    desc: 'Piccola perenne dal sapore delicato di cipolla; i fiori viola sono commestibili e attirano gli insetti utili.',
    sole: 'Sole o mezz\'ombra',
    terreno: 'Fresco e ricco',
    ph: '6,0 – 7,0',
    acqua: { freq: '1–2 volte a settimana in estate', quant: 'leggera', note: 'Tienila fresca: con la siccità le foglie diventano dure.' },
    germ: '10–15 giorni', tGerm: 'min 10 °C',
    ciclo: 'Pianta perenne: tagli continui da primavera ad autunno',
    dist: [20, 25],
    cal: {
      nord:   { sem: '3-4', dir: '4-5', tra: '4-5,9',  rac: '4-10' },
      centro: { sem: '3',   dir: '3-4', tra: '3-5,9',  rac: '3-11' },
      sud:    { sem: '2-3', dir: '2-3', tra: '2-4,10', rac: '2-11' }
    },
    amiche: ['carota', 'pomodoro', 'fragola'],
    nemiche: ['fagiolo', 'fagiolino', 'pisello'],
    avv: ['Ruggine', 'Afidi'],
    consigli: ['Taglia le foglie a 3–4 cm da terra: ricresce in pochi giorni.', 'Ogni 3–4 anni dividi il cespo e ripiantalo.']
  },

  // ───────────── ALTRE ─────────────
  {
    id: 'scalogno', nome: 'Scalogno', emoji: '🧅', fam: 'amarillidacee', esig: 'bassa',
    desc: 'Parente della cipolla dal gusto più fine. Si pianta il bulbo, che si moltiplica formando un cespo di 5–10 bulbi.',
    sole: 'Pieno sole',
    terreno: 'Sciolto, ben drenato, senza letame fresco',
    ph: '6,0 – 7,0',
    acqua: { freq: '1 volta a settimana se non piove', quant: '10 L per m²', note: 'Sospendi un mese prima della raccolta: si conservano meglio.' },
    germ: '—', tGerm: 'si pianta il bulbo',
    ciclo: '120–150 giorni dall\'impianto',
    dist: [15, 25],
    cal: {
      nord:   { sem: '', dir: '2-3',        tra: '', rac: '6-7' },
      centro: { sem: '', dir: '10-11,2-3',  tra: '', rac: '6-7' },
      sud:    { sem: '', dir: '10-12',      tra: '', rac: '5-6' }
    },
    amiche: ['carota', 'lattuga', 'barbabietola', 'fragola'],
    nemiche: ['fagiolo', 'fagiolino', 'pisello', 'fava'],
    avv: ['Peronospora', 'Mosca della cipolla'],
    consigli: ['Interra il bulbo appena, con la punta fuori dal terreno.', 'Raccogli quando le foglie ingialliscono e lascialo asciugare qualche giorno.']
  },
  {
    id: 'rapa', nome: 'Rapa', emoji: '🟣', fam: 'brassicacee', esig: 'media',
    desc: 'Radice dolce e veloce, bianca e viola. Ottima come coltura autunnale dopo gli ortaggi estivi.',
    sole: 'Sole o mezz\'ombra',
    terreno: 'Fresco, sciolto, senza sassi',
    ph: '6,0 – 7,5',
    acqua: { freq: '1–2 volte a settimana', quant: '10 L per m²', note: 'Acqua regolare: con la siccità diventa fibrosa e piccante.' },
    germ: '4–7 giorni', tGerm: 'min 5 °C',
    ciclo: '50–70 giorni dalla semina',
    dist: [10, 30],
    cal: {
      nord:   { sem: '', dir: '3-4,8-9', tra: '', rac: '5-6,10-11' },
      centro: { sem: '', dir: '3,8-9',   tra: '', rac: '5,10-12' },
      sud:    { sem: '', dir: '2,9-10',  tra: '', rac: '4,11-1' }
    },
    amiche: ['lattuga', 'pisello', 'spinacio'],
    nemiche: ['fragola'],
    avv: ['Altica', 'Mosca del cavolo'],
    consigli: ['Diradala a 10 cm: troppo fitta resta piccola.', 'Raccoglila a 5–8 cm di diametro, quando è più tenera.']
  }
];

// Varietà principali: tempi diversi dalla scheda generale (usati dal calendario personale).
(function () {
  const V = {
    pomodoro: [
      { id: 'ciliegino', nome: 'Ciliegino / datterino', ciclo: '60–75 giorni dal trapianto', note: 'Molto produttivo, a grappoli; ottimo anche in vaso.' },
      { id: 'tondo', nome: 'Tondo liscio da insalata', ciclo: '70–85 giorni dal trapianto', note: 'Il più classico, versatile.' },
      { id: 'sanmarzano', nome: 'San Marzano e allungati', ciclo: '75–90 giorni dal trapianto', note: 'Da salsa: polpa soda, maturazione abbastanza concentrata.' },
      { id: 'cuorebue', nome: 'Cuore di bue', ciclo: '80–100 giorni dal trapianto', note: 'Frutti grandi da insalata: serve un tutore robusto.' }
    ],
    lattuga: [
      { id: 'taglio', nome: 'Da taglio', ciclo: '25–35 giorni dalla semina', note: 'Si taglia più volte; perfetta per le semine scaglionate.' },
      { id: 'gentilina', nome: 'Gentilina / lollo', ciclo: '45–60 giorni dal trapianto', note: 'Foglie arricciate, si raccoglie anche a foglie.' },
      { id: 'cappuccio', nome: 'Cappuccio', ciclo: '50–65 giorni dal trapianto', note: 'Cespo chiuso e croccante.' },
      { id: 'romana', nome: 'Romana', ciclo: '60–75 giorni dal trapianto', note: 'Cespo allungato, resiste meglio al caldo.' }
    ],
    zucchina: [
      { id: 'genovese', nome: 'Chiara / genovese', ciclo: '45–55 giorni dalla semina', note: 'Molto produttiva e precoce.' },
      { id: 'tonda', nome: 'Tonda di Nizza / Piacenza', ciclo: '45–55 giorni dalla semina', note: 'Ideale da ripieno.' },
      { id: 'romanesca', nome: 'Romanesca (costoluta)', ciclo: '50–60 giorni dalla semina', note: 'Saporita, con fiore grande.' }
    ],
    peperone: [
      { id: 'friggitello', nome: 'Friggitello', ciclo: '60–75 giorni dal trapianto', note: 'Piccolo e dolce, raccolto verde: molto produttivo.' },
      { id: 'cornoditoro', nome: 'Corno di toro', ciclo: '75–90 giorni dal trapianto', note: 'Allungato, dolce.' },
      { id: 'quadrato', nome: 'Quadrato (tipo Asti)', ciclo: '80–95 giorni dal trapianto', note: 'Grande e carnoso: più lento a colorarsi.' }
    ],
    patata: [
      { id: 'precoce', nome: 'Precoce (novella)', ciclo: '70–90 giorni dall\'impianto', note: 'Da consumare presto, non si conserva a lungo.' },
      { id: 'media', nome: 'Medio-precoce', ciclo: '90–110 giorni dall\'impianto', note: 'Buon compromesso tra resa e conservazione.' },
      { id: 'tardiva', nome: 'Tardiva (da conservare)', ciclo: '110–130 giorni dall\'impianto', note: 'Resa maggiore, si conserva per mesi.' }
    ],
    cipolla: [
      { id: 'bianca', nome: 'Bianca precoce', ciclo: '120–150 giorni dall\'impianto', note: 'Dolce, da consumare fresca.' },
      { id: 'tropea', nome: 'Rossa di Tropea', ciclo: '130–160 giorni dall\'impianto', note: 'Dolcissima, si conserva poco.' },
      { id: 'dorata', nome: 'Dorata da conservazione', ciclo: '150–180 giorni dall\'impianto', note: 'Si conserva fino all\'inverno.' }
    ],
    fagiolo: [
      { id: 'borlotto', nome: 'Borlotto', ciclo: '70–80 giorni dalla semina (da sgranare fresco)', note: 'Da secco servono 90–110 giorni.' },
      { id: 'cannellino', nome: 'Cannellino', ciclo: '80–90 giorni dalla semina (da sgranare fresco)', note: 'Pianta nana, ottimo da secco.' }
    ],
    carota: [
      { id: 'precoce', nome: 'Precoce (tipo Nantese)', ciclo: '70–80 giorni dalla semina', note: 'Dolce, da consumare fresca.' },
      { id: 'tardiva', nome: 'Tardiva (tipo Flakkee)', ciclo: '100–120 giorni dalla semina', note: 'Più grossa, si conserva bene.' }
    ]
  };
  window.COLTURE.forEach(c => { if (V[c.id]) c.varieta = V[c.id]; });
})();

// Prezzo medio indicativo al dettaglio (€/kg, Italia) per stimare il risparmio del diario raccolti,
// e per quanti anni i semi restano buoni (germinabilità indicativa, conservati al fresco e all'asciutto).
(function () {
  const PREZZO = {
    pomodoro: 2.8, peperone: 3.2, melanzana: 2.5, peperoncino: 8, patata: 1.4, zucchina: 2.4, zucca: 1.8, cetriolo: 2.2,
    melone: 1.8, anguria: 1, fagiolo: 5, fagiolino: 4.5, pisello: 5, fava: 3.5, cavolfiore: 2.5, broccolo: 3, cappuccio: 1.5,
    cavolonero: 4, verza: 1.8, rucola: 12, ravanello: 4, cimedirapa: 3, lattuga: 3, radicchio: 3.5, indivia: 3, carciofo: 4,
    carota: 1.6, sedano: 2.2, prezzemolo: 10, finocchio: 2.2, bietola: 3, spinacio: 4.5, barbabietola: 2.5, aglio: 7,
    cipolla: 1.6, porro: 3, basilico: 20, fragola: 7, mais: 3, valerianella: 15, asparago: 9, rosmarino: 25, salvia: 30,
    timo: 40, menta: 25, origano: 30, erbacipollina: 30, scalogno: 6, rapa: 2
  };
  const SEMI_ANNI = {
    pomodoro: 4, peperone: 3, melanzana: 4, peperoncino: 3, zucchina: 5, zucca: 5, cetriolo: 5, melone: 5, anguria: 5,
    fagiolo: 3, fagiolino: 3, pisello: 3, fava: 4, cavolfiore: 4, broccolo: 4, cappuccio: 4, cavolonero: 4, verza: 4,
    rucola: 4, ravanello: 4, cimedirapa: 4, lattuga: 3, radicchio: 4, indivia: 4, carciofo: 5, carota: 3, sedano: 4,
    prezzemolo: 2, finocchio: 3, bietola: 4, spinacio: 3, barbabietola: 4, cipolla: 1, porro: 2, basilico: 4, fragola: 3,
    mais: 2, valerianella: 4, asparago: 4, salvia: 3, timo: 3, menta: 3, origano: 3, erbacipollina: 2, rapa: 4
  };
  window.COLTURE.forEach(c => { c.prezzo = PREZZO[c.id] || 3; if (SEMI_ANNI[c.id]) c.semiAnni = SEMI_ANNI[c.id]; });
})();
