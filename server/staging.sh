COLOR='\033[1;35m'
NC='\033[0m' # No Color

cp -R ../content .

printf "\n${COLOR}@@@@@@@@@@@@@@\nEngagement Lab World Bank API Staging Upload\n@@@@@@@@@@@@@@\n\n"

export NODE_ENV=staging
node ./node_modules/.bin/actionhero start