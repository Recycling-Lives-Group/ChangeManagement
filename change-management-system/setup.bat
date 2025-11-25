@echo off
echo Setting up Change Management System...
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

echo.
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo.
echo Building shared types...
cd shared\types
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build shared types
    exit /b 1
)

cd ..\..

echo.
echo Setting up environment files...

:: Backend .env
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo [OK] Created backend\.env (please update with your settings^)
) else (
    echo [OK] backend\.env already exists
)

:: Frontend .env
if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo [OK] Created frontend\.env
) else (
    echo [OK] frontend\.env already exists
)

echo.
echo [SUCCESS] Setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your MongoDB URI and JWT secret
echo 2. Start MongoDB (if using local MongoDB^)
echo 3. Run the application: npm run dev
echo.
echo Read QUICKSTART.md for detailed instructions
