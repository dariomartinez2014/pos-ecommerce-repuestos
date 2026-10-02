# ARCHIVO: Prepara la base exclusiva de pruebas y ejecuta e2e sin limpiar la base de demostración.
# ESTUDIO: pasos y bloques explicados en docs/GUIA-CODIGO-COMPLETA.md.
# PRUEBAS: usa una base exclusiva terminada en _test y preserva la demostración.
param([switch]$EngineFallback)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $projectRoot
& node scripts/configure-local.cjs
if ($LASTEXITCODE -ne 0) { throw 'Configuración local inválida.' }
& (Join-Path $PSScriptRoot 'local-db.ps1') -Action Start
$config = Get-Content -LiteralPath '.local/config.json' -Raw | ConvertFrom-Json
$candidate = Get-ChildItem -LiteralPath 'C:\Program Files\PostgreSQL' -Directory | Sort-Object { [int]$_.Name } -Descending | Select-Object -First 1
$pgBin = Join-Path $candidate.FullName 'bin'
$env:PGPASSWORD = [string]$config.password
try {
  $exists = & (Join-Path $pgBin 'psql.exe') -h 127.0.0.1 -p $config.port -U $config.user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'pos_ecommerce_test'"
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo consultar la base de pruebas.' }
  if (($exists -join '').Trim() -ne '1') {
    & (Join-Path $pgBin 'createdb.exe') -h 127.0.0.1 -p $config.port -U $config.user pos_ecommerce_test
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la base de pruebas.' }
  }
} finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
$previousDatabase = $env:DATABASE_URL
$previousTest = $env:TEST_DATABASE_URL
try {
  $env:TEST_DATABASE_URL = "postgresql://$($config.user):$($config.password)@127.0.0.1:$($config.port)/pos_ecommerce_test"
  $env:DATABASE_URL = $env:TEST_DATABASE_URL
  if ($EngineFallback) { & (Join-Path $PSScriptRoot 'migrate-local.ps1') -DatabaseUrl $env:TEST_DATABASE_URL }
  else { & npm.cmd run db:deploy; if ($LASTEXITCODE -ne 0) { throw 'Falló la migración de pruebas.' } }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación.' }
  # EJECUCIÓN: el mismo proceso evita restricciones de procesos hijos.
  & node test/e2e.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Las pruebas fallaron.' }
} finally { $env:DATABASE_URL = $previousDatabase; $env:TEST_DATABASE_URL = $previousTest }
