# World Bank API
# Created by Engagement Lab, 2015
# ==============
#  development.sh
#  Development server automation script

#  Created by Johnny Richardson on 7/9/15.
# ==============

printf "\n${COLOR}@@@@@@@@@@@@@@\nEngagement Lab API Dev Automation\n@@@@@@@@@@@@@@\n${NC}"

# See if /content and /server/content differ
CONTENT_DIFF=$(diff -qr  content server/content);

if [ "$CONTENT_DIFF" != "" ]
then
	printf "\n>>>> Copying /content to server root for Heroku usage\n";

	rm -rf server/content;
	cp -R content server;

	wait;

	printf "\n>>>> Adding content to server root for git push \n";

	git add .;
	git commit -m "Synced content to server root.";
else
	printf "\n>>>> /content and /server/content are the same \n";
fi