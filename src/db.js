// this file connects to the remote prisma DB and
// gives us the ability to query it with JS

// import prisma from prisma-binding
const { Prisma } = require('prisma-binding');

// create and instance of the db, using env variables
const db = new Prisma({
  // typeDefs is the graphql types
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: false,
});

module.exports = db;
