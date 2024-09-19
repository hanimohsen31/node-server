const dotenv = require('dotenv')
dotenv.config({ path: './.env' }) // environment variables

const env = {
  MONGO_CONNECT_URI: process.env.MONGO_CONNECT_URI,
  COLLECTION: process.env.COLLECTION,
  JWT_KEY: process.env.JWT_KEY,
  EXPIRATION: process.env.EXPIRATION,
}

module.exports = env
