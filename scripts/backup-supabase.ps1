param(
    [string]$OutputDir = "backups"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outFile = Join-Path $OutputDir "preppy-losers-$timestamp.sql"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Starting Supabase backup -> $outFile"
npx supabase db dump --linked -f $outFile

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backup failed with exit code $LASTEXITCODE"
}

$fileSize = (Get-Item $outFile).Length / 1MB
Write-Host "Backup complete: $outFile ($([math]::Round($fileSize, 2)) MB)"
Write-Host "Upload to off-site storage (S3/GCS) for retention."
