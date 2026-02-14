const ErrorHandler = require('./utils/ErrorHandler')
const sanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const xss = require('xss-clean')
const morgan = require('morgan')
const dotenv = require('dotenv')
const compression = require('compression');
const cors = require('cors')
const hpp = require('hpp')
dotenv.config({ path: './.env' }) // environment variables
const notifier = require('node-notifier')
const { exec } = require('child_process')
const fs = require('fs')

// ---------------------  DIVIDER  restarting app ---------------------------------------
process.on('uncaughtException', (err) => {
  console.log('uncaughtException error', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection:', err)
  process.exit(1)
})

// ---------------------  DIVIDER  adding app -------------------------------------------
// app create
const app = express()
// middleware
app.use(helmet()) // set security http headers
app.use(cors({ origin: '*' })) // allow cors
app.use(express.json({ limit: '3mb' })) // body parser and limit req body to 10 kb
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(sanitize()) // noSql injections security
app.use(xss()) // clean html data security
app.use(hpp({ whitelist: ['duration'] })) // prevent parameter pollution (clear dublicated params fileds)
app.use(morgan('dev')) // morgan dev lgos in terminal
app.use(express.static(`${__dirname}/public`)) // serving static path
app.use(express.static(`${__dirname}/dev-assets`)) // serving static path
app.use(rateLimit({ max: 10000, windowMs: 60 * 60 * 1000, message: 'Requsets limit exceeded for this ip' })) // 100 request per hour
app.use(compression());

// ---------------------  DIVIDER  set NODE_ENV ---------------------------------------------
/*
 * run each time after windows installation this command
 * set NODE_ENV=production
 * or Linux / macOS
 * NODE_ENV=production node app.js
 */
const isDev = process.env.NODE_ENV !== 'production'
console.log(isDev ? "🧪 Development" : "🌐 Production", "Env");

// ---------------------  DIVIDER  database ---------------------------------------------
let DB = isDev ? process.env.LOCAL_MONGO_CONNECT_URI : process.env.SERVER_MONGO_CONNECT_URI
process.env.MONGO_CONNECT_URI = DB
mongoose.connect(DB, {}).then((con) => console.log('📊 Mongo Connected On:', DB))

// ---------------------  DIVIDER  routes -----------------------------------------------
app.all('/', (req, res, next) => next(res.status(200).json({ message: 'Server Works' })))
app.use('/auth', require('./modules/auth/auth-routes'))
app.use('/ella-vibes', require('./modules/ella-vibes/market-routes'))
app.use('/fba-automation', require('./modules/fba-automation/index'))
app.use('/markdown', require('./modules/markdown/markdown-routes'))
app.use('/dummy-data', require('./modules/learning/dummy-data'))
app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))

// ---------------------  DIVIDER  funcitons to run on start --------------------------------------
function openMarkdownServer() {
  // const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  // exec(`${start} ${process.env.LOCAL_PORT}/markdown`)
  console.log("📚 Start Markdown Viewer On:", `${process.env.LOCAL_PORT}/markdown`);
}

function startNotification() {
  let doaa = fs.readFileSync("./public/Doaa.json", "utf-8");
  doaa = JSON.parse(doaa);

  // flatten categories
  doaa = Object.entries(doaa).flatMap(([key, arr]) =>
    arr.map(item => ({ ...item, zikrCategory: key.replace(/_/g, " "), }))
  );

  const used = new Set();
  function getRandomDoaa() {
    if (used.size === doaa.length) used.clear();
    let i;
    do {
      i = Math.floor(Math.random() * doaa.length);
    } while (used.has(i));
    used.add(i);
    return doaa[i];
  }

  const defaultNotification = {
    title: "Hey Honey!",
    message: "Stand up, drink water, move a bit.",
    wait: false,
    sound: true
  };

  const triggerNotification = (minutes, getNotification, isRtl = false) => {
    setInterval(() => {
      let notification = typeof getNotification === "function" ? getNotification() : defaultNotification;
      // if (isRtl) notification = { ...notification, title: "\u200F" + notification.title, message: "\u200F" + notification.message };
      notifier.notify(notification);
    }, 60 * 1000 * minutes);
  };

  // Water reminder every 60 minutes
  triggerNotification(60);

  // Doaa reminder
  triggerNotification(
    10,
    () => {
      const randomDoaa = getRandomDoaa();
      return { title: randomDoaa?.zikrCategory || "Doaa", message: randomDoaa?.zikr, wait: true, sound: false };
    },
    true
  );
}

// ---------------------  DIVIDER  export app -------------------------------------------
// Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server Started`)
  /* 
   * By Default this will not work on vercil 
   * but just in case it is being hosted on any vbs server 
   */
  if (isDev) {
    openMarkdownServer()
    startNotification()
  }
})
