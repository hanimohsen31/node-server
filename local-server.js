const ErrorHandler = require('./utils/ErrorHandler')
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
// console.log(isDev ? 'Development' : 'Production', 'Env')

// ---------------------  DIVIDER  process-level error guards  --------------------------
process.on('uncaughtException', (err) => {
  console.error('❌ uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})

// Do NOT exit on unhandledRejection — a MongoDB timeout should not crash the server.
// Mongoose manages its own reconnection logic internally.
process.on('unhandledRejection', (reason) => {
  const msg = reason?.message || String(reason)
  console.error('⚠️  unhandledRejection (non-fatal):', msg)
})

// ---------------------  DIVIDER  app setup  -------------------------------------------
const app = express()
// middleware
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '3mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(sanitize())
app.use(xss())
app.use(hpp({ whitelist: ['duration'] }))
app.use(morgan('dev'))
app.use(express.static(`${__dirname}/public`))
app.use(express.static(`${__dirname}/dev-assets`))
app.use(express.static(`${__dirname}/client/dist/client-markdown/browser`))
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requests limit exceeded for this IP' }))
app.use(compression())
if (isDev) app.use(helmet({ contentSecurityPolicy: false }))
else app.use(helmet())

// ---------------------  DIVIDER  database  --------------------------------------------
const DB = process.env.MONGO_CONNECT_URI
mongoose.connect(DB, {}).then((con) => console.log('Mongo Connected'))

// ---------------------  DIVIDER  routes  ----------------------------------------------
app.all('/', (req, res) => res.status(200).json({ message: 'Server Works' }))
app.use('/auth', require('./modules/auth/auth-routes'))
app.use('/ella-vibes', require('./modules/ella-vibes/market-routes'))
app.use('/carzzy', require('./modules/carzzy/carzzy-routes'))
app.use('/fba-automation', require('./modules/fba-automation/index'))
app.use('/ai', require('./modules/ai/index'))
app.use('/newsletter', require('./modules/newsletter/newsletter-router'))
app.use('/markdown/v3', require('./modules/markdown/markdown-routes-v3'))
app.use('/markdown-frontend', require('./modules/markdown/markdown-frontend'))
app.use('/car-report', require('./modules/car-report/car-report-routes'))
app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))

// ---------------------  DIVIDER  export app -------------------------------------------
// Start the server
// server : http://127.0.0.1:5000
let port = process.env.PORT || 5000
// let host = "127.0.0.1";
// // vercel
// host = "https://node-server-seven-gamma.vercel.app"
app.listen(port, () => {
  console.log(`Server Started`)
  console.log(`Client: http://127.0.0.1:5000/markdown-frontend`)
  console.log(`Car Report: http://127.0.0.1:5000/car-report`)
})
