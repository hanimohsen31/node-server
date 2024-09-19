const dotenv = require('dotenv')
dotenv.config({ path: './.env' }) // environment variables

const env = {
  MONGO_CONNECT_URI: process.env.MONGO_CONNECT_URI || 'mongodb+srv://hanimohsen3131:npccNFit7CD7eOea@cluster0.dsyn0.mongodb.net/',
  COLLECTION: process.env.COLLECTION || 'onix',
  JWT_KEY: process.env.JWT_KEY || 'onix-3810-this-may-be-the-secret-of-my-application',
  EXPIRATION: process.env.EXPIRATION || '30d',
}

module.exports = env
