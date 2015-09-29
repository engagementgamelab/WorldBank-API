#!/bin/sh
#/etc/init.d/apiprod

export PATH=$PATH:/usr/bin
export NODE_PATH=$NODE_PATH:/usr/lib/node_modules
export NODE_ENV=production

case "$1" in
  start)
  exec forever --sourceDir=/srv/api/server -p /usr/lib/node_modules/forever/pidetcfiles -o out.log -e err.log -c "npm start"
  ;;
stop)
  exec forever stop --sourceDir=/srv/api/server -c "npm start"
  ;;
*)
  echo "Usage: /etc/init.d/apiprod {start|stop}"
  exit 1
  ;;
esac

exit 0