const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

/**
 * Extracts card data from Beehiiv newsletter HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of card objects
 */
function TheRunDown(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const slides = document.querySelectorAll('.embla__slide')
  return Array.from(slides).map((slide) => {
    try {
      const anchor = slide.querySelector('a')
      const url = 'https://www.therundown.ai/' + anchor?.getAttribute('href')
      const img = slide.querySelector('img._11n66oe2')
      const image = {
        src: img?.getAttribute('src') || null,
        alt: img?.getAttribute('alt') || null,
      }
      const titleEl = slide.querySelector('h3 span._11r14xt1')
      const title = titleEl?.textContent?.trim() || null
      const paragraphs = slide.querySelectorAll('p.dream-paragraph span._11r14xt1')
      const subtitle = paragraphs[0]?.textContent?.trim() || null
      const authorImgs = slide.querySelectorAll('.flex.-space-x-1\\.5 img')
      const authorText = slide.querySelector('.flex.flex-wrap span._11r14xt1')
      const authors = Array.from(authorImgs).map((authorImg) => ({
        name: authorImg.getAttribute('alt') || null,
        avatar: authorImg.getAttribute('src') || null,
      }))
      const authorSummary = authorText?.textContent?.trim() || null
      return { url, image, title, subtitle, authors, authorSummary }
    } catch (e) { return null }
  }).filter(Boolean)
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = TheRunDown(fs.readFileSync(filePath))
// fs.writeFileSync(`${dirPath}/object.json`, JSON.stringify(xx))

module.exports = { TheRunDown }
