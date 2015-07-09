# World Bank API
# Created by Engagement Lab, 2015
# ==============
#  development.sh
#  Development server automation script

#  Created by Johnny Richardson on 7/9/15.
# ==============

printf "\n${COLOR}@@@@@@@@@@@@@@\nEngagement Lab API Dev Automation\n@@@@@@@@@@@@@@\n\n${NC}"

printf "\n>>>> Copying /content to server root for Heroku usage\n"

rm -rf server/content
cp -R content server

wait

printf "\n>>>> Adding content to server root for git push \n"

git add .