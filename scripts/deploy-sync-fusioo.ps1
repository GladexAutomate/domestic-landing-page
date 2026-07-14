# Run this from the project root:
#   .\scripts\deploy-sync-fusioo.ps1
#
# Requires: Supabase CLI installed + logged in (supabase login)

# 1. Read secrets from .env.local
$env_file = Join-Path $PSScriptRoot ".." ".env.local"
$env_vars = @{}
Get-Content $env_file | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $key = $line.Substring(0, $eq).Trim()
    $val = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
    $env_vars[$key] = $val
}

$FUSIOO_TOKEN         = $env_vars["FUSIOO_TOKEN"]
$FUSIOO_BOOKING_APP   = $env_vars["FUSIOO_BOOKING_APP_ID"]

if (-not $FUSIOO_TOKEN -or -not $FUSIOO_BOOKING_APP) {
    Write-Error "Could not read FUSIOO_TOKEN or FUSIOO_BOOKING_APP_ID from .env.local"
    exit 1
}

Write-Host "Setting Supabase secrets..." -ForegroundColor Cyan
supabase secrets set FUSIOO_TOKEN="$FUSIOO_TOKEN" FUSIOO_BOOKING_APP_ID="$FUSIOO_BOOKING_APP"

Write-Host "Deploying sync-fusioo edge function..." -ForegroundColor Cyan
supabase functions deploy sync-fusioo

Write-Host "Done! Now run the SQL in schedule-sync-fusioo.sql in your Supabase SQL editor." -ForegroundColor Green
