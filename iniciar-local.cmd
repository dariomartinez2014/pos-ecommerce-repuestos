@echo off
REM INICIO WINDOWS: prepara el proyecto y mantiene visible la consola del servidor.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-local.ps1" -Preparar
pause
