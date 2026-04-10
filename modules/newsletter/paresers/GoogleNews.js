const { JSDOM } = require('jsdom')

function GoogleNews(html) {
  const { document } = new JSDOM(html).window
  return Array.from(document.querySelectorAll('article')).reduce((acc, el) => {
    try {
      const pubDate = el.getAttribute('data-pub-date') || null
      const url = el.querySelector('a')?.getAttribute('href') || null
      const title = el.querySelector('h3')?.textContent?.trim() || null
      const sourceEl = el.querySelector('small a')
      const source = sourceEl?.textContent?.trim() || null
      const sourceUrl = sourceEl?.getAttribute('href') || null
      if (title || url) {
        acc.push({ title, url, source, sourceUrl, pubDate })
      }
    } catch (e) {}
    return acc
  }, [])
}

module.exports = { GoogleNews }
