@echo off

SET BINPATH=bin
SET OUTFILE=%BINPATH%\%1
SET TMPFILE=%BINPATH%\_tmp.js

copy %OUTFILE% %TMPFILE%
copy extension_descriptor.js %OUTFILE%
type %TMPFILE% >> %OUTFILE%
del %TMPFILE%