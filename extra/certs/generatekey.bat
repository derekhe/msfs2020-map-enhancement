mkcert -ecdsa -key-file key.pem -cert-file cert.pem kh.ssl.ak.tiles.virtualearth.net khstorelive.azureedge.net *.virtualearth.net *.azureedge.net
openssl x509 -outform der -in cert.pem -out cert.crt