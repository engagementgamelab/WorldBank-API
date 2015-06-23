COLOR='\033[1;35m'
NC='\033[0m' # No Color


printf "\n${COLOR}@@@@@@@@@@@@@@\nEngagement Lab World Bank API debug\n@@@@@@@@@@@@@@\n\nYou may also want to run (in seperate tabs):\n"
printf "\nforever start /usr/local/lib/node_modules/mongo-express/app.js\n"
printf "\n./node_modules/.bin/node-inspector --web-port=8080\n\n"
printf "DO NOT RUN THIS IN PRODUCTION!!\n\n${NC}"

sleep 3

node --debug ./node_modules/.bin/actionhero start

# 