# SSL via certbot on Beget VPS (run from Windows PowerShell)
# Usage: .\scripts\beget-ssl.ps1

param(
  [string]$ServerIp = "159.194.212.82",
  [string]$User = "root",
  [string]$Email = "admin@stroistroy.ru"
)

$remote = "${User}@${ServerIp}"
Write-Host "Running certbot on $remote ..." -ForegroundColor Cyan
ssh $remote "certbot --nginx -d stroistroy.ru -d www.stroistroy.ru --agree-tos -m $Email"
Write-Host "Open: https://stroistroy.ru" -ForegroundColor Green
