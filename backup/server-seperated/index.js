const startNotification = require('./modules/dev/notification')
const ErrorHandler = require('./middlewares/ErrorHandler')
const { app, isDev } = require('./configs')
const { startDatabase } = require('./database')

// ---------------------  DIVIDER  routes ---------------------------------------------
function initRoutes() {
  app.all('/', (req, res) => res.status(200).json({ message: 'Server Works' }))
  app.use('/auth', require('./modules/auth/auth-routes'))
  app.use('/ella-vibes', require('./modules/ella-vibes/market-routes'))
  app.use('/fba-automation', require('./modules/fba-automation/index'))
  app.use('/markdown/v3', require('./modules/markdown/markdown-routes-v3'))
  app.use('/markdown-fronend', require('./modules/markdown/markdown-frontend'))
  app.use('/ai', require('./modules/ai/index'))
  app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))
}

async function startServer() {
  await startDatabase()
  app.listen(process.env.PORT || 5000, () => {
    initRoutes()
    if (isDev) startNotification()
    console.log(`🚀 Server Started`)
  });
}

startServer()