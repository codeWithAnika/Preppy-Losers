param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
}

Write-Host "WARNING: This will overwrite data on the linked Supabase project."
$confirm = Read-Host "Type RESTORE to continue"
if ($confirm -ne "RESTORE") {
    Write-Host "Aborted."
    exit 1
}

Write-Host "Restoring from $BackupFile ..."
Get-Content $BackupFile | npx supabase db execute --linked

if ($LASTEXITCODE -ne 0) {
    Write-Error "Restore failed with exit code $LASTEXITCODE"
}

Write-Host "Restore complete. Verify data in Supabase Dashboard."
