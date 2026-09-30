# INICIO: configura secretos, enciende PostgreSQL y ejecuta la API en esta consola.
param([switch]$Preparar, [switch]$EngineFallback)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $projectRoot
& node (Join-Path $PSScriptRoot 'configure-local.cjs')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar el entorno local.' }
& (Join-Path $PSScriptRoot 'local-db.ps1') -Action Start
if (!(Test-Path -LiteralPath 'node_modules')) {
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias.' }
  $Preparar = $true
}
if ($Preparar -or !(Test-Path -LiteralPath 'dist/main.js')) {
  & npm.cmd run prisma:generate
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el cliente Prisma.' }
  if ($EngineFallback) { & (Join-Path $PSScriptRoot 'migrate-local.ps1') }
  else {
    & npm.cmd run db:deploy
    if ($LASTEXITCODE -ne 0) { throw 'No se pudieron aplicar migraciones. Si el entorno informa spawn EPERM, usa -EngineFallback.' }
  }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'La compilación falló.' }
  & npm.cmd run db:seed
  if ($LASTEXITCODE -ne 0) { throw 'No se pudieron cargar los datos de demostración.' }
}
Write-Host 'Accesos: .local/ACCESOS-DEMO.md. Swagger: http://localhost:3000/api/docs'
Write-Host 'Mantén esta ventana abierta. Ctrl+C detiene la API.'
& npm.cmd start
