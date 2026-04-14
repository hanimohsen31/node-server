import startNotification from './modules/dev/notification.js'
import { MongoClient, ServerApiVersion } from 'mongodb'
import ErrorHandler from './utils/ErrorHandler.js'
import sanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import xss from 'xss-clean'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'
import hpp from 'hpp'
import path from 'path'
import { fileURLToPath } from 'url'
// fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: './.env' })

// ---------------------  DIVIDER  restarting app ---------------------------------------
process.on('uncaughtException', (err) => {
  console.log('uncaughtException error', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection:', err)
  process.exit(1)
})

// ---------------------  DIVIDER  set NODE_ENV -----------------------------------------
/*
 * run each time after windows installation this command
 * set NODE_ENV=production
 * or Linux / macOS
 * NODE_ENV=production node app.js
 */
const isDev = process.env.NODE_ENV !== 'production'
console.log(isDev ? '🧪 Development' : '🌐 Production', 'Env')

// ---------------------  DIVIDER  adding app -------------------------------------------
// app create
const app = express()
// middleware
app.use(cors({ origin: '*' })) // allow cors
app.use(express.json({ limit: '3mb' })) // body parser and limit req body to 10 kb
app.use(express.urlencoded({ extended: true })) // parse form data
app.use(sanitize()) // noSql injections security
app.use(xss()) // clean html data security
app.use(hpp({ whitelist: ['duration'] })) // prevent parameter pollution (clear dublicated params fileds)
app.use(morgan('dev')) // morgan dev lgos in terminal
app.use(express.static(`${__dirname}/public`)) // serving static path
app.use(express.static(`${__dirname}/dev-assets`)) // serving static path
app.use(express.static(`${__dirname}/client/dist/client-markdown/browser`))
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requsets limit exceeded for this ip' })) // 100 request per hour
app.use(compression())
if (isDev) app.use(helmet({ contentSecurityPolicy: false }))
else app.use(helmet())

// ---------------------  DIVIDER  routes ---------------------------------------------
async function initDatabase() {
  let mongoURI = isDev ? process.env.LOCAL_MONGO_CONNECT_URI : process.env.SERVER_MONGO_CONNECT_URI
  mongoURI = process.env.SERVER_MONGO_CONNECT_URI
  try {
    const defaultClient = new MongoClient(mongoURI, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } })
    await defaultClient.connect()
    process.env.MONGO_CONNECT_URI = mongoURI
    console.log('📊 MongoDB Connected!', `${process.env.MONGO_CONNECT_URI.slice(0, 15)}...`)
  } catch (err) {
    if (isDev) {
      try {
        mongoURI = process.env.SERVER_MONGO_CONNECT_URI
        const serverClient = new MongoClient(mongoURI, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } })
        await serverClient.connect()
        process.env.MONGO_CONNECT_URI = mongoURI
        console.log('📊 MongoDB Connected!', `${process.env.MONGO_CONNECT_URI.slice(0, 15)}...`)
      } catch (err) {
        console.error('❌ Mongo Error:', err)
      }
    } else console.error('❌ Mongo Error:', err)
  }
}

async function initRoutes() {
  app.all('/', (req, res) => res.status(200).json({ message: 'Server Works' }))
  app.use('/auth', (await import('./modules/auth/auth-routes.js')).default)
  app.use('/ella-vibes', (await import('./modules/ella-vibes/market-routes.js')).default)
  app.use('/fba-automation', (await import('./modules/fba-automation/index.js')).default)
  app.use('/markdown/v3', (await import('./modules/markdown/markdown-routes-v3.js')).default)
  app.use('/markdown-fronend', (await import('./modules/markdown/markdown-frontend.js')).default)
  app.use('/ai', (await import('./modules/ai/index.js')).default)
  app.use('/newsletter', (await import('./modules/newsletter/newsletter-router.js')).default)
  app.use('/dawar-sah', (await import('./modules/dawar-sah/dawar-sah-routes.js')).default)
  app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))
}

// ---------------------  DIVIDER  Start Mongo -----------------------------------------
initDatabase()
initRoutes()
app.listen(process.env.PORT || 5000, () => {
  if (isDev) startNotification()
  console.log(`🚀 Server Started`)
})
