const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

const BASE_URL = 'https://deepmind.google'

/**
 * Extracts article cards from DeepMind newsletter HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of article objects
 */
function Deepmind(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const articles = document.querySelectorAll('article.card-blog')
  return Array.from(articles).map((article) => {
    try {
      const overlay = article.querySelector('a.card__overlay-link')
      const href = overlay?.getAttribute('href') || null
      const url = href?.startsWith('http') ? href : href ? BASE_URL + href : null
      const titleEl = article.querySelector('h3.card__title')
      const title = titleEl?.textContent?.trim() || null
      const timeEl = article.querySelector('time')
      const date = timeEl?.getAttribute('datetime') || timeEl?.textContent?.trim() || null
      const categoryEl = article.querySelector('.meta__category')
      const category = categoryEl?.textContent?.trim() || null
      const img = article.querySelector('img.picture__image')
      const image = {
        src: img?.getAttribute('src') || null,
        alt: img?.getAttribute('alt') || null,
      }
      return { title, url, date, category, image }
    } catch (e) { return null }
  }).filter(Boolean)
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = Deepmind(fs.readFileSync(filePath, 'utf-8'))
// fs.writeFileSync(path.join(dirPath, 'deepmind.json'), JSON.stringify(xx, null, 2))

module.exports = { Deepmind }
