$ErrorActionPreference = "Stop"

$port = 8000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Serving folder: $root"
Write-Host "Port: $port"
Write-Host ""
Write-Host "Keep this window open while using the site on iPad."
Write-Host ""

Set-Location $root
python -m http.server $port
