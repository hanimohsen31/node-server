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