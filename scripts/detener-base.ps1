# ARCHIVO: Solicita detener PostgreSQL local de forma ordenada.
# ESTUDIO: pasos y bloques explicados en docs/GUIA-CODIGO-COMPLETA.md.
# PARADA: detiene únicamente PostgreSQL de este proyecto; la API se detiene con Ctrl+C.
& (Join-Path $PSScriptRoot 'local-db.ps1') -Action Stop
