$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

Write-Host "Removing native build caches..."
Write-Host "(Stop Metro first if it is running - npm run kill:metro)"
$paths = @(
  "android\app\.cxx",
  "android\app\build",
  "android\build",
  "node_modules\react-native-gesture-handler\android\.cxx",
  "node_modules\react-native-gesture-handler\android\build",
  "node_modules\react-native-screens\android\.cxx",
  "node_modules\react-native-screens\android\build"
)
foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Recurse -Force $p
    Write-Host "  removed $p"
  }
}

Write-Host "Done. Run: npm run android"
