# Server locale per provare l'app: http://localhost:8950
$root = Join-Path $PSScriptRoot "app"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8950/")
$listener.Start()
Write-Output "Serving $root on http://localhost:8950/"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $res = $context.Response
    $path = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq "") { $path = "index.html" }
    $full = Join-Path $root $path
    if (Test-Path $full -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $res.ContentType = switch ([System.IO.Path]::GetExtension($full).ToLower()) {
            ".html" { "text/html; charset=utf-8" }
            ".js"   { "application/javascript; charset=utf-8" }
            ".css"  { "text/css; charset=utf-8" }
            ".webmanifest" { "application/manifest+json" }
            ".png"  { "image/png" }
            default { "application/octet-stream" }
        }
        $res.Headers.Add("Cache-Control", "no-cache")
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $res.StatusCode = 404 }
    $res.OutputStream.Close()
}
