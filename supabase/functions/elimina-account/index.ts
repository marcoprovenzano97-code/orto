// Elimina definitivamente l'account dell'utente che la chiama.
// I dati collegati (profilo, orto, iscrizioni push, check-up, assistente) si cancellano a cascata.
import { createClient } from 'npm:@supabase/supabase-js@2.116.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const risposta = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return risposta({ errore: 'Metodo non consentito' }, 405);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return risposta({ errore: 'Accedi per eliminare l\'account.' }, 401);
  const { error: errDel } = await sb.auth.admin.deleteUser(data.user.id);
  if (errDel) { console.error(errDel); return risposta({ errore: 'Eliminazione non riuscita, riprova o scrivici.' }, 500); }
  return risposta({ ok: true });
});
