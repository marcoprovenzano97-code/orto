// Check-up con foto: analizza la foto di una pianta (stato, raccolta, potatura, malattie, acqua)
// con Claude e restituisce una scheda strutturata. Solo utenti Premium, con limite mensile.
//
// Richiesta (POST, JSON, con l'Authorization della sessione Supabase):
//   { immagine: <jpeg base64>, coltura: <id coltura>, tipoAiuola, giorniImpianto?, irrigata?, nota? }
import '../_shared/shim.ts';
import '../_shared/colture.js';
import '../_shared/promemoria.js';
import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
import Anthropic from 'npm:@anthropic-ai/sdk@0.130.0';

// deno-lint-ignore no-explicit-any
const G = globalThis as any;
const LIMITE_MESE = 30;
const MODELLO = 'claude-opus-5-5';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const risposta = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Formato della scheda: il modello deve rispondere esattamente con questa struttura.
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['foto_utile', 'consiglio_foto', 'coltura_vista', 'corrisponde', 'stato', 'riepilogo', 'azioni', 'problemi', 'raccolta'],
  properties: {
    foto_utile: { type: 'boolean', description: 'false se la foto è sfocata, troppo lontana o non mostra una pianta' },
    consiglio_foto: { type: 'string', description: 'come rifare la foto se non è utile, altrimenti stringa vuota' },
    coltura_vista: { type: 'string', description: 'la pianta che si vede, in italiano' },
    corrisponde: { type: 'boolean', description: 'la pianta vista corrisponde alla coltura indicata' },
    stato: { type: 'string', enum: ['buono', 'attenzione', 'problema'] },
    riepilogo: { type: 'string', description: 'una o due frasi semplici sullo stato della pianta' },
    azioni: {
      type: 'array',
      description: 'da 1 a 4 azioni concrete, la più urgente per prima',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['tipo', 'priorita', 'titolo', 'dettaglio'],
        properties: {
          tipo: { type: 'string', enum: ['raccogli', 'annaffia', 'pota', 'tratta', 'concima', 'proteggi', 'aspetta', 'controlla'] },
          priorita: { type: 'string', enum: ['alta', 'media', 'bassa'] },
          titolo: { type: 'string' },
          dettaglio: { type: 'string' }
        }
      }
    },
    problemi: {
      type: 'array',
      description: 'malattie, parassiti, carenze o stress visibili; vuoto se non ce ne sono',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['nome', 'certezza', 'segni'],
        properties: {
          nome: { type: 'string' },
          certezza: { type: 'string', enum: ['alta', 'media', 'bassa'] },
          segni: { type: 'string', description: 'cosa si vede nella foto che fa pensare a questo problema' }
        }
      }
    },
    raccolta: {
      type: 'object',
      additionalProperties: false,
      required: ['pronta', 'quando'],
      properties: {
        pronta: { type: 'string', enum: ['si', 'in_parte', 'no', 'non_applicabile'] },
        quando: { type: 'string', description: 'es. "i 3 frutti in basso subito, gli altri tra 5-7 giorni"; vuoto se non applicabile' }
      }
    }
  }
};

const ISTRUZIONI = `Sei un agronomo esperto di orti familiari italiani. Ricevi la foto di una pianta coltivata in un orto di casa, con alcune informazioni di contesto, e prepari un breve check-up per un appassionato non esperto.

Cosa valutare guardando la foto:
- maturazione e momento della raccolta di frutti, ortaggi o foglie;
- potature o interventi visibili (femminelle del pomodoro, foglie secche o malate da togliere, piante troppo fitte da diradare, tutori);
- malattie, parassiti, carenze nutritive, scottature, stress da caldo o da freddo;
- segni di sete o di eccesso d'acqua.

Regole:
- Per l'acqua non basarti solo sulla foto: una pianta un po' appassita nelle ore calde può essere normale. Incrocia sempre ciò che vedi con i dati meteo e di irrigazione forniti e spiega il ragionamento in parole semplici.
- Sii onesto sul grado di certezza: se un problema non è chiaro, indicalo con certezza bassa e suggerisci cosa controllare (es. il retro delle foglie).
- Proponi rimedi adatti all'orto di casa, preferendo quelli consentiti in agricoltura biologica (es. prodotti rameici, zolfo, sapone molle, Bacillus thuringiensis), con le cautele d'uso e rispettando i tempi di carenza prima della raccolta.
- Se la foto non permette una valutazione affidabile, imposta foto_utile a false e spiega in consiglio_foto come rifarla.
- Se la pianta nella foto non è la coltura indicata, imposta corrisponde a false e valuta comunque quella che vedi.
- Scrivi in italiano semplice e concreto, frasi brevi, niente gergo tecnico non spiegato. Massimo 4 azioni.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return risposta({ errore: 'Metodo non consentito' }, 405);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Utente dalla sessione.
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u, error: errU } = await sb.auth.getUser(token);
  if (errU || !u?.user) return risposta({ errore: 'Accedi per usare il check-up.' }, 401);
  const uid = u.user.id;

  // Premium e limite mensile.
  const { data: prof } = await sb.from('profili').select('premium, premium_fino, zona, lat, lon').eq('id', uid).maybeSingle();
  const premium = !!prof?.premium && (!prof.premium_fino || new Date(prof.premium_fino) > new Date());
  if (!premium) return risposta({ errore: 'Il check-up con foto è una funzione Premium.' }, 403);
  const inizioMese = new Date(); inizioMese.setDate(1); inizioMese.setHours(0, 0, 0, 0);
  const { count } = await sb.from('checkup').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('creato', inizioMese.toISOString());
  if ((count ?? 0) >= LIMITE_MESE) {
    return risposta({ errore: `Hai usato tutti i ${LIMITE_MESE} check-up di questo mese. Si rinnovano il primo del mese.` }, 429);
  }

  // Richiesta.
  let corpo: { immagine?: string; coltura?: string; tipoAiuola?: string; giorniImpianto?: number; irrigata?: string; nota?: string };
  try { corpo = await req.json(); } catch { return risposta({ errore: 'Richiesta non valida.' }, 400); }
  const immagine = (corpo.immagine || '').replace(/^data:image\/\w+;base64,/, '');
  if (!immagine || immagine.length > 4_000_000) return risposta({ errore: 'Foto mancante o troppo grande.' }, 400);
  const coltura = G.COLTURE.find((c: { id: string }) => c.id === corpo.coltura);

  // Contesto: coltura, zona, stagione, meteo degli ultimi giorni e irrigazione.
  const oggi = new Date(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date()) + 'T12:00:00');
  const zona = G.ZONE[prof?.zona || 'nord']?.nome || 'Nord';
  const righe = [
    `Coltura indicata: ${coltura ? `${coltura.nome} (famiglia ${G.FAMIGLIE[coltura.fam].nome})` : 'non indicata'}.`,
    `Zona climatica: ${zona} Italia. Data: ${oggi.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
    `Tipo di aiuola: ${({ cassone: 'cassone rialzato', terra: 'piena terra', vaso: 'vaso o fioriera' } as Record<string, string>)[corpo.tipoAiuola || ''] || 'non indicato'}.`
  ];
  if (coltura) righe.push(`Scheda di riferimento: ciclo ${coltura.ciclo}; acqua: ${coltura.acqua.freq}, ${coltura.acqua.quant}.`);
  if (corpo.giorniImpianto != null) righe.push(`Messa a dimora circa ${corpo.giorniImpianto} giorni fa.`);
  if (corpo.irrigata) righe.push(`Ultima irrigazione registrata: ${corpo.irrigata}.`);
  if (prof?.lat != null && prof?.lon != null) {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${prof.lat}&longitude=${prof.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration&past_days=5&forecast_days=2&timezone=Europe%2FRome`);
      const m = await r.json();
      const d = m.daily;
      righe.push('Meteo (giorno: max/min °C, pioggia mm, evaporazione mm): ' +
        d.time.map((t: string, i: number) => `${t.slice(5)}: ${Math.round(d.temperature_2m_max[i])}/${Math.round(d.temperature_2m_min[i])}, ${d.precipitation_sum[i]}, ${d.et0_fao_evapotranspiration[i]}`).join('; ') + '.');
    } catch { righe.push('Meteo non disponibile.'); }
  } else {
    righe.push('Meteo non disponibile (comune non impostato).');
  }
  if (corpo.nota) righe.push(`Nota dell'utente: ${String(corpo.nota).slice(0, 300)}`);

  // Analisi.
  const chiave = Deno.env.get('ANTHROPIC_API_KEY');
  if (!chiave) return risposta({ errore: 'Il check-up con foto non è ancora attivo.' }, 503);
  const client = new Anthropic({ apiKey: chiave });
  let msg;
  try {
    msg = await client.beta.messages.create({
      model: MODELLO,
      max_tokens: 16000,
      system: ISTRUZIONI,
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
      // In caso di rifiuto per policy, la richiesta passa al modello di riserva scelto dal server.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: immagine } },
          { type: 'text', text: righe.join('\n') + '\n\nPrepara il check-up di questa pianta.' }
        ]
      }]
    // deno-lint-ignore no-explicit-any
    } as any);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return risposta({ errore: 'Servizio molto richiesto in questo momento: riprova tra un minuto.' }, 503);
    if (e instanceof Anthropic.APIError) { console.error('Anthropic', e.status, e.message); return risposta({ errore: 'Analisi non riuscita, riprova più tardi.' }, 502); }
    console.error(e);
    return risposta({ errore: 'Analisi non riuscita, riprova più tardi.' }, 502);
  }
  if (msg.stop_reason === 'refusal') return risposta({ errore: 'Non è stato possibile analizzare questa foto. Prova con un\'altra inquadratura.' }, 422);
  // deno-lint-ignore no-explicit-any
  const testo = (msg.content as any[]).filter(b => b.type === 'text').map(b => b.text).join('');
  let esito;
  try { esito = JSON.parse(testo); } catch { return risposta({ errore: 'Risposta non valida, riprova.' }, 502); }

  await sb.from('checkup').insert({
    user_id: uid, coltura: corpo.coltura || null, esito,
    token_input: msg.usage?.input_tokens ?? null, token_output: msg.usage?.output_tokens ?? null
  });
  return risposta({ esito, rimasti: LIMITE_MESE - (count ?? 0) - 1 });
});
