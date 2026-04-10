const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

const BASE_URL = 'https://superhumanai.beehiiv.com'

/**
 * Extracts news articles from Superhuman (Beehiiv) newsletter HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of article objects
 */
function Superhuman(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const sections = document.querySelectorAll('section')
  const articles = []

  sections.forEach((section) => {
    const source = section.getAttribute('id') || null
    const cards = section.querySelectorAll('div.rounded-lg.flex.flex-col.border')
    cards.forEach((card) => {
      try {
        const anchor = card.querySelector('a[href^="/p/"]')
        const url = anchor ? BASE_URL + anchor.getAttribute('href') : null
        const img = card.querySelector('figure img')
        const image = {
          src: img?.getAttribute('src') || null,
          alt: img?.getAttribute('alt') || null,
        }
        const titleEl = card.querySelector('h2')
        const title = titleEl?.textContent?.trim() || null
        const subtitleEl = card.querySelector('p.font-light')
        const subtitle = subtitleEl?.textContent?.trim() || null
        const timeEl = card.querySelector('time[datetime]')
        const datetime = timeEl?.getAttribute('datetime') || null
        const dateLabel = timeEl?.textContent?.trim() || null
        const authorImg = card.querySelector('.rounded-full img')
        const authorNameEl = card.querySelector('a[href="/authors"] span.font-semibold')
        const author = {
          name: authorImg?.getAttribute('alt') || authorNameEl?.textContent?.trim() || null,
          avatar: authorImg?.getAttribute('src') || null,
        }
        articles.push({ source, url, image, title, subtitle, datetime, dateLabel, author })
      } catch (e) {}
    })
  })

  return articles
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let result = Superhuman(fs.readFileSync(filePath, 'utf-8'))
// fs.writeFileSync(`${dirPath}/superhuman.json`, JSON.stringify(result, null, 2))

module.exports = { Superhuman }
