/* This is our configuration file. It's job is to setup variables and
   other information for our program (usually based on the environment).
   Since this is just another node.js file, we can use things like
   logic, if statements, etc here.
*/

/* In the past we have used process.env to set things like our port
   and database connections on Heroku. Heroku configures process.env
   based on the Config Vars section of it's website. We often want to
   use config vars like this to pull out our sensitive database
   connection strings from our code. If someone were to get their hands
   on our connection strings they could maliciously attack our database.
   Therefore it is ideal to not have them stored as plain text in our code.

   This is where the dotenv library comes in. Heroku is already setup
   to add to process.env when we run our node code there. We can use the
   dotenv library to set this up locally as well. The dotenv library will
   look for the .env file in our project, and load in the key-value pairs
   stored there into process.env.

   The standard Node gitignore intentionally ignores the .env file so that
   it is not tracked by git. Take a look at .gitignore now. The last line
   ignores .env, meaning it won't get sent to GitHub. This is intentional,
   as we will store our sensitive information in .env. It does mean that we
   will need to remake it on any machine that we are working on. However,
   it makes it far safer, especially if our code is public on GitHub.

   You'll notice that there is no .env file in this project. That is because
   it was ignored by git when this demo was made. Try creating a file called
   .env in the root of this project (near the package.json) and add the
   following content to it:

        NODE_ENV=development
        MONGODB_URI=mongodb://localhost/ConfigExample
        REDISCLOUD_URL= (note: put your redis connection string here)
        SECRET=My secret

   These will all be loaded into process.env by the following function
   call to the dotenv library. More on what each does below.
*/
require('dotenv').config();

/* Almost always when working on professional software, we make use of
   "environments". The most common of which are development and
   production. The idea is that "development" is the configuration used
   when we are working on the project, and "production" is the config
   we use when the program is actually running for clients to use.

   Below, we have an object of objects that maps our environment name
   to a static asset path. The reason these are objects is because we
   could theoretically store more information in them later.
*/
const staticAssets = {
  development: {
    path: 'clientDev/',
  },
  production: {
    path: 'client/',
  },
};

/* Similar to static assets above, we also want to have different
   connection information for our different environments. Below we see
   that each environment has http connection info, mongo connection
   info, and redis connection info. You'll also notice that for some
   of these we are pulling in information from our process.env variables
   that were setup by our .env file and the dotenv library.

   Again: it is important that we put sensitive information like these
   connection strings into our .env file and our Config Vars on Heroku
   so that they are not publically visible in our codebase on GitHub.
*/
const connections = {
  development: {
    http: {
      port: 3000,
    },
    mongo: process.env.MONGODB_URI || 'mongodb://localhost/ConfigExample',
    redis: process.env.REDISCLOUD_URL,
  },

  production: {
    http: {
      port: process.env.PORT || process.env.NODE_PORT || 3000,
    },
    mongo: process.env.MONGODB_URI,
    redis: process.env.REDISCLOUD_URL,
  },
};

/* Once we have setup the map objects above, we can simply export the ones
   relevant to our specific dev environment. In the case of our secret, it
   will always just be the one we are importing from our .env file.
*/
module.exports = {
  staticAssets: staticAssets[process.env.NODE_ENV],
  connections: connections[process.env.NODE_ENV],
  secret: process.env.SECRET,
};
