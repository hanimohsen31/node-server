const { JSDOM } = require('jsdom')
// const fs = require('fs')
// const path = require('path')

const BASE_URL = 'https://x.com'

/**
 * Extracts tweet data from X (Twitter) HTML
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of tweet objects
 */
function X(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const tweets = document.querySelectorAll('article[data-testid="tweet"]')

  return Array.from(tweets).map((tweet) => {
    try {
      const avatarContainer = tweet.querySelector('[data-testid^="UserAvatar-Container-"]')
      const username = avatarContainer?.getAttribute('data-testid')?.replace('UserAvatar-Container-', '') || null
      const avatarImg = tweet.querySelector('[data-testid="Tweet-User-Avatar"] img[src]')
      const avatar = avatarImg?.getAttribute('src') || null
      const userNameEl = tweet.querySelector('[data-testid="User-Name"]')
      const displayName = userNameEl?.querySelector('a span span')?.textContent?.trim() || null
      const handleEl = userNameEl?.querySelector('a[tabindex="-1"] span')
      const handle = handleEl?.textContent?.trim() || (username ? `@${username}` : null)
      const timeLink = tweet.querySelector('a[href*="/status/"]')
      const statusHref = timeLink?.getAttribute('href') || null
      const tweetUrl = statusHref ? `${BASE_URL}${statusHref}` : null
      const timeEl = timeLink?.querySelector('time')
      const publishedAt = timeEl?.getAttribute('datetime') || null
      const publishedText = timeEl?.textContent?.trim() || null
      const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent?.replace(/\s+/g, ' ').trim() || null
      const statsLabel = tweet.querySelector('[role="group"][aria-label]')?.getAttribute('aria-label') || ''
      const parseNum = (key) => {
        const match = statsLabel.match(new RegExp('([\\d,]+)\\s+' + key))
        return match ? parseInt(match[1].replace(/,/g, '')) : null
      }
      const stats = {
        replies: parseNum('repl'),
        reposts: parseNum('repost'),
        likes: parseNum('like'),
        bookmarks: parseNum('bookmark'),
        views: parseNum('view'),
      }
      return { username, handle, displayName, avatar, tweetUrl, publishedAt, publishedText, text, stats }
    } catch (e) { return null }
  }).filter(Boolean)
}

// let dirPath = path.join(__dirname, '../../../outputs')
// let filePath = path.join(dirPath, 'newslettuuuue234r.html')
// let xx = X(fs.readFileSync(filePath, 'utf-8'))
// fs.writeFileSync(path.join(dirPath, 'x.json'), JSON.stringify(xx, null, 2))

module.exports = { X }
