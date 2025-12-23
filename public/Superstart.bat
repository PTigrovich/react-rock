@echo off
setlocal enabledelayedexpansion

REM --- Настройка папки build ---
set "BUILD_DIR=%~dp0build"
if not exist "%BUILD_DIR%" (
    echo [Ошибка] Папка "%BUILD_DIR%" не найдена.
    pause
    exit /b 1
)
cd /d "%BUILD_DIR%" || (
    echo [Ошибка] Не удалось перейти в "%BUILD_DIR%".
    pause
    exit /b 1
)

REM --- Запуск сервера ---
start "Serve Server" cmd /k "serve -s -l 3001"
timeout /t 3 /nobreak >nul

REM --- Проверка браузеров ---
set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "EDGE_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" ^
        --disable-web-security ^
        --user-data-dir="%TEMP%\ChromeTempProfile" ^
        --autoplay-policy=no-user-gesture-required ^
        --app="http://localhost:3001/" ^
        --start-fullscreen ^
        --kiosk ^
        --disable-features=Translate,ContextMenuSearchWebFor,ImageSearch
) else if exist "%EDGE_PATH%" (
    reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v "TranslateEnabled" /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v "ContextMenuSearchEnabled" /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v "VisualSearchEnabled" /t REG_DWORD /d 0 /f >nul 2>&1

    start "" "%EDGE_PATH%" ^
        --kiosk "http://localhost:3001/" ^
        --edge-kiosk-type=fullscreen ^
        --no-first-run ^
        --disable-features=msEdgeSidebarV2,msHub,msWelcomePage,msTranslations,msContextMenuSearch,msVisualSearch ^
        --disable-component-update ^
        --disable-prompt-on-repost ^
        --kiosk-idle-timeout-minutes=0
) else (
    echo [Ошибка] Не найден ни Chrome, ни Edge.
    pause
    exit /b 1
)


REM --- Убиваем explorer.exe для чистого киоск-режима ---
echo Kill Explorer...
timeout /t 12 /nobreak >nul
taskkill /f /im explorer.exe >nul 2>&1

exit /b 0