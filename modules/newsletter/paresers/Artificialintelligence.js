const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

/**
 * Extracts article listings from artificialintelligence-news.com HTML.
 * Returns two groups: latest posts (rich cards with image/date) and trending micro-news posts.
 * @param {string} html - Raw HTML string
 * @returns {{ latest: Array<Object>, trending: Array<Object> }}
 */
function Artificialintelligence(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document

  // ── Latest posts (Elementor loop template 16970) ─────────────────────────
  const latest = Array.from(
    document.querySelectorAll('[data-elementor-id="16970"].e-loop-item')
  ).reduce((acc, item) => {
    try {
      const classList = Array.from(item.classList)
      const postId = classList.find((c) => /^post-\d+$/.test(c))?.replace('post-', '') || null
      const tags = classList.filter((c) => c.startsWith('tag-')).map((c) => c.replace('tag-', ''))
      const categories = classList.filter((c) => c.startsWith('category-')).map((c) => c.replace('category-', ''))
      const imgWidget = item.querySelector('[data-widget_type="theme-post-featured-image.default"]')
      const imgLink = imgWidget?.querySelector('a')
      const img = imgWidget?.querySelector('img')
      const image = {
        src: img?.getAttribute('src') || null,
        alt: img?.getAttribute('alt') || null,
      }
      const category = item.querySelector('p.post-category a')?.textContent?.trim() || null
      const dateParagraphs = item.querySelectorAll('p.elementor-heading-title')
      let date = null
      dateParagraphs.forEach((p) => {
        if (!p.querySelector('a') && /\d{4}/.test(p.textContent)) date = p.textContent.trim()
      })
      const titleLink = item.querySelector(
        '[data-widget_type="theme-post-title.default"] h1 a, [data-widget_type="theme-post-title.default"] h3 a'
      )
      const title = titleLink?.textContent?.replace(/\s+/g, ' ').trim() || null
      const url = titleLink?.getAttribute('href') || imgLink?.getAttribute('href') || null
      if (title) acc.push({ postId, title, url, date, category, image, tags, categories })
    } catch (e) {}
    return acc
  }, [])

  // ── Trending / micro-news posts (Elementor loop template 16850) ───────────
  const trending = Array.from(
    document.querySelectorAll('[data-elementor-id="16850"].e-loop-item')
  ).reduce((acc, item) => {
    try {
      const classList = Array.from(item.classList)
      const postId = classList.find((c) => /^post-\d+$/.test(c))?.replace('post-', '') || null
      const tags = classList.filter((c) => c.startsWith('tag-')).map((c) => c.replace('tag-', ''))
      const category = item.querySelector('p.elementor-heading-title a[rel="tag"]')?.textContent?.trim() || null
      const titleLink = item.querySelector('[data-widget_type="theme-post-title.default"] h3 a')
      const title = titleLink?.textContent?.replace(/\s+/g, ' ').trim() || null
      const url = titleLink?.getAttribute('href') || null
      const viewsText = item.querySelector('.elementor-shortcode')?.textContent?.trim() || ''
      const views = parseInt(viewsText) || null
      if (title) acc.push({ postId, title, url, category, views, tags })
    } catch (e) {}
    return acc
  }, [])

  return { latest, trending }
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = Artificialintelligence(fs.readFileSync(filePath, 'utf-8'))
// fs.writeFileSync(path.join(dirPath, 'artificialintelligence.json'), JSON.stringify(xx, null, 2))

module.exports = { Artificialintelligence }
