const fs = require('fs')
const path = require('path')
const { SOURCES, ScrapePage, ScrapeYoutubeChannel, ScrapeReutersPage, ScrapeGoogleNews } = require('./newsletter-helpers.js')
const { extractAll, generateHTML } = require('./paresers/index.js')
const { MongoClient } = require('mongodb')
const express = require('express')
const puppeteer = require('puppeteer')
const router = express.Router()

const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

async function getCollection(name = 'cache') {
  const client = new MongoClient(process.env.MONGO_CONNECT_URI)
  await client.connect()
  return { client, collection: client.db('newsletter').collection(name) }
}

async function getCached() {
  const { client, collection } = await getCollection('cache')
  try {
    const since = new Date(Date.now() - CACHE_TTL_MS)
    return await collection.findOne({ createdAt: { $gte: since } }, { sort: { createdAt: -1 } })
  } finally {
    await client.close()
  }
}

async function saveCache(data, html) {
  const { client, collection } = await getCollection('cache')
  try {
    await collection.insertOne({ data, html, createdAt: new Date() })
  } finally {
    await client.close()
  }
}

async function getLinkCache(url) {
  const { client, collection } = await getCollection('link_cache')
  try {
    const since = new Date(Date.now() - CACHE_TTL_MS)
    return await collection.findOne({ url, createdAt: { $gte: since } }, { sort: { createdAt: -1 } })
  } finally {
    await client.close()
  }
}

async function saveLinkCache(url, html) {
  const { client, collection } = await getCollection('link_cache')
  try {
    await collection.updateOne({ url }, { $set: { url, html, createdAt: new Date() } }, { upsert: true })
  } finally {
    await client.close()
  }
}

async function GetNewsLetter(req, res) {
  // Check cache first
  const cached = await getCached()
  if (cached) {
    const ageMs = Date.now() - new Date(cached.createdAt).getTime()
    const ageHours = (ageMs / (1000 * 60 * 60)).toFixed(2)
    console.log(`📦 Returning cached response (age: ${ageHours}h)`)
    return res.status(200).json({ message: 'success', cached: true, cachedAt: cached.createdAt, ageHours: +ageHours, data: cached.data, hmtl: cached.html })
  }

  let htmlContent = ''
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  try {
    for (const source of SOURCES) {
      for (const link of source.links) {
        const cached = await getLinkCache(link)
        if (cached) {
          console.log(`📦 Using cached data for: ${link}`)
          htmlContent += cached.html
          continue
        }
        let html = ''
        if (source.label == 'Reuters') html = await ScrapeReutersPage(link)
        else if (source.label == 'GoogleNews') html = await ScrapeGoogleNews(link)
        else if (source.label == 'Youtube') html = await ScrapeYoutubeChannel(link)
        else html = await ScrapePage(browser, source, link)
        if (html) await saveLinkCache(link, html)
        htmlContent += html
      }
    }
    let finalObject = extractAll(htmlContent)
    let finalHtml = generateHTML(finalObject)
    const downloadsDir = path.join(require('os').homedir(), 'Downloads')
    const fileName = `newsletter-${Date.now()}`
    fs.writeFileSync(path.join(downloadsDir, fileName + '.html'), finalHtml, 'utf-8')
    fs.writeFileSync(path.join(downloadsDir, fileName + '.json'), JSON.stringify(finalObject, null, 2), 'utf-8')
    await saveCache(finalObject, finalHtml)
    console.log('✅ Done — saved to cache')
    res.status(200).json({ message: 'success', cached: false, cachedAt: new Date(), data: finalObject, hmtl: finalHtml })
  } catch (err) {
    console.error('Failed', err)
    res.status(500).json({ message: 'Scraping succeeded, but AI analysis failed.' })
  } finally {
    await browser.close() // ✅ ALWAYS CLOSE
  }
}

// ----------------  DIVIDER  routes -----------------------------------
router.route('/').get(GetNewsLetter)
module.exports = router
