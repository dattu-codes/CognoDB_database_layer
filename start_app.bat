@echo off
title NexusGraph — Starting Local App Server
echo ========================================================
echo   NexusGraph — Software Supply Chain Intelligence
echo   Starting local server at http://localhost:3000 ...
echo ========================================================
echo.

start "" "http://localhost:3000"
npm run dev
