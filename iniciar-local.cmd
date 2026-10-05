REM Lanzador Windows que ejecuta el preparador PowerShell y mantiene visible la consola.

@echo off
REM prepara el proyecto y mantiene visible la consola del servidor.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-local.ps1" -Preparar
pause
