@echo off

echo.
echo -----------------------
echo Building
echo.

"Build\Release\CrystalBuild.JS.exe" -p buildConfigInternal.json -c

call makeScript.bat RoAExtInternal.js
call makeScript.bat RoAExtInternal_raw.js