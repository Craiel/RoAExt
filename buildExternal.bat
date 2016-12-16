@echo off

echo.
echo -----------------------
echo Building
echo.

"Build\Release\CrystalBuild.JS.exe" -p buildConfigExternal.json -c

call makeScript.bat RoAExt_raw.js