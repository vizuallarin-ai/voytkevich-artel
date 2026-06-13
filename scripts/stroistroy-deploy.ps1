# Deploy stroistroy.ru to Beget VPS from Windows PowerShell
# Usage: .\scripts\stroistroy-deploy.ps1

param(
  [string]$ServerIp = "159.194.212.82",
  [string]$User = "root",
  [string]$ProjectRoot = "",
  [string]$KeyPath = "$env:USERPROFILE\.ssh\stroistroy_beget",
  [switch]$RotateToken,
  [switch]$SetupKeyOnly
)

$ErrorActionPreference = "Stop"

if (-not $ProjectRoot) {
  $ProjectRoot = Split-Path $PSScriptRoot -Parent
}

$remote = "${User}@${ServerIp}"
$sshArgs = @()

if (Test-Path $KeyPath) {
  $sshArgs = @("-i", $KeyPath, "-o", "IdentitiesOnly=yes", "-o", "StrictHostKeyChecking=accept-new")
} else {
  Write-Host "SSH key not found: $KeyPath" -ForegroundColor Yellow
  Write-Host "Run: ssh-keygen -t ed25519 -f $KeyPath -C stroistroy-beget" -ForegroundColor Cyan
  if ($SetupKeyOnly) { exit 1 }
  throw "Configure SSH key first"
}

function Invoke-Ssh([string]$Command) {
  & ssh @sshArgs $remote $Command
  if ($LASTEXITCODE -ne 0) { throw "SSH failed: $Command" }
}

Write-Host "==> Push to GitHub" -ForegroundColor Cyan
Push-Location $ProjectRoot
try {
  git push origin master
} finally {
  Pop-Location
}

Write-Host "==> Update VPS" -ForegroundColor Cyan
Invoke-Ssh "cd /opt/stroistroy && git pull origin master && bash scripts/vps-update.sh"

if ($RotateToken) {
  Write-Host "==> Rotate CRM token" -ForegroundColor Cyan
  Invoke-Ssh "cd /opt/stroistroy && bash scripts/rotate-crm-token.sh"
}

Write-Host ""
Write-Host "Deploy finished." -ForegroundColor Green
Write-Host "Site: https://stroistroy.ru" -ForegroundColor Green
Write-Host "CRM:  https://stroistroy.ru/dashboard/login" -ForegroundColor Green
Write-Host "Health: https://stroistroy.ru/api/health" -ForegroundColor Green
