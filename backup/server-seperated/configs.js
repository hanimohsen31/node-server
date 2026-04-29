// const { MongoClient, ServerApiVersion } = require('mongodb');
// const ErrorHandler = require('./middlewares/ErrorHandler')
// const mongoose = require('mongoose')
const sanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const express = require('express')
const helmet = require('helmet')
const xss = require('xss-clean')
const morgan = require('morgan')
const dotenv = require('dotenv')
const compression = require('compression');
const cors = require('cors')
const hpp = require('hpp')
dotenv.config({ path: './.env' }) // environment variables

// ---------------------  DIVIDER  restarting app ---------------------------------------
process.on('uncaughtException', (err) => {
    console.log('uncaughtException error', err)
    process.exit(1)
})

process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection:', err)
    process.exit(1)
})

// ---------------------  DIVIDER  set NODE_ENV ---------------------------------------------
/*
 * run each time after windows installation this command
 * set NODE_ENV=production
 * or Linux / macOS
 * NODE_ENV=production node app.js
 */
const isDev = process.env.NODE_ENV !== 'production'
console.log(isDev ? "🧪 Development" : "🌐 Production", "Env");

// ---------------------  DIVIDER  adding app -------------------------------------------
// app create
const app = express()
// middleware
app.use(cors({ origin: '*' })) // allow cors
app.use(express.json({ limit: '3mb' })) // body parser and limit req body to 10 kb
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(sanitize()) // noSql injections security
app.use(xss()) // clean html data security
app.use(hpp({ whitelist: ['duration'] })) // prevent parameter pollution (clear dublicated params fileds)
app.use(morgan('dev')) // morgan dev lgos in terminal
app.use(express.static(`${__dirname}/public`)) // serving static path
app.use(express.static(`${__dirname}/dev-assets`)) // serving static path
app.use(express.static(`${__dirname}/client/dist/client-markdown/browser`));
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requsets limit exceeded for this ip' })) // 100 request per hour
app.use(compression());
if (isDev) { app.use(helmet({ contentSecurityPolicy: false })); }
else { app.use(helmet()) }

// ---------------------  DIVIDER  routes ---------------------------------------------
module.exports = { app ,isDev}