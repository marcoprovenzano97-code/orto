# Copia la logica condivisa dall'app alle funzioni Supabase e le pubblica.
# Uso:  powershell -ExecutionPolicy Bypass -File pubblica-funzioni.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Copy-Item "$root\app\data\colture.js" "$root\supabase\functions\_shared\colture.js" -Force
Copy-Item "$root\app\promemoria.js"   "$root\supabase\functions\_shared\promemoria.js" -Force
Push-Location $root
$ErrorActionPreference = 'Continue'   # la CLI scrive avvisi su stderr: non sono errori
try {
  # Ogni funzione controlla da sola chi chiama (segreto del cron / sessione dell'utente).
  foreach ($f in 'promemoria', 'checkup', 'assistente', 'elimina-account') {
    npx.cmd --yes supabase@2.117.0 functions deploy $f --no-verify-jwt
  }
} finally { Pop-Location }
