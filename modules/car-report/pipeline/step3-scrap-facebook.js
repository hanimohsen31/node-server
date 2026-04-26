// [1] go to https://www.facebook.com/marketplace/cairo/search?query=matrix
// [2] set fitlers to cairo-egypt within 250 km
// [2] make optional to set fitlers to mansoura-egypt within 10 km
// [3] scrap items using extension "Instant Data Scraper" + save as csv
// [4] make to json + return json

const puppeteerExtra = require('puppeteer-extra')
const path = require('path')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const puppeteer = require('puppeteer')
const { JSDOM } = require('jsdom')
const { extractAll } = require('../utils/pattern-extractor')
const { beforeChromeHandling } = require('../../../utils/PuppeteerHelpers')
puppeteerExtra.use(StealthPlugin())
const LOCATIONS = {
  cairo: { citySlug: 'cairo', latitude: 30.0626, longitude: 31.2497, radius: 250 },
  mansoura: { citySlug: 'mansoura', latitude: 31.0364, longitude: 31.3815, radius: 10 },
}

/**
 * @param {string} carModel  e.g. "matrix"
 * @param {{ location?: 'cairo' | 'mansoura' }} options
 * @returns {Promise<{ location: string, carModel: string, url: string, count: number, listings: object[] }>}
 */
async function scrapFacebook(carModel, location = 'cairo', minPriceLimit = 300_000, maxPriceLimit = 550_000, scrollsInPage = 8, browserClient = 'clone') {
  const showBrowser = false
  try {
    await beforeChromeHandling(false, false, true, false, !showBrowser, browserClient)
  } catch (err) {
    throw new Error('Error Happened In Opening Chrome Bash')
  }
  // ------------------------  DIVIDER  [1] open defualt browser -------------------------------------------------------------
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null })
  const pages = await browser.pages()
  const page = pages[0] || (await browser.newPage())
  await page.bringToFront()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
  await page.setViewport({ width: 1500, height: 5000, zoom: 0.25, deviceScaleFactor: 0.25 })

  const cleanPrice = (price) => {
    if (!price) return NaN
    return Number(price.replace(/[^\d.]/g, ''))
  }

  const attemptScrap = async () => {
    // ------------------------  DIVIDER  [2] go to page -------------------------------------------------------------
    const locConfig = LOCATIONS[location] ?? LOCATIONS.cairo
    const url = buildUrl(carModel, locConfig)
    console.log(url)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await new Promise((resolve) => setTimeout(resolve, 5_000)) // wait
    // ------------------------  DIVIDER  [3] start scrapping -------------------------------------------------------------
    for (let i = 0; i < 1; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      await dismissDialogs(page)
      await scrollToLoadMore(page, scrollsInPage)
      await dismissDialogs(page)
      console.log(`iter-${i}`)
    }
    // ------------------------  DIVIDER  [4] collect data -------------------------------------------------------------
    const listings = await page.evaluate(() => {
      const items = []
      const seen = new Set()
      document.querySelectorAll('a[href*="/marketplace/item/"]').forEach((a) => {
        const href = a.getAttribute('href') || ''
        const ariaLabel = a.getAttribute('aria-label') || ''
        // aria-label format: "TITLE, EGP_PRICE, CITY, COUNTRY, listing ID"
        // price can contain commas (e.g. EGP390,000) so we match greedily on EGP\d[,\d]*
        const match = ariaLabel.match(/^(.*?),\s*(EGP[\d,]+(?:\.\d+)?),\s*(.*?),\s*listing (\d+)/)
        const listingId = match ? match[4] : href.match(/item\/(\d+)/)?.[1]
        if (!listingId || seen.has(listingId)) return
        seen.add(listingId)
        const img = a.querySelector('img')
        // fallback: extract text spans when aria-label regex doesn't match
        const spans = Array.from(a.querySelectorAll('span'))
          .map((s) => s.textContent?.trim())
          .filter(Boolean)
        const fallbackTitle = match?.[1]?.trim() || spans.find((s) => !s.startsWith('EGP') && !/^\d/.test(s)) || null
        const fallbackPrice = match?.[2]?.trim().replace('EGP', '') || spans.find((s) => s.startsWith('EGP'))?.replace('EGP', '') || null
        items.push({
          listingId,
          url: 'https://www.facebook.com' + href.split('?')[0],
          title: fallbackTitle,
          price: fallbackPrice,
          location: match?.[3]?.trim() || null,
          image: img?.getAttribute('src') || null,
          imageAlt: img?.getAttribute('alt')?.trim() || null,
        })
      })
      return items
    })
    if (listings.length === 0) throw new Error('No listings found')
    return { listings, url: buildUrl(carModel, LOCATIONS[location] ?? LOCATIONS.cairo) }
  }

  try {
    // ------------------------  DIVIDER  [5] scrap with 1 retry -------------------------------------------------------------
    let listings, url
    try {
      ;({ listings, url } = await attemptScrap())
    } catch (err) {
      console.warn('⚠️ Facebook scrap failed, retrying...', err.message)
      await new Promise((r) => setTimeout(r, 5000))
      ;({ listings, url } = await attemptScrap())
    }
    // ------------------------  DIVIDER  [6] states -------------------------------------------------------------
    const modelLower = carModel.toLowerCase()
    const listingWithUpdatedPrice = listings.map((x) => ({ ...x, price: cleanPrice(x.price) })).map((x) => ({ ...x, price: Number(x.price) !== NaN ? x.price : 0 }))

    const pricesList = listings.filter((x) => !isNaN(x.price) && x.price >= 50_000).map((x) => x.price)
    const overAllMinPrice = listingWithUpdatedPrice.length ? Math.min(...pricesList) : NaN
    const overAllMaxPrice = listingWithUpdatedPrice.length ? Math.max(...pricesList) : NaN

    const filterdData = listingWithUpdatedPrice.filter((x) => x.title?.toLowerCase().includes(modelLower) || x.imageAlt?.toLowerCase().includes(modelLower)).filter((x) => !isNaN(x.price) && x.price >= 50_000)
    const minPrice = filterdData.length ? Math.min(...filterdData.map((x) => x.price)) : NaN
    const maxPrice = filterdData.length ? Math.max(...filterdData.map((x) => x.price)) : NaN
    // ------------------------  DIVIDER  [7] return -------------------------------------------------------------
    console.log('✅ Facebook Scrapped')
    return { location, carModel, url, count: listings.length, listings, filterdData, filterdDataCount: filterdData.length, minPrice, maxPrice, overAllMinPrice, overAllMaxPrice }
  } finally {
    browser.disconnect()
  }
}

// ------------------------  DIVIDER  helpers -------------------------------------------------------------
function buildUrl(carModel, locConfig) {
  const query = encodeURIComponent(carModel)
  return `https://www.facebook.com/marketplace/${locConfig.citySlug}/search?query=${query}&latitude=${locConfig.latitude}&longitude=${locConfig.longitude}&radius=${locConfig.radius}`
}

async function dismissDialogs(page) {
  await page
    .evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[aria-label="Close"], button'))
      const dismiss = buttons.map((button) => {
        button.click()
      })

      const html = document.querySelector('html')
      if (html) html.style.overlay = 'auto'

      const body = document.querySelector('body')
      if (body) body.style.overlay = 'auto'

      const overlay = document.querySelector('.__fb-light-mode.x1n2onr6.xzkaem6')
      if (overlay) overlay.style.display = 'none'
    })
    .catch(() => {})
}

async function scrollToLoadMore(page, scrolls = 8) {
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight))
    await new Promise((r) => setTimeout(r, 1500))
    console.log('scrolled')
  }
}

// ------------------------  DIVIDER  export -------------------------------------------------------------
module.exports = scrapFacebook
