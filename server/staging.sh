# World Bank API
# Created by Engagement Lab, 2015
# ==============
#  staging.sh
#  Staging server upload script

#  Created by Johnny Richardson on 7/1/15.
# ==============


COLOR='\033[1;35m'
NC='\033[0m' # No Color

printf "\n${COLOR}@@@@@@@@@@@@@@\nEngagement Lab API Staging Upload\n@@@@@@@@@@@@@@\n\n${NC}"

printf "\n>>>> Switching to staging branch\n"

git checkout staging

printf "\n>>>> Merging master branch into staging working tree\n"

git rebase master

printf "\n>>>> Copying /content to server root for Heroku\n"

cp -R content server

printf "\n>>>> Adding content changes and committing to branch from master head $(git rev-parse HEAD) \n"

git add .
git commit -m "Made staging commit from master head ($(git rev-parse HEAD))"

printf "\n>>>> Setting NODE_ENV to staging and pushing to Heroku \n"

heroku config:set NODE_ENV=staging

git subtree push --prefix server heroku master

printf "\n****** DONE ******* \n"