cd extra\server
rd /r /s dist
call build.bat
cd ..\..
npm run build
