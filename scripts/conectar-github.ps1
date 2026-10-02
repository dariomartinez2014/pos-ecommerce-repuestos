# ARCHIVO: Vincula el historial local al remoto desde la consola del usuario, conservando los archivos de trabajo.
# ESTUDIO: pasos y bloques explicados en docs/GUIA-CODIGO-COMPLETA.md.
# SINCRONIZACIÓN: ejecuta este archivo en tu propia consola para conectar el historial local.
# La subida inicial se realizó por la API de GitHub; este entorno protege la carpeta .git.
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $projectRoot
& git fetch origin main
if ($LASTEXITCODE -ne 0) { throw 'No se pudo obtener el historial de GitHub. Completa la autenticación de Git si se solicita.' }
& git rev-parse --verify HEAD 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  # MIXED: crea la referencia y el índice; conserva todos los archivos del directorio de trabajo.
  & git reset --mixed FETCH_HEAD
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo conectar el historial local.' }
  & git branch --set-upstream-to=origin/main main
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar la rama de seguimiento.' }
} else { Write-Host 'El historial local ya contiene commits. Revisa git status antes de integrar otros cambios.' }
& git status --short
