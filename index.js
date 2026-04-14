const { MongoClient, ServerApiVersion } = require('mongodb')
const ErrorHandler = require('./utils/ErrorHandler')
const sanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const express = require('express')
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
console.log(isDev ? '🧪 Development' : '🌐 Production', 'Env')

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
const MONGO_OPTIONS = {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  serverSelectionTimeoutMS: 8000,   // give up selecting a server after 8s
  connectTimeoutMS: 10000,          // TCP connect timeout
  socketTimeoutMS: 45000,           // how long a socket can be idle
}

let dbConnected = false

async function connectWithRetry(uri, maxAttempts = 2, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = new MongoClient(uri, MONGO_OPTIONS)
      await client.connect()
      await client.close()
      return true
    } catch (err) {
      console.error(`❌ MongoDB attempt ${attempt}/${maxAttempts}: ${err.message}`)
      if (attempt < maxAttempts) {
        console.log(`⏳ Retrying in ${delayMs / 1000}s…`)
        await new Promise((res) => setTimeout(res, delayMs))
      }
    }
  }
  return false
}

async function initDatabase() {
  // Build the candidate URI list.  Always try the server/cloud URI first so that
  // both dev and prod behave the same; fall back to a local URI in dev if provided.
  const candidates = []
  if (process.env.SERVER_MONGO_CONNECT_URI) candidates.push(process.env.SERVER_MONGO_CONNECT_URI)
  if (isDev && process.env.LOCAL_MONGO_CONNECT_URI) candidates.push(process.env.LOCAL_MONGO_CONNECT_URI)

  if (!candidates.length) {
    console.error('❌ No MongoDB URI found in .env — set SERVER_MONGO_CONNECT_URI or LOCAL_MONGO_CONNECT_URI')
    return false
  }

  for (const uri of candidates) {
    console.log(`🔄 Connecting to MongoDB: ${uri.slice(0, 20)}…`)
    const ok = await connectWithRetry(uri)
    if (ok) {
      // Expose the working URI so Mongoose models can pick it up at require-time
      process.env.MONGO_CONNECT_URI = uri
      dbConnected = true
      console.log(`📊 MongoDB Connected (${uri.slice(0, 20)}…)`)
      return true
    }
  }

  console.error('❌ All MongoDB connection attempts failed — server will start without a database.')
  return false
}

// ---------------------  DIVIDER  routes  ----------------------------------------------
function initRoutes() {
  app.get('/health', (_req, res) =>
    res.status(200).json({ status: 'ok', db: dbConnected ? 'connected' : 'disconnected', env: isDev ? 'development' : 'production' })
  )

  app.all('/', (_req, res) =>
    res.status(200).json({ message: 'Server Works', db: dbConnected ? 'connected' : 'disconnected' })
  )

  app.use('/auth', require('./modules/auth/auth-routes'))
  app.use('/ella-vibes', require('./modules/ella-vibes/market-routes'))
  app.use('/fba-automation', require('./modules/fba-automation/index'))
  // app.use('/markdown/v3', require('./modules/markdown/markdown-routes-v3'))
  // app.use('/markdown-fronend', require('./modules/markdown/markdown-frontend'))
  app.use('/ai', require('./modules/ai/index'))
  app.use('/newsletter', require('./modules/newsletter/newsletter-router'))
  app.use('/dawar-sah', require('./modules/dawar-sah/dawar-sah-routes'))

  app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))
}

// ---------------------  DIVIDER  graceful shutdown  -----------------------------------
let server

function gracefulShutdown(signal) {
  console.log(`\n📴 ${signal} — shutting down gracefully…`)
  server.close(() => {
    console.log('✅ HTTP server closed')
    process.exit(0)
  })
  // Force-kill if close takes too long (e.g. hanging keep-alive connections)
  setTimeout(() => {
    console.error('⚠️  Graceful shutdown timed out — forcing exit')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// ---------------------  DIVIDER  main  ------------------------------------------------
const isVercel = !!process.env.VERCEL

if (isVercel) {
  // Serverless (Vercel): initialize DB + routes once, then export the app as the handler.
  // app.listen() must NOT be called — Vercel manages the HTTP layer.
  const initPromise = initDatabase().then(initRoutes)

  // Wrap the app so that the first request waits for initialization to finish.
  const handler = async (req, res) => {
    await initPromise
    app(req, res)
  }

  module.exports = handler
} else {
  // Traditional long-running server (local / VPS / PM2).
  async function main() {
    await initDatabase()
    initRoutes()

    if (isDev) {
      try {
        const startNotification = require('./modules/dev/notification')
        startNotification()
      } catch (e) {
        console.warn('⚠️  Notification init failed:', e.message)
      }
    }

    const PORT = Number(process.env.PORT) || 5000
    server = app.listen(PORT, () => {
      console.log(`🚀 Server Started (on port ${PORT})`)
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use — exiting`)
        process.exit(1)
      } else {
        console.error('❌ Server error:', err.message)
      }
    })
  }

  main().catch((err) => {
    console.error('❌ Fatal startup error:', err)
    process.exit(1)
  })
}
