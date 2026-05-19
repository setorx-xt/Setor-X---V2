@echo off
title Gerar EXE - Setor X
echo =========================================
echo  SETOR X - GERADOR DE .EXE WINDOWS
echo =========================================
echo.
echo Este script cria o programa desktop do Setor X usando Electron.
echo Requisitos: Node.js instalado no Windows.
echo.

copy /Y package.desktop.json package.json > nul

echo Instalando dependencias...
call npm install

echo.
echo Gerando .EXE portable...
call npm run dist:win

echo.
echo Pronto. Veja a pasta dist.
pause