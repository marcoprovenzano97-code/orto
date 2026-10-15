# Copia la logica condivisa dall'app alla funzione Supabase e la pubblica.
# Uso:  powershell -ExecutionPolicy Bypass -File pubblica-funzioni.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Copy-Item "$root\app\data\colture.js" "$root\supabase\functions\_shared\colture.js" -Force
Copy-Item "$root\app\promemoria.js"   "$root\supabase\functions\_shared\promemoria.js" -Force
Push-Location $root
try {
  npx --yes supabase@2.117.0 functions deploy promemoria --no-verify-jwt
} finally { Pop-Location }
