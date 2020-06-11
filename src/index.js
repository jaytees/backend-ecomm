// code to start up node server
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// Use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
// Use express middleware to populate current user
// decode the JWT so we can get user ID on each req
server.express.use((req, res, next) => {
  // get token
  const { token } = req.cookies;
  // decode token to get user id
  if (token) {
    const { userID } = jwt.verify(token, process.env.APP_SECRET);
    // put the userID onto the req for future requests to acess
    req.userID = userID;
  }
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`server is now running on port http://localhost:${deets.port}`);
  }
);
