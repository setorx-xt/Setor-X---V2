@echo off
setlocal
set APP=%~dp0index.html

where msedge >nul 2>nul
if %errorlevel%==0 (
  start "" msedge --app="file:///%APP%"
  exit /b
)

where chrome >nul 2>nul
if %errorlevel%==0 (
  start "" chrome --app="file:///%APP%"
  exit /b
)

start "" "%APP%"