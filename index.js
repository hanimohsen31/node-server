// const { swaggerUi, swaggerSpec } = require('./modules/swagger/swagger')
const ErrorHandler = require('./utils/ErrorHandler')
const sanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const xss = require('xss-clean')
const morgan = require('morgan')
const dotenv = require('dotenv')
const cors = require('cors')
const hpp = require('hpp')
dotenv.config({ path: './.env' }) // environment variables
// ---------------------  DIVIDER  restarting app ---------------------------------------
process.on('uncaughtException', (err) => {
  console.log('uncaughtException error', err)
  process.exit(1)
})

// ---------------------  DIVIDER  adding app -------------------------------------------
// app create
const app = express()
// middleware
app.use(helmet()) // set security http headers
app.use(cors({ origin: '*' })) // allow cors
app.use(express.json({ limit: '3mb' })) // body parser and limit req body to 10 kb
app.use(sanitize()) // noSql injections security
app.use(xss()) // clean html data security
app.use(hpp({ whitelist: ['duration'] })) // prevent parameter pollution (clear dublicated params fileds)
app.use(morgan('dev')) // morgan dev lgos in terminal
app.use(express.static(`${__dirname}/public`)) // serving static path
app.use(express.static(`${__dirname}/dev-assets`)) // serving static path
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requsets limit exceeded for this ip' })) // 100 request per hour

// ---------------------  DIVIDER  database ---------------------------------------------
const DB = process.env.MONGO_CONNECT_URI
mongoose.connect(DB, {}).then((con) => console.log('Mongo Connected'))

// ---------------------  DIVIDER  routes -----------------------------------------------
app.use('/', require('./modules/root/root-controller'))
// app.use('/auth', require('./auth/auth-routes'))
app.use('/health-mate', require('./modules/health-mate/index'))
// app.use('/cypress', require('./modules/cypress/cypress-routes'))
app.use('/katana-summury', require('./modules/katana-summury/katana-summury-routes'))
app.use('/katana-tracker', require('./modules/katana-tracker/katana-tracker-routes'))
app.use('/market', require('./modules/market/market-routes'))

// ---------------------  DIVIDER  middleware -------------------------------------------
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
})
