# Copia la logica condivisa dall'app alle funzioni Supabase e le pubblica.
# Uso:  powershell -ExecutionPolicy Bypass -File pubblica-funzioni.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Copy-Item "$root\app\data\colture.js" "$root\supabase\functions\_shared\colture.js" -Force
Copy-Item "$root\app\promemoria.js"   "$root\supabase\functions\_shared\promemoria.js" -Force
Push-Location $root
$ErrorActionPreference = 'Continue'   # la CLI scrive avvisi su stderr: non sono errori
try {
  # Entrambe controllano da sole chi chiama (segreto del cron / sessione dell'utente).
  npx.cmd --yes supabase@2.117.0 functions deploy promemoria --no-verify-jwt
  npx.cmd --yes supabase@2.117.0 functions deploy checkup --no-verify-jwt
} finally { Pop-Location }
