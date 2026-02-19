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

// ---------------------  DIVIDER  set NODE_ENV ---------------------------------------------
/*
 * run each time after windows installation this command
 * set NODE_ENV=production
 * or Linux / macOS
 * NODE_ENV=production node app.js
 */
const isDev = process.env.NODE_ENV !== 'production'
console.log(isDev ? "🧪 Development" : "🌐 Production", "Env");

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
if (isDev) {
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "'unsafe-inline'",
        ],
        scriptSrcAttr: ["'unsafe-inline'"],

        styleSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
          "'unsafe-inline'",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        connectSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:"
        ],
        objectSrc: ["'none'"]
      }
    })
  );
} else {
  app.use(helmet()) // set security http headers
}

// ---------------------  DIVIDER  database ---------------------------------------------
async function connectWithRetry(uri, retries = 3, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(uri, {});
      process.env.MONGO_CONNECT_URI = uri
      console.log("📊 Mongo Connected On:", uri);
      return true;
    } catch (err) {
      console.error(`❌ Mongo connect failed (${i}/${retries})`);
      if (i === retries) return false;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function initDatabase() {
  if (isDev) {
    try {
      await new Promise(resolve => {
        exec('net start MongoDB', (err, stdout) => {
          if (err) {
            console.log('MongoDB service may already be running or not installed.');
            return resolve();
          }
          console.log('stdout', stdout);
          setTimeout(resolve, 3000); // allow DB to fully boot
        });
      });
    } catch {
      console.log("Error in startMongoWindows");
    }
    const isLocalOk = await connectWithRetry(process.env.LOCAL_MONGO_CONNECT_URI);
    if (!isLocalOk && process.env.SERVER_MONGO_CONNECT_URI) {
      console.log("⚠️ Falling back to server Mongo...");
      const serverOk = await connectWithRetry(process.env.SERVER_MONGO_CONNECT_URI, 2);
      if (!serverOk) {
        console.error("💀 Could not connect to any Mongo instance.");
        process.exit(1);
      }
    }
  } else {
    const ok = await connectWithRetry(process.env.SERVER_MONGO_CONNECT_URI, 2);
    if (!ok) {
      console.error("💀 Production DB connection failed.");
      process.exit(1);
    }
  }
}

// ---------------------  DIVIDER  routes -----------------------------------------------
function applyRoutes() {
  app.all('/', (req, res, next) => next(res.status(200).json({ message: 'Server Works' })))
  app.use('/auth', require('./modules/auth/auth-routes'))
  app.use('/ella-vibes', require('./modules/ella-vibes/market-routes'))
  app.use('/fba-automation', require('./modules/fba-automation/index'))
  app.use('/markdown', require('./modules/markdown/markdown-routes'))
  app.use('/ai', require('./modules/ai/index'))
  app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))
}

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
  // to match notifications limit
  // console.log("Doaa loaded", doaa.length,);
  doaa = doaa.filter(item => item.zikr && item.zikr.length <= 200);
  // console.log("Doaa loaded for notifications", doaa.length,);

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

  const triggerNotification = (minutes, getNotification) => {
    setInterval(() => {
      let notification = typeof getNotification === "function" ? getNotification() : defaultNotification;
      notifier.notify(notification);
    }, 60 * 1000 * minutes);
  };

  // Water reminder every 60 minutes
  triggerNotification(60);

  // Doaa reminder
  triggerNotification(
    3,
    () => {
      let randomDoaa = getRandomDoaa();
      return {
        title: randomDoaa?.zikrCategory || "Doaa", message: randomDoaa?.zikr,
        wait: true, sound: false,
        icon: "public/images/notification/notification-2.jpg",
      };
    },
    true
  );
}

// ---------------------  DIVIDER  export app -------------------------------------------
// Start the server
app.listen(process.env.PORT || 5000, async () => {
  console.log(`🚀 Server Started`)
  await initDatabase()
  applyRoutes()
  /* 
   * By Default this will not work on vercil 
   * but just in case it is being hosted on any vbs server 
   */
  if (isDev) {
    openMarkdownServer()
    startNotification()
  }
})
