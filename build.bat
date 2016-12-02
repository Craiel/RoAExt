@echo off

SET OUT_FILE=final.js
SET OUT_DIR=Build
SET OUT_FILE_FULL=%OUT_DIR%\%OUT_FILE%

mkdir %OUT_DIR%
echo Building %OUT_FILE_FULL%

copy extension_header.js %OUT_FILE_FULL%
type src\* >> %OUT_FILE_FULL%
type extension.js >> %OUT_FILE_FULL%
