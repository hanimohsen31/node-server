const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

/**
 * Extracts card data from TechCrunch post list HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of card objects
 */
function extractTechCrunchCards(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const posts = document.querySelectorAll('li.wp-block-post')
  return Array.from(posts).map((post) => {
    try {
      const classList = Array.from(post.classList)
      const postId = classList.find((c) => c.startsWith('post-'))?.replace('post-', '') || null
      const tags = classList.filter((c) => c.startsWith('tag-')).map((c) => c.replace('tag-', ''))
      const categories = classList.filter((c) => c.startsWith('category-')).map((c) => c.replace('category-', ''))
      const img = post.querySelector('figure.loop-card__figure img')
      const image = {
        src: img?.getAttribute('src') || null,
        alt: img?.getAttribute('alt') || null,
        srcset: img?.getAttribute('srcset') || null,
      }
      const catEl = post.querySelector('a.loop-card__cat')
      const category = {
        label: catEl?.textContent?.trim() || null,
        url: catEl?.getAttribute('href') || null,
      }
      const titleLink = post.querySelector('a.loop-card__title-link')
      const title = titleLink?.textContent?.trim() || null
      const url = titleLink?.getAttribute('href') || null
      const authorEls = post.querySelectorAll('a.loop-card__author')
      const authors = Array.from(authorEls).map((a) => ({
        name: a.textContent?.trim() || null,
        url: a.getAttribute('href') || null,
      }))
      const timeEl = post.querySelector('time.loop-card__time')
      const publishedAt = timeEl?.getAttribute('datetime') || null
      const publishedAgo = timeEl?.textContent?.trim() || null
      return { postId, url, title, category, image, authors, tags, categories, publishedAt, publishedAgo }
    } catch (e) { return null }
  }).filter(Boolean)
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = extractTechCrunchCards(fs.readFileSync(filePath))
// fs.writeFileSync(`${dirPath}/object345.json`, JSON.stringify(xx))

module.exports = { extractTechCrunchCards }
