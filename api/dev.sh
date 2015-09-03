#DEBUG=imagex:* PORT=12020 nohup nodemon -i barn -i test -i ui ./bin/www > nohup_server.out &

pm2 delete imagex
pm2 start imagex.js --watch --ignore-watch="\.log$"

pm2 logs imagex
