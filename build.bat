cd extra\server
rm /r /s dist
call build.bat
cd ..\..
npm run build
