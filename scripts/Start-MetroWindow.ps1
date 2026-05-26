param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$title = 'Metro - SAMSON'
$command = @"
`$Host.UI.RawUI.WindowTitle = '$title'
Write-Host 'Metro bundler - press r to reload' -ForegroundColor Cyan
npm run start
"@

Start-Process -FilePath 'powershell.exe' `
  -WorkingDirectory $ProjectRoot `
  -ArgumentList @('-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $command)

Write-Host "Opened '$title' PowerShell window (port 8088)."
