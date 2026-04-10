const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

const BASE_URL = 'https://github.com'

/**
 * Extracts trending repository data from GitHub Trending HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of trending repo objects
 */
function Github(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const repos = document.querySelectorAll('article.Box-row')

  return Array.from(repos).map((repo) => {
    try {
      const titleLink = repo.querySelector('h2 a')
      const href = titleLink?.getAttribute('href') || ''
      const url = href ? `${BASE_URL}${href}` : null
      const owner = repo.querySelector('h2 .text-normal')?.textContent?.replace(/\s|\//g, '').trim() || null
      const name = titleLink?.textContent?.replace(owner, '').replace(/\s|\//g, '').trim() || null
      const description = repo.querySelector('p.col-9')?.textContent?.replace(/\s+/g, ' ').trim() || null
      const language = repo.querySelector('[itemprop="programmingLanguage"]')?.textContent?.trim() || null
      const languageColor = repo.querySelector('.repo-language-color')?.style?.backgroundColor || null
      const starsEl = repo.querySelector(`a[href="${href}/stargazers"]`)
      const stars = parseInt(starsEl?.textContent?.replace(/,/g, '').trim()) || null
      const forksEl = repo.querySelector(`a[href="${href}/forks"]`)
      const forks = parseInt(forksEl?.textContent?.replace(/,/g, '').trim()) || null
      const starsToday = repo.querySelector('.float-sm-right')?.textContent?.replace(/\s+/g, ' ').trim() || null
      const contributors = Array.from(repo.querySelectorAll('a.d-inline-block img.avatar-user')).map((img) => ({
        username: img.getAttribute('alt')?.replace('@', '') || null,
        avatar: img.getAttribute('src') || null,
      }))
      return { owner, name, url, description, language, languageColor, stars, forks, starsToday, contributors }
    } catch (e) { return null }
  }).filter(Boolean)
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = Github(fs.readFileSync(filePath, 'utf-8'))
// fs.writeFileSync(path.join(dirPath, 'github.json'), JSON.stringify(xx, null, 2))

module.exports = { Github }
