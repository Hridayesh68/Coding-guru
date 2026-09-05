@echo off
REM ==========================================
REM Coding Guru Docker Hub Push Script
REM ==========================================

set /p DOCKER_USER="Enter your Docker Hub Username: "
if "%DOCKER_USER%"=="" (
    echo Error: Docker Hub username cannot be empty.
    exit /b 1
)

set IMAGE_TAG=%DOCKER_USER%/coding-guru:latest

echo.
echo [1/3] Building unified production container...
docker build -t %IMAGE_TAG% .
if errorlevel 1 (
    echo Docker build failed.
    exit /b 1
)

echo.
echo [2/3] Authenticating with Docker Hub...
docker login
if errorlevel 1 (
    echo Docker login failed.
    exit /b 1
)

echo.
echo [3/3] Pushing image to Docker Hub (%IMAGE_TAG%)...
docker push %IMAGE_TAG%
if errorlevel 1 (
    echo Docker push failed.
    exit /b 1
)

echo.
echo ========================================================
echo SUCCESS! Your image is live on Docker Hub: %IMAGE_TAG%
echo Anyone can now run it on any OS with a single command:
echo.
echo   docker run -d -p 5000:5000 %IMAGE_TAG%
echo ========================================================
