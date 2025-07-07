const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const ErrorHandler = require('./utils/ErrorHandler')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const sanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const dotenv = require('dotenv')

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
// app.use(cors()) // allow cors
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin) // reflect the request origin
    },
    credentials: true,
  })
)
// app.use(express.json()) // body parser
app.use(express.json({ limit: '3mb' })) // body parser and limit req body to 10 kb
app.use(sanitize()) // noSql injections security
app.use(xss()) // clean html data security
app.use(hpp({ whitelist: ['duration'] })) // prevent parameter pollution (clear dublicated params fileds)
app.use(morgan('dev')) // morgan dev lgos in terminal
app.use(express.static(`${__dirname}/public`)) // serving static path
app.use(express.static(`${__dirname}/dev-assets`)) // serving static path
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requsets limit exceeded for this ip' })) // 100 request per hour

// ---------------------  DIVIDER  database ---------------------------------------------
const DB = process.env.MONGO_CONNECT_URI + process.env.COLLECTION
mongoose.connect(DB, {}).then((con) => console.log('Mongo Connected'))

// ---------------------  DIVIDER  routes -----------------------------------------------
app.use('/', require('./controllers/root-controller'))
app.use('/first', require('./controllers/first-controller'))
app.use('/html-view', require('./controllers/html-view-controller'))
app.use('/tours', require('./controllers/tours-controller'))
app.use('/auth', require('./controllers/auth-controller'))
// app.use('/general', require('./controllers/general-controller'))
app.use('/market', require('./controllers/market-controller'))
app.use('/images', require('./controllers/images-controller'))
app.use('/images-assets', require('./controllers/images-assets-controller'))
app.use('/blogging', require('./controllers/blogging-controller'))
app.use('/scrapper', require('./controllers/scrapper-controller'))
app.use('/serpapi', require('./controllers/serpapi-controller'))
app.use('/aliexpress', require('./controllers/aliexpress-controller'))
app.use('/sabry-server', require('./controllers/sabry-server-controller'))
app.use('/dummy-users', require('./controllers/dummy-users-controller'))
app.use('/gym-app/api/v1', require('./controllers/gym-app-controller'))
app.use('/tunneling', require('./controllers/tunneling-controller'))

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
