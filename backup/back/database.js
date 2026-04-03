const { MongoClient, ServerApiVersion } = require('mongodb');
const { isDev } = require('../server-seperated/configs')

async function connecAndStart(mongoURI) {
    await new MongoClient(mongoURI, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true, } })
        .connect()
        .then(() => {
            process.env.MONGO_CONNECT_URI = mongoURI
            console.log("📊 MongoDB Started", `${mongoURI.slice(0, 15)}...`);
        })
}

async function startDatabase() {
    if (isDev) {
        try {
            await connecAndStart(process.env.LOCAL_MONGO_CONNECT_URI)
        }
        catch {
            await connecAndStart(process.env.SERVER_MONGO_CONNECT_URI)
        }
    } else {
        await connecAndStart(process.env.SERVER_MONGO_CONNECT_URI)
    }
}

module.exports = { startDatabase }