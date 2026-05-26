$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$metroPort = 8088
$proxyPort = 8787
$listening = Get-NetTCPConnection -LocalPort $metroPort -State Listen -ErrorAction SilentlyContinue

if (-not $listening) {
  Write-Host "Starting Metro in a new PowerShell window on port $metroPort..."
  & "$PSScriptRoot\Start-MetroWindow.ps1" -ProjectRoot $Root
  Start-Sleep -Seconds 8
} else {
  Write-Host "Metro already running on port $metroPort - reusing it."
}

$proxyListening = Get-NetTCPConnection -LocalPort $proxyPort -State Listen -ErrorAction SilentlyContinue
if (-not $proxyListening) {
  Write-Host "Starting Forge dev proxy on port $proxyPort (emulator -> PC -> uto.on-forge.com)..."
  Start-Process powershell -ArgumentList @(
    '-NoProfile', '-NoExit', '-Command',
    "Set-Location '$Root'; npm run dev:proxy"
  ) | Out-Null
  Start-Sleep -Seconds 2
} else {
  Write-Host "Forge dev proxy already running on port $proxyPort."
}

$adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
if (Test-Path $adb) {
  & $adb reverse "tcp:${metroPort}" "tcp:${metroPort}" | Out-Null
  Write-Host "adb reverse tcp:${metroPort} tcp:${metroPort}"
}

Write-Host "Building and launching Android app..."
npx react-native run-android --port $metroPort --no-packager
