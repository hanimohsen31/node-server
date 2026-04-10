const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

/**
 * Extracts card data from OpenAI index/news HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of card objects
 */
function extractOpenAICards(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const cards = document.querySelectorAll('.group.relative')
  return Array.from(cards).map((card) => {
    try {
      const anchor = card.querySelector('a[aria-label]')
      if (!anchor) return null
      const id = anchor.getAttribute('id') || null
      const href = anchor.getAttribute('href') || null
      const url = href?.startsWith('http') ? href : `https://openai.com${href}`
      const titleEl = anchor.querySelector('.text-h5, [class*="text-h"]')
      const title = titleEl?.textContent?.trim() || null
      const metaEl = anchor.querySelector('p.text-meta')
      const categoryEl = metaEl?.querySelector(':scope > span:first-child')
      const category = categoryEl?.textContent?.trim() || null
      const timeEl = anchor.querySelector('time')
      const publishedAt = timeEl?.getAttribute('datetime') || null
      const publishedLabel = timeEl?.textContent?.trim() || null
      const img = card.querySelector('img[src]')
      const image = img
        ? { src: img.getAttribute('src') || null, alt: img.getAttribute('alt') || null, srcset: img.getAttribute('srcset') || null }
        : null
      return { id, url, title, category, publishedAt, publishedLabel, image }
    } catch (e) { return null }
  }).filter(Boolean)
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = extractOpenAICards(fs.readFileSync(filePath))
// fs.writeFileSync(`${dirPath}/objecqweqt.json`, JSON.stringify(xx))

module.exports = { extractOpenAICards }
