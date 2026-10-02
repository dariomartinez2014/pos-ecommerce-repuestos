REM ARCHIVO: Lanzador Windows que ejecuta el preparador PowerShell y mantiene visible la consola.
REM ESTUDIO: pasos y bloques explicados en docs/GUIA-CODIGO-COMPLETA.md.
@echo off
REM INICIO WINDOWS: prepara el proyecto y mantiene visible la consola del servidor.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-local.ps1" -Preparar
pause
