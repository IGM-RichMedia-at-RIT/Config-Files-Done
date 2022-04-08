/* This demo focuses on the use of config files. A config file is simply
   one that handles configuring a project to run in a specific way. Often
   this means running for development or for production, etc. However, it
   can also be a simple abstraction that pulls our various hardcoded variables
   out of something like our app.js file and stores them somewhere more
   centralized.

   In this example, we have created a config.js in the src folder, where
   most of our configuration is done. In this file, there will be comments
   for places that we have made use of that config file.

   There is nothing new in router.js or controllers/index.js to look at.
*/
const config = require('./config.js');


const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');


/* A major part of why we want to use config files is to configure our
   database / external api connections. Usually when developing we will
   have these things point to one instance but then when we deploy to
   heroku we want them to point to a different instance. 
   
   You can see below that instead of creating dbURL from process.env.MONGODB_URI
   and defaulting to localhost, we are instead just using the mongo connection
   from our config file.
*/
mongoose.connect(config.connections.mongo, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

/* Similar to the mongoose connection above, we have moved our redis
   connection string into our config file. More about some additional
   security features is covered in the config.js file.
*/
const redisClient = redis.createClient({
  legacyMode: true,
  url: config.connections.redis,
});
redisClient.connect().catch(console.error);


// pull in our routes
const router = require('./router.js');
const app = express();

/* In this demo we have a folder called client, and a folder called clientDev.
   Both have their own versions of images for the final app. This is not
   uncommon. Oftentimes you want some very visible dev images to help with css
   layout, etc. But when in production (like on heroku) you want to use the
   actual images.

   By moving our paths into our config file, we can make our /assets urls
   point to the clientDev folder in development mode, and point to /client in
   our production mode.
*/
app.use('/assets', express.static(path.resolve(config.staticAssets.path)));

app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));

/* As a part of setting up our session, we have abstracted our secret into
   our config file. This is largely due to security benefits discussed in
   the config.js file.
*/
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: config.secret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));

app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

/* Similar to where we were statically hosting the /assets urls up above,
   we can also use this same technique for the favicon.
*/
app.use(favicon(path.resolve(`${config.staticAssets.path}/img/favicon.png`)));
app.use(cookieParser());

router(app);

/* Finally we can pull the port out and store it in our config information
   as well. Again this helps if we want to have different port numbers for
   per our environment.
*/
app.listen(config.connections.http.port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${config.connections.http.port}`);
});
