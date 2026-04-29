const ErrorHandler = require('./middlewares/ErrorHandler')
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
const path = require('path')
const axios = require("axios");

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
  // process.exit(1)
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
    // helmet.contentSecurityPolicy({
    //   directives: {
    //     defaultSrc: ["'self'"],
    //     scriptSrc: [
    //       "'self'",
    //       'unsafe-eval',
    //       "https://cdnjs.cloudflare.com",
    //       "'unsafe-inline'",
    //     ],
    //     scriptSrcAttr: ["'unsafe-inline'"],
    //     styleSrc: [
    //       "'self'",
    //       "https://cdnjs.cloudflare.com",
    //       "https://fonts.googleapis.com",
    //       "'unsafe-inline'",
    //     ],
    //     fontSrc: [
    //       "'self'",
    //       "https://fonts.gstatic.com"
    //     ],
    //     connectSrc: [
    //       "'self'",
    //       "https://cdnjs.cloudflare.com"
    //     ],
    //     imgSrc: [
    //       "'self'",
    //       "data:",
    //       "https:"
    //     ],
    //     objectSrc: ["'none'"]
    //   }
    // }),
    helmet({ contentSecurityPolicy: false })
  );
} else {
  app.use(helmet()) // set security http headers
}

// ---------------------  DIVIDER  database ---------------------------------------------
async function connectWithRetry(uri, retries = 3, delay = 2000) {
  // ✅ Guard: never connect twice
  if (mongoose.connection.readyState === 1) {
    console.log("⚡ Mongoose already connected, skipping.")
    return true
  }
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(uri, {});
      // 2. Handle post-connection errors (This fixes the unhandledRejection)
      mongoose.connection.on('error', (err) => {
        console.error('🚨 Mongoose connection error:', err);
      });
      process.env.MONGO_CONNECT_URI = uri
      console.log("📊 Mongo Connected On:", uri);
      return true;
    } catch (err) {
      console.error(`❌ Mongo connect failed (${i}/${retries}):`, err.message)
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
            if (err) console.log('ℹ️ MongoDB service check (may already be running).');
            else console.log('✅ MongoDB service start command issued.');
            // Wait a bit for service to initialize if it was just started
            setTimeout(resolve, 3000);
          }
          // console.log('stdout', stdout);
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
  app.all('/', (req, res) => res.status(200).json({ message: 'Server Works' }))
  app.use('/auth', require('./modules/auth/auth-routes'))
  app.use('/ella-vibes', require('./modules/ella-vibes/market-routes'))
  app.use('/fba-automation', require('./modules/fba-automation/index'))
  app.use('/markdown', require('./modules/markdown/index'))
  app.use('/ai', require('./modules/ai/index'))
  app.all('*', (req, res, next) => next(ErrorHandler(res, null, 'Route not found', 404, null)))
}

// ---------------------  DIVIDER  funcitons to run on start --------------------------------------
function openMarkdownServer() {
  // const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  // exec(`${start} ${process.env.LOCAL_PORT}/markdown`)
  console.log("📚 Start Markdown Viewer V1 On:", `${process.env.LOCAL_PORT}/markdown`);
  console.log("📚 Start Markdown Viewer V2 On:", `http://localhost:5000/`);
  // Serve Angular app (both dev & prod)
  const angularPath = path.join(__dirname, 'client', 'dist', 'client-markdown', 'browser');
  app.use(express.static(angularPath));
  // 3. Catch-all for Angular routing (skip APIs)
  app.get('*', (req, res, next) => {
    const apiPrefixes = ['/auth', '/markdown', '/ella-vibes', '/fba-automation', '/ai'];
    if (apiPrefixes.some(prefix => req.originalUrl.startsWith(prefix))) {
      return next(); // let API route handle it
    }
    res.sendFile(path.join(angularPath, 'index.html'));
  });
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

function checkVisaTrigger() {
  function hasTarget(html, target) {
    return typeof html === "string" && html.includes(target);
  }

  function isWithinWorkingHours() {
    const hour = new Date().getHours();
    return hour >= 9 && hour < 14;
  }

  function checkVisa() {
    const URL = "https://www.eg.emb-japan.go.jp/itpr_en/11_000001_pick.html";
    const TARGET_NUMBER = "75837891";
    let found = false;
    let running = false;
    const check = async () => {
      if (running || found) return;
      if (!isWithinWorkingHours()) {
        console.log("⏱ Outside working hours");
        return;
      }
      running = true;
      try {
        console.log("Checking...", new Date().toLocaleString());
        const { data } = await axios.get(URL, { timeout: 10000 });
        if (hasTarget(data, TARGET_NUMBER)) {
          found = true;
          console.log("🔥 FOUND");
          notifier.notify({
            title: "🔥 Visa FOUND",
            message: `Number ${TARGET_NUMBER} is available`,
            sound: true,
          });
        } else {
          console.log("Not found");
        }
      } catch (err) {
        console.error("Request failed:", err.message);
      } finally {
        running = false;
      }
    };
    // ✅ run immediately
    check();
    // ✅ safer than setInterval (no overlap)
    const loop = async () => {
      await check();
      setTimeout(loop, 3 * 60 * 60 * 1000); // 3 hours
    };
    setTimeout(loop, 3 * 60 * 60 * 1000);
  }

  checkVisa();
}

// ---------------------  DIVIDER  export app -------------------------------------------
// Start the server
openMarkdownServer()
app.listen(process.env.PORT || 5000, async () => {
  console.log(`🚀 Server Started`)
  // await new Promise(r => setTimeout(r, 5_000));
  await initDatabase()
  // await new Promise(r => setTimeout(r, 5_000));
  applyRoutes()
  /* 
   * By Default this will not work on vercil 
   * but just in case it is being hosted on any vbs server 
   */
  if (isDev) {
    // openMarkdownServer()
    startNotification()
    checkVisaTrigger()
  }
})
