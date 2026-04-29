// [1] go to https://eg.hatla2ee.com/en/car/used-prices/hyundai/matrix
// [1] + go to https://eg.hatla2ee.com/en/car/used-prices/hyundai
// [1] + go to https://eg.hatla2ee.com/en/car/hyundai/matrix/year/2025
// [2] scrap table component of prices
// [3] scrap items using extension "Instant Data Scraper" + save as csv
// [4] make json file + return json

const puppeteer = require('puppeteer')
const Anthropic = require('@anthropic-ai/sdk')
const Hatla2eeBaseData = require('../utils/hatla2ee-lists')
const BASE = 'https://eg.hatla2ee.com/en/car'
const HATLA2EE_HOME = 'https://eg.hatla2ee.com/en'

/**
 * @param {string} brand  e.g. "hyundai"
 * @param {string} model  e.g. "matrix"
 * @param {string|number} [year]  e.g. 2025  (optional)
 * @param {number} [pages=3]  how many listing pages to scrape
 * @returns {Promise<{ usedPricesTable: { url, data, count }, listings: { url, data, count } }>}
 */

async function scrapHatla2ee(brand, model, year = null, minPriceLimit = 300_000, maxPriceLimit = 550_000, pagesNum = 3) {
  const resolved = resolveHatla2eeSlugs(brand, model)
  console.log(`🔍 Resolved slugs: brand="${resolved.brand}" model="${resolved.model}" (input: brand="${brand}" model="${model}")`)
  brand = resolved.brand
  model = resolved.model

  // ------------------------  DIVIDER  [1] launch puppeteer's default chromium -------------------------------------------------------------
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  })
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
  await page.setViewport({ width: 1500, height: 5000, deviceScaleFactor: 0.25 })

  try {
    // ------------------------  DIVIDER  [2] scrap used-prices table -------------------------------------------------------------
    const usedPricesUrl = buildUsedPricesUrl(brand, model)
    const usedPrices = await scrapeUsedPricesTable(page, usedPricesUrl)
    console.log(`✅ Used prices scraped (${usedPrices.length} rows) from ${usedPricesUrl}`)

    // ------------------------  DIVIDER  [3] scrap listings (paginated) -------------------------------------------------------------
    const listingsBaseUrl = buildListingsUrl(brand, model, year, 1)
    let listings = await scrapeListingPages(page, brand, model, year, pagesNum)
    console.log(`✅ Listings scraped (${listings.length} total items across ${pagesNum} pages)`)

    // ------------------------  DIVIDER  [4] return json -------------------------------------------------------------
    const prices = listings.map((l) => l.price).filter((p) => p !== null)
    const minPrice = prices.length ? Math.min(...prices) : null
    const maxPrice = prices.length ? Math.max(...prices) : null

    const BASE_URL = 'https://eg.hatla2ee.com'
    const parsedUsedPrices = usedPrices.map((item) => ({
      ...item,
      url: `${BASE_URL}${item.url}`,
      avgPrice: Number(item.avgPrice.replace(/,/g, '')),
      minPrice: Number(item.minPrice.replace(/,/g, '')),
      maxPrice: Number(item.maxPrice.replace(/,/g, '')),
    }))

    const listingItems = [...new Map(listings.map((l) => [l.id, { ...l, url: `${BASE_URL}${l.url}` }])).values()]

    return {
      usedPricesTable: {
        url: usedPricesUrl,
        data: parsedUsedPrices,
        count: parsedUsedPrices.length,
      },
      listings: {
        url: listingsBaseUrl,
        data: listingItems,
        count: listingItems.length,
        minPrice,
        maxPrice,
      },
    }
  } finally {
    await browser.close()
  }
}

// ------------------------  DIVIDER  helpers -------------------------------------------------------------
function normalize(str) {
  if (!str) return ''
  return str.toLowerCase().replace(/[-\s]/g, '')
}

function charOverlapScore(a, b) {
  const freq = {}
  for (const c of a) freq[c] = (freq[c] || 0) + 1
  let score = 0
  for (const c of b) {
    if (freq[c] > 0) {
      score++
      freq[c]--
    }
  }
  return score
}

function bestMatch(input, candidates) {
  const normInput = normalize(input)
  const exact = candidates.find((c) => normalize(c) === normInput)
  if (exact) return exact
  let best = null,
    bestScore = -1
  for (const c of candidates) {
    const score = charOverlapScore(normInput, normalize(c))
    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }
  return best
}

function resolveHatla2eeSlugs(brand, model) {
  const brandKeys = Object.keys(Hatla2eeBaseData)
  const resolvedBrand = bestMatch(brand, brandKeys)
  const models = resolvedBrand ? Hatla2eeBaseData[resolvedBrand] : []
  const resolvedModel = model && models.length ? bestMatch(model, models) : null
  return { brand: resolvedBrand, model: resolvedModel }
}

function buildUsedPricesUrl(brand, model) {
  if (model) return `${BASE}/used-prices/${brand}/${model}?sortby=updated_at_desc`
  return `${BASE}/used-prices/${brand}`
}

function buildListingsUrl(brand, model, year, page = 1) {
  const pagePart = page > 1 ? `/page/${page}` : ''
  if (year) return `${BASE}/${brand}/${model}/year/${year}${pagePart}?sortby=updated_at_desc`
  if (model) return `${BASE}/${brand}/${model}${pagePart}?sortby=updated_at_desc`
  return `${BASE}/${brand}${pagePart}?sortby=updated_at_desc`
}

async function scrapeUsedPricesTable(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 3000))
  return page.evaluate(() => {
    const extractPrice = (cell) => cell.querySelector('span.font-semibold')?.innerText?.trim() || null
    const extractCurrency = (cell) => {
      const spans = cell.querySelectorAll('span.font-semibold')
      return spans[1]?.innerText?.trim() || 'EGP'
    }
    const rows = []
    document.querySelectorAll('[data-slot="table-body"] [data-slot="table-row"]').forEach((tr) => {
      const cells = tr.querySelectorAll('[data-slot="table-cell"]')
      if (cells.length < 4) return
      const anchor = cells[0].querySelector('a')
      rows.push({
        modelEnglish: anchor?.innerText?.trim() || cells[0].innerText.trim(),
        modelArabic: anchor?.getAttribute('text_l1') || null,
        url: anchor?.getAttribute('href') || null,
        avgPrice: extractPrice(cells[1]),
        minPrice: extractPrice(cells[2]),
        maxPrice: extractPrice(cells[3]),
        currency: extractCurrency(cells[1]),
      })
    })
    return rows
  })
}

async function scrapeListings(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 3000))
  return page.evaluate(() => {
    const items = []
    document.querySelectorAll('[data-slot="card"]').forEach((card) => {
      const anchor = card.querySelector('a[href*="/en/car/"]')
      const href = anchor?.getAttribute('href') || null
      const id = href ? href.split('/').pop() : null
      const title = card.querySelector('a.no-underline span.font-semibold')?.innerText?.trim() || null
      const specs = Array.from(card.querySelectorAll('div.text-xs span'))
        .map((s) => s.innerText.trim())
        .filter(Boolean)
      const [yearRaw, mileageRaw, transmission, fuel] = specs
      const year = yearRaw ? parseInt(yearRaw, 10) || null : null
      const mileage = mileageRaw ? parseInt(mileageRaw.replace(/[^\d]/g, ''), 10) || null : null
      const priceEl = card.querySelector('.text-primary')
      const priceRaw = priceEl ? priceEl.childNodes[0]?.textContent?.replace(/[^\d]/g, '').trim() : null
      const price = priceRaw ? parseInt(priceRaw, 10) || null : null
      const currency = priceEl ? priceEl.querySelector('span')?.innerText?.trim() || null : null
      const location = card.querySelector('a[href*="/car/city/"]')?.innerText?.trim() || null
      const image = card.querySelector('img[src*="listing_image"]')?.getAttribute('src') || null
      if (id && (title || price)) {
        items.push({ id, title, year, mileage, transmission, fuel, price, currency, location, image, url: href })
      }
    })
    return items
  })
}

async function scrapeListingPages(page, brand, model, year, totalPages) {
  const allItems = []
  for (let p = 1; p <= totalPages; p++) {
    const url = buildListingsUrl(brand, model, year, p)
    const items = await scrapeListings(page, url)
    console.log(`📄 Page ${p}/${totalPages}: ${items.length} items from ${url}`)
    allItems.push(...items)
    if (items.length === 0) break // no more results, stop early
  }
  return allItems
}

// ------------------------  DIVIDER  exports -------------------------------------------------------------
module.exports = scrapHatla2ee
