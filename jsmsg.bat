@echo off
cmd /c node %~dp0start.js %*
exit /b %ERRORLEVEL%