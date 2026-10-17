// Invio giornaliero dei promemoria (avvisi meteo ogni giorno, lavori della settimana il lunedì)
// agli utenti premium con notifiche attive. Chiamata ogni mattina da GitHub Actions
// (.github/workflows/promemoria.yml) con l'intestazione x-cron-secret.
//
// I file in ../_shared/ (colture.js, promemoria.js) sono copie di quelli dell'app,
// aggiornate da pubblica-funzioni.ps1 prima di ogni deploy.
import '../_shared/shim.ts';
import '../_shared/colture.js';
import '../_shared/promemoria.js';
import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
import webpush from 'npm:web-push@3.6.7';

// deno-lint-ignore no-explicit-any
const G = globalThis as any;
const APP_URL = 'https://marcoprovenzano97-code.github.io/orto/';

type Voce = { id: string; tipo: string; livello: string; titolo: string; testo: string; link?: string };

function oggiRoma(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
}

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('Non autorizzato', { status: 401 });
  }
  const url = new URL(req.url);
  const soloUtente = url.searchParams.get('utente');      // per i test: un solo utente
  const forzaLunedi = url.searchParams.get('lunedi') === '1';

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  webpush.setVapidDetails(APP_URL, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

  const iso = oggiRoma();
  const oggi = new Date(iso + 'T12:00:00');
  const lunedi = forzaLunedi || oggi.getDay() === 1;

  let q = sb.from('profili').select('id, zona, lat, lon, premium_fino').eq('premium', true).eq('notifiche', true);
  if (soloUtente) q = q.eq('id', soloUtente);
  const { data: profili, error } = await q;
  if (error) return Response.json({ errore: error.message }, { status: 500 });

  const cacheMeteo = new Map<string, unknown>();
  const esito = { utenti: 0, notifiche: 0, iscrizioniRimosse: 0, errori: [] as string[] };

  for (const p of profili ?? []) {
    if (p.premium_fino && new Date(p.premium_fino) < new Date()) continue;
    const { data: iscr } = await sb.from('push_iscrizioni').select('id, endpoint, p256dh, auth').eq('user_id', p.id);
    if (!iscr?.length) continue;
    esito.utenti++;

    const { data: orto } = await sb.from('orti').select('dati').eq('user_id', p.id).maybeSingle();
    let meteo = null;
    if (p.lat != null && p.lon != null) {
      const chiave = `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`;
      if (!cacheMeteo.has(chiave)) {
        try {
          const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration&past_days=5&forecast_days=4&timezone=Europe%2FRome`);
          cacheMeteo.set(chiave, await r.json());
        } catch (e) { esito.errori.push('meteo ' + chiave + ': ' + e); cacheMeteo.set(chiave, null); }
      }
      meteo = cacheMeteo.get(chiave);
    }

    const voci: Voce[] = G.OrtoPromemoria.calcola({ colture: G.COLTURE, dati: orto?.dati ?? { cassoni: [] }, zona: p.zona, meteo, oggi });
    const daInviare: { chiave: string; title: string; body: string; url: string }[] = [];
    voci.filter(v => (v.tipo === 'meteo' && v.livello !== 'info') || v.tipo === 'evento').forEach(v =>
      daInviare.push({ chiave: v.id, title: v.titolo, body: v.testo, url: v.link ? './' + v.link : './#/mese' }));
    if (lunedi) {
      const lavori = voci.filter(v => v.tipo === 'lavori');
      if (lavori.length) {
        daInviare.push({ chiave: 'settimana-' + iso, title: '🗓️ Questa settimana nell\'orto', body: lavori.map(v => v.titolo.replace(/^\S+\s/, '') + ': ' + v.testo).join('\n'), url: './#/mese' });
      }
    }

    for (const n of daInviare.slice(0, 3)) {
      // Una sola volta per chiave (es. stessa allerta caldo ripetuta nei giorni successivi ha chiave diversa per data).
      const { error: dup } = await sb.from('notifiche_inviate').insert({ user_id: p.id, chiave: n.chiave });
      if (dup) continue;
      const payload = JSON.stringify({ title: n.title, body: n.body, url: n.url, tag: n.chiave });
      for (const s of iscr) {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 6 * 3600 });
          esito.notifiche++;
        } catch (e) {
          // deno-lint-ignore no-explicit-any
          const code = (e as any).statusCode;
          if (code === 404 || code === 410) {
            await sb.from('push_iscrizioni').delete().eq('id', s.id);
            esito.iscrizioniRimosse++;
          } else esito.errori.push(`push ${p.id}: ${code ?? e}`);
        }
      }
    }
  }
  return Response.json(esito);
});
