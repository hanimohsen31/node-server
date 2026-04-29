const ErrorHandler = require('./middlewares/ErrorHandler')
const sanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const xss = require('xss-clean')
const morgan = require('morgan')
const dotenv = require('dotenv')
const cors = require('cors')
const hpp = require('hpp')
dotenv.config({ path: './.env' })

// ---------------------  DIVIDER  set NODE_ENV -----------------------------------------
/*
 * run each time after windows installation this command
 * set NODE_ENV=production
 * or Linux / macOS
 * NODE_ENV=production node app.js
 */
const isDev = process.env.NODE_ENV !== 'production'

// ---------------------  DIVIDER  restarting app ---------------------------------------
process.on('uncaughtException', (err) => {
  console.log('❌ uncaughtException error', err)
  console.error(err.stack)
  process.exit(1)
})

// Do NOT exit on unhandledRejection — a MongoDB timeout should not crash the server.
// Mongoose manages its own reconnection logic internally.
process.on('unhandledRejection', (reason) => {
  const msg = reason?.message || String(reason)
  console.error('⚠️  unhandledRejection (non-fatal):', msg)
})

// ---------------------  DIVIDER  adding app -------------------------------------------
// app create
const app = express()
// middleware
app.use(cors({ origin: '*' })) // allow cors
app.use(express.json({ limit: '3mb' })) // body parser and limit req body to 10 kb
app.use(sanitize()) // noSql injections security
app.use(xss()) // clean html data security
app.use(hpp({ whitelist: ['duration'] })) // prevent parameter pollution (clear dublicated params fileds)
app.use(morgan('dev')) // morgan dev lgos in terminal
app.use(compression())
app.use(express.static(`${__dirname}/public`)) // serving static path
app.use(express.static(`${__dirname}/client/dist/client-markdown/browser`))
app.use(express.static(`${__dirname}/client/car-report`))
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requsets limit exceeded for this ip' })) // 100 request per hour
if (isDev) app.use(helmet({ contentSecurityPolicy: false }))
else app.use(helmet()) // set security http headers

// ---------------------  DIVIDER  database ---------------------------------------------
const DB = process.env.MONGO_CONNECT_URI
mongoose
  .connect(DB, {})
  .then((con) => console.log('Mongo Connected'))
  .catch((err) => {
    mongoose.disconnect()
    mongoose.connect(DB, {}).then((con) => console.log('Mongo Connected in Try #2'))
  })

// ---------------------  DIVIDER  routes -----------------------------------------------
app.use('/', require('./modules/root/root-controller'))
app.use('/auth', require('./modules/auth/auth-routes'))
app.use('/ella-vibes', require('./modules/ella-vibes/market-routes'))
app.use('/carzzy', require('./modules/carzzy/carzzy-routes'))
if (isDev) {
  app.use('/ai', require('./modules/ai/index'))
  app.use('/markdown-frontend', require('./modules/markdown/markdown-frontend'))
  app.use('/markdown/v3', require('./modules/markdown/markdown-routes-v3'))
  // scrapping
  app.use('/car-report', require('./modules/car-report/car-report-routes'))
  app.use('/newsletter', require('./modules/newsletter/newsletter-router'))
  // app.use('/fba-automation', require('./modules/fba-automation/index'))
}
// ---------------------  DIVIDER  telegram bots ----------------------------------------
require('./modules/car-report/car-report-telegram').startCarReportTelegramBot()

// ---------------------  DIVIDER  middleware -------------------------------------------
app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))

// ---------------------  DIVIDER  export app -------------------------------------------
// Start the server
// server : http://127.0.0.1:5000
// vercel => host = "https://node-server-seven-gamma.vercel.app"
let port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server Started`)
  if (isDev) {
    console.log(`Client: http://127.0.0.1:5000/markdown-frontend`)
    console.log(`Car Report: http://127.0.0.1:5000/car-report`)
  }
})
