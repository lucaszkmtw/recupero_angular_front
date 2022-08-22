@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.15
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET DEPLOYMENT_SOURCE=%~dp0%\src
SET MANIFEST=%~dp0%..\manifest
IF NOT EXIST "%MANIFEST%" (
    mkdir "%MANIFEST%"
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%~dp0%..\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%MANIFEST%

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%MANIFEST%
  )
)

IF NOT DEFINED YARN_CMD (
  :: Install Yarn
  echo Installing Yarn
  call npm install yarn -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error
  SET YARN_CMD=%appdata%\npm\yarn.cmd
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------
:Deployment

echo Handling Basic Web Site deployment.

:: 1. Change directory
pushd %DEPLOYMENT_SOURCE%

:: 2. Install npm packages
call :ExecuteCmd "%YARN_CMD%" install
IF !ERRORLEVEL! NEQ 0 goto error

:: 4. Install bower packages
call :ExecuteCmd bower install --production
IF !ERRORLEVEL! NEQ 0 goto error

:: 5. Compile TypeScript
echo Transpiling TypeScript in %DEPLOYMENT_SOURCE%
call :ExecuteCmd %DEPLOYMENT_SOURCE%\node_modules\.bin\tsc.cmd -p "%DEPLOYMENT_SOURCE%"

:: 6. KuduSync
call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_SOURCE%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.ts;.bowerrc;bower.json;.sln;package.json;yarn.lock"
IF !ERRORLEVEL! NEQ 0 goto error

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.
