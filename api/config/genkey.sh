openssl genrsa -out imagex.key 2048
openssl rsa -in imagex.key -pubout > imagex.pub
