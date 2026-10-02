# ARCHIVO: Inicializa, inicia o detiene únicamente el clúster PostgreSQL propio del proyecto.
# ESTUDIO: pasos y bloques explicados en docs/GUIA-CODIGO-COMPLETA.md.
# POSTGRESQL LOCAL: administra únicamente el clúster de este proyecto, en .local/postgres.
param([ValidateSet('Start', 'Stop')][string]$Action = 'Start', [string]$PgBin = '')
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$localDir = Join-Path $projectRoot '.local'
$dataDir = Join-Path $localDir 'postgres'
if (!$PgBin) {
  $candidate = Get-ChildItem -LiteralPath 'C:\Program Files\PostgreSQL' -Directory -ErrorAction SilentlyContinue | Sort-Object { [int]$_.Name } -Descending | Select-Object -First 1
  if ($candidate) { $PgBin = Join-Path $candidate.FullName 'bin' }
}
if (!(Test-Path -LiteralPath (Join-Path $PgBin 'postgres.exe'))) { throw 'Instala PostgreSQL o indica -PgBin con su carpeta bin.' }
if (!(Test-Path -LiteralPath (Join-Path $localDir 'config.json'))) { throw 'Ejecuta primero node scripts/configure-local.cjs.' }
$config = Get-Content -LiteralPath (Join-Path $localDir 'config.json') -Raw | ConvertFrom-Json
$port = [int]$config.port
if ($Action -eq 'Stop') {
  # PARADA ORDENADA: pg_ctl recibe el directorio exacto del clúster propio.
  if (Test-Path -LiteralPath (Join-Path $dataDir 'postmaster.pid')) {
    & (Join-Path $PgBin 'pg_ctl.exe') -D $dataDir -m fast -w stop
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo detener PostgreSQL local.' }
  }
  return
}
if (!(Test-Path -LiteralPath (Join-Path $dataDir 'PG_VERSION'))) {
  $passwordFile = Join-Path $localDir 'init-password.tmp'
  [IO.File]::WriteAllText($passwordFile, [string]$config.password)
  try {
    # AUTENTICACIÓN: SCRAM con clave aleatoria y conexión limitada a loopback.
    & (Join-Path $PgBin 'initdb.exe') -D $dataDir -U $config.user -A scram-sha-256 --encoding=UTF8 --locale=C "--pwfile=$passwordFile"
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo inicializar el clúster local.' }
  } finally { Remove-Item -LiteralPath $passwordFile -ErrorAction SilentlyContinue }
}
$env:PGPASSWORD = [string]$config.password
try {
  $running = $false
  if (Test-Path -LiteralPath (Join-Path $dataDir 'postmaster.pid')) {
    $pidLines = Get-Content -LiteralPath (Join-Path $dataDir 'postmaster.pid')
    $ownProcess = Get-Process -Id ([int]$pidLines[0]) -ErrorAction SilentlyContinue
    $running = !!$ownProcess -and $ownProcess.ProcessName -eq 'postgres'
  }
  if (!$running) {
    & (Join-Path $PgBin 'pg_isready.exe') -h 127.0.0.1 -p $port *> $null
    if ($LASTEXITCODE -eq 0) { throw "El puerto $port está ocupado por otro clúster. No se modificará esa base." }
    # SEGUNDO PLANO: ventana oculta; las rutas de log permanecen dentro del proyecto.
    $process = Start-Process -FilePath (Join-Path $PgBin 'postgres.exe') -ArgumentList @('-D', ('"' + $dataDir + '"'), '-p', $port, '-h', '127.0.0.1') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $localDir 'postgres-out.log') -RedirectStandardError (Join-Path $localDir 'postgres-error.log') -PassThru
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
      & (Join-Path $PgBin 'pg_isready.exe') -h 127.0.0.1 -p $port *> $null
      if ($LASTEXITCODE -eq 0) { break }
      Start-Sleep -Milliseconds 300
    }
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL no inició. Revisa .local/postgres-error.log.' }
  }
  # COMPROBACIÓN: autenticar verifica que se trata de nuestro clúster.
  $exists = & (Join-Path $PgBin 'psql.exe') -h 127.0.0.1 -p $port -U $config.user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'pos_ecommerce'"
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo autenticar en PostgreSQL local.' }
  if (($exists -join '').Trim() -ne '1') {
    & (Join-Path $PgBin 'createdb.exe') -h 127.0.0.1 -p $port -U $config.user pos_ecommerce
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la base del proyecto.' }
  }
  Write-Host "PostgreSQL del proyecto disponible en 127.0.0.1:$port."
} finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
