@echo off

SET OUT_FILE=final.js
SET OUT_FILE_LIGHT=final_light.js
SET OUT_DIR=Build
SET OUT_FILE_FULL=%OUT_DIR%\%OUT_FILE%
SET OUT_FILE_FULL_LIGHT=%OUT_DIR%\%OUT_FILE_LIGHT%

mkdir %OUT_DIR%
echo Building %OUT_FILE_FULL%

copy extension_header_light.js %OUT_FILE_FULL_LIGHT%
copy extension_header.js %OUT_FILE_FULL%
type src\* >> %OUT_FILE_FULL%
type extension.js >> %OUT_FILE_FULL%
type extension.js >> %OUT_FILE_FULL_LIGHT%
