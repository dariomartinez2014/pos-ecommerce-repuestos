# ADAPTADOR LOCAL: usa el mismo motor Prisma cuando el entorno restringe spawn de Node.
# El flujo habitual sigue siendo npm run db:deploy; este adaptador usa la versión del lockfile.
param([string]$DatabaseUrl = '')
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (!$DatabaseUrl) {
  $config = Get-Content -LiteralPath (Join-Path $projectRoot '.local/config.json') -Raw | ConvertFrom-Json
  $DatabaseUrl = "postgresql://$($config.user):$($config.password)@127.0.0.1:$($config.port)/$($config.database)"
}
$uri = [uri]$DatabaseUrl
if ($uri.Host -notin @('127.0.0.1', 'localhost')) { throw 'Este adaptador solo admite bases locales.' }
$migrationRoot = Join-Path $projectRoot 'prisma/migrations'
$directories = @(Get-ChildItem -LiteralPath $migrationRoot -Directory | Sort-Object Name | ForEach-Object {
  @{ path=$_.Name; migrationFile=@{ path='migration.sql'; content=@{ tag='ok'; value=[IO.File]::ReadAllText((Join-Path $_.FullName 'migration.sql')) } } }
})
$list = @{ baseDir=$migrationRoot; lockfile=@{ path='migration_lock.toml'; content=[IO.File]::ReadAllText((Join-Path $migrationRoot 'migration_lock.toml')) }; migrationDirectories=$directories; shadowDbInitScript='' }
$rpc = @{ id=1; jsonrpc='2.0'; method='applyMigrations'; params=@{ migrationsList=$list; filters=@{ externalTables=@(); externalEnums=@() } } } | ConvertTo-Json -Depth 15 -Compress
$source = @{url=$DatabaseUrl} | ConvertTo-Json -Compress
# HISTORIAL: el motor ejecuta SQL y registra checksums en _prisma_migrations.
# COMUNICACIÓN: mantener stdin abierto hasta la respuesta evita cortar una migración en curso.
$engineInfo = [Diagnostics.ProcessStartInfo]::new()
$engineInfo.FileName = Join-Path $projectRoot 'node_modules/@prisma/engines/schema-engine-windows.exe'
$engineInfo.Arguments = '--datamodels "' + (Join-Path $projectRoot 'prisma/schema.prisma') + '" --datasource "' + $source.Replace('"', '\"') + '"'
$engineInfo.UseShellExecute = $false
$engineInfo.CreateNoWindow = $true

$engineInfo.StandardOutputEncoding = [Text.UTF8Encoding]::new($false)
$engineInfo.RedirectStandardInput = $true
$engineInfo.RedirectStandardOutput = $true
$engineInfo.RedirectStandardError = $true
$engine = [Diagnostics.Process]::new()
$engine.StartInfo = $engineInfo
try {
  [void]$engine.Start()
  $inputWriter = [IO.StreamWriter]::new($engine.StandardInput.BaseStream, [Text.UTF8Encoding]::new($false))
  $inputWriter.AutoFlush = $true
  $stderrTask = $engine.StandardError.ReadToEndAsync()
  $inputWriter.WriteLine($rpc)
  $response = $null
  while (!$response) {
    $lineTask = $engine.StandardOutput.ReadLineAsync()
    if (!$lineTask.Wait(30000)) { throw 'El motor tardó más de lo previsto.' }
    $line = $lineTask.Result
    if (!$line) { throw ('El motor terminó antes de responder: ' + ($stderrTask.Result.Replace($DatabaseUrl, '<URL local>'))) }
    $message = $line | ConvertFrom-Json
    if ($message.method) {
      # El motor puede solicitar impresión de progreso; confirmar su callback.
      if ($null -ne $message.id) { $inputWriter.WriteLine((@{jsonrpc='2.0';id=$message.id;result=@{}} | ConvertTo-Json -Compress)) }
    } elseif ($message.id -eq 1) { $response = $message }
  }
  if ($response.error) { throw ('Migración rechazada: ' + ($response.error.data.message.Replace($DatabaseUrl, '<URL local>'))) }
  Write-Host ('Migraciones aplicadas: ' + ($response.result.appliedMigrationNames -join ', '))
} finally {
  if ($engine.Id) {
    if ($inputWriter) { $inputWriter.Close() }
    if (!$engine.WaitForExit(3000)) { $engine.Kill() }
    $engine.Dispose()
  }
}
