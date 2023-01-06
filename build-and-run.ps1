npm run electron:build
cd 'dist_electron\win-unpacked'
$Env:ELECTRON_ENABLE_LOGGING=1
& '.\MSFS2020 Map Enhancement.exe'
cd ../..