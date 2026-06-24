@echo off
REM ==========================================
REM  PolicyAI Backend - Start Script
REM  Sets JAVA_HOME to JDK 21 and runs Maven
REM ==========================================

set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot
set M2_HOME=%~dp0.maven\apache-maven-3.9.9
set PATH=%JAVA_HOME%\bin;%M2_HOME%\bin;%PATH%

echo ============================================
echo  PolicyAI Backend
echo  Java: %JAVA_HOME%
echo ============================================
echo.

java --version
echo.

cd /d %~dp0

if "%1"=="build" (
    echo Building project...
    call mvn clean compile -DskipTests
) else if "%1"=="test" (
    echo Running tests...
    call mvn test
) else (
    echo Starting Spring Boot application...
    call mvn spring-boot:run -DskipTests
)
