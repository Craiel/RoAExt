@echo off

SET OUT_FILE=final.js
SET OUT_FILE_MIN=final.min.js
SET OUT_DIR=Build
SET OUT_FILE_FULL=%OUT_DIR%\%OUT_FILE%
SET OUT_FILE_MIN_FULL=%OUT_DIR%\%OUT_FILE_MIN%

mkdir %OUT_DIR%
echo Building %OUT_FILE_FULL%

copy extension_header.js %OUT_FILE_FULL%
type src\core\* >> %OUT_FILE_FULL%
type src\* >> %OUT_FILE_FULL%
type src\automation\* >> %OUT_FILE_FULL%
type src\chart\* >> %OUT_FILE_FULL%
type src\chat\* >> %OUT_FILE_FULL%
type src\clan\* >> %OUT_FILE_FULL%
type src\dungeon\* >> %OUT_FILE_FULL%
type src\house\* >> %OUT_FILE_FULL%
type src\market\* >> %OUT_FILE_FULL%
type src\ui\* >> %OUT_FILE_FULL%
type extension.js >> %OUT_FILE_FULL%

copy extension_header.js %OUT_FILE_MIN_FULL%
uglifyjs %OUT_FILE_FULL% >> %OUT_FILE_MIN_FULL%