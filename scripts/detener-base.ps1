# Solicita detener PostgreSQL local de forma ordenada.

# detiene únicamente PostgreSQL de este proyecto; la API se detiene con Ctrl+C.
& (Join-Path $PSScriptRoot 'local-db.ps1') -Action Stop
