# First deploy to Beget VPS from Windows PowerShell
# Usage: .\scripts\beget-deploy.ps1

param(
  [string]$ServerIp = "159.194.212.82",
  [string]$User = "root"
)

$remote = "${User}@${ServerIp}"

Write-Host "Deploying to $remote ..." -ForegroundColor Cyan
Write-Host "Enter root password from Beget VPS panel when prompted." -ForegroundColor Yellow

ssh $remote "bash -s" < "$PSScriptRoot/beget-vps-setup.sh"

Write-Host ""
Write-Host "Next: .\scripts\beget-ssl.ps1" -ForegroundColor Green
Write-Host "CRM:  https://stroistroy.ru/dashboard/login" -ForegroundColor Green
