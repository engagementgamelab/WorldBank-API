If you've not already installed homebrew, first you'll have to do that:
```ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"```

Once that is done, you will need to install MongoDB, if you don't already have it:
```brew install mongodb```

sudo mkdir -p /data/db

sudo chmod 0755 /data/db

Then you'll need to clone the WorldBank-API repo:

```git clone https://github.com/engagementgamelab/WorldBank-API.git```

Once that is done, go to the root folder of the repo, then:
```cd server```
```npm install```

Once that's all set, if you run:
```npm run-script debug```

The server should start, and if you go to http://localhost:3000/api/gameData you should see a ton of JSON content.

Please see docs (forthcoming) for details on all API endpoints and features.

---------

To start server in production:
```sudo NODE_ENV=production forever start -o out.log -e err.log -c "npm start" ./```