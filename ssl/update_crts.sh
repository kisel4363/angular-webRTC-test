#!/bin/bash

cd ./ssl

mkcert $(ipconfig getifaddr en0)
rm -rf server.crt
rm -rf server.key
mv $(ipconfig getifaddr en0).pem server.crt
mv $(ipconfig getifaddr en0)-key.pem server.key

# cd ~/Documents/Yiies/yiies-socket/ssl
# rm -rf server.crt
# rm -rf server.key
# mkcert $(ipconfig getifaddr en0)
# mv $(ipconfig getifaddr en0).pem server.crt
# mv $(ipconfig getifaddr en0)-key.pem server.key

# cd ~/Documents/Yiies/yiies-api/ssl
# rm -rf server.crt
# rm -rf server.key
# mkcert $(ipconfig getifaddr en0)
# mv $(ipconfig getifaddr en0).pem server.crt
# mv $(ipconfig getifaddr en0)-key.pem server.key
