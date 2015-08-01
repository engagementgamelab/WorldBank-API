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

printf "\n>>>> Merging master branch into staging working tree\n"

git remote add heroku git@heroku.com:engagementlab.git

git config user.name "jenkins@labs-egl-macserver"

printf "\n>>>> Setting NODE_ENV to staging and pushing to Heroku (pausing until push is done) \n"

heroku config:set NODE_ENV=staging

git subtree push --prefix server heroku master

wait

printf "\n****** DONE ******* \n"