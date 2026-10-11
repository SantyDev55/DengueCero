@echo off
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 goto no_python
start "Servidor local DengueCero" /D "%~dp0" py -m http.server 8000
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8000/index.html
echo.
echo DengueCero se esta ejecutando. Para apagar el servidor, cierra la ventana "Servidor local DengueCero".
pause
exit /b
:no_python
echo No se encontro Python en este equipo.
echo Alternativa: abre la carpeta en Visual Studio Code y usa la extension Live Server.
pause
