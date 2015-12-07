As specified in the API Tech Specification, the World Bank/Engagement Lab API, for use with any World Bank projects, is built on the rocket-fast and highly-scalable MEAN stack.
It also uses the excellent actionHero.js framework (http://www.actionherojs.com/) for accelerated development.

This guide assumes intermediate-to-advanced experience running Unix-based web servers, a modicum of experience with JavaScript, and familiarity with Node.
However, a brief guide to setting up a MEAN stack is provided below. You should be running this on a Unix box, ideally.

If you've not already installed homebrew, first you'll have to do that:

```ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"```

Once that is done, you will need to install MongoDB, if you don't already have it:

```brew install mongodb```

You may need to run:

```sudo mkdir -p /data/db```
```sudo chmod 0755 /data/db```

Now install node:

```brew install node```

Once finished, install redis and redis-cli:

```brew install redis```
```brew install redis-cli```

Unzip or clone the API repo.

Once that is done, go to the root folder of the repo, then:

```cd server```

Install the API:

```npm install```

Once that's all set, you can run the server in development mode (NEVER run in production):

```npm run-script debug```

The server should start, and if you go to http://localhost:3000/api/gameData you should see all client JSON content. This content is loaded from the /conent folder of the repo, where all YAML game content is defined. 

Please see the /docs folder for details on all API endpoints and features.

---------

To start server in production:

```sudo NODE_ENV=production /usr/lib/node_modules/forever start -o out.log -e err.log -c "npm start" ./```
It is possible you will also want to install the 'apiprod' service (provided) in production to enable server auto-start in case of downtime.

To run the Unlocking Health WebGL build:

After running Build -> Build WebGL in Unity, the 'Release', 'TemplateData', and 'index.html' items ought to be placed in /server/public/uh so that the client can be served the app. The link to this build will be http://<server url>/uh/.