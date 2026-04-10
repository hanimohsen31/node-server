const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

const BASE_URL = 'https://aiweekly.co'

/**
 * Extracts issue data from AI News Weekly (aiweekly.co) HTML.
 * Returns the issue metadata and its sections (welcome, sponsor, etc.).
 * @param {string} html - Raw HTML string
 * @returns {Object} Parsed issue object
 */
function Aiweekly(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const article = document.querySelector('article.issue')
  if (!article) return null

  const nodeId = article.getAttribute('data-history-node-id') || null
  const issueLinkEl = article.querySelector('h1 a')
  const issueHref = issueLinkEl?.getAttribute('href') || ''
  const issueNumber = parseInt(issueHref.replace('/issues/', '')) || null
  const url = issueHref ? `${BASE_URL}${issueHref}` : null
  const titleEl = article.querySelector('h1 a span')
  const title = titleEl?.textContent?.replace(/\s+/g, ' ').trim() || null
  const timeEl = article.querySelector('time.published')
  const date = timeEl?.getAttribute('datetime') || null
  const dateText = timeEl?.textContent?.trim() || null
  const prevEl = article.querySelector('.issue__pager a[href*="/issues/"]')
  const prevHref = prevEl?.getAttribute('href') || null
  const previousIssue = prevHref ? { url: `${BASE_URL}${prevHref}`, label: prevEl.textContent.trim() } : null

  const sections = Array.from(article.querySelectorAll('section.category')).map((section) => {
    try {
      const categoryClass = Array.from(section.classList).find((c) => c.startsWith('cc-'))?.replace('cc-', '') || null
      const categoryTitle = section.querySelector('h2.category__title .category__title__text')?.textContent?.trim() || null
      const items = Array.from(section.querySelectorAll('.item--link')).map((item) => {
        try {
          const itemTitle = item.querySelector('h3.item__title a')?.textContent?.replace(/\s+/g, ' ').trim() || null
          const itemUrl = item.querySelector('h3.item__title a')?.getAttribute('href') || null
          const img = item.querySelector('img')
          const image = img ? { src: img.getAttribute('src') || null, alt: img.getAttribute('alt') || null } : null
          const paragraphs = Array.from(item.querySelectorAll('p')).map((p) => p.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)
          const description = paragraphs.join(' ') || null
          const domain = item.querySelector('.item__footer-link a')?.textContent?.trim() || null
          return { title: itemTitle, url: itemUrl, description, image, domain }
        } catch (e) { return null }
      }).filter(Boolean)
      const prose = section.querySelector('.item--issue:not(.item--link)')
      const content = prose ? prose.textContent.replace(/\s+/g, ' ').trim() : null
      return { category: categoryClass, title: categoryTitle, ...(items.length ? { items } : {}), ...(content ? { content } : {}) }
    } catch (e) { return null }
  }).filter(Boolean)

  return { nodeId, issueNumber, title, url, date, dateText, previousIssue, sections }
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = Aiweekly(fs.readFileSync(filePath, 'utf-8'))
// fs.writeFileSync(path.join(dirPath, 'aiweekly.json'), JSON.stringify(xx, null, 2))

module.exports = { Aiweekly }
