rd /s /q ../dist
pyarmor obfuscate server.py --advanced 4 --with-license outer -O ../dist/
pyarmor obfuscate licence_check.py --advanced 4 --with-license outer -O ../dist