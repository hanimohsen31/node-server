const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

const BASE_URL = 'https://news.ycombinator.com'

/**
 * Extracts story listings from Hacker News (Ycombinator) HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of story objects
 */
function Ycombinator(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const rows = document.querySelectorAll('tr.athing.submission')

  return Array.from(rows).map((row) => {
    try {
      const id = row.getAttribute('id')
      const rank = parseInt(row.querySelector('.rank')?.textContent?.trim()) || null
      const titleLink = row.querySelector('.titleline a')
      const title = titleLink?.textContent?.replace(/\s+/g, ' ').trim() || null
      const href = titleLink?.getAttribute('href') || null
      const url = href?.startsWith('http') ? href : href ? `${BASE_URL}/${href}` : null
      const domain = row.querySelector('.sitestr')?.textContent?.trim() || null
      const subRow = row.nextElementSibling
      const scoreText = subRow?.querySelector('.score')?.textContent?.trim() || ''
      const points = parseInt(scoreText) || null
      const authorEl = subRow?.querySelector('a.hnuser')
      const author = authorEl?.textContent?.trim() || null
      const authorUrl = authorEl ? `${BASE_URL}/user?id=${author}` : null
      const ageEl = subRow?.querySelector('.age')
      const publishedAt = ageEl?.getAttribute('title')?.split(' ')[0] || null
      const publishedAgo = ageEl?.textContent?.replace(/\s+/g, ' ').trim() || null
      const commentLinks = subRow?.querySelectorAll(`a[href^="item?id="]`)
      const commentLink = commentLinks ? commentLinks[commentLinks.length - 1] : null
      const commentsText = commentLink?.textContent?.trim() || ''
      const comments = parseInt(commentsText) || 0
      const commentsUrl = id ? `${BASE_URL}/item?id=${id}` : null
      return { rank, title, url, domain, points, author, authorUrl, publishedAt, publishedAgo, comments, commentsUrl }
    } catch (e) { return null }
  }).filter(Boolean)
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = Ycombinator(fs.readFileSync(filePath, 'utf-8'))
// fs.writeFileSync(path.join(dirPath, 'ycombinator.json'), JSON.stringify(xx, null, 2))

module.exports = { Ycombinator }
