// Assistente dell'orto: risponde alle domande dell'utente conoscendo il suo orto
// (aiuole, colture in campo, zona, meteo, irrigazione, ultimi check-up). Solo Premium, 50 messaggi al mese.
//
// Richiesta (POST, JSON, con l'Authorization della sessione Supabase):
//   { messaggi: [{ ruolo: 'utente' | 'assistente', testo }] }   — l'ultimo è la nuova domanda
import '../_shared/shim.ts';
import '../_shared/colture.js';
import '../_shared/promemoria.js';
import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
import Anthropic from 'npm:@anthropic-ai/sdk@0.130.0';

// deno-lint-ignore no-explicit-any
const G = globalThis as any;
const LIMITE_MESE = 50;
const MODELLO = 'claude-opus-5-5';
const STORIA_MAX = 12;            // messaggi precedenti inviati al modello
const TESTO_MAX = 2000;           // caratteri per messaggio

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const risposta = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const ISTRUZIONI = `Sei l'assistente di Ortogramma, un'app italiana per chi coltiva un orto familiare. Rispondi come un orticoltore esperto e cordiale che conosce bene l'orto dell'utente: sotto trovi la sua situazione aggiornata (zona, aiuole, colture, meteo, irrigazione, ultimi check-up). Usala sempre per dare consigli concreti e personali, citando aiuole e colture per nome quando serve.

Ambito:
- Rispondi su orto, ortaggi, aromatiche, piccoli frutti, alberi da frutto, giardinaggio, terreno, compost, irrigazione, semi, malattie e parassiti delle piante, conservazione e uso del raccolto, e sull'uso dell'app.
- Se la domanda non riguarda questi temi, rispondi con una frase gentile che ti occupi solo dell'orto e proponi una domanda utile sul suo orto.

Come rispondere:
- Italiano semplice e diretto, frasi brevi. Di norma 3-8 frasi o un breve elenco; vai più nel dettaglio solo se la domanda lo richiede.
- Dai la risposta pratica per prima, poi il perché in poche parole.
- Se mancano informazioni importanti, fai una sola domanda di chiarimento oppure indica cosa controllare.
- Sii onesto quando non sei sicuro; per diagnosi dalle foto suggerisci il check-up con foto dell'app, nella pagina dell'aiuola.
- Trattamenti: preferisci rimedi consentiti in agricoltura biologica e pratiche preventive; indica sempre le precauzioni d'uso e i tempi di attesa prima della raccolta. Non dare indicazioni su prodotti non autorizzati per l'orto di casa. Per sicurezza alimentare (conserve, funghi, piante tossiche) sii prudente e invita a fonti ufficiali quando c'è un rischio.
- Le date di semina dipendono dalla zona indicata: usa quella dell'utente.
- Puoi usare **grassetto** ed elenchi puntati con "- ". Niente tabelle e niente titoli.`;

function stagioneEtichetta(k: string) {
  const [a, s] = k.split('-');
  return s === 'PE' ? `primavera-estate ${a}` : `autunno-inverno ${a}/${String(+a + 1).slice(2)}`;
}

// deno-lint-ignore no-explicit-any
function descriviOrto(dati: any, meteo: any, oggi: Date, checkup: any[]) {
  const byId = Object.fromEntries(G.COLTURE.map((c: { id: string }) => [c.id, c]));
  const P = G.OrtoPromemoria;
  const kOggi = P.stagioneDa(oggi);
  const tipi: Record<string, string> = { cassone: 'cassone rialzato', terra: 'piena terra', vaso: 'vaso o fioriera' };
  const righe: string[] = [];
  const aiuole = (dati && dati.cassoni) || [];
  if (!aiuole.length) righe.push('L\'utente non ha ancora registrato aiuole nell\'app.');
  // deno-lint-ignore no-explicit-any
  aiuole.forEach((cs: any) => {
    const piani = cs.piani || {};
    const nomi = (k: string) => {
      const p = piani[k]; if (!p) return [];
      const ids = new Set([...Object.values(p.celle || {}), ...(p.extra || [])] as string[]);
      return [...ids].filter(id => byId[id]).map(id => byId[id].nome);
    };
    const passate = Object.keys(piani).filter(k => k !== kOggi && nomi(k).length).sort().reverse().slice(0, 4)
      .map(k => `${stagioneEtichetta(k)}: ${nomi(k).join(', ')}`);
    const ir = meteo ? P.irrigazione(cs, byId, meteo, oggi) : null;
    const acqua = !ir ? '' : ir.serve ? ` Acqua stimata oggi: circa ${ir.litri} litri.` : ' Oggi non serve annaffiare (stima).';
    righe.push(`- ${cs.nome} (${tipi[cs.tipo] || 'cassone rialzato'}, ${cs.larghezza}×${cs.lunghezza} cm${cs.perenne ? ', colture perenni' : ''}). ` +
      `In questa stagione (${stagioneEtichetta(kOggi)}): ${nomi(kOggi).join(', ') || 'vuota'}.` +
      (passate.length ? ` Stagioni precedenti — ${passate.join('; ')}.` : '') +
      (cs.irrigata ? ` Ultima irrigazione registrata: ${cs.irrigata}.` : '') + acqua);
  });
  let met = 'Meteo non disponibile (comune non impostato).';
  if (meteo && meteo.daily) {
    const d = meteo.daily;
    met = 'Meteo (data: max/min °C, pioggia mm): ' + d.time.map((t: string, i: number) =>
      `${t.slice(5)}${t === P.isoGiorno(oggi) ? ' (oggi)' : ''}: ${Math.round(d.temperature_2m_max[i])}/${Math.round(d.temperature_2m_min[i])}, ${d.precipitation_sum[i]}`).join('; ') + '.';
  }
  const ck = checkup.length ? 'Ultimi check-up con foto: ' + checkup.map(c =>
    `${c.creato.slice(0, 10)} ${byId[c.coltura]?.nome || 'pianta'}: ${c.esito?.stato || '?'} — ${c.esito?.riepilogo || ''}`).join(' | ') : '';
  return { aiuole: righe.join('\n'), meteo: met, checkup: ck };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return risposta({ errore: 'Metodo non consentito' }, 405);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u, error: errU } = await sb.auth.getUser(token);
  if (errU || !u?.user) return risposta({ errore: 'Accedi per usare l\'assistente.' }, 401);
  const uid = u.user.id;

  const { data: prof } = await sb.from('profili').select('premium, premium_fino, zona, luogo, lat, lon').eq('id', uid).maybeSingle();
  const premium = !!prof?.premium && (!prof.premium_fino || new Date(prof.premium_fino) > new Date());
  if (!premium) return risposta({ errore: 'L\'assistente è una funzione Premium.' }, 403);
  const inizioMese = new Date(); inizioMese.setDate(1); inizioMese.setHours(0, 0, 0, 0);
  const { count } = await sb.from('assistente_log').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('creato', inizioMese.toISOString());
  if ((count ?? 0) >= LIMITE_MESE) {
    return risposta({ errore: `Hai usato tutti i ${LIMITE_MESE} messaggi di questo mese. Si rinnovano il primo del mese.` }, 429);
  }

  // Conversazione: alterna utente/assistente, inizia con l'utente e finisce con la nuova domanda.
  let corpo: { messaggi?: { ruolo?: string; testo?: string }[] };
  try { corpo = await req.json(); } catch { return risposta({ errore: 'Richiesta non valida.' }, 400); }
  const lista = (corpo.messaggi || []).filter(m => m && typeof m.testo === 'string' && m.testo.trim())
    .map(m => ({ role: m.ruolo === 'assistente' ? 'assistant' as const : 'user' as const, content: m.testo!.slice(0, TESTO_MAX) }));
  const storia: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of lista.slice(-STORIA_MAX)) {
    if (!storia.length && m.role !== 'user') continue;
    if (storia.length && storia[storia.length - 1].role === m.role) storia[storia.length - 1].content += '\n\n' + m.content;
    else storia.push(m);
  }
  if (!storia.length || storia[storia.length - 1].role !== 'user') return risposta({ errore: 'Scrivi una domanda.' }, 400);

  // Contesto dell'orto.
  const oggi = new Date(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date()) + 'T12:00:00');
  const { data: orto } = await sb.from('orti').select('dati').eq('user_id', uid).maybeSingle();
  const { data: ck } = await sb.from('checkup').select('creato, coltura, esito').eq('user_id', uid).order('creato', { ascending: false }).limit(5);
  let meteo = null;
  if (prof?.lat != null && prof?.lon != null) {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${prof.lat}&longitude=${prof.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration&past_days=5&forecast_days=4&timezone=Europe%2FRome`);
      meteo = await r.json();
    } catch { /* senza meteo */ }
  }
  const o = descriviOrto(orto?.dati, meteo, oggi, ck || []);
  const contesto = [
    `Data di oggi: ${oggi.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`,
    `Zona climatica: ${G.ZONE[prof?.zona || 'nord']?.nome || 'Nord'} Italia${prof?.luogo ? `; comune: ${prof.luogo}` : ''}.`,
    'Aiuole dell\'utente:', o.aiuole, o.meteo, o.checkup
  ].filter(Boolean).join('\n');

  const chiave = Deno.env.get('ANTHROPIC_API_KEY');
  if (!chiave) return risposta({ errore: 'L\'assistente non è ancora attivo.' }, 503);
  const client = new Anthropic({ apiKey: chiave });
  let msg;
  try {
    msg = await client.beta.messages.create({
      model: MODELLO,
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      // Istruzioni fisse e contesto dell'orto in cache: dalla seconda domanda costano molto meno.
      system: [
        { type: 'text', text: ISTRUZIONI, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: 'SITUAZIONE DELL\'ORTO DELL\'UTENTE\n' + contesto, cache_control: { type: 'ephemeral' } }
      ],
      // In caso di rifiuto per policy, la richiesta passa al modello di riserva scelto dal server.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: storia
    // deno-lint-ignore no-explicit-any
    } as any);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return risposta({ errore: 'Servizio molto richiesto in questo momento: riprova tra un minuto.' }, 503);
    if (e instanceof Anthropic.APIError) { console.error('Anthropic', e.status, e.message); return risposta({ errore: 'Risposta non riuscita, riprova più tardi.' }, 502); }
    console.error(e);
    return risposta({ errore: 'Risposta non riuscita, riprova più tardi.' }, 502);
  }
  if (msg.stop_reason === 'refusal') return risposta({ errore: 'Su questa domanda non posso aiutarti. Prova a riformularla parlando del tuo orto.' }, 422);
  // deno-lint-ignore no-explicit-any
  const testo = (msg.content as any[]).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  if (!testo) return risposta({ errore: 'Risposta vuota, riprova.' }, 502);

  await sb.from('assistente_log').insert({
    user_id: uid, token_input: msg.usage?.input_tokens ?? null, token_output: msg.usage?.output_tokens ?? null,
    token_cache: msg.usage?.cache_read_input_tokens ?? null
  });
  return risposta({ testo, rimasti: LIMITE_MESE - (count ?? 0) - 1 });
});
